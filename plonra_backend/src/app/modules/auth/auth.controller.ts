import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenHelpers } from "../../utils/token";
import { cookieHelpers } from "../../utils/cookie";
import AppError from "../../middleware/appError";

const signUpController = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, token, ...rest } =
    await authService.signUpService(req.body);

  // set token to cookie
  tokenHelpers.setAccessToken(res, accessToken);
  tokenHelpers.setRefreshToken(res, refreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.CREATED,
    ok: true,
    message:
      "User registered successfully. Please check your email for the verification code.",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest,
    },
  });
});

const signInController = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, token, ...rest } =
    await authService.signInService(req.body);

  // set token to cookie
  tokenHelpers.setAccessToken(res, accessToken);
  tokenHelpers.setRefreshToken(res, refreshToken);
  tokenHelpers.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.OK,
    ok: true,
    message: "User signed in successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest,
    },
  });
});

const signOutController = catchAsync(async (req: Request, res: Response) => {
  // get session token from cookie
  const sessionToken = req.cookies["better-auth.session_token"];

  const result = await authService.signOutService(sessionToken);

  // clear cookies
  cookieHelpers.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  cookieHelpers.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  cookieHelpers.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  sendResponse(res, {
    statusCode: status.OK,
    ok: true,
    message: "User signed out successfully",
    data: result,
  });
});

const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    // get refresh and better-auth session token from cookie
    const refreshToken = req.cookies.refreshToken;
    const sessionToken = req.cookies["better-auth.session_token"];

    if (!refreshToken) {
      throw new AppError(status.UNAUTHORIZED, "Refresh token not found");
    }

    const { newAccessToken, newRefreshToken, token } =
      await authService.refreshTokenService(refreshToken, sessionToken);

    // set token to cookie
    tokenHelpers.setAccessToken(res, newAccessToken);
    tokenHelpers.setRefreshToken(res, newRefreshToken);
    tokenHelpers.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Token refreshed successfully",
      data: {
        newAccessToken,
        newRefreshToken,
        token,
      },
    });
  },
);

const changePasswordController = catchAsync(
  async (req: Request, res: Response) => {
    // get session token from cookie
    const sessionToken = req.cookies["better-auth.session_token"];

    const { newAccessToken, newRefreshToken, token } =
      await authService.changePasswordService(req.body, sessionToken);

    // set token to cookie
    tokenHelpers.setAccessToken(res, newAccessToken);
    tokenHelpers.setRefreshToken(res, newRefreshToken);
    tokenHelpers.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Password changed successfully",
    });
  },
);

const verifyEmailController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.verifyEmailService(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Email verified successfully",
      data: result,
    });
  },
);

const forgetPasswordRequestController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.forgetPasswordRequestService(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message:
        "Password reset request sent successfully. Please check your email for the verification code.",
      data: result,
    });
  },
);

const resetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await authService.resetPasswordService(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "Password reset successfully",
    });
  },
);

const getMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await authService.getMyProfileService(user!);

    sendResponse(res, {
      statusCode: status.OK,
      ok: true,
      message: "My profile fetched successfully",
      data: result,
    });
  },
);

export const authController = {
  signUpController,
  signInController,
  signOutController,
  refreshTokenController,
  changePasswordController,
  verifyEmailController,
  forgetPasswordRequestController,
  resetPasswordController,
  getMyProfileController,
};
