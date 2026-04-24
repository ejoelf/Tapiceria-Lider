import asyncHandler from "../../utils/asyncHandler.js";
import { getMonthlySummary } from "./service.js";

export const getOneMonthlySummary = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const data = await getMonthlySummary({ year, month });

  res.status(200).json({
    ok: true,
    data,
  });
});