import status from "http-status";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import AppError from "../../middleware/appError";
import { prisma } from "../../lib/prisma";
import {
  EventStatus,
  NotificationType,
  PaymentStatus,
  RegistrationStatus,
} from "../../../generated/prisma/enums";
import stripe from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createEventRegisterService = async (
  user: IRequestUserInterface,
  eventId: string,
) => {
  // check the user
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find the event first
  const eventData = await prisma.events.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!eventData) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (eventData.status === EventStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Event is cancelled");
  }

  if (eventData.status === EventStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Event is completed");
  }

  if (eventData.status === EventStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, "Event is ongoing");
  }

  if (eventData.totalMembers === eventData.maxMembers) {
    throw new AppError(status.BAD_REQUEST, "Event is full");
  }

  // host can't join their own event
  if (eventData.organizerId === userData.id) {
    throw new AppError(status.BAD_REQUEST, "You cannot join your own event");
  }

  // Check if already registered
  const existingRegistration = await prisma.eventsRegistrations.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: userData.id,
      },
    },
  });

  if (existingRegistration) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already registered for this event",
    );
  }

  // TODO: in case of free payment
  if (eventData.fee === 0) {
    const result = await prisma.$transaction(async (tx) => {
      // registration
      const registerEvent = await tx.eventsRegistrations.create({
        data: {
          eventId,
          userId: userData.id,
          status: RegistrationStatus.APPROVED,
        },
      });

      // update total members
      await tx.events.update({
        where: {
          id: eventId,
        },
        data: {
          totalMembers: {
            increment: 1,
          },
        },
      });

      // add notification
      await tx.notification.create({
        data: {
          userId: userData.id,
          type: NotificationType.REQUEST_APPROVED,
          message: "Your registration has been approved successfully",
        },
      });

      return {
        registerEvent,
      };
    });
    return {
      result,
      paymentUrl: null,
    };
  }

  // TODO: in case of paid payment
  if (eventData.fee > 0) {
    const result = await prisma.$transaction(async (tx) => {
      // registration
      const registerEvent = await tx.eventsRegistrations.create({
        data: {
          eventId,
          userId: userData.id,
        },
      });

      const payment = await tx.payments.create({
        data: {
          eventId,
          userId: userData.id,
          amount: eventData.fee,
          transactionId: "",
          stripEventId: "",
          status: PaymentStatus.UNPAID,
        },
      });

      return {
        registerEvent,
        payment,
      };
    });

    // handle payment gateway session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: ` ${eventData.title} - ${userData.name}`,
            },
            unit_amount: Math.round(eventData.fee * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        paymentId: result.payment.id,
        eventId: eventData.id,
      },

      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
    });

    return {
      result,
      paymentUrl: session.url,
    };
  }
};

export const eventRegisterService = {
  createEventRegisterService,
};
