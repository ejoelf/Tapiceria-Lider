import api from "./api";

export async function getDashboardRequest() {
  const response = await api.get("/dashboard");
  return response.data;
}