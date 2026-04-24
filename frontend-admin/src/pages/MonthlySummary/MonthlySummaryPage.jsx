import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { exportMonthlySummaryPdfRequest } from "../../services/exportsService";
import { getMonthlySummaryRequest } from "../../services/monthlySummaryService";
import "./MonthlySummaryPage.css";

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

function MonthlySummaryPage() {
  const current = useMemo(() => getCurrentYearMonth(), []);
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");

  async function loadSummary(selectedYear, selectedMonth) {
    try {
      setLoading(true);
      setError("");

      const response = await getMonthlySummaryRequest({
        year: selectedYear,
        month: selectedMonth,
      });

      setData(response?.data || null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar el resumen mensual."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary(year, month);
  }, [year, month]);

  const handlePdfDownload = async () => {
    try {
      setLoadingPdf(true);
      const blob = await exportMonthlySummaryPdfRequest({ year, month });
      downloadBlob(blob, `monthly-summary-${year}-${month}.pdf`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo descargar el PDF."
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  const metrics = data?.metrics || {};
  const statusEntries = Object.entries(data?.work_orders_by_status || {});
  const priorityEntries = Object.entries(data?.work_orders_by_priority || {});

  return (
    <div className="monthly-summary-page">
      <PageHeader
        title="Resumen mensual"
        description="Visualizá el rendimiento mensual del negocio."
      />

      <SectionCard
        title="Período"
        actions={
          <button
            className="monthly-summary-page__download-btn"
            onClick={handlePdfDownload}
            disabled={loadingPdf}
          >
            {loadingPdf ? "Generando PDF..." : "Descargar PDF"}
          </button>
        }
      >
        <div className="monthly-summary-page__filters">
          <div className="monthly-summary-page__field">
            <label>Año</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="monthly-summary-page__field">
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
      </SectionCard>

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}

      {loading ? (
        <StatelessMessage>Cargando resumen mensual...</StatelessMessage>
      ) : (
        <>
          <section className="monthly-summary-page__metrics">
            <article className="monthly-summary-card">
              <span>Ingresos</span>
              <strong>${Number(metrics.total_incomes || 0).toLocaleString("es-AR")}</strong>
            </article>

            <article className="monthly-summary-card">
              <span>Egresos</span>
              <strong>${Number(metrics.total_expenses || 0).toLocaleString("es-AR")}</strong>
            </article>

            <article className="monthly-summary-card">
              <span>Balance</span>
              <strong>${Number(metrics.balance || 0).toLocaleString("es-AR")}</strong>
            </article>

            <article className="monthly-summary-card">
              <span>Trabajos</span>
              <strong>{metrics.work_orders_count || 0}</strong>
            </article>

            <article className="monthly-summary-card">
              <span>Ingresos registrados</span>
              <strong>{metrics.incomes_count || 0}</strong>
            </article>

            <article className="monthly-summary-card">
              <span>Egresos registrados</span>
              <strong>{metrics.expenses_count || 0}</strong>
            </article>
          </section>

          <div className="monthly-summary-page__panels">
            <SectionCard title="Trabajos por estado">
              <div className="monthly-summary-page__body">
                {statusEntries.length ? (
                  <div className="monthly-summary-page__list">
                    {statusEntries.map(([key, value]) => (
                      <div key={key} className="monthly-summary-page__row">
                        <span>{key}</span>
                        <StatusBadge variant="default">{value}</StatusBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <StatelessMessage>No hay datos de estados.</StatelessMessage>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Trabajos por prioridad">
              <div className="monthly-summary-page__body">
                {priorityEntries.length ? (
                  <div className="monthly-summary-page__list">
                    {priorityEntries.map(([key, value]) => (
                      <div key={key} className="monthly-summary-page__row">
                        <span>{key}</span>
                        <StatusBadge>{value}</StatusBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <StatelessMessage>No hay datos de prioridades.</StatelessMessage>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="monthly-summary-page__panels">
            <SectionCard title="Últimos trabajos del período">
              <div className="monthly-summary-page__body">
                {data?.latest_work_orders?.length ? (
                  <div className="monthly-summary-page__table">
                    {data.latest_work_orders.map((item) => (
                      <div key={item.id} className="monthly-summary-page__table-row">
                        <div>
                          <strong>{item.code || "-"}</strong>
                          <p>{item.title || "-"}</p>
                        </div>
                        <StatusBadge>{item.priority || "-"}</StatusBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <StatelessMessage>No hay trabajos en este período.</StatelessMessage>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Últimos movimientos financieros">
              <div className="monthly-summary-page__body">
                {data?.latest_incomes?.length || data?.latest_expenses?.length ? (
                  <div className="monthly-summary-page__table">
                    {data.latest_incomes?.slice(0, 5).map((item) => (
                      <div key={`income-${item.id}`} className="monthly-summary-page__table-row">
                        <div>
                          <strong>{item.concept || "-"}</strong>
                          <p>Ingreso</p>
                        </div>
                        <StatusBadge variant="success">
                          ${Number(item.amount || 0).toLocaleString("es-AR")}
                        </StatusBadge>
                      </div>
                    ))}

                    {data.latest_expenses?.slice(0, 5).map((item) => (
                      <div key={`expense-${item.id}`} className="monthly-summary-page__table-row">
                        <div>
                          <strong>{item.concept || "-"}</strong>
                          <p>Egreso</p>
                        </div>
                        <StatusBadge variant="danger">
                          ${Number(item.amount || 0).toLocaleString("es-AR")}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <StatelessMessage>No hay movimientos en este período.</StatelessMessage>
                )}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

export default MonthlySummaryPage;