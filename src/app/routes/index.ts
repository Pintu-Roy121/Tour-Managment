import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { BookingRoutes } from "../modules/booking/booking.route.js";
import { DivisionRoutes } from "../modules/division/division.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { TourRoutes } from "../modules/tour/tour.route.js";
import { UserRoutes } from "../modules/user/user.route.js";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
  {
    path: "/tour",
    route: TourRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route?.path, route?.route);
});
