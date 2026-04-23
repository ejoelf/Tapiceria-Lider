import { Router } from "express";
import {
  createOneMold,
  createOneMoldFile,
  createOneTechnicalPart,
  getAllMolds,
  getAllTechnicalParts,
  getOneMold,
  updateOneMold,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/parts", requirePermission("molds.view"), getAllTechnicalParts);
router.post("/parts", requirePermission("molds.create"), createOneTechnicalPart);

router.get("/", requirePermission("molds.view"), getAllMolds);
router.get("/:id", requirePermission("molds.view"), getOneMold);
router.post("/", requirePermission("molds.create"), createOneMold);
router.put("/:id", requirePermission("molds.update"), updateOneMold);
router.post("/:moldId/files", requirePermission("molds.files.create"), createOneMoldFile);

export default router;