import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { envVers } from "../../config/env.js";
import AppError from "../../errorHelpers/appError.js";
import { Role, type IAuthProvider, type IUser } from "./user.interface.js";
import { User } from "./user.model.js";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist!");
  }

  const hasPassword = await bcrypt.hash(
    password as string,
    Number(envVers.BCRYPT_SALT_ROUND),
  );

  const authProvider: IAuthProvider = {
    provider: "Credential",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hasPassword,
    auths: [authProvider],
    ...rest,
  });
  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      envVers.BCRYPT_SALT_ROUND,
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({}).select("-password");
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

export const UserServices = { createUser, getAllUsers, updateUser };
