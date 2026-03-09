import { Router } from "express";
import {
  createOneClient,
  getAllClients,
  getOneClient,
  updateOneClient,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("clients.view"), getAllClients);
router.get("/:id", requirePermission("clients.view"), getOneClient);
router.post("/", requirePermission("clients.create"), createOneClient);
router.put("/:id", requirePermission("clients.update"), updateOneClient);

export default router;