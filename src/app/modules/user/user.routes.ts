import { Router } from "express";
import { UserController } from "./user.controller.js";

const router = Router();

router.post("/register", UserController.createUser);
router.get("/all-users", UserController.getAllUsers);

export const UserRoutes = router;
