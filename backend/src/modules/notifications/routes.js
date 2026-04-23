import { Router } from "express";
import {
  createOneNotification,
  getAllNotifications,
  getMyNotifications,
  markOneNotificationAsRead,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/me", requirePermission("notifications.view"), getMyNotifications);
router.get("/", requirePermission("notifications.view"), getAllNotifications);
router.post("/", requirePermission("notifications.manage"), createOneNotification);
router.patch("/:id/read", requirePermission("notifications.view"), markOneNotificationAsRead);

export default router;