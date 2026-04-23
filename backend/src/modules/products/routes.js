import { Router } from "express";
import {
  createOneProduct,
  createOneProductCategory,
  getAllProductCategories,
  getAllProducts,
  getOneProduct,
  updateOneProduct,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get(
  "/categories",
  requirePermission("products.view"),
  getAllProductCategories
);

router.post(
  "/categories",
  requirePermission("products.create"),
  createOneProductCategory
);

router.get("/", requirePermission("products.view"), getAllProducts);
router.get("/:id", requirePermission("products.view"), getOneProduct);
router.post("/", requirePermission("products.create"), createOneProduct);
router.put("/:id", requirePermission("products.update"), updateOneProduct);

export default router;