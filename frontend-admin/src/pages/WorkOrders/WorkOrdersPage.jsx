import { useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/ui/ActionButton";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { getClientsRequest } from "../../services/clientsService";
import {
  changeWorkOrderStatusRequest,
  createWorkOrderRequest,
  getWorkOrderByIdRequest,
  getWorkOrderStatusesRequest,
  getWorkOrdersRequest,
} from "../../services/workOrdersService";
import {
  createWorkOrderMediaRequest,
  getWorkOrderMediaRequest,
  uploadWorkOrderMediaRequest,
} from "../../services/workOrderMediaService";
import { getVehiclesRequest } from "../../services/vehiclesService";
import "./WorkOrdersPage.css";

const initialWorkOrderForm = {
  branch_id: 1,
  client_id: "",
  vehicle_id: "",
  service_type: "",
  title: "",
  description: "",
  internal_notes: "",
  priority: "medium",
  estimated_start_date: "",
  estimated_end_date: "",
  estimated_price: "",
  final_price: "",
  advance_paid: "",
  is_public_portfolio_candidate: false,
  customer_reference: "",
  source_channel: "manual",
};

const initialManualMediaForm = {
  media_type: "external_link",
  stage: "after",
  title: "",
  description: "",
  external_url: "",
  thumbnail_url: "",
  sort_order: 0,
  is_cover: false,
  is_public_portfolio_asset: true,
};

const initialUploadForm = {
  stage: "before",
  title: "",
  description: "",
  sort_order: 0,
  is_cover: false,
  is_public_portfolio_asset: true,
  file: null,
};

function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedWorkOrderMedia, setSelectedWorkOrderMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openManualMediaModal, setOpenManualMediaModal] = useState(false);
  const [openUploadMediaModal, setOpenUploadMediaModal] = useState(false);

  const [workOrderForm, setWorkOrderForm] = useState(initialWorkOrderForm);
  const [statusForm, setStatusForm] = useState({
    status_code: "",
    note: "",
  });
  const [manualMediaForm, setManualMediaForm] = useState(initialManualMediaForm);
  const [uploadForm, setUploadForm] = useState(initialUploadForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadBaseData() {
    try {
      setLoading(true);

      const [
        workOrdersResponse,
        clientsResponse,
        vehiclesResponse,
        statusesResponse,
      ] = await Promise.all([
        getWorkOrdersRequest(),
        getClientsRequest(),
        getVehiclesRequest(),
        getWorkOrderStatusesRequest(),
      ]);

      setWorkOrders(workOrdersResponse?.data || []);
      setClients(clientsResponse?.data || []);
      setVehicles(vehiclesResponse?.data || []);
      setStatuses(statusesResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar las órdenes de trabajo."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBaseData();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (!workOrderForm.client_id) return vehicles;
    return vehicles.filter(
      (vehicle) => String(vehicle.client_id) === String(workOrderForm.client_id)
    );
  }, [vehicles, workOrderForm.client_id]);

  const filteredWorkOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return workOrders;

    return workOrders.filter((row) =>
      [
        row.code,
        row.title,
        row.client?.display_name,
        row.client_snapshot?.display_name,
        row.current_status?.name,
        row.priority,
        row.vehicle?.plate,
        row.vehicle?.brand?.name,
        row.vehicle?.model?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [workOrders, search]);

  const handleWorkOrderFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setWorkOrderForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "client_id" ? { vehicle_id: "" } : {}),
    }));
  };

  const handleManualMediaChange = (event) => {
    const { name, value, type, checked } = event.target;
    setManualMediaForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUploadChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (type === "file") {
      setUploadForm((prev) => ({
        ...prev,
        file: files?.[0] || null,
      }));
      return;
    }

    setUploadForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openDetail = async (workOrderId) => {
    setError("");

    try {
      const [detailResponse, mediaResponse] = await Promise.all([
        getWorkOrderByIdRequest(workOrderId),
        getWorkOrderMediaRequest(workOrderId),
      ]);

      setSelectedWorkOrder(detailResponse?.data || null);
      setSelectedWorkOrderMedia(mediaResponse?.data || []);
      setOpenDetailModal(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar el detalle del trabajo."
      );
    }
  };

  const handleCreateWorkOrder = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        branch_id: workOrderForm.branch_id ? Number(workOrderForm.branch_id) : null,
        client_id: Number(workOrderForm.client_id),
        vehicle_id: workOrderForm.vehicle_id ? Number(workOrderForm.vehicle_id) : null,
        service_type: workOrderForm.service_type,
        title: workOrderForm.title,
        description: workOrderForm.description,
        internal_notes: workOrderForm.internal_notes,
        priority: workOrderForm.priority,
        estimated_start_date: workOrderForm.estimated_start_date || null,
        estimated_end_date: workOrderForm.estimated_end_date || null,
        estimated_price: workOrderForm.estimated_price ? Number(workOrderForm.estimated_price) : 0,
        final_price: workOrderForm.final_price ? Number(workOrderForm.final_price) : 0,
        advance_paid: workOrderForm.advance_paid ? Number(workOrderForm.advance_paid) : 0,
        is_public_portfolio_candidate: Boolean(workOrderForm.is_public_portfolio_candidate),
        customer_reference: workOrderForm.customer_reference,
        source_channel: workOrderForm.source_channel,
      };

      await createWorkOrderRequest(payload);
      setSuccess("Orden de trabajo creada correctamente.");
      setWorkOrderForm(initialWorkOrderForm);
      setOpenCreateModal(false);
      await loadBaseData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la orden de trabajo."
      );
    }
  };

  const handleOpenStatusModal = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setStatusForm({
      status_code: "",
      note: "",
    });
    setOpenStatusModal(true);
  };

  const handleChangeStatus = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await changeWorkOrderStatusRequest(selectedWorkOrder.id, statusForm);
      setSuccess("Estado actualizado correctamente.");
      setOpenStatusModal(false);
      await loadBaseData();

      if (openDetailModal && selectedWorkOrder?.id) {
        await openDetail(selectedWorkOrder.id);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cambiar el estado."
      );
    }
  };

  const handleCreateManualMedia = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createWorkOrderMediaRequest(selectedWorkOrder.id, {
        ...manualMediaForm,
        sort_order: Number(manualMediaForm.sort_order || 0),
      });

      setSuccess("Media creada correctamente.");
      setManualMediaForm(initialManualMediaForm);
      setOpenManualMediaModal(false);
      await openDetail(selectedWorkOrder.id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la media."
      );
    }
  };

  const handleUploadMedia = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("stage", uploadForm.stage);
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("sort_order", String(uploadForm.sort_order || 0));
      formData.append("is_cover", String(Boolean(uploadForm.is_cover)));
      formData.append(
        "is_public_portfolio_asset",
        String(Boolean(uploadForm.is_public_portfolio_asset))
      );

      await uploadWorkOrderMediaRequest(selectedWorkOrder.id, formData);

      setSuccess("Archivo subido correctamente.");
      setUploadForm(initialUploadForm);
      setOpenUploadMediaModal(false);
      await openDetail(selectedWorkOrder.id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo subir el archivo."
      );
    }
  };

  const columns = [
    {
      key: "code",
      label: "Código",
      render: (row) => row.code || "-",
    },
    {
      key: "title",
      label: "Trabajo",
      render: (row) => row.title || "-",
    },
    {
      key: "client",
      label: "Cliente",
      render: (row) => row.client?.display_name || row.client_snapshot?.display_name || "-",
    },
    {
      key: "vehicle",
      label: "Vehículo",
      render: (row) => {
        const brand = row.vehicle?.brand?.name || "";
        const model = row.vehicle?.model?.name || "";
        const year = row.vehicle?.year || "";
        return [brand, model, year].filter(Boolean).join(" ") || row.vehicle?.plate || "-";
      },
    },
    {
      key: "current_status",
      label: "Estado",
      render: (row) => (
        <StatusBadge>{row.current_status?.name || "-"}</StatusBadge>
      ),
    },
    {
      key: "priority",
      label: "Prioridad",
      render: (row) => {
        const map = {
          low: "Baja",
          medium: "Media",
          high: "Alta",
          urgent: "Urgente",
        };
        return <StatusBadge>{map[row.priority] || row.priority || "-"}</StatusBadge>;
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <div className="work-orders-page__actions">
          <ActionButton onClick={() => openDetail(row.id)}>Ver</ActionButton>
          <ActionButton variant="secondary" onClick={() => handleOpenStatusModal(row)}>
            Estado
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="work-orders-page">
      <PageHeader
        title="Órdenes de trabajo"
        description="Gestioná los trabajos del taller, sus estados y su media."
        actionLabel="Nueva orden"
        onAction={() => setOpenCreateModal(true)}
      />

      <SectionCard
        title="Listado de órdenes"
        actions={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente, vehículo, estado o prioridad..."
          />
        }
      >
        {error ? <div className="work-orders-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="work-orders-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="work-orders-page__messages">
            <StatelessMessage>Cargando trabajos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={columns}
            rows={filteredWorkOrders}
            emptyText="Todavía no hay órdenes de trabajo cargadas."
          />
        )}
      </SectionCard>

      <Modal
        open={openCreateModal}
        title="Crear orden de trabajo"
        onClose={() => setOpenCreateModal(false)}
      >
        <form className="work-order-form" onSubmit={handleCreateWorkOrder}>
          <div className="work-order-form__grid">
            <div className="work-order-form__field">
              <label>Sucursal</label>
              <input
                name="branch_id"
                value={workOrderForm.branch_id}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Cliente</label>
              <select
                name="client_id"
                value={workOrderForm.client_id}
                onChange={handleWorkOrderFormChange}
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

            <div className="work-order-form__field">
              <label>Vehículo</label>
              <select
                name="vehicle_id"
                value={workOrderForm.vehicle_id}
                onChange={handleWorkOrderFormChange}
              >
                <option value="">Seleccionar</option>
                {filteredVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {[vehicle.brand?.name, vehicle.model?.name, vehicle.year, vehicle.plate]
                      .filter(Boolean)
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="work-order-form__field">
              <label>Tipo de servicio</label>
              <input
                name="service_type"
                value={workOrderForm.service_type}
                onChange={handleWorkOrderFormChange}
                required
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Título</label>
              <input
                name="title"
                value={workOrderForm.title}
                onChange={handleWorkOrderFormChange}
                required
              />
            </div>

            <div className="work-order-form__field">
              <label>Prioridad</label>
              <select
                name="priority"
                value={workOrderForm.priority}
                onChange={handleWorkOrderFormChange}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="work-order-form__field">
              <label>Canal</label>
              <input
                name="source_channel"
                value={workOrderForm.source_channel}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Fecha inicio estimada</label>
              <input
                type="date"
                name="estimated_start_date"
                value={workOrderForm.estimated_start_date}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Fecha fin estimada</label>
              <input
                type="date"
                name="estimated_end_date"
                value={workOrderForm.estimated_end_date}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Precio estimado</label>
              <input
                name="estimated_price"
                value={workOrderForm.estimated_price}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Seña</label>
              <input
                name="advance_paid"
                value={workOrderForm.advance_paid}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Descripción</label>
              <textarea
                name="description"
                value={workOrderForm.description}
                onChange={handleWorkOrderFormChange}
                rows="4"
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Notas internas</label>
              <textarea
                name="internal_notes"
                value={workOrderForm.internal_notes}
                onChange={handleWorkOrderFormChange}
                rows="4"
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Referencia del cliente</label>
              <input
                name="customer_reference"
                value={workOrderForm.customer_reference}
                onChange={handleWorkOrderFormChange}
              />
            </div>

            <div className="work-order-form__checkbox work-order-form__field--full">
              <label>
                <input
                  type="checkbox"
                  name="is_public_portfolio_candidate"
                  checked={workOrderForm.is_public_portfolio_candidate}
                  onChange={handleWorkOrderFormChange}
                />
                Candidato a portfolio público
              </label>
            </div>
          </div>

          <div className="work-order-form__actions">
            <button
              type="button"
              className="work-order-form__secondary"
              onClick={() => setOpenCreateModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="work-order-form__primary">
              Guardar orden
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openStatusModal}
        title={`Cambiar estado ${selectedWorkOrder?.code || ""}`}
        onClose={() => setOpenStatusModal(false)}
      >
        <form className="work-order-form" onSubmit={handleChangeStatus}>
          <div className="work-order-form__grid">
            <div className="work-order-form__field">
              <label>Nuevo estado</label>
              <select
                value={statusForm.status_code}
                onChange={(event) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    status_code: event.target.value,
                  }))
                }
                required
              >
                <option value="">Seleccionar</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.code}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Nota</label>
              <textarea
                value={statusForm.note}
                onChange={(event) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
                rows="4"
              />
            </div>
          </div>

          <div className="work-order-form__actions">
            <button
              type="button"
              className="work-order-form__secondary"
              onClick={() => setOpenStatusModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="work-order-form__primary">
              Cambiar estado
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openDetailModal}
        title={`Detalle ${selectedWorkOrder?.code || ""}`}
        onClose={() => setOpenDetailModal(false)}
      >
        {selectedWorkOrder ? (
          <div className="work-order-detail">
            <div className="work-order-detail__block">
              <h4>Información general</h4>
              <p><strong>Título:</strong> {selectedWorkOrder.title}</p>
              <p><strong>Cliente:</strong> {selectedWorkOrder.client?.display_name || selectedWorkOrder.client_snapshot?.display_name || "-"}</p>
              <p><strong>Estado:</strong> {selectedWorkOrder.current_status?.name || "-"}</p>
              <p><strong>Prioridad:</strong> {selectedWorkOrder.priority || "-"}</p>
              <p><strong>Descripción:</strong> {selectedWorkOrder.description || "-"}</p>
              <p><strong>Notas internas:</strong> {selectedWorkOrder.internal_notes || "-"}</p>
            </div>

            <div className="work-order-detail__actions">
              <ActionButton onClick={() => setOpenManualMediaModal(true)}>
                Agregar media manual
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => setOpenUploadMediaModal(true)}>
                Subir archivo
              </ActionButton>
            </div>

            <div className="work-order-detail__block">
              <h4>Historial de estados</h4>
              {selectedWorkOrder.status_history?.length ? (
                <ul className="work-order-detail__list">
                  {selectedWorkOrder.status_history.map((item) => (
                    <li key={item.id}>
                      <strong>{item.new_status?.name || "-"}</strong> — {item.note || "Sin nota"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay historial disponible.</p>
              )}
            </div>

            <div className="work-order-detail__block">
              <h4>Media</h4>
              {selectedWorkOrderMedia.length ? (
                <ul className="work-order-detail__list">
                  {selectedWorkOrderMedia.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title || item.original_name || "Archivo"}</strong>
                      {" — "}
                      {item.media_type}
                      {" — "}
                      {item.stage}
                      {item.file_url ? (
                        <>
                          {" — "}
                          <a href={item.file_url} target="_blank" rel="noreferrer">
                            abrir
                          </a>
                        </>
                      ) : null}
                      {item.external_url ? (
                        <>
                          {" — "}
                          <a href={item.external_url} target="_blank" rel="noreferrer">
                            enlace
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay media cargada.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={openManualMediaModal}
        title="Crear media manual"
        onClose={() => setOpenManualMediaModal(false)}
      >
        <form className="work-order-form" onSubmit={handleCreateManualMedia}>
          <div className="work-order-form__grid">
            <div className="work-order-form__field">
              <label>Tipo</label>
              <select
                name="media_type"
                value={manualMediaForm.media_type}
                onChange={handleManualMediaChange}
              >
                <option value="external_link">Enlace externo</option>
                <option value="image">Imagen</option>
                <option value="video">Video</option>
                <option value="file">Archivo</option>
              </select>
            </div>

            <div className="work-order-form__field">
              <label>Etapa</label>
              <select
                name="stage"
                value={manualMediaForm.stage}
                onChange={handleManualMediaChange}
              >
                <option value="before">Antes</option>
                <option value="during">Durante</option>
                <option value="after">Después</option>
                <option value="cover">Portada</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Título</label>
              <input
                name="title"
                value={manualMediaForm.title}
                onChange={handleManualMediaChange}
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Descripción</label>
              <textarea
                name="description"
                value={manualMediaForm.description}
                onChange={handleManualMediaChange}
                rows="3"
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>External URL</label>
              <input
                name="external_url"
                value={manualMediaForm.external_url}
                onChange={handleManualMediaChange}
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Thumbnail URL</label>
              <input
                name="thumbnail_url"
                value={manualMediaForm.thumbnail_url}
                onChange={handleManualMediaChange}
              />
            </div>

            <div className="work-order-form__field">
              <label>Orden</label>
              <input
                name="sort_order"
                value={manualMediaForm.sort_order}
                onChange={handleManualMediaChange}
              />
            </div>

            <div className="work-order-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_cover"
                  checked={manualMediaForm.is_cover}
                  onChange={handleManualMediaChange}
                />
                Portada
              </label>
            </div>

            <div className="work-order-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_public_portfolio_asset"
                  checked={manualMediaForm.is_public_portfolio_asset}
                  onChange={handleManualMediaChange}
                />
                Visible para portfolio
              </label>
            </div>
          </div>

          <div className="work-order-form__actions">
            <button
              type="button"
              className="work-order-form__secondary"
              onClick={() => setOpenManualMediaModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="work-order-form__primary">
              Guardar media
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openUploadMediaModal}
        title="Subir archivo"
        onClose={() => setOpenUploadMediaModal(false)}
      >
        <form className="work-order-form" onSubmit={handleUploadMedia}>
          <div className="work-order-form__grid">
            <div className="work-order-form__field">
              <label>Etapa</label>
              <select
                name="stage"
                value={uploadForm.stage}
                onChange={handleUploadChange}
              >
                <option value="before">Antes</option>
                <option value="during">Durante</option>
                <option value="after">Después</option>
                <option value="cover">Portada</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="work-order-form__field">
              <label>Orden</label>
              <input
                name="sort_order"
                value={uploadForm.sort_order}
                onChange={handleUploadChange}
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Título</label>
              <input
                name="title"
                value={uploadForm.title}
                onChange={handleUploadChange}
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Descripción</label>
              <textarea
                name="description"
                value={uploadForm.description}
                onChange={handleUploadChange}
                rows="3"
              />
            </div>

            <div className="work-order-form__field work-order-form__field--full">
              <label>Archivo</label>
              <input
                type="file"
                name="file"
                onChange={handleUploadChange}
                required
              />
            </div>

            <div className="work-order-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_cover"
                  checked={uploadForm.is_cover}
                  onChange={handleUploadChange}
                />
                Portada
              </label>
            </div>

            <div className="work-order-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  name="is_public_portfolio_asset"
                  checked={uploadForm.is_public_portfolio_asset}
                  onChange={handleUploadChange}
                />
                Visible para portfolio
              </label>
            </div>
          </div>

          <div className="work-order-form__actions">
            <button
              type="button"
              className="work-order-form__secondary"
              onClick={() => setOpenUploadMediaModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="work-order-form__primary">
              Subir archivo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WorkOrdersPage;