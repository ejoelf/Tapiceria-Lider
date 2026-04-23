import api from "./api";

export async function getWorkOrdersRequest() {
  const response = await api.get("/work-orders");
  return response.data;
}

export async function getWorkOrderByIdRequest(id) {
  const response = await api.get(`/work-orders/${id}`);
  return response.data;
}

export async function getWorkOrderStatusesRequest() {
  const response = await api.get("/work-orders/statuses");
  return response.data;
}

export async function createWorkOrderRequest(payload) {
  const response = await api.post("/work-orders", payload);
  return response.data;
}

export async function changeWorkOrderStatusRequest(id, payload) {
  const response = await api.patch(`/work-orders/${id}/change-status`, payload);
  return response.data;
}