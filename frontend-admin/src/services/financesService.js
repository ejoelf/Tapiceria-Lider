import api from "./api";

export async function getIncomesRequest() {
  const response = await api.get("/finances/incomes");
  return response.data;
}

export async function createIncomeRequest(payload) {
  const response = await api.post("/finances/incomes", payload);
  return response.data;
}

export async function getExpensesRequest() {
  const response = await api.get("/finances/expenses");
  return response.data;
}

export async function createExpenseRequest(payload) {
  const response = await api.post("/finances/expenses", payload);
  return response.data;
}