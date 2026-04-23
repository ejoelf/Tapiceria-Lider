import { fn, col, literal } from "sequelize";
import {
  Branch,
  Expense,
  Income,
  User,
  WorkOrder,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const incomeInclude = [
  { model: Branch, as: "branch" },
  { model: WorkOrder, as: "work_order" },
  { model: User, as: "created_by_user" },
];

const expenseInclude = [
  { model: Branch, as: "branch" },
  { model: User, as: "created_by_user" },
];

export async function listIncomes() {
  const items = await Income.findAll({
    include: incomeInclude,
    order: [["id", "DESC"]],
  });

  return items.map((item) => item.toSafeJSON());
}

export async function createIncome(payload, authUserId = null) {
  const {
    branch_id = null,
    work_order_id = null,
    type = "payment",
    concept,
    amount,
    payment_method = "cash",
    paid_at = new Date(),
    notes = null,
  } = payload;

  if (!concept || amount === undefined) {
    throw new AppError("concept y amount son obligatorios.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) throw new AppError("La sucursal indicada no existe.", 400);
  }

  if (work_order_id) {
    const workOrder = await WorkOrder.findByPk(work_order_id);
    if (!workOrder) throw new AppError("La orden de trabajo indicada no existe.", 400);
  }

  const created = await Income.create({
    branch_id,
    work_order_id,
    created_by_user_id: authUserId,
    type: String(type).trim(),
    concept: String(concept).trim(),
    amount,
    payment_method: String(payment_method).trim(),
    paid_at,
    notes: notes ? String(notes).trim() : null,
  });

  const item = await Income.findByPk(created.id, { include: incomeInclude });
  return item.toSafeJSON();
}

export async function listExpenses() {
  const items = await Expense.findAll({
    include: expenseInclude,
    order: [["id", "DESC"]],
  });

  return items.map((item) => item.toSafeJSON());
}

export async function createExpense(payload, authUserId = null) {
  const {
    branch_id = null,
    category = "general",
    concept,
    amount,
    payment_method = "cash",
    spent_at = new Date(),
    notes = null,
  } = payload;

  if (!concept || amount === undefined) {
    throw new AppError("concept y amount son obligatorios.", 400);
  }

  if (branch_id) {
    const branch = await Branch.findByPk(branch_id);
    if (!branch) throw new AppError("La sucursal indicada no existe.", 400);
  }

  const created = await Expense.create({
    branch_id,
    created_by_user_id: authUserId,
    category: String(category).trim(),
    concept: String(concept).trim(),
    amount,
    payment_method: String(payment_method).trim(),
    spent_at,
    notes: notes ? String(notes).trim() : null,
  });

  const item = await Expense.findByPk(created.id, { include: expenseInclude });
  return item.toSafeJSON();
}