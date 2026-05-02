import express, { Application, Request, Response } from "express";
import { authRouter } from "./app/modules/auth/auth.route";
import globalErrorHandler from "./app/middleware/globarError";
import { routeError } from "./app/middleware/routeError";
import cors from "cors";
import { envVars } from "./app/config/env";
import cookieParser from "cookie-parser";
import { userRouter } from "./app/modules/users/user.route";
import { adminRouter } from "./app/modules/admin/admin.route";
import qs from "qs";
import { eventRouter } from "./app/modules/events/event.route";
import { eventRegisterRouter } from "./app/modules/eventRegister/eventRegister.route";
import { paymentController } from "./app/modules/payment/payment.controller";
import cron from "node-cron";
import { eventRegisterService } from "./app/modules/eventRegister/eventRegister.service";
import { notificationRouter } from "./app/modules/notifications/notification.route";
import { invitationRouter } from "./app/modules/invitations/invitation.route";
import { invitationService } from "./app/modules/invitations/invitation.service";
import { reviewsRouter } from "./app/modules/reviews/reviews.route";
import { statsRouter } from "./app/modules/stats/state.route";
import { searchRouter } from "./app/modules/ai-search/search.route";

const app: Application = express();

// for query builder
app.set("query parser", (str: string) => qs.parse(str));

// for stripe webhook
app.use(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handlePaymentWebhookController,
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    allowedHeaders: ["content-type", "authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// cancel unpaid registration every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running scheduled cleanup tasks...");

    await eventRegisterService.cancelUnpaidRegistration();
    await invitationService.deleteExpiredInvitations();
  } catch (error: any) {
    console.error(
      "Error occurred while running scheduled cleanup tasks:",
      error.message,
    );
  }
});

// stats router
app.use("/api/v1/stats", statsRouter);

// reviews router
app.use("/api/v1/reviews", reviewsRouter);

// invitations router
app.use("/api/v1/invitations", invitationRouter);

// event register router
app.use("/api/v1/event-register", eventRegisterRouter);

// notification router
app.use("/api/v1/notifications", notificationRouter);

// event router
app.use("/api/v1/events", eventRouter);

// auth router
app.use("/api/v1/auth", authRouter);

// user router
app.use("/api/v1/users", userRouter);

// admin router
app.use("/api/v1/admin", adminRouter);

// ai search router
app.use("/api/v1/ai", searchRouter);

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

// route error handler
app.use(routeError);

// global error handler
app.use(globalErrorHandler);

export default app;
