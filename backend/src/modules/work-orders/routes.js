import { Router } from "express";
import {
  changeOneWorkOrderStatus,
  createOneWorkOrder,
  getAllWorkOrders,
  getAllWorkOrderStatuses,
  getOneWorkOrder,
  updateOneWorkOrder,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/statuses", requirePermission("work-orders.view"), getAllWorkOrderStatuses);
router.get("/", requirePermission("work-orders.view"), getAllWorkOrders);
router.get("/:id", requirePermission("work-orders.view"), getOneWorkOrder);
router.post("/", requirePermission("work-orders.create"), createOneWorkOrder);
router.put("/:id", requirePermission("work-orders.update"), updateOneWorkOrder);
router.patch(
  "/:id/change-status",
  requirePermission("work-orders.change-status"),
  changeOneWorkOrderStatus
);

export default router;