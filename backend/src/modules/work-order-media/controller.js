import asyncHandler from "../../utils/asyncHandler.js";
import {
  createMediaRecord,
  deleteMediaRecord,
  listMediaByWorkOrder,
  updateMediaRecord,
} from "./service.js";

export const getWorkOrderMedia = asyncHandler(async (req, res) => {
  const items = await listMediaByWorkOrder(Number(req.params.workOrderId));

  res.status(200).json({
    ok: true,
    data: items,
  });
});

export const createWorkOrderMedia = asyncHandler(async (req, res) => {
  const item = await createMediaRecord(
    Number(req.params.workOrderId),
    req.body,
    req.user?.id || null
  );

  res.status(201).json({
    ok: true,
    message: "Media creada correctamente",
    data: item,
  });
});

export const updateWorkOrderMedia = asyncHandler(async (req, res) => {
  const item = await updateMediaRecord(Number(req.params.mediaId), req.body);

  res.status(200).json({
    ok: true,
    message: "Media actualizada correctamente",
    data: item,
  });
});

export const deleteWorkOrderMedia = asyncHandler(async (req, res) => {
  await deleteMediaRecord(Number(req.params.mediaId));

  res.status(200).json({
    ok: true,
    message: "Media desactivada correctamente",
  });
});