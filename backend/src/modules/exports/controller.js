import asyncHandler from "../../utils/asyncHandler.js";
import {
  exportMonthlySummaryCsv,
  exportMonthlySummaryJson,
} from "./service.js";

export const exportMonthlySummaryAsJson = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const data = await exportMonthlySummaryJson({ year, month });

  res.status(200).json({
    ok: true,
    data,
  });
});

export const exportMonthlySummaryAsCsv = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const csv = await exportMonthlySummaryCsv({ year, month });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="monthly-summary-${year}-${month}.csv"`
  );

  res.status(200).send(csv);
});