import { Router } from "express";
import {
  createOneExpense,
  createOneIncome,
  getAllExpenses,
  getAllIncomes,
} from "./controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const router = Router();

router.use(protect);

router.get("/incomes", requirePermission("finances.manage"), getAllIncomes);
router.post("/incomes", requirePermission("finances.manage"), createOneIncome);

router.get("/expenses", requirePermission("finances.manage"), getAllExpenses);
router.post("/expenses", requirePermission("finances.manage"), createOneExpense);

export default router;