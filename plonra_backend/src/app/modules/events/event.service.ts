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
import { Role } from "../../../generated/prisma/enums";
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

// TODO: prevent host to update fee if event is booked
// TODO: let the updated schedule to the booked user via email
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

  let convertEventDate = eventData.date;
  // convert date and time
  if (payload.date) {
    convertEventDate = convertDateTime(payload.date);
  }

  // delete image from cloudinary if new image is uploaded
  if (payload.image && eventData.image && payload.image !== eventData.image) {
    await deleteFileFromCloudinary(eventData.image);
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
