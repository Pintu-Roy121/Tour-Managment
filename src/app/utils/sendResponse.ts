import type { Response } from "express";

interface IMeta {
  page?: number;
  limit?: number;
  totalPage?: number;
  total: number;
}

interface IResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: IMeta;
}

export const SendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data?.statusCode).json({
    statusCode: data?.statusCode,
    success: data?.success,
    message: data?.message,
    data: data?.data,
    meta: data?.meta,
  });
};
