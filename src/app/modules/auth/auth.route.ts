import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post("/login", AuthController.credentialLogin);

export const AuthRouter = router;
