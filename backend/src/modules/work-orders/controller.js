import asyncHandler from "../../utils/asyncHandler.js";
import {
  changeWorkOrderStatus,
  createWorkOrder,
  getWorkOrderById,
  listWorkOrders,
  listWorkOrderStatuses,
  updateWorkOrder,
} from "./service.js";

export const getAllWorkOrders = asyncHandler(async (req, res) => {
  const workOrders = await listWorkOrders();

  res.status(200).json({
    ok: true,
    data: workOrders,
  });
});

export const getOneWorkOrder = asyncHandler(async (req, res) => {
  const workOrder = await getWorkOrderById(Number(req.params.id));

  res.status(200).json({
    ok: true,
    data: workOrder,
  });
});

export const createOneWorkOrder = asyncHandler(async (req, res) => {
  const workOrder = await createWorkOrder(req.body, req.user?.id || null);

  res.status(201).json({
    ok: true,
    message: "Orden de trabajo creada correctamente",
    data: workOrder,
  });
});

export const updateOneWorkOrder = asyncHandler(async (req, res) => {
  const workOrder = await updateWorkOrder(Number(req.params.id), req.body);

  res.status(200).json({
    ok: true,
    message: "Orden de trabajo actualizada correctamente",
    data: workOrder,
  });
});

export const changeOneWorkOrderStatus = asyncHandler(async (req, res) => {
  const workOrder = await changeWorkOrderStatus(
    Number(req.params.id),
    req.body,
    req.user?.id || null
  );

  res.status(200).json({
    ok: true,
    message: "Estado de la orden actualizado correctamente",
    data: workOrder,
  });
});

export const getAllWorkOrderStatuses = asyncHandler(async (req, res) => {
  const statuses = await listWorkOrderStatuses();

  res.status(200).json({
    ok: true,
    data: statuses,
  });
});