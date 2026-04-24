import asyncHandler from "../../utils/asyncHandler.js";
import {
  listSettings,
  saveSiteSettings,
  upsertSetting,
} from "./service.js";

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

export const saveWebsiteSettings = asyncHandler(async (req, res) => {
  const data = await saveSiteSettings(req.body);

  res.status(200).json({
    ok: true,
    message: "Ajustes del sitio guardados correctamente",
    data,
  });
});