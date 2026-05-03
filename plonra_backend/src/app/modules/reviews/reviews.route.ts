import express from "express";
import { reviewsController } from "./reviews.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

// create review
router.post(
  "/create/:id",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  reviewsController.createReview,
);

// get all reviews
router.get("/", reviewsController.getAllReviews);

// update reviews
router.put(
  "/update/:id",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  reviewsController.updateComment,
);

// delete review
router.delete(
  "/delete/:id",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  reviewsController.deleteComment,
);

// reply comment
router.post(
  "/reply/:id",
  checkAuth(Role.USER, Role.HOST),
  reviewsController.replyComment,
);

export const reviewsRouter = router;
