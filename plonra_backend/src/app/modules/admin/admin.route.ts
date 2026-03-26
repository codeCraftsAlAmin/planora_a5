import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router: Router = Router();

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

// ban and unban user
router.patch(
  "/ban/user/:id",
  checkAuth(Role.ADMIN),
  adminController.banUserController,
);

// update role route
router.put(
  "/update/role",
  checkAuth(Role.ADMIN),
  adminController.updateRoleController,
);

export const adminRouter: Router = router;
