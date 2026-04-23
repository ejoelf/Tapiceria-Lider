import asyncHandler from "../../utils/asyncHandler.js";
import {
  createNotification,
  listNotifications,
  markNotificationAsRead,
} from "./service.js";

export const getAllNotifications = asyncHandler(async (req, res) => {
  const data = await listNotifications();

  res.status(200).json({ ok: true, data });
});

export const getMyNotifications = asyncHandler(async (req, res) => {
  const data = await listNotifications(req.user?.id || null);

  res.status(200).json({ ok: true, data });
});

export const createOneNotification = asyncHandler(async (req, res) => {
  const data = await createNotification(req.body);

  res.status(201).json({
    ok: true,
    message: "Notificación creada correctamente",
    data,
  });
});

export const markOneNotificationAsRead = asyncHandler(async (req, res) => {
  const data = await markNotificationAsRead(Number(req.params.id));

  res.status(200).json({
    ok: true,
    message: "Notificación marcada como leída",
    data,
  });
});