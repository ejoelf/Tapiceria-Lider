import api from "./api";

export async function getClientsRequest() {
  const response = await api.get("/clients");
  return response.data;
}

export async function createClientRequest(payload) {
  const response = await api.post("/clients", payload);
  return response.data;
}