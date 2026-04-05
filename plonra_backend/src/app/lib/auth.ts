import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Gender, Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP, role } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import AppError from "../middleware/appError";
import status from "http-status";
import { envVars } from "../config/env";
import { waitUntil } from "@vercel/functions";

export const auth = betterAuth({
  baseUrl: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    backgroundTasks: {
      handler: waitUntil,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  // additional feilds
  user: {
    additionalFields: {
      address: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: true,
        defaultValue: Gender.OTHER,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  // plugins helps to add extra features such as use Bearer token
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          //find user
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            throw new AppError(status.NOT_FOUND, "User not found");
          }

          // no need to send verification for admin
          if (user.role === Role.ADMIN) return;
          waitUntil(
            sendEmail({
              to: email,
              subject: "Email Verification",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            }),
          );
        }

        if (type === "forget-password") {
          //find user
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            throw new AppError(status.NOT_FOUND, "User not found");
          }
          console.log("Sending email to forget password", email);
          waitUntil(
            sendEmail({
              to: email,
              subject: "Forget Password",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            }),
          );
        }
      },
      expiresIn: 60 * 2, // 2mins
      otpLength: 6,
    }),
  ],

  // better-auth session configuration
  session: {
    expiresIn: 60 * 60 * 24, // 1d
    updatedAt: 60 * 60 * 24, // 1d
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1d
    },
  },
});
