import asyncHandler from "../../utils/asyncHandler.js";
import {
  createInventoryMovement,
  createMaterial,
  createMaterialCategory,
  getMaterialById,
  listInventoryMovements,
  listMaterialCategories,
  listMaterials,
  updateMaterial,
} from "./service.js";

export const getAllMaterialCategories = asyncHandler(async (req, res) => {
  const categories = await listMaterialCategories();

  res.status(200).json({
    ok: true,
    data: categories,
  });
});

export const createOneMaterialCategory = asyncHandler(async (req, res) => {
  const category = await createMaterialCategory(req.body);

  res.status(201).json({
    ok: true,
    message: "Categoría creada correctamente",
    data: category,
  });
});

export const getAllMaterials = asyncHandler(async (req, res) => {
  const materials = await listMaterials();

  res.status(200).json({
    ok: true,
    data: materials,
  });
});

export const getOneMaterial = asyncHandler(async (req, res) => {
  const material = await getMaterialById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: material,
  });
});

export const createOneMaterial = asyncHandler(async (req, res) => {
  const material = await createMaterial(req.body);

  res.status(201).json({
    ok: true,
    message: "Material creado correctamente",
    data: material,
  });
});

export const updateOneMaterial = asyncHandler(async (req, res) => {
  const material = await updateMaterial(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Material actualizado correctamente",
    data: material,
  });
});

export const getAllInventoryMovements = asyncHandler(async (req, res) => {
  const movements = await listInventoryMovements();

  res.status(200).json({
    ok: true,
    data: movements,
  });
});

export const createOneInventoryMovement = asyncHandler(async (req, res) => {
  const movement = await createInventoryMovement(req.body, req.user?.id || null);

  res.status(201).json({
    ok: true,
    message: "Movimiento registrado correctamente",
    data: movement,
  });
});