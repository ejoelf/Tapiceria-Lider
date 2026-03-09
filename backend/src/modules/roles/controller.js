import asyncHandler from "../../utils/asyncHandler.js";
import { listRoles } from "./service.js";

export const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await listRoles();

  res.status(200).json({
    ok: true,
    data: roles,
  });
});