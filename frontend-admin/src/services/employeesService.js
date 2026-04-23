import api from "./api";

export async function getEmployeesRequest() {
  const response = await api.get("/employees");
  return response.data;
}

export async function createEmployeeRequest(payload) {
  const response = await api.post("/employees", payload);
  return response.data;
}