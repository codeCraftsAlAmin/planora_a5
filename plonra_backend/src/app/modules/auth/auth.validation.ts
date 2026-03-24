import * as z from "zod";

const signUpEmailSchema = z.object({
  name: z
    .string("Name is required")
    .min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string("Old password is required")
    .min(6, "Old password must be at least 6 characters"),
  newPassword: z
    .string("New password is required")
    .min(6, "New password must be at least 6 characters"),
});

export const authValidation = {
  signUpEmailSchema,
  changePasswordSchema,
};
