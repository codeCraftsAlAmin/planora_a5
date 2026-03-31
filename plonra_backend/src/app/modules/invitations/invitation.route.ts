import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { invitationController } from "./invitation.controller";

const router: Router = Router();

// send invitaion
router.post("/send", checkAuth(Role.HOST), invitationController.sendInvitation);

// accept invitaion
router.post(
  "/accept/:id",
  checkAuth(Role.USER),
  invitationController.acceptInvitation,
);

// reject invitaion
router.post(
  "/reject/:id",
  checkAuth(Role.USER),
  invitationController.rejectInvitation,
);

export const invitationRouter: Router = router;
