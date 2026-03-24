import status from "http-status";
import z from "zod";
import { TErrorSources } from "./error.interface";

export const handleZodError = (err: z.ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errSources: TErrorSources[] = [];

  err.issues.forEach((issue) => {
    errSources.push({
      path: issue.path.join("."),
      message: issue.message,
    });
  });

  return { ok: false, statusCode, message, errSources };
};
