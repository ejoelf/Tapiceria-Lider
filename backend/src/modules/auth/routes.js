import { Router } from "express";
import {
  changeMyPassword,
  login,
  me,
  updateMe,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.post("/login", login);

router.get("/me", protect, requirePermission("profile.view"), me);
router.put("/me", protect, requirePermission("profile.update"), updateMe);
router.patch(
  "/change-password",
  protect,
  requirePermission("profile.change-password"),
  changeMyPassword
);

export default router;