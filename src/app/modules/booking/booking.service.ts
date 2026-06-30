import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError.js";
import { PAYMENT_STATUS } from "../payment/payment.interface.js";
import { Payment } from "../payment/payment.model.js";
import { Tour } from "../tour/tour.model.js";
import { User } from "../user/user.model.js";
import { BOOKING_STATUS, type IBooking } from "./booking.interface.js";
import { Booking } from "./booking.mode.js";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  // const user = await User.findById(userId);
  // if (!user?.phone || !user.address) {
  //   throw new AppError(
  //     httpStatus.NOT_FOUND,
  //     "Please update your profile to book a tour",
  //   );
  // }

  // const tour = await Tour.findById(payload.tour).select("costFrom");
  // if (!tour?.costFrom) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
  // }
  // const amount = Number(payload.guestCount) * Number(tour.costFrom);

  // const booking = await Booking.create({
  //   user: userId,
  //   status: BOOKING_STATUS.PENDING,
  //   ...payload,
  // });

  // const payment = await Payment.create({
  //   booking: booking?._id,
  //   status: PAYMENT_STATUS.UNPAID,
  //   transactionId,
  //   amount,
  // });

  // const updateBooking = await Booking.findByIdAndUpdate(
  //   booking?._id,
  //   { payment: payment._id },
  //   { new: true, runValidators: true },
  // )
  //   .populate("user", "name email phone address")
  //   .populate("tour", "title costFrom")
  //   .populate("payment");

  // return updateBooking;

  const session = await Booking.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId);
    if (!user?.phone || !user.address) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Please update your profile to book a tour",
      );
    }

    const tour = await Tour.findById(payload.tour).select("costFrom");
    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
    }
    const amount = Number(payload.guestCount) * Number(tour.costFrom);

    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session },
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]?._id,
          status: PAYMENT_STATUS.UNPAID,
          transactionId,
          amount,
        },
      ],
      { session },
    );

    const updateBooking = await Booking.findByIdAndUpdate(
      booking[0]?._id,
      { payment: payment[0]?._id },
      { new: true, runValidators: true, session },
    )
      .populate("user", "name email phone address")
      .populate("tour", "title costFrom")
      .populate("payment");

    await session.commitTransaction();
    session.endSession();
    return updateBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const getUserBookings = async () => {
  return {};
};
const getBookingById = async () => {
  return {};
};
const updateBookingStatus = async () => {
  return {};
};
const getAllBookings = async () => {
  return {};
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
