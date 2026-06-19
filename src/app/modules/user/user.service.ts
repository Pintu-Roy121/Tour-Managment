import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError.js";
import type { IAuthProvider, IUser } from "./user.interface.js";
import { User } from "./user.model.js";

const createUser = async (payload: Partial<IUser>) => {
  const { email, ...rest } = payload;
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist!");
  }

  const authProvider: IAuthProvider = {
    provider: "Credential",
    providerId: email as string,
  };
  const user = await User.create({ email, auths: [authProvider], ...rest });
  return user;
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

export const UserServices = { createUser, getAllUsers };
