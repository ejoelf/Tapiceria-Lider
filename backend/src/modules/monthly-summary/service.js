import { Op } from "sequelize";
import {
  Expense,
  Income,
  Product,
  WorkOrder,
  WorkOrderStatus,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

function buildMonthRange(year, month) {
  const safeYear = Number(year);
  const safeMonth = Number(month);

  if (!safeYear || !safeMonth || safeMonth < 1 || safeMonth > 12) {
    throw new AppError("year y month son obligatorios y válidos.", 400);
  }

  const start = new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(safeYear, safeMonth, 1, 0, 0, 0, 0));

  return { start, end };
}

function normalizeDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getMonthlySummary({ year, month }) {
  const { start, end } = buildMonthRange(year, month);

  const [incomes, expenses, workOrders, totalProducts] = await Promise.all([
    Income.findAll({
      where: {
        created_at: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      include: [
        {
          model: WorkOrder,
          as: "work_order",
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    }),
    Expense.findAll({
      where: {
        created_at: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      order: [["created_at", "DESC"]],
    }),
    WorkOrder.findAll({
      where: {
        created_at: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      include: [
        {
          model: WorkOrderStatus,
          as: "current_status",
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    }),
    Product.count(),
  ]);

  const totalIncomes = incomes.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const balance = totalIncomes - totalExpenses;

  const workOrdersByStatus = workOrders.reduce((acc, item) => {
    const key = item.current_status?.name || "Sin estado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const workOrdersByPriority = workOrders.reduce((acc, item) => {
    const key = item.priority || "Sin prioridad";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const latestIncomeDate = incomes.length
    ? normalizeDate(incomes[0].created_at)?.toISOString() || null
    : null;

  const latestExpenseDate = expenses.length
    ? normalizeDate(expenses[0].created_at)?.toISOString() || null
    : null;

  return {
    period: {
      year: Number(year),
      month: Number(month),
      start: start.toISOString(),
      end: end.toISOString(),
    },
    metrics: {
      total_incomes: totalIncomes,
      total_expenses: totalExpenses,
      balance,
      work_orders_count: workOrders.length,
      incomes_count: incomes.length,
      expenses_count: expenses.length,
      products_count: totalProducts,
      latest_income_date: latestIncomeDate,
      latest_expense_date: latestExpenseDate,
    },
    work_orders_by_status: workOrdersByStatus,
    work_orders_by_priority: workOrdersByPriority,
    latest_work_orders: workOrders.slice(0, 10),
    latest_incomes: incomes.slice(0, 10),
    latest_expenses: expenses.slice(0, 10),
  };
}