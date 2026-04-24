import { Op } from "sequelize";
import {
  Expense,
  Income,
  Material,
  Notification,
  WorkOrder,
  WorkOrderStatus,
} from "../../database/models/index.js";

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("es-AR", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

export async function getDashboardSummary() {
  const [
    totalWorkOrders,
    activeWorkOrders,
    totalIncomesRows,
    totalExpensesRows,
    lowStockMaterials,
    unreadNotifications,
    workOrdersByPriorityRows,
    workOrdersByStatusRows,
  ] = await Promise.all([
    WorkOrder.count(),
    WorkOrder.count({
      include: [
        {
          model: WorkOrderStatus,
          as: "current_status",
          required: false,
          where: {
            code: {
              [Op.notIn]: ["completed", "cancelled"],
            },
          },
        },
      ],
    }),
    Income.findAll(),
    Expense.findAll(),
    Material.count({
      where: {
        stock_current: {
          [Op.lte]: 5,
        },
      },
    }),
    Notification.count({
      where: {
        is_read: false,
      },
    }),
    WorkOrder.findAll({
      attributes: ["priority"],
    }),
    WorkOrder.findAll({
      include: [
        {
          model: WorkOrderStatus,
          as: "current_status",
          required: false,
        },
      ],
    }),
  ]);

  const totalIncomes = totalIncomesRows.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const totalExpenses = totalExpensesRows.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const workOrdersByPriority = workOrdersByPriorityRows.reduce(
    (acc, item) => {
      const key = item.priority || "Sin prioridad";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  const workOrdersByStatus = workOrdersByStatusRows.reduce((acc, item) => {
    const key = item.current_status?.name || "Sin estado";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const monthlyFinanceEvolution = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const { start, end } = getMonthRange(offset);

    const [incomeRows, expenseRows] = await Promise.all([
      Income.findAll({
        where: {
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      }),
      Expense.findAll({
        where: {
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      }),
    ]);

    const ingresos = incomeRows.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    const egresos = expenseRows.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    monthlyFinanceEvolution.push({
      name: formatMonthLabel(start),
      ingresos,
      egresos,
    });
  }

  return {
    counters: {
      total_work_orders: totalWorkOrders,
      active_work_orders: activeWorkOrders,
      total_incomes: totalIncomes,
      total_expenses: totalExpenses,
      balance: totalIncomes - totalExpenses,
      low_stock_materials: lowStockMaterials,
      unread_notifications: unreadNotifications,
    },
    charts: {
      work_orders_by_priority: workOrdersByPriority,
      work_orders_by_status: workOrdersByStatus,
      monthly_finance_evolution: monthlyFinanceEvolution,
    },
  };
}