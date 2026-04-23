import api from "./api";

export async function getMaterialCategoriesRequest() {
  const response = await api.get("/materials/categories");
  return response.data;
}

export async function createMaterialCategoryRequest(payload) {
  const response = await api.post("/materials/categories", payload);
  return response.data;
}

export async function getMaterialsRequest() {
  const response = await api.get("/materials");
  return response.data;
}

export async function createMaterialRequest(payload) {
  const response = await api.post("/materials", payload);
  return response.data;
}

export async function getInventoryMovementsRequest() {
  const response = await api.get("/materials/inventory/movements");
  return response.data;
}

export async function createInventoryMovementRequest(payload) {
  const response = await api.post("/materials/inventory/movements", payload);
  return response.data;
}