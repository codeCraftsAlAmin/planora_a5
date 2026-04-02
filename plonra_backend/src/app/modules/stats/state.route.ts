import express from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { statsController } from "./state.controller";

const router = express.Router();

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.USER, Role.HOST),
  statsController.getDashboardStatsData,
);

export const statsRouter = router;