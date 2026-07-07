import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { OTPService } from "./opt.service.js";

const sentOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  await OTPService.sendOTP(email, name);
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP sent successfully",
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});

export const OTPController = {
  sentOTP,
  verifyOTP,
};
