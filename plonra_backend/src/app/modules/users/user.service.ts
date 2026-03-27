import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { IUpdateMyProfileInterface } from "./user.interface";
import { Role } from "../../../generated/prisma/enums";

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

const updateMyProfileService = async (
  user: IRequestUserInterface,
  payload: IUpdateMyProfileInterface,
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  const updatedUserData = await prisma.user.update({
    where: {
      id: user.userId,
    },
    data: payload,
  });

  return updatedUserData;
};

const becomeHostService = async (user: IRequestUserInterface) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // already a host or admin
  if (userData.role === Role.HOST) {
    throw new AppError(status.BAD_REQUEST, "You are already a host");
  }

  if (userData.role === Role.ADMIN) {
    throw new AppError(status.BAD_REQUEST, "Admins cannot become a host");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { role: Role.HOST },
  });

  return updatedUser;
};

export const userService = {
  getMyProfileService,
  updateMyProfileService,
  becomeHostService,
};
