import {
  VehicleBrand,
  VehicleModel,
  VehicleType,
} from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

export async function listVehicleBrands() {
  return VehicleBrand.findAll({
    order: [["name", "ASC"]],
  });
}

export async function createVehicleBrand(payload) {
  const { name, code = null, is_active = true } = payload;

  if (!name) {
    throw new AppError("name es obligatorio.", 400);
  }

  return VehicleBrand.create({
    name: String(name).trim(),
    code: code ? String(code).trim().toUpperCase() : null,
    is_active: Boolean(is_active),
  });
}

export async function updateVehicleBrand(brandId, payload) {
  const brand = await VehicleBrand.findByPk(brandId);

  if (!brand) {
    throw new AppError("Marca no encontrada.", 404);
  }

  const { name, code, is_active } = payload;

  if (name !== undefined) brand.name = String(name).trim();
  if (code !== undefined) brand.code = code ? String(code).trim().toUpperCase() : null;
  if (is_active !== undefined) brand.is_active = Boolean(is_active);

  await brand.save();
  return brand;
}

export async function listVehicleModels() {
  return VehicleModel.findAll({
    include: [{ model: VehicleBrand, as: "brand" }],
    order: [["name", "ASC"]],
  });
}

export async function createVehicleModel(payload) {
  const { brand_id, name, code = null, is_active = true } = payload;

  if (!brand_id || !name) {
    throw new AppError("brand_id y name son obligatorios.", 400);
  }

  const brand = await VehicleBrand.findByPk(brand_id);
  if (!brand) {
    throw new AppError("La marca indicada no existe.", 400);
  }

  return VehicleModel.create({
    brand_id,
    name: String(name).trim(),
    code: code ? String(code).trim().toUpperCase() : null,
    is_active: Boolean(is_active),
  });
}

export async function updateVehicleModel(modelId, payload) {
  const model = await VehicleModel.findByPk(modelId);

  if (!model) {
    throw new AppError("Modelo no encontrado.", 404);
  }

  const { brand_id, name, code, is_active } = payload;

  if (brand_id !== undefined) {
    const brand = await VehicleBrand.findByPk(brand_id);
    if (!brand) {
      throw new AppError("La marca indicada no existe.", 400);
    }
    model.brand_id = brand_id;
  }

  if (name !== undefined) model.name = String(name).trim();
  if (code !== undefined) model.code = code ? String(code).trim().toUpperCase() : null;
  if (is_active !== undefined) model.is_active = Boolean(is_active);

  await model.save();
  return model;
}

export async function listVehicleTypes() {
  return VehicleType.findAll({
    order: [["name", "ASC"]],
  });
}

export async function createVehicleType(payload) {
  const { code, name, description = null, is_active = true } = payload;

  if (!code || !name) {
    throw new AppError("code y name son obligatorios.", 400);
  }

  return VehicleType.create({
    code: String(code).trim().toUpperCase(),
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
    is_active: Boolean(is_active),
  });
}

export async function updateVehicleType(typeId, payload) {
  const type = await VehicleType.findByPk(typeId);

  if (!type) {
    throw new AppError("Tipo de vehículo no encontrado.", 404);
  }

  const { code, name, description, is_active } = payload;

  if (code !== undefined) type.code = String(code).trim().toUpperCase();
  if (name !== undefined) type.name = String(name).trim();
  if (description !== undefined) {
    type.description = description ? String(description).trim() : null;
  }
  if (is_active !== undefined) type.is_active = Boolean(is_active);

  await type.save();
  return type;
}