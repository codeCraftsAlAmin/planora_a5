import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequeset } from "../../middleware/zodValidation";
import { authValidation } from "./auth.validation";

const router: Router = Router();
// sign-up route
router.post(
  "/sign-up/email",
  validateRequeset(authValidation.signUpEmailSchema),
  authController.signUpController,
);

// sign-in route
router.post("/sign-in/email", authController.signInController);

// sign-out route
router.post("/sign-out", authController.signOutController);

// refresh token route
router.post("/refresh-token", authController.refreshTokenController);

// change password route
router.post(
  "/change-password",
  validateRequeset(authValidation.changePasswordSchema),
  authController.changePasswordController,
);

// verify email route
router.post("/email-otp/verify-email", authController.verifyEmailController);

// forget-password request route
router.post(
  "/email-otp/request-password-reset",
  authController.forgetPasswordRequestController,
);

// reset password route
router.post(
  "/email-otp/reset-password",
  authController.resetPasswordController,
);

export const authRouter: Router = router;
