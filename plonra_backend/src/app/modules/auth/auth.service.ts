import status from "http-status";
import { auth } from "../../lib/auth";
import AppError from "../../middleware/appError";
import {
  IChangePassword,
  IResetPassword,
  ISignInEmail,
  ISignUpEmail,
  IVerifyEmail,
} from "./auth.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { tokenHelpers } from "../../utils/token";
import { prisma } from "../../lib/prisma";
import { jwtHelpers } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


const signUpService = async (payload: ISignUpEmail) => {
  const { name, email, password } = payload;

  try {
    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError(status.BAD_REQUEST, "User already exists");
    }

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
    }

    // token payload
    const tokenPayload = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      status: result.user.status,
      isDeleted: result.user.isDeleted,
      emailVerified: result.user.emailVerified,
    };

    // create access token
    const accessToken = tokenHelpers.createAccessToken(tokenPayload);
    // create refresh token
    const refreshToken = tokenHelpers.createRefreshToken(tokenPayload);

    return {
      ...result,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    // if (!(error instanceof AppError)) {
    //   await prisma.user.delete({
    //     where: {
    //       email: payload.email,
    //     },
    //   });
    // }
    throw error;
  }
};

const signInService = async (payload: ISignInEmail) => {
  const { email, password } = payload;

  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!result) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to sign in");
  }

  if (result.user.status === UserStatus.BANNED || result.user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been banned or deleted. Please contact support for assistance.",
    );
  }

  // token payload
  const tokenPayload = {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
    role: result.user.role,
    status: result.user.status,
    isDeleted: result.user.isDeleted,
    emailVerified: result.user.emailVerified,
  };

  // create access token
  const accessToken = tokenHelpers.createAccessToken(tokenPayload);
  // create refresh token
  const refreshToken = tokenHelpers.createRefreshToken(tokenPayload);

  return {
    ...result,
    accessToken,
    refreshToken,
  };
};

const signOutService = async (sessionToken: string) => {
  // verify session
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

const refreshTokenService = async (
  refreshToken: string,
  sessionToken: string,
) => {
  // check if session token exists
  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  // verify refresh token
  const isRefreshTokenValid = jwtHelpers.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SEC,
  );

  if (!isRefreshTokenValid) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token is not valid");
  }

  // get data from refresh token
  const decodedToken = jwtHelpers.decodedToken(refreshToken) as JwtPayload;

  // create new access token
  const tokenPayload = {
    id: decodedToken.id,
    email: decodedToken.email,
    name: decodedToken.name,
    role: decodedToken.role,
    status: decodedToken.status,
    isDeleted: decodedToken.isDeleted,
    emailVerified: decodedToken.emailVerified,
  };

  const user = await prisma.user.findUnique({ where: { id: decodedToken.id } });
  if (!user || user.status === UserStatus.BANNED || user.isDeleted) {
    throw new AppError(status.UNAUTHORIZED, "User no longer has access");
  }

  // create access token
  const newAccessToken = tokenHelpers.createAccessToken(tokenPayload);
  // create refresh token
  const newRefreshToken = tokenHelpers.createRefreshToken(tokenPayload);

  // update better-auth session expiry date
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      updatedAt: new Date(),
    },
  });

  return {
    newAccessToken,
    newRefreshToken,
    token,
  };
};

const changePasswordService = async (
  payload: IChangePassword,
  sessionToken: string,
) => {
  // verify session
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session not found");
  }

  const { oldPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      newPassword: newPassword,
      currentPassword: oldPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // create new access token
  const tokenPayload = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  };

  // create access token
  const newAccessToken = tokenHelpers.createAccessToken(tokenPayload);
  // create refresh token
  const newRefreshToken = tokenHelpers.createRefreshToken(tokenPayload);

  return {
    ...result,
    newAccessToken,
    newRefreshToken,
  };
};

const verifyEmailService = async (payload: IVerifyEmail) => {
  const { email, otp } = payload;

  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });
  
  return result;
};

const forgetPasswordRequestService = async (payload: { email: string }) => {
  const { email } = payload;

  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  if (user.status === UserStatus.BANNED || user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been banned or deleted. Please contact support for assistance.",
    );
  }

  const data = await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });

  return data;
};

const resetPasswordService = async (payload: IResetPassword) => {
  const { email, otp, newPassword } = payload;

  // check if user exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "User not found");
  }

  if (user.status === UserStatus.BANNED || user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been banned or deleted. Please contact support for assistance.",
    );
  }

  // verify the otp
  const verifyEmailOtp = await auth.api.checkVerificationOTP({
    body: {
      email,
      type: "forget-password",
      otp,
    },
  });

  if (!verifyEmailOtp) {
    throw new AppError(status.UNAUTHORIZED, "Invalid OTP");
  }

  // reset passwrod
  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  // delete last session data
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
    },
  });

  return result;
};

export const authService = {
  signUpService,
  signInService,
  signOutService,
  refreshTokenService,
  changePasswordService,
  verifyEmailService,
  forgetPasswordRequestService,
  resetPasswordService,
};
