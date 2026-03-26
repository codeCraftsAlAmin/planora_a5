import { Response } from "express";

interface ISendResponse<T> {
  ok: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(
  res: Response,
  responseData: ISendResponse<T>,
) => {
  const { ok, statusCode, message, data, meta } = responseData;

  res.status(statusCode).json({
    ok,
    statusCode,
    message,
    meta,
    data,
  });
};
