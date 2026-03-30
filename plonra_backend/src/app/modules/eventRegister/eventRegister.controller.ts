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
      data: result,
    });
  },
);

const getAllEventRegistrationsController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await eventRegisterService.getAllEventRegistrationsService(
      user!,
    );
    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Event registrations fetched successfully",
      data: result,
    });
  },
);

const updateRegistrationController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;

    const result = await eventRegisterService.updateRegistrationService(
      id as string,
      user!,
      req.body.status,
    );
    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Registration updated successfully",
      data: result,
    });
  },
);

const refundRegistrationController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;

    const result = await eventRegisterService.refundRegistrationService(
      id as string,
      user!,
    );
    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Registration refunded successfully",
      data: result,
    });
  },
);

export const eventRegisterController = {
  createEventRegisterController,
  getAllEventRegistrationsController,
  updateRegistrationController,
  refundRegistrationController,
};
