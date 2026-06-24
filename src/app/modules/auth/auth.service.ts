import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError.js";
import {
  createNewAccessTokenWithRefreshToken,
  createUserToken,
} from "../../utils/userTokens.js";
import { type IUser } from "../user/user.interface.js";
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

  const userToken = createUserToken(isUserExist);

  const { password, ...rest } = isUserExist.toObject();

  return {
    user: rest,
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  credentialLogin,
  getNewAccessToken,
};
