import api from "./api";

export async function getVehiclesRequest() {
  const response = await api.get("/vehicles");
  return response.data;
}

export async function createVehicleRequest(payload) {
  const response = await api.post("/vehicles", payload);
  return response.data;
}

export async function getVehicleBrandsRequest() {
  const response = await api.get("/vehicles/brands");
  return response.data;
}

export async function getVehicleModelsRequest() {
  const response = await api.get("/vehicles/models");
  return response.data;
}