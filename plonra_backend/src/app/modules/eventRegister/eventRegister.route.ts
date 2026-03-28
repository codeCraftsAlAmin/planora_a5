import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { eventRegisterController } from "./eventRegister.controller";
import { validateRequeset } from "../../middleware/zodValidation";
import { registerEventValidation } from "./eventRegister.validations";

const router: Router = Router();

// create event route
router.post(
  "/register/:id",
  checkAuth(Role.USER),
  eventRegisterController.createEventRegisterController,
);

export const eventRegisterRouter: Router = router;
