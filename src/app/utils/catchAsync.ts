/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env.js";

type TAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const catchAsync =
  (fn: TAsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      if (envVars.NODE_ENV === "development") {
        console.log(err);
      }
      next(err);
    });
  };
