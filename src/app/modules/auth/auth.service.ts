import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVers } from "../../config/env.js";
import AppError from "../../errorHelpers/appError.js";
import { generateToken } from "../../utils/jwt.js";
import type { IUser } from "../user/user.interface.js";
import { User } from "../user/user.model.js";

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password: inputPassword } = payload;
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const isPasswordMatch = await bcrypt.compare(
    inputPassword as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Wrong Password!");
  }

  //   const accessToken = jwt.sign(
  //     {
  //       userId: isUserExist._id,
  //       email: isUserExist.email,
  //       role: isUserExist.role,
  //     },
  //     "secret",
  //     { expiresIn: "1d" },
  //   );
  const accessToken = generateToken(
    {
      userId: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
    },
    envVers.JWT_ACCESS_SECRET,
    envVers.JWT_ACCESS_EXPIRES,
  );

  return {
    name: isUserExist.name,
    email: isUserExist.email,
    accessToken,
  };
};

export const AuthService = {
  credentialLogin,
};
