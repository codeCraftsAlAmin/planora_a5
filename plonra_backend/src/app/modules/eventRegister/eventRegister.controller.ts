import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { Request, Response } from "express";
import { eventRegisterService } from "./eventRegister.service";

const createEventRegisterController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id;
    
    const result = await eventRegisterService.createEventRegisterService(
      user!,
      id as string,
    );
    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Event registered successfully",
    });
  },
);

export const eventRegisterController = {
  createEventRegisterController,
};
