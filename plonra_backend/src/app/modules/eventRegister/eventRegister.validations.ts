import { z } from "zod";

const createEventValidation = z.object({
  eventId: z.string({ message: "Event ID is required" }),
});

export const registerEventValidation = {
  createEventValidation,
};
