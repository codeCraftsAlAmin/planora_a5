import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { eventController } from "./event.controller";
import { eventValidation } from "./event.validation";
import { validateRequeset } from "../../middleware/zodValidation";

const router: Router = Router();

// create event route
router.post(
  "/create",
  checkAuth(Role.HOST),
  multerUpload.single("image"),
  validateRequeset(eventValidation.createEventValidation),
  eventController.createEventController,
);

// get my events route
router.get(
  "/my-event",
  checkAuth(Role.HOST),
  eventController.getMyEventsController,
);

// delete event route
router.delete(
  "/delete/:id",
  checkAuth(Role.HOST, Role.ADMIN),
  eventController.deleteEventController,
);

// update my event route
router.put(
  "/update/:id",
  checkAuth(Role.HOST),
  multerUpload.single("image"),
  validateRequeset(eventValidation.updateEventValidation),
  eventController.updateMyEventController,
);

// get all events
router.get("/", eventController.getAllEventsController);

export const eventRouter: Router = router;
