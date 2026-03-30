import status from "http-status";
import { IRequestUserInterface } from "../../interface/requestUserInterface";
import { prisma } from "../../lib/prisma";
import {
  ICreateEventInterface,
  IUpdateEventInterface,
} from "./event.interface";
import AppError from "../../middleware/appError";
import { convertDateTime } from "./timeZoneUtils";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import {
  EventStatus,
  NotificationType,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { Events, Prisma } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interface/query.interface";
import {
  eventFilterableFields,
  eventIncludingConfig,
  eventSearchedFields,
} from "./event.constant";

const createEventService = async (
  user: IRequestUserInterface,
  payload: ICreateEventInterface,
) => {
  // find user data
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // banned host can not create event
  if (userData.status === UserStatus.BANNED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You are banned from creating events",
    );
  }

  // convert date and time
  // const eventDate = format(new Date(payload.date), "yyyy-MM-dd");
  const convertEventDate = convertDateTime(payload.date);

  // create event
  const result = await prisma.events.create({
    data: {
      ...payload,
      date: convertEventDate,
      organizerId: userData.id,
    },
  });

  return result;
};

const getMyEventsService = async (user: IRequestUserInterface) => {
  // find user data
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find my events
  const result = await prisma.events.findMany({
    where: {
      organizerId: userData.id,
    },
  });

  return result;
};

const deleteEventService = async (user: IRequestUserInterface, id: string) => {
  // find user data
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find event data
  const eventData = await prisma.events.findUnique({
    where: {
      id,
    },
  });

  if (!eventData) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  // check if user is organizer
  if (eventData.organizerId !== userData.id && userData.role !== Role.ADMIN) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to delete this event",
    );
  }

  // can not delete on going event
  if (eventData.status === EventStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, "Event is ongoing");
  }

  // can not delete upcoming event with members
  if (eventData.status === EventStatus.UPCOMING && eventData.totalMembers > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Can not delete event with active members",
    );
  }

  // delete event
  const result = await prisma.events.delete({
    where: {
      id,
    },
  });

  // delete image from cloudinary
  if (eventData.image) {
    await deleteFileFromCloudinary(eventData.image);
  }

  return result;
};

const updateMyEventService = async (
  user: IRequestUserInterface,
  id: string,
  payload: IUpdateEventInterface,
) => {
  // find user data
  const userData = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userData) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // find event data
  const eventData = await prisma.events.findUnique({
    where: {
      id,
    },
  });

  if (!eventData) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  // check if user is organizer
  if (eventData.organizerId !== userData.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this event",
    );
  }

  // check if event is not started
  if (
    eventData.status === EventStatus.ONGOING ||
    eventData.status === EventStatus.COMPLETED ||
    eventData.status === EventStatus.CANCELLED
  ) {
    throw new AppError(status.BAD_REQUEST, "Event is already started");
  }

  let convertEventDate = eventData.date;
  // convert date and time
  if (payload.date) {
    convertEventDate = convertDateTime(payload.date);
  }

  // new date must be in future
  if (convertEventDate < new Date()) {
    throw new AppError(status.BAD_REQUEST, "Event date must be in future");
  }

  // delete image from cloudinary if new image is uploaded
  if (payload.image && eventData.image && payload.image !== eventData.image) {
    await deleteFileFromCloudinary(eventData.image);
  }

  // only allows to change fee if member is 0
  if (payload.fee && eventData.fee !== payload.fee) {
    const memberCount = await prisma.eventsRegistrations.count({
      where: {
        eventId: id,
      },
    });
    if (memberCount > 0) {
      throw new AppError(
        status.BAD_REQUEST,
        "You can't change fee if member is booked",
      );
    }
  }

  // maxNumber can not be less than current participant
  if (payload.maxMembers && eventData.maxMembers !== payload.maxMembers) {
    const participantCount = await prisma.eventsRegistrations.count({
      where: {
        eventId: id,
      },
    });
    if (participantCount > payload.maxMembers) {
      throw new AppError(
        status.BAD_REQUEST,
        "You can't change maxNumber if participant is booked",
      );
    }
  }

  // update event
  const result = await prisma.events.update({
    where: {
      id,
    },
    data: {
      ...payload,
      date: convertEventDate,
    },
  });

  // let the users know about the update via notification
  const users = await prisma.eventsRegistrations.findMany({
    where: {
      eventId: id,
    },
  });

  const userToInform = users.map((user) => ({
    userId: user.userId,
    eventId: id,
    type: NotificationType.EVENT_UPDATED,
    message: `Event "${eventData.title}" has been updated. Check it out`,
  }));

  await prisma.notification.createMany({
    data: userToInform,
  });

  return result;
};

const getAllEventsService = async (query: IQueryParams) => {
  const queryBuilders = new QueryBuilder<
    Events,
    Prisma.EventsWhereInput,
    Prisma.EventsInclude
  >(prisma.events, query, {
    searchableFields: eventSearchedFields,
    filterableFields: eventFilterableFields,
  });

  const result = await queryBuilders
    .search()
    .filter()
    .include({
      organizer: true,
      reviews: true,
      invitations: true,
      eventsRegistrations: true,
    })
    .dynamicInclude(eventIncludingConfig)
    .fields()
    .pagination()
    .sort()
    .execute();

  return result;
};

export const eventService = {
  createEventService,
  deleteEventService,
  getMyEventsService,
  updateMyEventService,
  getAllEventsService,
};
