import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { createClientRequest, getClientsRequest } from "../../services/clientsService";
import "./ClientsPage.css";

const initialForm = {
  branch_id: 1,
  client_type: "individual",
  first_name: "",
  last_name: "",
  company_name: "",
  email: "",
  phone: "",
  city: "",
  province: "",
  notes: "",
};

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadClients() {
    try {
      setLoading(true);
      const response = await getClientsRequest();
      setClients(response?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los clientes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) =>
      [
        client.display_name,
        client.email,
        client.phone,
        client.city,
        client.province,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [clients, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
      };

      await createClientRequest(payload);
      setSuccess("Cliente creado correctamente.");
      setForm(initialForm);
      setOpenModal(false);
      await loadClients();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el cliente."
      );
    }
  };

  const columns = [
    {
      key: "display_name",
      label: "Cliente",
      render: (row) => row.display_name || "-",
    },
    {
      key: "client_type",
      label: "Tipo",
      render: (row) => (
        <StatusBadge variant="default">
          {row.client_type === "company" ? "Empresa" : "Individual"}
        </StatusBadge>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => row.email || "-",
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (row) => row.phone || "-",
    },
    {
      key: "city",
      label: "Ciudad",
      render: (row) => row.city || "-",
    },
    {
      key: "province",
      label: "Provincia",
      render: (row) => row.province || "-",
    },
  ];

  return (
    <div className="clients-page">
      <PageHeader
        title="Clientes"
        description="Administrá la base de clientes del negocio."
        actionLabel="Nuevo cliente"
        onAction={() => setOpenModal(true)}
      />

      <SectionCard
        title="Listado de clientes"
        actions={
          <div className="clients-page__header-tools">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono o ciudad..."
            />
          </div>
        }
      >
        {error ? <div className="clients-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="clients-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="clients-page__messages">
            <StatelessMessage>Cargando clientes...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={columns}
            rows={filteredClients}
            emptyText="Todavía no hay clientes cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openModal}
        title="Crear cliente"
        onClose={() => setOpenModal(false)}
      >
        <form className="clients-form" onSubmit={handleSubmit}>
          <div className="clients-form__grid">
            <div className="clients-form__field">
              <label>Tipo</label>
              <select
                name="client_type"
                value={form.client_type}
                onChange={handleChange}
              >
                <option value="individual">Individual</option>
                <option value="company">Empresa</option>
              </select>
            </div>

            <div className="clients-form__field">
              <label>Sucursal</label>
              <input
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                placeholder="1"
              />
            </div>

            {form.client_type === "company" ? (
              <div className="clients-form__field clients-form__field--full">
                <label>Nombre de empresa</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <>
                <div className="clients-form__field">
                  <label>Nombre</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="clients-form__field">
                  <label>Apellido</label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="clients-form__field">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="clients-form__field">
              <label>Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="clients-form__field">
              <label>Ciudad</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="clients-form__field">
              <label>Provincia</label>
              <input
                name="province"
                value={form.province}
                onChange={handleChange}
              />
            </div>

            <div className="clients-form__field clients-form__field--full">
              <label>Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          <div className="clients-form__actions">
            <button type="button" className="clients-form__secondary" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="clients-form__primary">
              Guardar cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientsPage;