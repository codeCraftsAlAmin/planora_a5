import status from "http-status";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import AppError from "../../middleware/appError";
import { prisma } from "../../lib/prisma";
import {
  EventStatus,
  EventType,
  InvitationStatus,
  NotificationType,
  PaymentStatus,
  RegistrationStatus,
  Role,
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

  // check event status
  if (eventData.status === EventStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Event is cancelled");
  }

  if (eventData.status === EventStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Event is completed");
  }

  if (eventData.status === EventStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, "Event is ongoing");
  }

  if (eventData.totalMembers >= eventData.maxMembers) {
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
    if (eventData.type === EventType.PUBLIC) {
      const result = await prisma.$transaction(async (tx) => {
        // registration
        const registerEvent = await tx.eventsRegistrations.create({
          data: {
            eventId,
            userId: userData.id,
            status: RegistrationStatus.APPROVED,
            paymentStatus: PaymentStatus.FREE,
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

        // send notification to user
        await tx.notification.create({
          data: {
            userId: userData.id,
            type: NotificationType.REQUEST_APPROVED,
            message: `Your registration for ${eventData.title} has been approved!`,
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
    } else if (eventData.type === EventType.PRIVATE) {
      const result = await prisma.$transaction(async (tx) => {
        // registration
        const registerEvent = await tx.eventsRegistrations.create({
          data: {
            eventId,
            userId: userData.id,
            status: RegistrationStatus.PROCESSING,
            paymentStatus: PaymentStatus.FREE,
          },
        });

        // sent notification to user
        await tx.notification.create({
          data: {
            userId: userData.id,
            type: NotificationType.REQUEST_PENDING,
            message: `Your registration for ${eventData.title} has been sent successfully, wait for approval`,
          },
        });

        // sent notification to organizer
        await tx.notification.create({
          data: {
            userId: eventData.organizerId,
            type: NotificationType.REQUEST_PENDING,
            message: `${userData.name} has sent a registration request for ${eventData.title}`,
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
  }

  // TODO: in case of paid payment
  if (eventData.fee > 0) {
    const result = await prisma.$transaction(async (tx) => {
      // registration
      const registerEvent = await tx.eventsRegistrations.create({
        data: {
          eventId,
          userId: userData.id,
          status: RegistrationStatus.PROCESSING,
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

const cancelUnpaidRegistration = async () => {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unpaidRegistrations = await prisma.eventsRegistrations.findMany({
    where: {
      paymentStatus: PaymentStatus.UNPAID,
      createdAt: {
        lt: thirtyMinsAgo,
      },
    },
    include: {
      event: true,
    },
  });

  if (unpaidRegistrations.length === 0) return;

  // get all registration id
  const unpaidRegistrationsId = unpaidRegistrations.map(
    (registration) => registration.id,
  );

  // get all user id
  const unpaidRegistrationsUserId = unpaidRegistrations.map(
    (registration) => registration.userId,
  );

  await prisma.$transaction(async (tx) => {
    // delete all registrations
    await tx.eventsRegistrations.deleteMany({
      where: {
        id: {
          in: unpaidRegistrationsId,
        },
      },
    });

    // delete all payments
    await tx.payments.deleteMany({
      where: {
        eventId: {
          in: unpaidRegistrations.map((registration) => registration.eventId),
        },
        userId: {
          in: unpaidRegistrations.map((registration) => registration.userId),
        },
        status: PaymentStatus.UNPAID,
        createdAt: {
          lt: thirtyMinsAgo,
        },
      },
    });

    // send notifications to users
    await prisma.notification.createMany({
      data: unpaidRegistrationsUserId.map((id) => ({
        userId: id,
        type: NotificationType.PAYMENT_FAILED,
        message:
          "Your event registration was cancelled because payment was not completed within 30 minutes.",
      })),
    });
  });
};

const getAllEventRegistrationsService = async (user: IRequestUserInterface) => {
  let result;

  if (user.role === Role.USER) {
    result = await prisma.eventsRegistrations.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        event: true,
      },
    });
  }

  if (user.role === Role.ADMIN) {
    result = await prisma.eventsRegistrations.findMany({
      include: {
        event: true,
      },
    });
  }
  return result;
};

const updateRegistrationService = async (
  registerId: string,
  user: IRequestUserInterface,
  payload: RegistrationStatus,
) => {
  // find registration
  const registration = await prisma.eventsRegistrations.findUnique({
    where: { id: registerId },
    include: { event: true },
  });

  if (!registration) {
    throw new AppError(status.NOT_FOUND, "Registration not found");
  }

  // host can only update their own event
  if (
    user.role === Role.HOST &&
    registration.event.organizerId !== user.userId
  ) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You are not the organizer of this event",
    );
  }

  // payload can not be PROCESSING
  if (payload === RegistrationStatus.PROCESSING) {
    throw new AppError(status.BAD_REQUEST, "Invalid status");
  }

  // already has this status
  if (registration.status === payload) {
    throw new AppError(
      status.BAD_REQUEST,
      `Registration is already ${payload.toLowerCase()}`,
    );
  }

  // can only ban APPROVED participants
  if (
    payload === RegistrationStatus.BANNED &&
    registration.status !== RegistrationStatus.APPROVED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Can only ban APPROVED participants",
    );
  }

  // check if event is full before approving
  if (
    payload === RegistrationStatus.APPROVED &&
    registration.event.totalMembers >= registration.event.maxMembers
  ) {
    throw new AppError(status.BAD_REQUEST, "Event is already full");
  }

  const result = await prisma.$transaction(async (tx) => {
    // update registration
    const updatedRegistration = await tx.eventsRegistrations.update({
      where: { id: registerId },
      data: { status: payload },
    });

    // increment for pri+free approval
    if (
      payload === RegistrationStatus.APPROVED &&
      registration.event.type === EventType.PRIVATE &&
      registration.event.fee === 0
    ) {
      await tx.events.update({
        where: { id: registration.eventId },
        data: { totalMembers: { increment: 1 } },
      });
    }

    // decrement for paid rejected or ban user
    if (
      (payload === RegistrationStatus.BANNED ||
        payload === RegistrationStatus.REJECTED) &&
      registration.paymentStatus === PaymentStatus.PAID
    ) {
      await tx.events.update({
        where: { id: registration.eventId },
        data: { totalMembers: { decrement: 1 } },
      });
    }

    // dynamic notification
    await tx.notification.create({
      data: {
        userId: registration.userId,
        type:
          payload === RegistrationStatus.APPROVED
            ? NotificationType.REQUEST_APPROVED
            : payload === RegistrationStatus.REJECTED
              ? NotificationType.REQUEST_REJECTED
              : NotificationType.BANNED_FROM_EVENT,
        message: `Your registration for "${registration.event.title}" has been ${payload.toLowerCase()}!`,
      },
    });

    return updatedRegistration;
  });

  return result;
};

const refundRegistrationService = async (
  eventId: string,
  user: IRequestUserInterface,
) => {
  // find the owner of events
  const eventData = await prisma.events.findUnique({
    where: { id: eventId },
    include: {
      eventsRegistrations: {
        where: {
          status: {
            in: [RegistrationStatus.REJECTED, RegistrationStatus.BANNED],
          },
          paymentStatus: PaymentStatus.PAID,
        },
      },
    },
  });

  if (!eventData) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (eventData.organizerId !== user.userId) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You are not the organizer of this event",
    );
  }

  // users to refund
  const usersToRefund = eventData.eventsRegistrations;

  if (usersToRefund.length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "No rejected or banned paid users found awaiting refund",
    );
  }

  // TODO: refund unpaid payments
  const result = await prisma.$transaction(async (tx) => {
    // find payment record
    const paymentRecord = await tx.payments.findMany({
      where: {
        eventId: eventData.id,
        userId: { in: usersToRefund.map((user) => user.userId) },
        status: PaymentStatus.PAID,
      },
      select: {
        userId: true,
        transactionId: true,
        id: true,
      },
    });

    for (const payment of paymentRecord) {
      if (payment.transactionId) {
        // get stripe session
        const session = await stripe.checkout.sessions.retrieve(
          payment.transactionId,
        );

        // create refund
        if (session.payment_intent) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
          });
        }

        // decrement total members
        await tx.events.update({
          where: { id: eventData.id },
          data: { totalMembers: { decrement: 1 } },
        });
      }
    }

    // update their refund status
    await tx.eventsRegistrations.updateMany({
      where: {
        eventId: eventData.id,
        userId: { in: usersToRefund.map((user) => user.userId) },
      },
      data: { paymentStatus: PaymentStatus.UNPAID },
    });

    // send notifications to user and save to db
    const userNotification = usersToRefund.map((id) => ({
      userId: id.userId,
      type: NotificationType.PAYMENT_FAILED,
      message: `Your registration for "${eventData.title}" has been rejected. Your payment has been refunded.`,
    }));

    await tx.notification.createMany({
      data: userNotification,
    });
  });

  return result;
};

export const eventRegisterService = {
  createEventRegisterService,
  cancelUnpaidRegistration,
  getAllEventRegistrationsService,
  updateRegistrationService,
  refundRegistrationService,
};
