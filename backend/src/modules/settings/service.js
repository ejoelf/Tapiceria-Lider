import { Setting } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

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

  const existing = await Setting.findOne({
    where: { key: String(key).trim() },
  });

  if (existing) {
    existing.value = value;
    existing.description = description ? String(description).trim() : null;
    existing.is_public = Boolean(is_public);
    await existing.save();
    return existing;
  }

  return Setting.create({
    key: String(key).trim(),
    value,
    description: description ? String(description).trim() : null,
    is_public: Boolean(is_public),
  });
}