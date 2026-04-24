import { useEffect, useMemo, useState } from "react";
import DashboardBarChart from "../../components/charts/DashboardBarChart";
import DashboardLineChart from "../../components/charts/DashboardLineChart";
import DashboardPieChart from "../../components/charts/DashboardPieChart";
import SectionCard from "../../components/ui/SectionCard";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { getDashboardRequest } from "../../services/dashboardService";
import "./DashboardPage.css";

function objectToChartArray(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({
    name,
    value: Number(value || 0),
  }));
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await getDashboardRequest();
        setData(response?.data || null);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudo cargar el dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const counters = data?.counters || {};
  const charts = data?.charts || {};
  const priorities = charts?.work_orders_by_priority || {};
  const statuses = charts?.work_orders_by_status || {};
  const financeEvolution = charts?.monthly_finance_evolution || [];

  const priorityArray = useMemo(() => objectToChartArray(priorities), [priorities]);
  const statusArray = useMemo(() => objectToChartArray(statuses), [statuses]);

  const totalPriority = useMemo(() => {
    return priorityArray.reduce((acc, item) => acc + Number(item.value || 0), 0);
  }, [priorityArray]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <StatelessMessage>Cargando dashboard...</StatelessMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <StatelessMessage type="error">{error}</StatelessMessage>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-page__hero">
        <div className="dashboard-page__hero-content">
          <span className="dashboard-page__eyebrow">Resumen general</span>
          <h2>Control central del negocio</h2>
          <p>
            Visualizá rápidamente el estado operativo y financiero de Tapicería
            Líder desde un solo lugar.
          </p>
        </div>

        <div className="dashboard-page__hero-side">
          <div className="dashboard-page__mini-card">
            <span>Notificaciones pendientes</span>
            <strong>{counters.unread_notifications || 0}</strong>
          </div>
          <div className="dashboard-page__mini-card">
            <span>Materiales con stock bajo</span>
            <strong>{counters.low_stock_materials || 0}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-page__grid">
        <article className="dashboard-card">
          <span>Total trabajos</span>
          <strong>{counters.total_work_orders || 0}</strong>
        </article>

        <article className="dashboard-card">
          <span>Trabajos activos</span>
          <strong>{counters.active_work_orders || 0}</strong>
        </article>

        <article className="dashboard-card">
          <span>Ingresos</span>
          <strong>${Number(counters.total_incomes || 0).toLocaleString("es-AR")}</strong>
        </article>

        <article className="dashboard-card">
          <span>Egresos</span>
          <strong>${Number(counters.total_expenses || 0).toLocaleString("es-AR")}</strong>
        </article>

        <article className="dashboard-card">
          <span>Balance</span>
          <strong>${Number(counters.balance || 0).toLocaleString("es-AR")}</strong>
        </article>

        <article className="dashboard-card">
          <span>Stock bajo</span>
          <strong>{counters.low_stock_materials || 0}</strong>
        </article>
      </section>

      <div className="dashboard-page__charts-grid">
        <SectionCard title="Evolución financiera mensual">
          <div className="dashboard-page__chart-body">
            <DashboardLineChart
              data={financeEvolution}
              xKey="name"
              firstLineKey="ingresos"
              secondLineKey="egresos"
              firstName="Ingresos"
              secondName="Egresos"
            />
          </div>
        </SectionCard>

        <SectionCard title="Trabajos por estado">
          <div className="dashboard-page__chart-body">
            <DashboardPieChart
              data={statusArray}
              dataKey="value"
              nameKey="name"
              small
            />
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-page__charts-grid">
        <SectionCard title="Trabajos por prioridad">
          <div className="dashboard-page__chart-body">
            <DashboardBarChart
              data={priorityArray}
              dataKey="value"
              xKey="name"
              title="Cantidad"
              colorByIndex
              small
            />
          </div>
        </SectionCard>

        <SectionCard title="Estado rápido del sistema">
          <div className="dashboard-page__quick-status">
            <div className="dashboard-page__quick-row">
              <span>Trabajos activos</span>
              <StatusBadge variant="success">
                {counters.active_work_orders || 0}
              </StatusBadge>
            </div>

            <div className="dashboard-page__quick-row">
              <span>Notificaciones pendientes</span>
              <StatusBadge variant="warning">
                {counters.unread_notifications || 0}
              </StatusBadge>
            </div>

            <div className="dashboard-page__quick-row">
              <span>Stock bajo</span>
              <StatusBadge variant="danger">
                {counters.low_stock_materials || 0}
              </StatusBadge>
            </div>

            <div className="dashboard-page__quick-row">
              <span>Balance actual</span>
              <StatusBadge variant={Number(counters.balance || 0) >= 0 ? "success" : "danger"}>
                ${Number(counters.balance || 0).toLocaleString("es-AR")}
              </StatusBadge>
            </div>

            <div className="dashboard-page__quick-row">
              <span>Peso prioridad total</span>
              <StatusBadge variant="default">
                {totalPriority}
              </StatusBadge>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-page__panels">
        <SectionCard title="Detalle de prioridades">
          <div className="dashboard-priority-list">
            {priorityArray.length ? (
              priorityArray.map((item) => (
                <div key={item.name} className="dashboard-priority-item">
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                  <StatusBadge variant="default">
                    {totalPriority ? `${Math.round((item.value / totalPriority) * 100)}%` : "0%"}
                  </StatusBadge>
                </div>
              ))
            ) : (
              <div className="dashboard-page__chart-body">
                <StatelessMessage>Sin datos de prioridad.</StatelessMessage>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Detalle de estados">
          <div className="dashboard-priority-list">
            {statusArray.length ? (
              statusArray.map((item) => (
                <div key={item.name} className="dashboard-priority-item">
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                  <StatusBadge variant="default">{item.value}</StatusBadge>
                </div>
              ))
            ) : (
              <div className="dashboard-page__chart-body">
                <StatelessMessage>Sin datos de estado.</StatelessMessage>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;