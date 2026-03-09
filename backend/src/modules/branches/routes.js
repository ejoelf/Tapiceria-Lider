import { Router } from "express";
import { getAllBranches } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);
router.get("/", requirePermission("branches.view"), getAllBranches);

export default router;