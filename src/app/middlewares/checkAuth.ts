import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { envVers } from "../config/env.js";
import AppError from "../errorHelpers/appError.js";
import { verifyToken } from "../utils/jwt.js";

export const checkAuth =
  (...authRole: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        throw new AppError(httpStatus.FORBIDDEN, "No Token found");
      }

      // const verifyToken = jwt.verify(accessToken, "secret");
      const verifiedToken = verifyToken(
        accessToken,
        envVers.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      if (!authRole.includes(verifiedToken.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
