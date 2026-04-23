import { Router } from "express";
import { getDashboardData } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);
router.get("/", requirePermission("dashboard.view"), getDashboardData);

export default router;