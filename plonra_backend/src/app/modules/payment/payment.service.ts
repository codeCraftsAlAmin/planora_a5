import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import status from "http-status";
import AppError from "../../middleware/appError";
import {
  NotificationType,
  PaymentStatus,
  RegistrationStatus,
} from "../../../generated/prisma/enums";

const handlePaymentWebhook = async (event: Stripe.Event) => {
  // find payment data
  const paymentData = await prisma.payments.findFirst({
    where: {
      stripEventId: event.id,
    },
  });

  if (paymentData) {
    return {
      ok: true,
      message: `Event ${event.id} already processed. Skipping`,
    };
  }

  // handle payment event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        const paymentId = session.metadata?.paymentId as string;
        const eventId = session.metadata?.eventId as string;

        // find payment
        const paymentData = await prisma.payments.findUnique({
          where: {
            id: paymentId,
          },
          include: {
            user: true,
          },
        });

        // find event
        const eventData = await prisma.events.findUnique({
          where: {
            id: eventId,
          },
        });

        if (!paymentData) {
          throw new AppError(status.NOT_FOUND, "Payment not found");
        }

        if (!eventData) {
          throw new AppError(status.NOT_FOUND, "Event not found");
        }

        await prisma.$transaction(async (tx) => {
          // update payment
          const updatedPayment = await tx.payments.update({
            where: {
              id: paymentId,
            },
            data: {
              status:
                session.payment_status === "paid"
                  ? PaymentStatus.PAID
                  : PaymentStatus.UNPAID,
              stripEventId: event.id,
              transactionId: session.id,
              paymentGatewayData: session as any,
            },
          });

          // update event registration
          const updatedEventRegistration = await tx.eventsRegistrations.update({
            where: {
              eventId_userId: {
                eventId: paymentData.eventId,
                userId: paymentData.userId,
              },
            },
            data: {
              paymentStatus: PaymentStatus.PAID,
              status: RegistrationStatus.PROCESSING,
            },
          });

          // send notification to user
          await tx.notification.create({
            data: {
              userId: paymentData.userId,
              type: NotificationType.PAYMENT_SUCCESS,
              message: `Your payment for ${eventData.title} has been processed successfully, wait for approval`,
            },
          });

          // send notification to organizer
          await tx.notification.create({
            data: {
              userId: eventData.organizerId,
              type: NotificationType.PAYMENT_SUCCESS,
              message: `New payment received for ${eventData.title} from ${paymentData.user.name}.`,
            },
          });

          // increase the number of members
          await tx.events.update({
            where: {
              id: paymentData.eventId,
            },
            data: {
              totalMembers: {
                increment: 1,
              },
            },
          });

          return {
            updatedPayment,
            updatedEventRegistration,
          };
        });

        break;
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const paymentId = session.metadata?.paymentId as string;
        const eventId = session.metadata?.eventId as string;

        if (!paymentId || !eventId) {
          throw new AppError(status.BAD_REQUEST, "Invalid payment or event ID");
        }

        // find payment
        const paymentData = await prisma.payments.findUnique({
          where: {
            id: paymentId,
          },
        });

        if (!paymentData) {
          throw new AppError(status.NOT_FOUND, "Payment not found");
        }

        await prisma.$transaction(async (tx) => {
          // update payment
          await tx.payments.update({
            where: {
              id: paymentId,
            },
            data: {
              status: PaymentStatus.UNPAID,
              stripEventId: event.id,
              paymentGatewayData: session as any,
            },
          });

          // update event registration
          await tx.eventsRegistrations.update({
            where: {
              eventId_userId: {
                eventId: paymentData.eventId,
                userId: paymentData.userId,
              },
            },
            data: {
              paymentStatus: PaymentStatus.UNPAID,
              status: RegistrationStatus.PROCESSING,
            },
          });

          // add notification
          const updateNotification = await tx.notification.create({
            data: {
              userId: paymentData.userId,
              type: NotificationType.PAYMENT_FAILED,
              message: "Your payment has been failed. Please try again",
            },
          });

          return {
            updateNotification,
          };
        });

        break;
      }

      default: {
        return { message: `Unhandled event type ${event.type}` };
      }
    }

    return {
      message: "Payment event processed successfully",
    };
  } catch (error: any) {
    console.log(`❌ Webhook Error [${event.id}]:`, error.message);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Webhook processing failed",
    );
  }
};

export const paymentService = {
  handlePaymentWebhook,
};
