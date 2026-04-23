import { useEffect, useMemo, useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { getDashboardRequest } from "../../services/dashboardService";
import "./DashboardPage.css";

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

  const totalPriority = useMemo(() => {
    return (
      Number(priorities.low || 0) +
      Number(priorities.medium || 0) +
      Number(priorities.high || 0) +
      Number(priorities.urgent || 0)
    );
  }, [priorities]);

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

      <div className="dashboard-page__panels">
        <SectionCard title="Trabajos por prioridad">
          <div className="dashboard-priority-list">
            <div className="dashboard-priority-item">
              <span>Baja</span>
              <strong>{priorities.low || 0}</strong>
              <StatusBadge variant="default">
                {totalPriority ? `${Math.round((Number(priorities.low || 0) / totalPriority) * 100)}%` : "0%"}
              </StatusBadge>
            </div>

            <div className="dashboard-priority-item">
              <span>Media</span>
              <strong>{priorities.medium || 0}</strong>
              <StatusBadge variant="warning">
                {totalPriority ? `${Math.round((Number(priorities.medium || 0) / totalPriority) * 100)}%` : "0%"}
              </StatusBadge>
            </div>

            <div className="dashboard-priority-item">
              <span>Alta</span>
              <strong>{priorities.high || 0}</strong>
              <StatusBadge variant="danger">
                {totalPriority ? `${Math.round((Number(priorities.high || 0) / totalPriority) * 100)}%` : "0%"}
              </StatusBadge>
            </div>

            <div className="dashboard-priority-item">
              <span>Urgente</span>
              <strong>{priorities.urgent || 0}</strong>
              <StatusBadge variant="danger">
                {totalPriority ? `${Math.round((Number(priorities.urgent || 0) / totalPriority) * 100)}%` : "0%"}
              </StatusBadge>
            </div>
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
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;