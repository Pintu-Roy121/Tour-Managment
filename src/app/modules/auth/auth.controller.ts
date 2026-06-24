import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { setCookie } from "../../utils/setCookies.js";
import { AuthService } from "./auth.service.js";

const credentialLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialLogin(req.body);

    setCookie(res, loginInfo);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successful",
      data: loginInfo,
    });
  },
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies",
      );
    }
    const tokenInfo = await AuthService.getNewAccessToken(refreshToken);

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    // });
    setCookie(res, tokenInfo);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successful",
      data: tokenInfo,
    });
  },
);

export const AuthController = { credentialLogin, getNewAccessToken };
