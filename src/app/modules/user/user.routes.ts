import { Router } from "express";
import { validateRequest } from "../../middlewares/validateReques.js";
import { UserController } from "./user.controller.js";
import { createUserZodSchema } from "./user.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser,
);
router.get("/all-users", UserController.getAllUsers);

export const UserRoutes = router;
