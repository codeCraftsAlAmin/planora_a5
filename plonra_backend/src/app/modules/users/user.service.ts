import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../middleware/requestUserInterface";
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

const updateRoleService = async (
  user: IRequestUserInterface,
  role: Role,
  id: string,
) => {
  console.log("ID from body:", id);
  console.log("Role from body:", role);

  const userData = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.role !== Role.ADMIN) {
    if (user.userId !== id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not authorized to change another user's role.",
      );
    }
  }

  // user can only update role to host
  if (user.role === Role.USER && role !== Role.HOST) {
    throw new AppError(status.FORBIDDEN, "You can only update role to host");
  }

  const updatedUserData = await prisma.user.update({
    where: {
      id,
    },
    data: {
      role,
    },
  });

  return updatedUserData;
};

export const userService = {
  getMyProfileService,
  updateMyProfileService,
  updateRoleService,
};
