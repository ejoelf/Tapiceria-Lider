import { Router } from "express";
import {
  createOneEmployee,
  getAllEmployees,
  getOneEmployee,
  updateOneEmployee,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("employees.view"), getAllEmployees);
router.get("/:id", requirePermission("employees.view"), getOneEmployee);
router.post("/", requirePermission("employees.create"), createOneEmployee);
router.put("/:id", requirePermission("employees.update"), updateOneEmployee);

export default router;