import asyncHandler from "../../utils/asyncHandler.js";
import { listSettings, upsertSetting } from "./service.js";

export const getAllSettings = asyncHandler(async (req, res) => {
  const data = await listSettings();
  res.status(200).json({ ok: true, data });
});

export const upsertOneSetting = asyncHandler(async (req, res) => {
  const data = await upsertSetting(req.body);
  res.status(200).json({
    ok: true,
    message: "Configuración guardada correctamente",
    data,
  });
});