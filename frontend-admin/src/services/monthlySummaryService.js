import api from "./api";

export async function getMonthlySummaryRequest({ year, month }) {
  const response = await api.get("/monthly-summary", {
    params: { year, month },
  });
  return response.data;
}