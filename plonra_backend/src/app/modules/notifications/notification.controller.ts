import { catchAsync } from "../../shared/catchAsync";
import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getMyNotificationsController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await notificationService.getMyNotificationsService(user!);
    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Your notifications fetched successfully",
      data: result,
    });
  },
);

const markAsReadController = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const result = await notificationService.markAsReadService(user!, id);
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Notification marked as read successfully",
    data: result,
  });
});

const getMyUnreadNotificationsCountController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await notificationService.getMyUnreadNotificationsCountService(user!);
    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Your unread notifications count fetched successfully",
      data: result,
    });
  },
);

export const notificationController = {
  getMyNotificationsController,
  markAsReadController,
  getMyUnreadNotificationsCountController,
};
