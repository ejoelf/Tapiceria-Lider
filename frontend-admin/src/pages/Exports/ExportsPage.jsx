import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatelessMessage from "../../components/ui/StatelessMessage";
import {
  exportMonthlySummaryCsvRequest,
  exportMonthlySummaryJsonRequest,
  exportMonthlySummaryPdfRequest,
} from "../../services/exportsService";
import "./ExportsPage.css";

function getCurrentYearMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  downloadBlob(blob, filename);
}

function ExportsPage() {
  const current = useMemo(() => getCurrentYearMonth(), []);
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [loadingJson, setLoadingJson] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJsonExport = async () => {
    try {
      setError("");
      setSuccess("");
      setLoadingJson(true);

      const response = await exportMonthlySummaryJsonRequest({ year, month });
      downloadJson(
        response?.data || {},
        `monthly-summary-${year}-${month}.json`
      );

      setSuccess("Resumen JSON exportado correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo exportar el JSON."
      );
    } finally {
      setLoadingJson(false);
    }
  };

  const handleCsvExport = async () => {
    try {
      setError("");
      setSuccess("");
      setLoadingCsv(true);

      const blob = await exportMonthlySummaryCsvRequest({ year, month });
      downloadBlob(blob, `monthly-summary-${year}-${month}.csv`);

      setSuccess("Resumen CSV exportado correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo exportar el CSV."
      );
    } finally {
      setLoadingCsv(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      setError("");
      setSuccess("");
      setLoadingPdf(true);

      const blob = await exportMonthlySummaryPdfRequest({ year, month });
      downloadBlob(blob, `monthly-summary-${year}-${month}.pdf`);

      setSuccess("Resumen PDF exportado correctamente.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo exportar el PDF."
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="exports-page">
      <PageHeader
        title="Exportaciones"
        description="Descargá resúmenes y reportes del negocio."
      />

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}
      {success ? <StatelessMessage type="success">{success}</StatelessMessage> : null}

      <SectionCard title="Exportar resumen mensual">
        <div className="exports-page__body">
          <div className="exports-page__filters">
            <div className="exports-page__field">
              <label>Año</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div className="exports-page__field">
              <label>Mes</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="exports-page__actions">
            <button onClick={handleJsonExport} disabled={loadingJson}>
              {loadingJson ? "Exportando JSON..." : "Descargar JSON"}
            </button>

            <button onClick={handleCsvExport} disabled={loadingCsv}>
              {loadingCsv ? "Exportando CSV..." : "Descargar CSV"}
            </button>

            <button onClick={handlePdfExport} disabled={loadingPdf}>
              {loadingPdf ? "Exportando PDF..." : "Descargar PDF profesional"}
            </button>
          </div>

          <p className="exports-page__note">
            El PDF sale con formato profesional para control interno o para compartir
            con contador. Después podemos sumar más modelos de reportes.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

export default ExportsPage;