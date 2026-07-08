import { Router } from "express";
import { multerUpload } from "../../config/multer.config.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateReques.js";
import { UserController } from "./user.controller.js";
import { Role } from "./user.interface.js";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  multerUpload.single("file"),
  UserController.createUser,
);
router.get(
  "/all-users",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getAllUsers,
);
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getSingleUser,
);
router.patch(
  "/update/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  multerUpload.single("file"),
  UserController.updateUser,
);

export const UserRoutes = router;
