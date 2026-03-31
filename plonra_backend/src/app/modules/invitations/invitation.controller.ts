import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { invitationService } from "./invitation.service";
import { Request, Response } from "express";

const sendInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { eventId, inviteeId } = req.body;
  const result = await invitationService.sendInvitation(
    user!,
    eventId,
    inviteeId,
  );
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Invitation sent successfully",
    data: result,
  });
});

const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  const result = await invitationService.acceptInvitation(user!, id as string);
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const rejectInvitation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id;

  const result = await invitationService.rejectInvitation(user!, id as string);
  sendResponse(res, {
    ok: true,
    statusCode: status.OK,
    message: "Invitation rejected successfully",
    data: result,
  });
});

export const invitationController = {
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
};
