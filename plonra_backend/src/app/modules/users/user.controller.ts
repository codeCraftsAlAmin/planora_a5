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

const updateRoleController = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id, role } = req.body;
  const result = await userService.updateRoleService(user!, role, id);

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Role updated successfully",
    data: result,
  });
});

export const userController = {
  getMyProfileController,
  updateMyProfileController,
  updateRoleController,
};
