import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env.js";
import AppError from "../errorHelpers/appError.js";
import { IsActive } from "../modules/user/user.interface.js";
import { User } from "../modules/user/user.model.js";
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
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`,
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRole.includes(verifiedToken.role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
