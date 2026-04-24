import api from "./api";

export async function saveWebsiteSettingsRequest(payload) {
  const response = await api.post("/settings/website", payload);
  return response.data;
}