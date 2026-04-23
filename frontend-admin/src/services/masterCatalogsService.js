import api from "./api";

export async function getVehicleCatalogBrandsRequest() {
  const response = await api.get("/vehicle-catalogs/brands");
  return response.data;
}

export async function createVehicleCatalogBrandRequest(payload) {
  const response = await api.post("/vehicle-catalogs/brands", payload);
  return response.data;
}

export async function updateVehicleCatalogBrandRequest(id, payload) {
  const response = await api.put(`/vehicle-catalogs/brands/${id}`, payload);
  return response.data;
}

export async function getVehicleCatalogModelsRequest() {
  const response = await api.get("/vehicle-catalogs/models");
  return response.data;
}

export async function createVehicleCatalogModelRequest(payload) {
  const response = await api.post("/vehicle-catalogs/models", payload);
  return response.data;
}

export async function updateVehicleCatalogModelRequest(id, payload) {
  const response = await api.put(`/vehicle-catalogs/models/${id}`, payload);
  return response.data;
}

export async function getVehicleTypesRequest() {
  const response = await api.get("/vehicle-catalogs/types");
  return response.data;
}

export async function createVehicleTypeRequest(payload) {
  const response = await api.post("/vehicle-catalogs/types", payload);
  return response.data;
}

export async function updateVehicleTypeRequest(id, payload) {
  const response = await api.put(`/vehicle-catalogs/types/${id}`, payload);
  return response.data;
}