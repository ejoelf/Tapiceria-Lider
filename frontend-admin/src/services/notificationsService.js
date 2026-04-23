import api from "./api";

export async function getMyNotificationsRequest() {
  const response = await api.get("/notifications/me");
  return response.data;
}

export async function createNotificationRequest(payload) {
  const response = await api.post("/notifications", payload);
  return response.data;
}

export async function markNotificationAsReadRequest(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}