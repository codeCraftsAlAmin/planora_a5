import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { notificationController } from "./notification.controller";

const router: Router = Router();

// get my notifications route
router.get(
  "/my-notifications",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  notificationController.getMyNotificationsController,
);

// mark as read route
router.put(
  "/mark-as-read/:id",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  notificationController.markAsReadController,
);

// get my unread notifications count route
router.get(
  "/my-unread-notifications-count",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  notificationController.getMyUnreadNotificationsCountController,
);

export const notificationRouter: Router = router;
