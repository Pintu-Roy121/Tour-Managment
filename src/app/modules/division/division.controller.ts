import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { DivisionService } from "./division.service.js";

const createDivision = catchAsync(async (req: Request, res: Response) => {
  const result = await DivisionService.createDivision(req.body);

  SendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Division created",
    data: result,
  });
});

const updateDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const result = await DivisionService.updateDivision(id, req.body);
    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Division updated",
      data: result,
    });
  },
);

const getAllDivision = catchAsync(async (req: Request, res: Response) => {
  const result = await DivisionService.getAllDivision();
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Divisions retrieved",
    data: result.divisions,
    meta: result.meta,
  });
});

const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const result = await DivisionService.getSingleDivision(slug);
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Divisions retrieved",
    data: result,
  });
});

const deleteDivision = catchAsync(async (req: Request, res: Response) => {
  const result = await DivisionService.deleteDivision(req.params.id as string);
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Division deleted",
    data: result,
  });
});

export const DivisionController = {
  createDivision,
  updateDivision,
  getAllDivision,
  getSingleDivision,
  deleteDivision,
};
