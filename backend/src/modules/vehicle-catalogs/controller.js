import asyncHandler from "../../utils/asyncHandler.js";
import {
  createVehicleBrand,
  createVehicleModel,
  createVehicleType,
  listVehicleBrands,
  listVehicleModels,
  listVehicleTypes,
  updateVehicleBrand,
  updateVehicleModel,
  updateVehicleType,
} from "./service.js";

export const getAllVehicleBrands = asyncHandler(async (req, res) => {
  const data = await listVehicleBrands();
  res.status(200).json({ ok: true, data });
});

export const createOneVehicleBrand = asyncHandler(async (req, res) => {
  const data = await createVehicleBrand(req.body);
  res.status(201).json({
    ok: true,
    message: "Marca creada correctamente",
    data,
  });
});

export const updateOneVehicleBrand = asyncHandler(async (req, res) => {
  const data = await updateVehicleBrand(Number(req.params.id), req.body);
  res.status(200).json({
    ok: true,
    message: "Marca actualizada correctamente",
    data,
  });
});

export const getAllVehicleModels = asyncHandler(async (req, res) => {
  const data = await listVehicleModels();
  res.status(200).json({ ok: true, data });
});

export const createOneVehicleModel = asyncHandler(async (req, res) => {
  const data = await createVehicleModel(req.body);
  res.status(201).json({
    ok: true,
    message: "Modelo creado correctamente",
    data,
  });
});

export const updateOneVehicleModel = asyncHandler(async (req, res) => {
  const data = await updateVehicleModel(Number(req.params.id), req.body);
  res.status(200).json({
    ok: true,
    message: "Modelo actualizado correctamente",
    data,
  });
});

export const getAllVehicleTypes = asyncHandler(async (req, res) => {
  const data = await listVehicleTypes();
  res.status(200).json({ ok: true, data });
});

export const createOneVehicleType = asyncHandler(async (req, res) => {
  const data = await createVehicleType(req.body);
  res.status(201).json({
    ok: true,
    message: "Tipo de vehículo creado correctamente",
    data,
  });
});

export const updateOneVehicleType = asyncHandler(async (req, res) => {
  const data = await updateVehicleType(Number(req.params.id), req.body);
  res.status(200).json({
    ok: true,
    message: "Tipo de vehículo actualizado correctamente",
    data,
  });
});