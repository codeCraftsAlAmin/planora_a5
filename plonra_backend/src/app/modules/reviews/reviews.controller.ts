import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { reviewsService } from "./reviews.service";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  const result = await reviewsService.createReview(user!, req.body, id as string);
  sendResponse(res, {
    ok: true,
    statusCode: status.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewsService.getAllReviews();
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const comment = req.body.comment;
  const { id } = req.params;

  const result = await reviewsService.updateComment(
    user!,
    comment,
    id as string,
  );
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  await reviewsService.deleteComment(user!, id as string);
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Review deleted successfully",
  });
});

const replyComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const comment = req.body.comment;
  const { id } = req.params;

  const result = await reviewsService.replyComment(
    user!,
    comment,
    id as string,
  );
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Review replied successfully",
    data: result,
  });
});

export const reviewsController = {
  createReview,
  getAllReviews,
  updateComment,
  deleteComment,
  replyComment,
};
