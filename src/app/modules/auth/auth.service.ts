import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { envVers } from "../../config/env.js";
import AppError from "../../errorHelpers/appError.js";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens.js";
import { User } from "../user/user.model.js";

// const credentialLogin = async (payload: Partial<IUser>) => {
//   const { email, password: inputPassword } = payload;
//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
//   }

//   const isPasswordMatch = await bcrypt.compare(
//     inputPassword as string,
//     isUserExist.password as string,
//   );

//   if (!isPasswordMatch) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Wrong Password!");
//   }

//   const userToken = createUserToken(isUserExist);

//   const { password, ...rest } = isUserExist.toObject();

//   return {
//     user: rest,
//     accessToken: userToken.accessToken,
//     refreshToken: userToken.refreshToken,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  newPassword: string,
  olePassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found!");
  }
  const passwordMatch = await bcrypt.compare(
    olePassword,
    user?.password as string,
  );

  if (!passwordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match!");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(envVers.BCRYPT_SALT_ROUND),
  );

  user.save();
};

export const AuthService = {
  // credentialLogin,
  getNewAccessToken,
  resetPassword,
};
