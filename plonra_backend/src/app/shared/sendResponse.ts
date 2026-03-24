import { Response } from "express";

interface ISendResponse<T> {
  ok: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  responseData: ISendResponse<T>,
) => {
  const { ok, statusCode, message, data } = responseData;

  res.status(statusCode).json({
    ok,
    statusCode,
    message,
    data,
  });
};
