import z from "zod";
import { EventStatus, EventType } from "../../../generated/prisma/enums";

const createEventValidation = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(1, "Title cannot be empty"),
  date: z
    .string({ message: "Date is required" })
    .min(1, "Date cannot be empty"),
  time: z
    .string({ message: "Time is required" })
    .min(1, "Time cannot be empty"),
  venue: z
    .string({ message: "Venue is required" })
    .min(1, "Venue cannot be empty"),
  type: z.enum([EventType.PUBLIC, EventType.PRIVATE], {
    message: "Type must be PUBLIC or PRIVATE",
  }),
  description: z.string({ message: "Description must be a string" }).optional(),
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
  fee: z.coerce.number({ message: "Fee must be a number" }).default(0),
});

const updateEventValidation = z.object({
  title: z.string({ message: "Title must be a string" }).optional(),
  date: z.string({ message: "Date must be a string" }).optional(),
  time: z.string({ message: "Time must be a string" }).optional(),
  venue: z.string({ message: "Venue must be a string" }).optional(),
  type: z
    .enum([EventType.PUBLIC, EventType.PRIVATE], {
      message: "Type must be PUBLIC or PRIVATE",
    })
    .optional(),
  description: z.string({ message: "Description must be a string" }).optional(),
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
  fee: z.coerce.number({ message: "Fee must be a number" }).optional(),
  status: z
    .enum(
      [
        EventStatus.UPCOMING,
        EventStatus.ONGOING,
        EventStatus.COMPLETED,
        EventStatus.CANCELLED,
      ],
      {
        message: "Status must be UPCOMING, ONGOING, COMPLETED or CANCELLED",
      },
    )
    .optional(),
  maxMembers: z.coerce
    .number({ message: "Max members must be a number" })
    .optional(),
});

export const eventValidation = {
  createEventValidation,
  updateEventValidation,
};
