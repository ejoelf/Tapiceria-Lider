import { Router } from "express";
import {
  createOneUser,
  getAllUsers,
  getOneUser,
  toggleOneUserStatus,
  updateOneUser,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("users.view"), getAllUsers);
router.get("/:id", requirePermission("users.view"), getOneUser);
router.post("/", requirePermission("users.create"), createOneUser);
router.put("/:id", requirePermission("users.update"), updateOneUser);
router.patch("/:id/toggle-status", requirePermission("users.toggle-status"), toggleOneUserStatus);

export default router;