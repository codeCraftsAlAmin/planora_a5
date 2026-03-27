import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

const updateMyProfileValidation = z.object({
  name: z
    .string({ message: "Name must be a string" })
    .min(3, "Name must be at least 3 characters long")
    .optional(),
  phone: z
    .string({ message: "Phone must be a string" })
    .regex(/^[0-9]{11}$/, "Phone must be exactly 11 digits")
    .optional(),
  image: z.string().url({ message: "Image must be a url" }).optional(),
  address: z.string({ message: "Address must be a string" }).optional(),
  bio: z
    .string({ message: "Bio must be a string" })
    .max(500, "Bio must be at most 500 characters")
    .optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
});

export const userValidation = {
  updateMyProfileValidation,
};
