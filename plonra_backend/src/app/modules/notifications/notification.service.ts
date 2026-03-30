import status from "http-status";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";

const getMyNotificationsService = async (user: IRequestUserInterface) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.userId,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return notifications;
};

const markAsReadService = async (user: IRequestUserInterface, id: string) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id,
      userId: user.userId,
    },
  });

  if (!notification) {
    throw new AppError(status.NOT_FOUND, "Notification not found");
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });
  return updatedNotification;
};

const getMyUnreadNotificationsCountService = async (
  user: IRequestUserInterface,
) => {
  const unreadNotificationsCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      isRead: false,
    },
  });

  return unreadNotificationsCount;
};

export const notificationService = {
  getMyNotificationsService,
  markAsReadService,
  getMyUnreadNotificationsCountService,
};
