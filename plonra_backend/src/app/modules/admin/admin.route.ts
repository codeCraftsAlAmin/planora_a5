import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router: Router = Router();

// delete user
router.delete(
  "/delete/user/:id",
  checkAuth(Role.ADMIN),
  adminController.deleteUserController,
);

// ban and unban user
router.put(
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

// update event isFeatured route
router.put(
  "/update/featured/:id",
  checkAuth(Role.ADMIN),
  adminController.updateFeaturedController,
);

export const adminRouter: Router = router;
