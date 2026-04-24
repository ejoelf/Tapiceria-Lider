import api from "./api";

export async function exportMonthlySummaryJsonRequest({ year, month }) {
  const response = await api.get("/exports/monthly-summary/json", {
    params: { year, month },
  });
  return response.data;
}

export async function exportMonthlySummaryCsvRequest({ year, month }) {
  const response = await api.get("/exports/monthly-summary/csv", {
    params: { year, month },
    responseType: "blob",
  });
  return response.data;
}

export async function exportMonthlySummaryPdfRequest({ year, month }) {
  const response = await api.get("/exports/monthly-summary/pdf", {
    params: { year, month },
    responseType: "blob",
  });
  return response.data;
}