import api from "./api";

export async function getProductCategoriesRequest() {
  const response = await api.get("/products/categories");
  return response.data;
}

export async function createProductCategoryRequest(payload) {
  const response = await api.post("/products/categories", payload);
  return response.data;
}

export async function getProductsRequest() {
  const response = await api.get("/products");
  return response.data;
}

export async function createProductRequest(payload) {
  const response = await api.post("/products", payload);
  return response.data;
}