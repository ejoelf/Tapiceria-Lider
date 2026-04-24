import { Router } from "express";
import { getDashboard } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("dashboard.view"), getDashboard);

export default router;