import api from "./api";

export async function getWorkOrderMediaRequest(workOrderId) {
  const response = await api.get(`/work-order-media/work-order/${workOrderId}`);
  return response.data;
}

export async function createWorkOrderMediaRequest(workOrderId, payload) {
  const response = await api.post(`/work-order-media/work-order/${workOrderId}`, payload);
  return response.data;
}

export async function uploadWorkOrderMediaRequest(workOrderId, formData) {
  const response = await api.post(
    `/work-order-media/work-order/${workOrderId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}