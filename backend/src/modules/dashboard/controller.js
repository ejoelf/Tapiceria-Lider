import asyncHandler from "../../utils/asyncHandler.js";
import { getDashboardMetrics } from "./service.js";

export const getDashboardData = asyncHandler(async (req, res) => {
  const data = await getDashboardMetrics();

  res.status(200).json({
    ok: true,
    data,
  });
});