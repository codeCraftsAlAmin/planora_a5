import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminService } from "./admin.service";

const getAllUsersController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllUsersService();

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "All users fetched successfully",
      data: result,
    });
  },
);

const deleteUserController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await adminService.deleteUserService(id as string, user!);

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "User deleted successfully",
    data: result,
  });
});

export const adminController = {
  getAllUsersController,
  deleteUserController,
};
