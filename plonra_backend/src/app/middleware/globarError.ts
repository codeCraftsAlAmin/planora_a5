import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../interface/error.interface";
import z from "zod";
import { handleZodError } from "./handleZodError";
import AppError from "./appError";
import { deleteUploadedFileFromGlobalErrHand } from "../utils/deleteUploadedFileFromGlobErrHand";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error:", err);
  }

  // delete uploaded files if error
  await deleteUploadedFileFromGlobalErrHand(req);

  let errSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let errMessage: string = "Internal Server Error";

  if (err instanceof z.ZodError) {
    const simplifiedErr = handleZodError(err);
    statusCode = simplifiedErr.statusCode;
    errMessage = simplifiedErr.message;
    errSources = simplifiedErr.errSources;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    errMessage = err.message;
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    errMessage = err.message;
  }

  const errResponse: TErrorResponse = {
    ok: false,
    statusCode,
    message: errMessage,
    errSources,
    error: envVars.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errResponse);
};

export default globalErrorHandler;
