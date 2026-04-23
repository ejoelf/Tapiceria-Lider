import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { getClientsRequest } from "../../services/clientsService";
import {
  createVehicleRequest,
  getVehicleBrandsRequest,
  getVehicleModelsRequest,
  getVehiclesRequest,
} from "../../services/vehiclesService";
import "./VehiclesPage.css";

const initialForm = {
  client_id: "",
  branch_id: 1,
  brand_id: "",
  model_id: "",
  vehicle_type: "car",
  year: "",
  version: "",
  plate: "",
  color: "",
  nickname: "",
  notes: "",
};

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [vehiclesResponse, clientsResponse, brandsResponse, modelsResponse] =
        await Promise.all([
          getVehiclesRequest(),
          getClientsRequest(),
          getVehicleBrandsRequest(),
          getVehicleModelsRequest(),
        ]);

      setVehicles(vehiclesResponse?.data || []);
      setClients(clientsResponse?.data || []);
      setBrands(brandsResponse?.data || []);
      setModels(modelsResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los vehículos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredModels = useMemo(() => {
    if (!form.brand_id) return models;
    return models.filter((item) => String(item.brand_id) === String(form.brand_id));
  }, [form.brand_id, models]);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;

    return vehicles.filter((vehicle) =>
      [
        vehicle.client?.display_name,
        vehicle.brand?.name,
        vehicle.model?.name,
        vehicle.plate,
        vehicle.color,
        vehicle.nickname,
        vehicle.year,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [vehicles, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "brand_id" ? { model_id: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        client_id: Number(form.client_id),
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        model_id: form.model_id ? Number(form.model_id) : null,
        vehicle_type: form.vehicle_type,
        year: form.year ? Number(form.year) : null,
        version: form.version,
        plate: form.plate,
        color: form.color,
        nickname: form.nickname,
        notes: form.notes,
      };

      await createVehicleRequest(payload);
      setSuccess("Vehículo creado correctamente.");
      setForm(initialForm);
      setOpenModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el vehículo."
      );
    }
  };

  const columns = [
    {
      key: "client",
      label: "Cliente",
      render: (row) => row.client?.display_name || row.client_snapshot?.display_name || "-",
    },
    {
      key: "vehicle_type",
      label: "Tipo",
      render: (row) => <StatusBadge variant="default">{row.vehicle_type || "-"}</StatusBadge>,
    },
    {
      key: "brand",
      label: "Marca",
      render: (row) => row.brand?.name || "-",
    },
    {
      key: "model",
      label: "Modelo",
      render: (row) => row.model?.name || "-",
    },
    {
      key: "year",
      label: "Año",
      render: (row) => row.year || "-",
    },
    {
      key: "plate",
      label: "Patente",
      render: (row) => row.plate || "-",
    },
  ];

  return (
    <div className="vehicles-page">
      <PageHeader
        title="Vehículos"
        description="Gestioná los vehículos vinculados a los clientes."
        actionLabel="Nuevo vehículo"
        onAction={() => setOpenModal(true)}
      />

      <SectionCard
        title="Listado de vehículos"
        actions={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, marca, modelo, patente o año..."
          />
        }
      >
        {error ? <div className="vehicles-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="vehicles-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="vehicles-page__messages">
            <StatelessMessage>Cargando vehículos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={columns}
            rows={filteredVehicles}
            emptyText="Todavía no hay vehículos cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openModal}
        title="Crear vehículo"
        onClose={() => setOpenModal(false)}
      >
        <form className="vehicles-form" onSubmit={handleSubmit}>
          <div className="vehicles-form__grid">
            <div className="vehicles-form__field">
              <label>Cliente</label>
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicles-form__field">
              <label>Sucursal</label>
              <input
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field">
              <label>Tipo</label>
              <select
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
              >
                <option value="car">Auto</option>
                <option value="motorcycle">Moto</option>
                <option value="truck">Camión</option>
                <option value="pickup">Camioneta</option>
                <option value="boat">Barco</option>
                <option value="jet_ski">Moto de agua</option>
                <option value="plane">Avioneta</option>
              </select>
            </div>

            <div className="vehicles-form__field">
              <label>Año</label>
              <input
                name="year"
                value={form.year}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field">
              <label>Marca</label>
              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicles-form__field">
              <label>Modelo</label>
              <select
                name="model_id"
                value={form.model_id}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {filteredModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicles-form__field">
              <label>Versión</label>
              <input
                name="version"
                value={form.version}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field">
              <label>Patente</label>
              <input
                name="plate"
                value={form.plate}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field">
              <label>Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field">
              <label>Alias</label>
              <input
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
              />
            </div>

            <div className="vehicles-form__field vehicles-form__field--full">
              <label>Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          <div className="vehicles-form__actions">
            <button type="button" className="vehicles-form__secondary" onClick={() => setOpenModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="vehicles-form__primary">
              Guardar vehículo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VehiclesPage;