import api from "./api";

export async function getSettingsRequest() {
  const response = await api.get("/settings");
  return response.data;
}

export async function saveSettingRequest(payload) {
  const response = await api.post("/settings", payload);
  return response.data;
}