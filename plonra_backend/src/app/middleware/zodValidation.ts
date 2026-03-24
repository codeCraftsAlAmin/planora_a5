import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequeset = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // convert data into json
    if (req.body.result) {
      req.body = JSON.parse(req.body.result);
    }

    // validate data
    const parsedResult = zodSchema.safeParse(req.body);

    // throw validation error
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    // sanitize the data
    req.body = parsedResult.data;
    next();
  };
};
