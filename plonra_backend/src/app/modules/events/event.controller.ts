import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { eventService } from "./event.service";
import { IQueryParams } from "../../interface/query.interface";

const createEventController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = {
      ...req.body,
      image: req.file?.path,
    };

    const result = await eventService.createEventService(user!, payload);

    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Event created successfully",
      data: result,
    });
  },
);

const getMyEventsController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await eventService.getMyEventsService(user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "My events fetched successfully",
      data: result,
    });
  },
);

const deleteEventController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    const result = await eventService.deleteEventService(user!, id as string);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Event deleted successfully",
      data: result,
    });
  },
);

const updateMyEventController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const { id } = req.params;
    const payload = {
      ...req.body,
      image: req.file?.path,
    };

    const result = await eventService.updateMyEventService(
      user!,
      id as string,
      payload,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Event updated successfully",
      data: result,
    });
  },
);

const getAllEventsController = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await eventService.getAllEventsService(
      query as IQueryParams,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "All events fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const eventController = {
  createEventController,
  deleteEventController,
  getMyEventsController,
  updateMyEventController,
  getAllEventsController,
};
