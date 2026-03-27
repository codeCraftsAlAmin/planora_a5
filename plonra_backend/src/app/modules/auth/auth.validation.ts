import * as z from "zod";

const signUpEmailSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, "Name must be at least 3 characters long"),
  email: z.email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string({ message: "Old password is required" })
    .min(6, "Old password must be at least 6 characters long"),
  newPassword: z
    .string({ message: "New password is required" })
    .min(6, "New password must be at least 6 characters long"),
});

export const authValidation = {
  signUpEmailSchema,
  changePasswordSchema,
};
