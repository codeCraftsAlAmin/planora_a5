import { envVars } from "../../config/env";
import stripe from "../../config/stripe.config";
import AppError from "../../middleware/appError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { paymentService } from "./payment.service";
import { Request, Response } from "express";
import status from "http-status";

const handlePaymentWebhookController = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webHookSecret = envVars.WEBHOOK_SEC_KEY;

    if (!signature || !webHookSecret) {
      throw new AppError(status.BAD_REQUEST, "Invalid webhook signature");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webHookSecret,
      );
    } catch (error: any) {
      throw new AppError(status.BAD_REQUEST, "Invalid webhook signature");
    }

    try {
      const result = await paymentService.handlePaymentWebhook(event);
      sendResponse(res, {
        ok: true,
        statusCode: status.OK,
        message: "Payment webhook handled successfully",
        data: result,
      });
    } catch (error) {
      sendResponse(res, {
        ok: false,
        statusCode: status.INTERNAL_SERVER_ERROR,
        message: "Payment webhook handled failed",
        data: error,
      });
    }
  },
);

export const paymentController = {
  handlePaymentWebhookController,
};
