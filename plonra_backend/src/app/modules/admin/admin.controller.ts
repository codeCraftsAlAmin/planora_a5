import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminService } from "./admin.service";

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

const banUserController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await adminService.banUserService(
    id as string,
    user!,
    req.body,
  );

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "User banned successfully",
    data: result,
  });
});

const updateRoleController = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.body;
  const result = await adminService.updateRoleService(role, id);

  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Role updated successfully",
    data: result,
  });
});

const updateFeaturedController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await adminService.updateFeaturedService(
      id as string,
      req.body,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Featured updated successfully",
      data: result,
    });
  },
);

export const adminController = {
  deleteUserController,
  banUserController,
  updateRoleController,
  updateFeaturedController,
};
