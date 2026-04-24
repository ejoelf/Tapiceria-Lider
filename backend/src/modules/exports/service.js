import PDFDocument from "pdfkit";
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

function money(value) {
  return `$${Number(value || 0).toLocaleString("es-AR")}`;
}

function addSectionTitle(doc, title) {
  doc
    .moveDown(0.8)
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#111111")
    .text(title);
  doc.moveDown(0.3);
}

function addKeyValueRow(doc, label, value) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#111111")
    .text(`${label}: `, { continued: true });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#333333")
    .text(String(value ?? "-"));
}

function ensurePageSpace(doc, minY = 730) {
  if (doc.y > minY) {
    doc.addPage();
  }
}

function addSimpleTable(doc, headers, rows) {
  const startX = 50;
  let currentY = doc.y;

  const colWidths = headers.map(() => 120);

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#111111");

  headers.forEach((header, index) => {
    const x = startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
    doc.text(header, x, currentY, {
      width: colWidths[index] - 10,
      ellipsis: true,
    });
  });

  currentY += 20;
  doc
    .moveTo(startX, currentY - 4)
    .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY - 4)
    .strokeColor("#dddddd")
    .stroke();

  doc.font("Helvetica").fontSize(9).fillColor("#333333");

  rows.forEach((row) => {
    ensurePageSpace(doc, 760);

    let rowHeight = 18;
    row.forEach((cell, index) => {
      const x = startX + colWidths.slice(0, index).reduce((a, b) => a + b, 0);
      const text = cell === null || cell === undefined ? "-" : String(cell);
      doc.text(text, x, currentY, {
        width: colWidths[index] - 10,
        ellipsis: true,
      });
    });

    currentY += rowHeight;
    doc
      .moveTo(startX, currentY - 2)
      .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), currentY - 2)
      .strokeColor("#f0f0f0")
      .stroke();

    doc.y = currentY;
  });

  doc.moveDown(0.5);
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

export async function exportMonthlySummaryPdf({ year, month }) {
  const summary = await getMonthlySummary({ year, month });

  if (!summary) {
    throw new AppError("No se pudo generar el PDF.", 400);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const endPromise = new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  doc.rect(0, 0, doc.page.width, 120).fill("#111111");

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("Tapicería Líder", 50, 42);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#e5e5e5")
    .text("Resumen mensual profesional", 50, 74);

  doc.moveDown(4);

  doc
    .fillColor("#111111")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Reporte ${summary.period.month}/${summary.period.year}`);

  doc.moveDown(0.5);

  addKeyValueRow(doc, "Período inicio", new Date(summary.period.start).toLocaleDateString("es-AR"));
  addKeyValueRow(doc, "Período fin", new Date(summary.period.end).toLocaleDateString("es-AR"));

  addSectionTitle(doc, "Resumen ejecutivo");

  addKeyValueRow(doc, "Ingresos totales", money(summary.metrics.total_incomes));
  addKeyValueRow(doc, "Egresos totales", money(summary.metrics.total_expenses));
  addKeyValueRow(doc, "Balance", money(summary.metrics.balance));
  addKeyValueRow(doc, "Trabajos del período", summary.metrics.work_orders_count);
  addKeyValueRow(doc, "Ingresos registrados", summary.metrics.incomes_count);
  addKeyValueRow(doc, "Egresos registrados", summary.metrics.expenses_count);
  addKeyValueRow(doc, "Productos cargados", summary.metrics.products_count);

  addSectionTitle(doc, "Trabajos por estado");
  Object.entries(summary.work_orders_by_status || {}).forEach(([key, value]) => {
    addKeyValueRow(doc, key, value);
  });

  addSectionTitle(doc, "Trabajos por prioridad");
  Object.entries(summary.work_orders_by_priority || {}).forEach(([key, value]) => {
    addKeyValueRow(doc, key, value);
  });

  ensurePageSpace(doc, 620);
  addSectionTitle(doc, "Últimos trabajos");
  addSimpleTable(
    doc,
    ["Código", "Título", "Prioridad", "Estado"],
    summary.latest_work_orders.map((item) => [
      item.code || "-",
      item.title || "-",
      item.priority || "-",
      item.current_status?.name || "-",
    ])
  );

  ensurePageSpace(doc, 620);
  addSectionTitle(doc, "Últimos ingresos");
  addSimpleTable(
    doc,
    ["Concepto", "Tipo", "Monto", "Orden"],
    summary.latest_incomes.map((item) => [
      item.concept || "-",
      item.type || "-",
      money(item.amount),
      item.work_order?.code || "-",
    ])
  );

  ensurePageSpace(doc, 620);
  addSectionTitle(doc, "Últimos egresos");
  addSimpleTable(
    doc,
    ["Concepto", "Categoría", "Monto", "Medio"],
    summary.latest_expenses.map((item) => [
      item.concept || "-",
      item.category || "-",
      money(item.amount),
      item.payment_method || "-",
    ])
  );

  doc.moveDown(1.5);
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("#777777")
    .text(
      "Documento generado automáticamente desde el panel de Tapicería Líder.",
      { align: "center" }
    );

  doc.end();

  return endPromise;
}