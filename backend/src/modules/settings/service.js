import { Setting } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";
import { SITE_DEFAULT_SETTINGS } from "./site-defaults.js";

export async function listSettings() {
  return Setting.findAll({
    order: [["key", "ASC"]],
  });
}

export async function upsertSetting(payload) {
  const { key, value = null, description = null, is_public = false } = payload;

  if (!key) {
    throw new AppError("key es obligatorio.", 400);
  }

  const normalizedKey = String(key).trim();

  const existing = await Setting.findOne({
    where: { key: normalizedKey },
  });

  if (existing) {
    existing.value = value;
    existing.description = description ? String(description).trim() : null;
    existing.is_public = Boolean(is_public);
    await existing.save();
    return existing;
  }

  return Setting.create({
    key: normalizedKey,
    value,
    description: description ? String(description).trim() : null,
    is_public: Boolean(is_public),
  });
}

export async function getPublicSiteSettings() {
  const rows = await Setting.findAll({
    where: { is_public: true },
    order: [["key", "ASC"]],
  });

  const dbMap = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return {
    company_info: dbMap.company_info || SITE_DEFAULT_SETTINGS.company_info,
    site_sections: dbMap.site_sections || SITE_DEFAULT_SETTINGS.site_sections,
  };
}

export async function saveSiteSettings(payload) {
  const { company_info, site_sections } = payload || {};

  if (!company_info || typeof company_info !== "object") {
    throw new AppError("company_info es obligatorio.", 400);
  }

  if (!site_sections || typeof site_sections !== "object") {
    throw new AppError("site_sections es obligatorio.", 400);
  }

  const companyInfoSaved = await upsertSetting({
    key: "company_info",
    value: company_info,
    description: "Datos públicos generales del sitio",
    is_public: true,
  });

  const siteSectionsSaved = await upsertSetting({
    key: "site_sections",
    value: site_sections,
    description: "Activación pública de secciones del sitio",
    is_public: true,
  });

  return {
    company_info: companyInfoSaved.value,
    site_sections: siteSectionsSaved.value,
  };
}