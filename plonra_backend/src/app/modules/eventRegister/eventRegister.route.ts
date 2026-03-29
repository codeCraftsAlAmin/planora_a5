import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { eventRegisterController } from "./eventRegister.controller";

const router: Router = Router();

// create event route
router.post(
  "/register/:id",
  checkAuth(Role.USER),
  eventRegisterController.createEventRegisterController,
);

// get all event registrations
router.get(
  "/",
  checkAuth(Role.USER, Role.ADMIN),
  eventRegisterController.getAllEventRegistrationsController,
);

// update registration status
router.put(
  "/update/:id",
  checkAuth(Role.ADMIN, Role.HOST),
  eventRegisterController.updateRegistrationController,
);

// refund rejected registration
router.put(
  "/refund/:id",
  checkAuth(Role.ADMIN, Role.HOST),
  eventRegisterController.refundRegistrationController,
);

export const eventRegisterRouter: Router = router;
