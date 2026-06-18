/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { UserServices } from "./user.service.js";

// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // console.log(req.body);
//     // const { name, email } = req.body;
//     // const user = await User.create({ name, email });
//     // throw new AppError(httpStatus.BAD_REQUEST, "Fake error");
//     const user = await UserServices?.createUser(req.body);

//     res.status(httpStatus.OK).json({
//       message: "User created successfully",
//       user,
//     });
//   } catch (err) {
//     // res.status(httpStatus.BAD_REQUEST).json({
//     //   message: `Something went wrong ${err}`,
//     // });
//     next(err);
//   }
// };

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices?.createUser(req.body);

    // res.status(httpStatus.OK).json({
    //   message: "User created successfully",
    //   user,
    // });

    SendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Successful",
      data: user,
    });
  },
);

// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const users = await UserServices?.getAllUsers();
//     res.status(httpStatus.OK).json({
//       success: true,
//       message: "All Users Retrieved Successfully",
//       data: users,
//     });
//     // return users;
//   } catch (err) {
//     next(err);
//   }
// };
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices?.getAllUsers();
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: "All Users Retrieved Successfully",
    //   data: users,
    // });
    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successful",
      data: result?.data,
      meta: result?.meta,
    });
  },
);

export const UserController = { createUser, getAllUsers };
