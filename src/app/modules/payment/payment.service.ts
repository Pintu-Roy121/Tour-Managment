/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config.js";
import AppError from "../../errorHelpers/appError.js";
import { type IInvoiceData } from "../../utils/invoice.js";
import { generateInvoice } from "../../utils/invoiceGPT.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { BOOKING_STATUS } from "../booking/booking.interface.js";
import { Booking } from "../booking/booking.mode.js";
import type { ISSLCommerz } from "../sslCommerz/sslCommerz.interface.js";
import { SSLService } from "../sslCommerz/sslCommerz.service.js";
import type { ITour } from "../tour/tour.interface.js";
import type { IUser } from "../user/user.interface.js";
import { PAYMENT_STATUS } from "./payment.interface.js";
import { Payment } from "./payment.model.js";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment Not Found. You have not booked this tour",
    );
  }

  const booking = await Booking.findById(payment.booking);

  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};

const successPayment = async (query: Record<string, string>) => {
  // Update Booking Status to COnfirm
  // Update Payment Status to PAID

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.PAID,
      },
      { new: true, runValidators: true, session: session },
    );

    if (!updatedPayment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found");
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.COMPLETE },
      { runValidators: true, session },
    )
      .populate("tour", "title")
      .populate("user", "name email address phone");

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking Not Found");
    }

    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      userName: (updatedBooking.user as unknown as IUser).name,
    };

    // const pdfBuffer1 = await generatePdf(invoiceData);
    const pdfBuffer = await generateInvoice({
      invoiceNo: invoiceData.transactionId,
      date: invoiceData.bookingDate.toDateString(),

      customer: {
        name: invoiceData.userName,
        address: (updatedBooking.user as unknown as IUser)?.address || "",
        phone:
          (updatedBooking.user as unknown as IUser)?.phone || "+88018*****9",
      },

      items: [
        {
          description: invoiceData.tourTitle,
          quantity: invoiceData.guestCount,
          price: invoiceData.totalAmount / invoiceData.guestCount,
        },
      ],

      shipping: 20,
      tax: 15,

      paymentMethod: "Bank Transfer",
      accountName: "ABC Company",
      bankName: "City Bank",
    });

    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice",
    );
    console.log(cloudinaryResult);
    if (!cloudinaryResult) {
      throw new AppError(401, "Upload Url not found!");
    }

    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      {
        invoiceUrl: cloudinaryResult?.secure_url,
      },
      { runValidators: true, session },
    );

    await sendEmail({
      to: (updatedBooking.user as unknown as IUser).email,
      subject: "Your Booking Invoice",
      templateName: "invoice",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer as any,
          contentType: "application/pdf",
        },
      ],
    });

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: true, message: "Payment Completed Successfully" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  // Update Booking Status to FAIL
  // Update Payment Status to FAIL

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.FAILED,
      },
      { new: true, runValidators: true, session: session },
    );

    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.FAILED },
      { runValidators: true, session },
    );

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "Payment Failed" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  // Update Booking Status to CANCEL
  // Update Payment Status to CANCEL

  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: PAYMENT_STATUS.CANCELLED,
      },
      { runValidators: true, session: session },
    );

    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.CANCEL },
      { runValidators: true, session },
    );

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "Payment Cancelled" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).select("invoiceUrl");

  if (!payment) {
    throw new AppError(401, "Payment not found");
  }

  if (!payment.invoiceUrl) {
    throw new AppError(401, "No invoice found");
  }

  return payment.invoiceUrl;
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
};
