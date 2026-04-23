import { Router } from "express";
import {
  createOneInventoryMovement,
  createOneMaterial,
  createOneMaterialCategory,
  getAllInventoryMovements,
  getAllMaterialCategories,
  getAllMaterials,
  getOneMaterial,
  updateOneMaterial,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get(
  "/categories",
  requirePermission("materials.view"),
  getAllMaterialCategories
);

router.post(
  "/categories",
  requirePermission("materials.create"),
  createOneMaterialCategory
);

router.get("/", requirePermission("materials.view"), getAllMaterials);
router.get("/:id", requirePermission("materials.view"), getOneMaterial);
router.post("/", requirePermission("materials.create"), createOneMaterial);
router.put("/:id", requirePermission("materials.update"), updateOneMaterial);

router.get(
  "/inventory/movements",
  requirePermission("materials.movements.view"),
  getAllInventoryMovements
);

router.post(
  "/inventory/movements",
  requirePermission("materials.movements.create"),
  createOneInventoryMovement
);

export default router;