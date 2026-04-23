import asyncHandler from "../../utils/asyncHandler.js";
import {
  createMold,
  createMoldFile,
  createTechnicalPart,
  getMoldById,
  listMolds,
  listTechnicalParts,
  updateMold,
} from "./service.js";

export const getAllTechnicalParts = asyncHandler(async (req, res) => {
  const parts = await listTechnicalParts();

  res.status(200).json({
    ok: true,
    data: parts,
  });
});

export const createOneTechnicalPart = asyncHandler(async (req, res) => {
  const part = await createTechnicalPart(req.body);

  res.status(201).json({
    ok: true,
    message: "Pieza técnica creada correctamente",
    data: part,
  });
});

export const getAllMolds = asyncHandler(async (req, res) => {
  const molds = await listMolds();

  res.status(200).json({
    ok: true,
    data: molds,
  });
});

export const getOneMold = asyncHandler(async (req, res) => {
  const mold = await getMoldById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: mold,
  });
});

export const createOneMold = asyncHandler(async (req, res) => {
  const mold = await createMold(req.body, req.user?.id || null);

  res.status(201).json({
    ok: true,
    message: "Molde creado correctamente",
    data: mold,
  });
});

export const updateOneMold = asyncHandler(async (req, res) => {
  const mold = await updateMold(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Molde actualizado correctamente",
    data: mold,
  });
});

export const createOneMoldFile = asyncHandler(async (req, res) => {
  const file = await createMoldFile(
    Number(req.params.moldId),
    req.body,
    req.user?.id || null
  );

  res.status(201).json({
    ok: true,
    message: "Archivo de molde creado correctamente",
    data: file,
  });
});