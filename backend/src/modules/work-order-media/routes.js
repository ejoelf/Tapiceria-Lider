import { Router } from "express";
import {
  createWorkOrderMedia,
  deleteWorkOrderMedia,
  getWorkOrderMedia,
  updateWorkOrderMedia,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get(
  "/work-order/:workOrderId",
  requirePermission("work-order-media.view"),
  getWorkOrderMedia
);

router.post(
  "/work-order/:workOrderId",
  requirePermission("work-order-media.create"),
  createWorkOrderMedia
);

router.put(
  "/:mediaId",
  requirePermission("work-order-media.update"),
  updateWorkOrderMedia
);

router.delete(
  "/:mediaId",
  requirePermission("work-order-media.delete"),
  deleteWorkOrderMedia
);

export default router;