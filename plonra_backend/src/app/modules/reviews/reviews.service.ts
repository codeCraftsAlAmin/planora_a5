import { ICreateReview } from "./reviews.interface";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { prisma } from "../../lib/prisma";
import {
  NotificationType,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import AppError from "../../middleware/appError";
import status from "http-status";

const createReview = async (
  user: IRequestUserInterface,
  payload: ICreateReview,
  eventId: string,
) => {
  const { comment, rating } = payload;

  // find event
  const event = await prisma.events.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    throw new AppError(status.BAD_REQUEST, "Event not found");
  }

  // only completed event can be rated
  if (rating && rating > 0) {
    const isCompleted = new Date(event.date) < new Date();

    if (!isCompleted) {
      throw new AppError(
        status.BAD_REQUEST,
        "Only completed event can be rated",
      );
    }
  }

  // only verified and active users are allowed to review
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData?.emailVerified || userData?.status !== UserStatus.ACTIVE) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only verified and active user are allowed to review",
    );
  }

  // avoid spam rating
  const existingRating = await prisma.reviews.findFirst({
    where: {
      eventId,
      userId: user.userId,
      rating: {
        gt: 0,
      },
    },
  });

  if (existingRating) {
    throw new AppError(status.BAD_REQUEST, "You have already rated this event");
  }

  const result = await prisma.reviews.create({
    data: {
      eventId,
      comment,
      rating,
      userId: user.userId,
    },
  });

  // calculate average rating
  const averageRating = await prisma.reviews.aggregate({
    where: {
      eventId,
      rating: { gt: 0 },
    },
    _avg: {
      rating: true,
    },
  });

  // send notification to the host if comment is not empty
  if (comment) {
    await prisma.notification.create({
      data: {
        userId: event.organizerId,
        type: NotificationType.REVIEW_POSTED,
        message: `${userData?.name} has commented on ${event.title}`,
      },
    });
  }

  return {
    ...result,
    averageRating: averageRating._avg.rating || 0,
  };
};

const getAllReviews = async () => {
  const result = await prisma.reviews.findMany({
    where: {
      isDeleted: false,
      parentId: null,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, image: true },
      },
      event: {
        select: { id: true, title: true },
      },
      replies: {
        where: { isDeleted: false },
        select: {
          id: true,
          comment: true,
          createdAt: true,
          user: {
            select: { name: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" }, // sort replies oldest to newest (conversation flow)
      },
    },
    orderBy: {
      createdAt: "desc", // show newest main reviews at the top
    },
  });
  return result;
};

const updateComment = async (
  user: IRequestUserInterface,
  comment: string,
  id: string,
) => {
  const existingReview = await prisma.reviews.findUnique({
    where: {
      id,
    },
  });

  if (!existingReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (existingReview.userId !== user.userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this review",
    );
  }

  const result = await prisma.reviews.update({
    where: {
      id,
    },
    data: {
      comment,
    },
    select: {
      id: true,
      comment: true,
      updatedAt: true,
      rating: true,
    },
  });

  return result;
};

const deleteComment = async (user: IRequestUserInterface, id: string) => {
  const existingReview = await prisma.reviews.findUnique({
    where: {
      id,
    },
  });

  if (!existingReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (existingReview.userId !== user.userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this review",
    );
  }

  const result = await prisma.reviews.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      rating: 0,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      eventId: true,
    },
  });

  return result;
};

const replyComment = async (
  user: IRequestUserInterface,
  comment: string,
  id: string,
) => {
  const existingReview = await prisma.reviews.findUnique({
    where: {
      id,
    },
    include: {
      user:{
        select: {
          id: true,
          name: true,
        }
      },
      event: {
        select: {
          organizerId: true,
          title: true,
        },
      },
    },
  });

  if (!existingReview) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (
    user.role === Role.HOST &&
    existingReview.event.organizerId !== user.userId
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to reply to this review",
    );
  }

  const result = await prisma.reviews.create({
    data: {
      eventId: existingReview.eventId,
      comment,
      userId: user.userId,
      parentId: id,
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      user: {
        select: { name: true, role: true },
      },
    },
  });

  // send notification to the user if comment is not empty
  if (comment) {
    await prisma.notification.create({
      data: {
        userId: existingReview.user.id,
        type: NotificationType.REVIEW_POSTED,
        message: `${existingReview.user.name} has replied to your comment on ${existingReview.event.title}`,
      },
    });
  }

  return result;
};

export const reviewsService = {
  createReview,
  getAllReviews,
  updateComment,
  deleteComment,
  replyComment,
};
