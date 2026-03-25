import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";

const router: Router = Router();

// get my profile route
router.get(
  "/my-profile",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  userController.getMyProfileController,
);

export const userRouter: Router = router;
