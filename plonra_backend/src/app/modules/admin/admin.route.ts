import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router: Router = Router();

// TODO: gotta add query builder
// get all users route
router.get(
  "/users",
  checkAuth(Role.ADMIN),
  adminController.getAllUsersController,
);

// delete user
router.delete(
  "/delete/user/:id",
  checkAuth(Role.ADMIN),
  adminController.deleteUserController,
);

export const adminRouter: Router = router;
