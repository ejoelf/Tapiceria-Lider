import { Router } from "express";
import {
  exportMonthlySummaryAsCsv,
  exportMonthlySummaryAsJson,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get(
  "/monthly-summary/json",
  requirePermission("dashboard.view"),
  exportMonthlySummaryAsJson
);

router.get(
  "/monthly-summary/csv",
  requirePermission("dashboard.view"),
  exportMonthlySummaryAsCsv
);

export default router;