import { Router } from "express";
import {
  createWorkOrderMedia,
  deleteWorkOrderMedia,
  getWorkOrderMedia,
  updateWorkOrderMedia,
  uploadWorkOrderMediaFile,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { uploadWorkOrderMedia } from "../../middlewares/upload.middleware.js";

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

router.post(
  "/work-order/:workOrderId/upload",
  requirePermission("work-order-media.create"),
  (req, res, next) => {
    uploadWorkOrderMedia(req, res, (error) => {
      if (error) return next(error);
      next();
    });
  },
  uploadWorkOrderMediaFile
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