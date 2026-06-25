import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.post("/login", AuthController.credentialLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);

export const AuthRouter = router;
