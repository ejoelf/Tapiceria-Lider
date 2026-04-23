import { Expense, Income, Material, Notification, WorkOrder } from "../../database/models/index.js";

export async function getDashboardMetrics() {
  const [
    totalWorkOrders,
    activeWorkOrders,
    totalIncomes,
    totalExpenses,
    lowStockMaterials,
    unreadNotifications,
  ] = await Promise.all([
    WorkOrder.count(),
    WorkOrder.count({ where: { is_active: true } }),
    Income.sum("amount"),
    Expense.sum("amount"),
    Material.count({
      where: {},
    }),
    Notification.count({ where: { is_read: false } }),
  ]);

  const workOrdersByPriority = await WorkOrder.findAll({
    attributes: ["priority"],
  });

  const priorityMap = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const item of workOrdersByPriority) {
    const key = item.priority || "medium";
    if (priorityMap[key] !== undefined) priorityMap[key] += 1;
  }

  const materials = await Material.findAll();
  const lowStockCount = materials.filter(
    (m) => Number(m.stock_current) <= Number(m.stock_minimum)
  ).length;

  return {
    counters: {
      total_work_orders: totalWorkOrders || 0,
      active_work_orders: activeWorkOrders || 0,
      total_incomes: Number(totalIncomes || 0),
      total_expenses: Number(totalExpenses || 0),
      balance: Number(totalIncomes || 0) - Number(totalExpenses || 0),
      low_stock_materials: lowStockCount,
      unread_notifications: unreadNotifications || 0,
    },
    charts: {
      work_orders_by_priority: priorityMap,
    },
  };
}