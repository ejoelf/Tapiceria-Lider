import api from "./api";

export async function getTechnicalPartsRequest() {
  const response = await api.get("/molds/parts");
  return response.data;
}

export async function createTechnicalPartRequest(payload) {
  const response = await api.post("/molds/parts", payload);
  return response.data;
}

export async function getMoldsRequest() {
  const response = await api.get("/molds");
  return response.data;
}

export async function getMoldByIdRequest(id) {
  const response = await api.get(`/molds/${id}`);
  return response.data;
}

export async function createMoldRequest(payload) {
  const response = await api.post("/molds", payload);
  return response.data;
}

export async function createMoldFileRequest(moldId, payload) {
  const response = await api.post(`/molds/${moldId}/files`, payload);
  return response.data;
}