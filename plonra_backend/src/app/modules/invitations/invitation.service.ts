import status from "http-status";
import AppError from "../../middleware/appError";
import { prisma } from "../../lib/prisma";
import {
  InvitationStatus,
  NotificationType,
  PaymentStatus,
  RegistrationStatus,
  UserStatus,
} from "../../../generated/prisma/enums";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { sendEmail } from "../../utils/email";
import { envVars } from "../../config/env";
import stripe from "../../config/stripe.config";

const sendInvitation = async (
  user: IRequestUserInterface,
  eventId: string,
  inviteeId: string,
) => {
  // find event
  const event = await prisma.events.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  // find invitee
  const invitee = await prisma.user.findUnique({
    where: {
      id: inviteeId,
    },
  });

  if (!invitee || invitee.status !== UserStatus.ACTIVE) {
    throw new AppError(status.NOT_FOUND, "Invitee not found or not active");
  }

  if (!invitee.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Invitee email not verified");
  }

  // find inviter
  const inviter = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!inviter) {
    throw new AppError(status.NOT_FOUND, "Inviter not found");
  }

  // confirm that event belong from correct host
  if (event.organizerId !== user.userId) {
    throw new AppError(status.UNAUTHORIZED, "You are not authorized to invite");
  }

  // check if user is already invited
  const invitation = await prisma.invitations.findUnique({
    where: {
      eventId_inviteeId: {
        eventId,
        inviteeId,
      },
    },
  });

  if (invitation) {
    throw new AppError(status.BAD_REQUEST, "User is already invited");
  }

  // TODO: create invitation
  const result = await prisma.$transaction(async (tx) => {
    // create invitation
    const invitation = await tx.invitations.create({
      data: {
        eventId,
        inviteeId,
        inviterId: user.userId,
      },
    });

    // send notification to user
    await tx.notification.create({
      data: {
        userId: inviteeId,
        message: `You have been invited to ${event.title}. Check your email to join.`,
        type: NotificationType.INVITATION_RECEIVED,
      },
    });

    return invitation;
  });

  // TODO: send email to user
  await sendEmail({
    to: invitee.email,
    subject: `Special Invitation: ${event.title}`,
    templateName: "invitation",
    templateData: {
      inviteeName: invitee.name,
      inviterName: inviter.name,
      eventName: event.title,
      eventLink: `${envVars.FRONTEND_URL}/events/${eventId}?invitation=true`,
    },
  });

  return result;
};

const acceptInvitation = async (
  user: IRequestUserInterface,
  eventId: string,
) => {
  // find invitation
  const invitation = await prisma.invitations.findUnique({
    where: {
      eventId_inviteeId: {
        eventId,
        inviteeId: user.userId,
      },
    },
    include: {
      event: true,
      invitee: true,
    },
  });

  if (!invitation) {
    throw new AppError(status.NOT_FOUND, "Invitation not found");
  }

  // check if user is invited
  if (invitation.inviteeId !== user.userId) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You are not authorized to accept this invitation",
    );
  }

  // check if invitation is already accepted
  if (invitation.status === InvitationStatus.ACCEPTED) {
    throw new AppError(status.BAD_REQUEST, "Invitation is already accepted");
  }

  // check if invitation is already rejected
  if (invitation.status === InvitationStatus.REJECTED) {
    throw new AppError(status.BAD_REQUEST, "Invitation is already rejected");
  }

  // if event is full
  if (invitation.event.totalMembers >= invitation.event.maxMembers) {
    throw new AppError(status.BAD_REQUEST, "Event is already full");
  }

  // TODO: in case of free payment
  if (invitation.event.fee === 0) {
    const result = await prisma.$transaction(async (tx) => {
      // registration
      const registerEvent = await tx.eventsRegistrations.create({
        data: {
          eventId: invitation.eventId,
          userId: invitation.inviteeId,
          status: RegistrationStatus.APPROVED,
          paymentStatus: PaymentStatus.FREE,
        },
      });

      // update invitation status
      await tx.invitations.update({
        where: {
          eventId_inviteeId: {
            eventId: invitation.eventId,
            inviteeId: invitation.inviteeId,
          },
        },
        data: { status: InvitationStatus.ACCEPTED },
      });

      // update total members
      await tx.events.update({
        where: {
          id: invitation.eventId,
        },
        data: {
          totalMembers: {
            increment: 1,
          },
        },
      });

      // send notification to the host
      await tx.notification.create({
        data: {
          userId: invitation.inviterId,
          message: `Success! Your guest has joined the event ${invitation.event.title}.`,
          type: NotificationType.REQUEST_APPROVED,
        },
      });

      // send notification to user
      await tx.notification.create({
        data: {
          userId: user.userId,
          type: NotificationType.REQUEST_APPROVED,
          message: `Your registration for ${invitation.event.title} has been approved!`,
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
  if (invitation.event.fee > 0) {
    const result = await prisma.$transaction(async (tx) => {
      // registration
      const registerEvent = await tx.eventsRegistrations.create({
        data: {
          eventId: invitation.eventId,
          userId: invitation.inviteeId,
          status: RegistrationStatus.PROCESSING,
        },
      });

      const payment = await tx.payments.create({
        data: {
          eventId: invitation.eventId,
          userId: invitation.inviteeId,
          amount: invitation.event.fee,
          transactionId: "",
          stripEventId: "",
          status: PaymentStatus.UNPAID,
        },
      });

      // update invitation status
      await tx.invitations.update({
        where: {
          eventId_inviteeId: {
            eventId: invitation.eventId,
            inviteeId: invitation.inviteeId,
          },
        },
        data: { status: InvitationStatus.INTERESTED },
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
              name: ` ${invitation.event.title} - ${invitation.invitee.name}`,
            },
            unit_amount: Math.round(invitation.event.fee * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        paymentId: result.payment.id,
        eventId: invitation.eventId,
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

const rejectInvitation = async (
  user: IRequestUserInterface,
  eventId: string,
) => {

  const invitation = await prisma.invitations.findUnique({
    where: {
      eventId_inviteeId: {
        eventId,
        inviteeId: user.userId,
      },
    },
    include: {
      event: true,
    },
  });
  if (!invitation) {
    throw new AppError(status.NOT_FOUND, "Invitation not found");
  }

  // auth check
  if (invitation.inviteeId !== user.userId) {
    throw new AppError(status.UNAUTHORIZED, "Not authorized");
  }

  // check if invitation is already accepted or rejected
  if (
    invitation.status === InvitationStatus.ACCEPTED ||
    invitation.status === InvitationStatus.REJECTED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Invitation is already ${invitation.status.toLowerCase()}`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // update invitation status
    const updatedInvitation = await tx.invitations.update({
      where: {
        eventId_inviteeId: {
          eventId,
          inviteeId: user.userId,
        },
      },
      data: { status: InvitationStatus.REJECTED },
    });

    // notify the inviter
    await tx.notification.create({
      data: {
        userId: invitation.inviterId,
        message: `Your guest has declined the invitation for ${invitation.event.title}.`,
        type: NotificationType.REQUEST_REJECTED,
      },
    });

    return updatedInvitation;
  });

  return result;
};

const deleteExpiredInvitations = async () => {
  // find pending invitaions
  const result = await prisma.invitations.deleteMany({
    where: {
      status: {
        in: [InvitationStatus.PENDING, InvitationStatus.INTERESTED],
      },
      event: {
        date: {
          lt: new Date(),
        },
      },
    },
  });

  if (result.count > 0) {
    console.log(`Successfully cleaned up ${result.count} expired invitations.`);
  }

  return result;
};

export const invitationService = {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
  deleteExpiredInvitations,
};
