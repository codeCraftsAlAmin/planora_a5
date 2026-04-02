import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { statsService } from "./state.service";

const getDashboardStatsData = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await statsService.getDashboardStatsData(user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Dashboard stats data fetched successfully",
      data: result,
    });
  },
);

export const statsController = {
  getDashboardStatsData,
};
