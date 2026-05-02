import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";
import { searchService } from "./search.service";
import { Request, Response } from "express";

const search = catchAsync(async (req: Request, res: Response) => {
  const { query, page, limit } = req.query;

  const result = await searchService.search(
    query as string,
    Number(page) || 1,
    Number(limit) || 10,
  );

  sendResponse(res, {
    ok: true,
    statusCode: httpStatus.OK,
    message: "AI Search completed",
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / (Number(limit) || 10)),
    },
  });
});

const suggestion = catchAsync(async (req: Request, res: Response) => {
  const { query } = req.query;
  const result = await searchService.suggestion(query as string);
  sendResponse(res, {
    ok: true,
    statusCode: httpStatus.OK,
    message: "Suggestions fetched successfully",
      data: result,
    });
});

export const searchController = {
  search,
  suggestion,
};
