import { Router } from "express";
import {
  createOneVehicle,
  getAllVehicleBrands,
  getAllVehicleModels,
  getAllVehicles,
  getOneVehicle,
  updateOneVehicle,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/brands", requirePermission("vehicles.view"), getAllVehicleBrands);
router.get("/models", requirePermission("vehicles.view"), getAllVehicleModels);
router.get("/", requirePermission("vehicles.view"), getAllVehicles);
router.get("/:id", requirePermission("vehicles.view"), getOneVehicle);
router.post("/", requirePermission("vehicles.create"), createOneVehicle);
router.put("/:id", requirePermission("vehicles.update"), updateOneVehicle);

export default router;