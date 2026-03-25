import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../middleware/requestUserInterface";

const getMyProfileService = async (user: IRequestUserInterface) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      events: true,
      invitationsSent: true,
      invitationsRecieved: true,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  return userData;
};

export const userService = { getMyProfileService };
