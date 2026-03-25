import { JWTPayload } from "better-auth";
import { jwtHelpers } from "./jwt";
import { envVars } from "../config/env";
import { SignOptions } from "jsonwebtoken";
import { cookieHelpers } from "./cookie";
import { Response } from "express";

// create access token
const createAccessToken = (payload: JWTPayload) => {
  const accessToken = jwtHelpers.createToken(
    payload,
    envVars.ACCESS_TOKEN_SEC,
    {
      expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
  return accessToken;
};

// create refresh token
const createRefreshToken = (payload: JWTPayload) => {
  const refreshToken = jwtHelpers.createToken(
    payload,
    envVars.REFRESH_TOKEN_SEC,
    {
      expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
  return refreshToken;
};

// set access token to cookie
const setAccessToken = (res: Response, token: string) => {
  cookieHelpers.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, //1day
  });
};

// set refresh token to cookie
const setRefreshToken = (res: Response, token: string) => {
  cookieHelpers.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000 * 7, //7days
  });
};

// set better auth session
const setBetterAuthSessionCookie = (res: Response, token: string) => {
  cookieHelpers.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, // 1day
  });
};

export const tokenHelpers = {
  createAccessToken,
  createRefreshToken,
  setAccessToken,
  setRefreshToken,
  setBetterAuthSessionCookie,
};