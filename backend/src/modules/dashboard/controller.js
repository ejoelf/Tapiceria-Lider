import asyncHandler from "../../utils/asyncHandler.js";
import { getDashboardSummary } from "./service.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary();

  res.status(200).json({
    ok: true,
    data,
  });
});