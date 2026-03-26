import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const getAllUsersService = async () => {
  const usersData = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      events: true,
      invitationsSent: true,
      invitationsRecieved: true,
    },
  });
  return usersData;
};

const deleteUserService = async (id: string, user: IRequestUserInterface) => {
  // admin can't delete himself
  if (id === user.userId) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot delete your own admin account.",
    );
  }

  // find user to delete
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      events: true,
      invitationsSent: true,
      invitationsRecieved: true,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (userData.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "User is already deleted");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUserData = await tx.user.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: id,
      },
    });

    await tx.account.deleteMany({
      where: {
        userId: id,
      },
    });

    return updatedUserData;
  });

  return result;
};

export const adminService = {
  getAllUsersService,
  deleteUserService,
};
