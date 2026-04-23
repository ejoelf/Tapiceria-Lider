import { Notification, User } from "../../database/models/index.js";
import AppError from "../../utils/appError.js";

const include = [{ model: User, as: "user" }];

export async function listNotifications(userId = null) {
  const where = userId ? { user_id: userId } : {};

  const items = await Notification.findAll({
    where,
    include,
    order: [["id", "DESC"]],
  });

  return items.map((item) => item.toSafeJSON());
}

export async function createNotification(payload) {
  const {
    user_id = null,
    event_code,
    title,
    message,
    level = "info",
    channels = ["in_app"],
    delivery_status = {
      in_app: "pending",
      email: channels?.includes("email") ? "pending" : "not_requested",
      whatsapp: channels?.includes("whatsapp") ? "pending" : "not_requested",
    },
    entity_type = null,
    entity_id = null,
    payload: extraPayload = null,
  } = payload;

  if (!event_code || !title || !message) {
    throw new AppError("event_code, title y message son obligatorios.", 400);
  }

  if (user_id) {
    const user = await User.findByPk(user_id);
    if (!user) throw new AppError("El usuario indicado no existe.", 400);
  }

  const created = await Notification.create({
    user_id,
    event_code: String(event_code).trim(),
    title: String(title).trim(),
    message: String(message).trim(),
    level: String(level).trim(),
    channels,
    delivery_status,
    entity_type: entity_type ? String(entity_type).trim() : null,
    entity_id,
    payload: extraPayload,
  });

  const item = await Notification.findByPk(created.id, { include });
  return item.toSafeJSON();
}

export async function markNotificationAsRead(notificationId) {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw new AppError("Notificación no encontrada.", 404);
  }

  notification.is_read = true;
  notification.read_at = new Date();
  notification.delivery_status = {
    ...(notification.delivery_status || {}),
    in_app: "read",
  };

  await notification.save();

  return notification.toSafeJSON();
}