import type { Response } from "express";

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setCookie = (res: Response, tokenInfo: AuthToken) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: false,
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: false,
    });
  }
};
