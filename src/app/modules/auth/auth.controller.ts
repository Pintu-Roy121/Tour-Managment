import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { envVers } from "../../config/env.js";
import AppError from "../../errorHelpers/appError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { setCookie } from "../../utils/setCookies.js";
import { createUserToken } from "../../utils/userTokens.js";
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
      message: "New Access Token Retrieve successful",
      data: tokenInfo,
    });
  },
);
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logout successful",
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

    await AuthService.resetPassword(
      newPassword,
      oldPassword,
      decodedToken as JwtPayload,
    );

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully!",
      data: null,
    });
  },
);
const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    let redirectTO = req.query.state ? (req.query.state as string) : "";

    if (redirectTO.startsWith("/")) {
      redirectTO = redirectTO.slice(1);
    }

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    const tokenInfo = createUserToken(user);

    setCookie(res, tokenInfo);

    // SendResponse(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: "New Access Token Retrieve successful",
    //   data: null,
    // });

    res.redirect(`${envVers.FRONTEND_URL}/${redirectTO}`);
  },
);

export const AuthController = {
  credentialLogin,
  getNewAccessToken,
  resetPassword,
  logout,
  googleCallbackController,
};
