import { Router } from "express";
import {
  createOneVehicleBrand,
  createOneVehicleModel,
  createOneVehicleType,
  getAllVehicleBrands,
  getAllVehicleModels,
  getAllVehicleTypes,
  updateOneVehicleBrand,
  updateOneVehicleModel,
  updateOneVehicleType,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/brands", requirePermission("vehicles.view"), getAllVehicleBrands);
router.post("/brands", requirePermission("vehicles.create"), createOneVehicleBrand);
router.put("/brands/:id", requirePermission("vehicles.update"), updateOneVehicleBrand);

router.get("/models", requirePermission("vehicles.view"), getAllVehicleModels);
router.post("/models", requirePermission("vehicles.create"), createOneVehicleModel);
router.put("/models/:id", requirePermission("vehicles.update"), updateOneVehicleModel);

router.get("/types", requirePermission("vehicles.view"), getAllVehicleTypes);
router.post("/types", requirePermission("vehicles.create"), createOneVehicleType);
router.put("/types/:id", requirePermission("vehicles.update"), updateOneVehicleType);

export default router;