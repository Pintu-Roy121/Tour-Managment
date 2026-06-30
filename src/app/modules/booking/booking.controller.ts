import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync.js";
import { SendResponse } from "../../utils/sendResponse.js";
import { BookingService } from "./booking.service.js";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;
  const booking = await BookingService.createBooking(
    req.body,
    decodeToken.userId,
  );
  SendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await BookingService.getUserBookings();
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings,
  });
});
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await BookingService.getBookingById();
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await BookingService.getAllBookings();
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: {},
    // meta: {},
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const updated = await BookingService.updateBookingStatus();
  SendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking Status Updated Successfully",
    data: updated,
  });
});

export const BookingController = {
  createBooking,
  getUserBookings,
  getSingleBooking,
  getAllBookings,
  updateBookingStatus,
};
