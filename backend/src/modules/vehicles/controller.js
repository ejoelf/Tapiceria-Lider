import asyncHandler from "../../utils/asyncHandler.js";
import {
  createVehicle,
  getVehicleById,
  listVehicleBrands,
  listVehicleModels,
  listVehicles,
  updateVehicle,
} from "./service.js";

export const getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await listVehicles();

  res.status(200).json({
    ok: true,
    data: vehicles,
  });
});

export const getOneVehicle = asyncHandler(async (req, res) => {
  const vehicle = await getVehicleById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: vehicle,
  });
});

export const createOneVehicle = asyncHandler(async (req, res) => {
  const vehicle = await createVehicle(req.body);

  res.status(201).json({
    ok: true,
    message: "Vehículo creado correctamente",
    data: vehicle,
  });
});

export const updateOneVehicle = asyncHandler(async (req, res) => {
  const vehicle = await updateVehicle(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Vehículo actualizado correctamente",
    data: vehicle,
  });
});

export const getAllVehicleBrands = asyncHandler(async (req, res) => {
  const brands = await listVehicleBrands();

  res.status(200).json({
    ok: true,
    data: brands,
  });
});

export const getAllVehicleModels = asyncHandler(async (req, res) => {
  const models = await listVehicleModels();

  res.status(200).json({
    ok: true,
    data: models,
  });
});