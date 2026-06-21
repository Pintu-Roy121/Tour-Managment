import { Router } from "express";
import { AuthRouter } from "../modules/auth/auth.route.js";
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
];

moduleRoutes.forEach((route) => {
  router.use(route?.path, route?.route);
});
