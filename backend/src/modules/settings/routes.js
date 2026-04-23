import { Router } from "express";
import { getAllSettings, upsertOneSetting } from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("profile.view"), getAllSettings);
router.post("/", requirePermission("profile.update"), upsertOneSetting);

export default router;