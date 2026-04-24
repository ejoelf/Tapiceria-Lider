import { getMonthlySummary } from "../monthly-summary/service.js";
import AppError from "../../utils/appError.js";

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function rowsToCsv(rows) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export async function exportMonthlySummaryJson({ year, month }) {
  return getMonthlySummary({ year, month });
}

export async function exportMonthlySummaryCsv({ year, month }) {
  const summary = await getMonthlySummary({ year, month });

  if (!summary) {
    throw new AppError("No se pudo generar el resumen.", 400);
  }

  const metricRows = [
    ["Métrica", "Valor"],
    ["Año", summary.period.year],
    ["Mes", summary.period.month],
    ["Ingresos totales", summary.metrics.total_incomes],
    ["Egresos totales", summary.metrics.total_expenses],
    ["Balance", summary.metrics.balance],
    ["Cantidad de trabajos", summary.metrics.work_orders_count],
    ["Cantidad de ingresos", summary.metrics.incomes_count],
    ["Cantidad de egresos", summary.metrics.expenses_count],
    ["Cantidad de productos", summary.metrics.products_count],
  ];

  const statusRows = [
    [],
    ["Trabajos por estado", ""],
    ["Estado", "Cantidad"],
    ...Object.entries(summary.work_orders_by_status),
  ];

  const priorityRows = [
    [],
    ["Trabajos por prioridad", ""],
    ["Prioridad", "Cantidad"],
    ...Object.entries(summary.work_orders_by_priority),
  ];

  const latestWorkOrdersRows = [
    [],
    ["Últimos trabajos", "", "", ""],
    ["Código", "Título", "Prioridad", "Estado"],
    ...summary.latest_work_orders.map((item) => [
      item.code || "",
      item.title || "",
      item.priority || "",
      item.current_status?.name || "",
    ]),
  ];

  const latestIncomesRows = [
    [],
    ["Últimos ingresos", "", "", ""],
    ["Concepto", "Tipo", "Monto", "Orden"],
    ...summary.latest_incomes.map((item) => [
      item.concept || "",
      item.type || "",
      Number(item.amount || 0),
      item.work_order?.code || "",
    ]),
  ];

  const latestExpensesRows = [
    [],
    ["Últimos egresos", "", "", ""],
    ["Concepto", "Categoría", "Monto", "Medio de pago"],
    ...summary.latest_expenses.map((item) => [
      item.concept || "",
      item.category || "",
      Number(item.amount || 0),
      item.payment_method || "",
    ]),
  ];

  return rowsToCsv([
    ...metricRows,
    ...statusRows,
    ...priorityRows,
    ...latestWorkOrdersRows,
    ...latestIncomesRows,
    ...latestExpensesRows,
  ]);
}