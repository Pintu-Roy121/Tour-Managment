import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

const credentialLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialLogin(req.body);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successful",
      data: loginInfo,
    });
  },
);

export const AuthController = { credentialLogin };
