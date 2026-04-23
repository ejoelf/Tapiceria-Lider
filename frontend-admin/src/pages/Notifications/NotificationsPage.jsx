import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  createNotificationRequest,
  getMyNotificationsRequest,
  markNotificationAsReadRequest,
} from "../../services/notificationsService";
import "./NotificationsPage.css";

const initialForm = {
  user_id: 1,
  event_code: "",
  title: "",
  message: "",
  level: "info",
  channels: {
    in_app: true,
    email: true,
    whatsapp: true,
  },
  entity_type: "",
  entity_id: "",
  payload: "",
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await getMyNotificationsRequest();
      setNotifications(response?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las notificaciones."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    let rows = [...notifications];

    if (filterRead === "read") {
      rows = rows.filter((row) => row.is_read);
    }

    if (filterRead === "unread") {
      rows = rows.filter((row) => !row.is_read);
    }

    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      [
        row.title,
        row.message,
        row.level,
        Array.isArray(row.channels) ? row.channels.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [notifications, filterRead, search]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChannelChange = (event) => {
    const { name, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [name]: checked,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const channels = Object.entries(form.channels)
        .filter(([, enabled]) => enabled)
        .map(([channel]) => channel);

      let parsedPayload = null;
      if (form.payload.trim()) {
        parsedPayload = JSON.parse(form.payload);
      }

      await createNotificationRequest({
        user_id: form.user_id ? Number(form.user_id) : null,
        event_code: form.event_code,
        title: form.title,
        message: form.message,
        level: form.level,
        channels,
        entity_type: form.entity_type || null,
        entity_id: form.entity_id ? Number(form.entity_id) : null,
        payload: parsedPayload,
      });

      setSuccess("Notificación creada correctamente.");
      setForm(initialForm);
      setOpenModal(false);
      await loadNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la notificación."
      );
    }
  };

  const handleMarkRead = async (notificationId) => {
    setError("");
    setSuccess("");

    try {
      await markNotificationAsReadRequest(notificationId);
      setSuccess("Notificación marcada como leída.");
      await loadNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo marcar la notificación."
      );
    }
  };

  const columns = [
    {
      key: "title",
      label: "Título",
      render: (row) => row.title || "-",
    },
    {
      key: "message",
      label: "Mensaje",
      render: (row) => row.message || "-",
    },
    {
      key: "level",
      label: "Nivel",
      render: (row) => <StatusBadge>{row.level || "-"}</StatusBadge>,
    },
    {
      key: "channels",
      label: "Canales",
      render: (row) =>
        Array.isArray(row.channels)
          ? row.channels.map((channel) => (
              <span key={channel} style={{ marginRight: 6 }}>
                <StatusBadge variant="default">{channel}</StatusBadge>
              </span>
            ))
          : "-",
    },
    {
      key: "is_read",
      label: "Estado",
      render: (row) => (
        <StatusBadge variant={row.is_read ? "success" : "warning"}>
          {row.is_read ? "Leída" : "Pendiente"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) =>
        row.is_read ? (
          "-"
        ) : (
          <button
            className="notifications-page__mark"
            onClick={() => handleMarkRead(row.id)}
          >
            Marcar leída
          </button>
        ),
    },
  ];

  return (
    <div className="notifications-page">
      <PageHeader
        title="Notificaciones"
        description="Administrá las notificaciones internas y preparadas para email/WhatsApp."
        actionLabel="Nueva notificación"
        onAction={() => setOpenModal(true)}
      />

      <SectionCard
        title="Listado de notificaciones"
        actions={
          <div className="notifications-page__tools">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="notifications-page__filter"
            >
              <option value="all">Todas</option>
              <option value="unread">Pendientes</option>
              <option value="read">Leídas</option>
            </select>

            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notificaciones..."
            />
          </div>
        }
      >
        {error ? <div className="notifications-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="notifications-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="notifications-page__messages">
            <StatelessMessage>Cargando notificaciones...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={columns}
            rows={filteredNotifications}
            emptyText="Todavía no hay notificaciones."
          />
        )}
      </SectionCard>

      <Modal
        open={openModal}
        title="Crear notificación"
        onClose={() => setOpenModal(false)}
      >
        <form className="notifications-form" onSubmit={handleSubmit}>
          <div className="notifications-form__grid">
            <div className="notifications-form__field">
              <label>ID usuario</label>
              <input name="user_id" value={form.user_id} onChange={handleFieldChange} />
            </div>

            <div className="notifications-form__field">
              <label>Event code</label>
              <input
                name="event_code"
                value={form.event_code}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="notifications-form__field notifications-form__field--full">
              <label>Título</label>
              <input name="title" value={form.title} onChange={handleFieldChange} required />
            </div>

            <div className="notifications-form__field notifications-form__field--full">
              <label>Mensaje</label>
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="notifications-form__field">
              <label>Nivel</label>
              <select name="level" value={form.level} onChange={handleFieldChange}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
            </div>

            <div className="notifications-form__field">
              <label>Entity type</label>
              <input name="entity_type" value={form.entity_type} onChange={handleFieldChange} />
            </div>

            <div className="notifications-form__field">
              <label>Entity id</label>
              <input name="entity_id" value={form.entity_id} onChange={handleFieldChange} />
            </div>

            <div className="notifications-form__field notifications-form__field--full">
              <label>Payload JSON</label>
              <textarea
                name="payload"
                rows="4"
                value={form.payload}
                onChange={handleFieldChange}
                placeholder='{"work_order_code":"TL-OT-000001"}'
              />
            </div>

            <div className="notifications-form__checkbox notifications-form__field--full">
              <label>
                <input
                  type="checkbox"
                  name="in_app"
                  checked={form.channels.in_app}
                  onChange={handleChannelChange}
                />
                In app
              </label>

              <label>
                <input
                  type="checkbox"
                  name="email"
                  checked={form.channels.email}
                  onChange={handleChannelChange}
                />
                Email
              </label>

              <label>
                <input
                  type="checkbox"
                  name="whatsapp"
                  checked={form.channels.whatsapp}
                  onChange={handleChannelChange}
                />
                WhatsApp
              </label>
            </div>
          </div>

          <div className="notifications-form__actions">
            <button
              type="button"
              className="notifications-form__secondary"
              onClick={() => setOpenModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="notifications-form__primary">
              Guardar notificación
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default NotificationsPage;