import asyncHandler from "../../utils/asyncHandler.js";
import { listBranches } from "./service.js";

export const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await listBranches();

  res.status(200).json({
    ok: true,
    data: branches,
  });
});