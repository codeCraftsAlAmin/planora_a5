import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";

const getMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await userService.getMyProfileService(user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "My profile fetched successfully",
      data: result,
    });
  },
);

const updateMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = {
      ...req.body,
      image: req.file?.path,
    };
    const result = await userService.updateMyProfileService(user!, payload);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "My profile updated successfully",
      data: result,
    });
  },
);

const becomeHostController = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await userService.becomeHostService(user!);

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "You are now a host",
    data: result,
  });
});

export const userController = {
  getMyProfileController,
  updateMyProfileController,
  becomeHostController,
};
