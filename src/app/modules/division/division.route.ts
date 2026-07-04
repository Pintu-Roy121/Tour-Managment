import { Router } from "express";
import { multerUpload } from "../../config/multer.config.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateReques.js";
import { Role } from "../user/user.interface.js";
import { DivisionController } from "./division.controller.js";
import {
  createDivisionSchema,
  updateDivisionSchema,
} from "./division.validation.js";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createDivisionSchema),
  DivisionController.createDivision,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateDivisionSchema),
  DivisionController.updateDivision,
);

router.get("/", DivisionController.getAllDivision);
router.get("/:slug", DivisionController.getSingleDivision);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DivisionController.deleteDivision,
);

export const DivisionRoutes = router;
