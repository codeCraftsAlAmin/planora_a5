import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieHelpers } from "../utils/cookie";
import AppError from "./appError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtHelpers } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get better auth sesion from cookie
      const sessionToken = cookieHelpers.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token found",
        );
      }

      // verify session
      const sessionData = await prisma.session.findUnique({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!sessionData || !sessionData.user) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access!. Invalid or expired session",
        );
      }

      const user = sessionData.user;

      const now = new Date();
      const expiresAt = new Date(sessionData.expiresAt);
      const createdAt = new Date(sessionData.createdAt);

      const sessionsLifetime = expiresAt.getTime() - createdAt.getTime();
      const remainingTime = expiresAt.getTime() - now.getTime();
      const parcentRemaining = (remainingTime / sessionsLifetime) * 100;

      if (parcentRemaining < 20) {
        res.setHeader("X-Session-Refresh", "true");
        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
        res.setHeader("X-Time-Remaining", remainingTime.toString());

        console.log("Session is expiring soon 🚨");
      }

      // if user is banned or inactive
      if (
        user.status === UserStatus.BANNED ||
        user.status === UserStatus.INACTIVE
      ) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access!. Your account has been banned or inactive",
        );
      }

      // if user is deleted
      if (user.isDeleted) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access!. Your account has been deleted",
        );
      }

      // get access token
      const accessToken = cookieHelpers.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access!. No access token provided",
        );
      }
      // verify the token
      const isAccessTokenValid = jwtHelpers.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SEC,
      );

      if (!isAccessTokenValid.ok) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access!. Invalid access token",
        );
      }

      // final role check
      if (authRoles.length > 0 && !authRoles.includes(user.role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden!. You don't have permission to access this resource",
        );
      }

      // return user info
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error: any) {
      next(error);
    }
  };
