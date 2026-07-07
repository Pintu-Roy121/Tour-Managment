import { Router } from "express";
import { OTPController } from "./otp.controller.js";

const router = Router();

router.post("/send", OTPController.sentOTP);
router.post("/verify", OTPController.verifyOTP);

export const OTPRoutes = router;
