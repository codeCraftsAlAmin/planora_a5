import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";
import { validateRequeset } from "../../middleware/zodValidation";
import { userValidation } from "./user.validation";
import { multerUpload } from "../../config/multer.config";

const router: Router = Router();

// get my profile route
router.get(
  "/my-profile",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  userController.getMyProfileController,
);

// update profile route
router.put(
  "/update/my-profile",
  checkAuth(Role.USER, Role.HOST, Role.ADMIN),
  multerUpload.single("image"),
  validateRequeset(userValidation.updateMyProfileValidation),
  userController.updateMyProfileController,
);



// become a host route
router.put(
  "/become-host",
  checkAuth(Role.USER),
  userController.becomeHostController,
);

export const userRouter: Router = router;
