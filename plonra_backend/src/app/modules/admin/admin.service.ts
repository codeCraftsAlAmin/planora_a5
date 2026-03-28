import status from "http-status";
import AppError from "../../middleware/appError";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interface/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, User } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import {
  userFilterableFields,
  userIncludingConfig,
  userSearchedFields,
} from "./admin.constant";

const getAllUsersService = async (query: IQueryParams) => {
  const queryBuilders = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: userSearchedFields,
    filterableFields: userFilterableFields,
  });

  const result = await queryBuilders
    .search()
    .filter()
    .where({ isDeleted: false })
    .sort()
    .include({
      events: true,
      invitationsSent: true,
      invitationsRecieved: true,
    })
    .dynamicInclude(userIncludingConfig)
    .fields()
    .pagination()
    .execute();

  // console.log("result ~ 🔑🕙", result);
  return result;
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

const banUserService = async (
  id: string,
  user: IRequestUserInterface,
  payload: { status: UserStatus },
) => {
  // admin can't ban himself
  if (id === user.userId) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot ban your own admin account.",
    );
  }

  // find user to ban
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (userData.status === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "User is already deleted");
  }

  if (userData.status === payload.status) {
    throw new AppError(status.BAD_REQUEST, `User is already ${payload.status}`);
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
  });

  return result;
};

const updateRoleService = async (role: Role, id: string) => {
  // check if user exists
  const userData = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // already has this role
  if (userData.role === role) {
    throw new AppError(
      status.BAD_REQUEST,
      `User already has the role of ${role}`,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userData.id },
    data: { role },
  });

  return updatedUser;
};

const updateFeaturedService = async (
  id: string,
  payload: { isFeatured: boolean },
) => {
  // check if event exists
  const eventData = await prisma.events.findUnique({
    where: {
      id,
    },
  });

  if (!eventData) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  // already has this featured status
  if (eventData.isFeatured === payload.isFeatured) {
    throw new AppError(
      status.BAD_REQUEST,
      `Event is already ${payload.isFeatured}`,
    );
  }

  const updatedEvent = await prisma.events.update({
    where: { id: eventData.id },
    data: { isFeatured: payload.isFeatured },
  });

  return updatedEvent;
};

export const adminService = {
  getAllUsersService,
  deleteUserService,
  banUserService,
  updateRoleService,
  updateFeaturedService,
};
