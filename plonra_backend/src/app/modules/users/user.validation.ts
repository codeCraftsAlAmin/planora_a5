import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

const updateMyProfileValidation = z.object({
  name: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long")
    .optional(),
  phone: z
    .string("Phone must be a string")
    .min(11, "Phone must be at least 11 characters long")
    .max(11, "Phone must be at most 11 characters long")
    .optional(),
  image: z.url("Image is invalid").optional(),
  address: z.string("Address must be a string").optional(),
  bio: z.string("Bio must be a string").optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
});

export const userValidation = {
  updateMyProfileValidation,
};
