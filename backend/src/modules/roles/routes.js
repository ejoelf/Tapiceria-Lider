import { Router } from "express";
import { getAllRoles } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);
router.get("/", requirePermission("roles.view"), getAllRoles);

export default router;