import { useEffect, useMemo, useState } from "react";
import ActionButton from "../../components/ui/ActionButton";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  createMoldFileRequest,
  createMoldRequest,
  createTechnicalPartRequest,
  getMoldByIdRequest,
  getMoldsRequest,
  getTechnicalPartsRequest,
} from "../../services/moldsService";
import {
  getVehicleBrandsRequest,
  getVehicleModelsRequest,
} from "../../services/vehiclesService";
import "./MoldsPage.css";

const initialPartForm = {
  code: "",
  name: "",
  description: "",
};

const initialMoldForm = {
  brand_id: "",
  model_id: "",
  technical_part_id: "",
  code: "",
  title: "",
  vehicle_type: "car",
  year_from: "",
  year_to: "",
  version_label: "",
  material_reference: "",
  dimensions_notes: "",
  technical_notes: "",
  print_notes: "",
  is_reference_verified: false,
};

const initialFileForm = {
  file_type: "pattern_pdf",
  version_number: 1,
  title: "",
  description: "",
  storage_type: "local",
  file_name: "",
  original_name: "",
  mime_type: "application/pdf",
  file_size: "",
  file_path: "",
  file_url: "",
  external_url: "",
  is_printable: true,
  is_current: true,
};

function MoldsPage() {
  const [parts, setParts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [molds, setMolds] = useState([]);
  const [selectedMold, setSelectedMold] = useState(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openPartModal, setOpenPartModal] = useState(false);
  const [openMoldModal, setOpenMoldModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);

  const [partForm, setPartForm] = useState(initialPartForm);
  const [moldForm, setMoldForm] = useState(initialMoldForm);
  const [fileForm, setFileForm] = useState(initialFileForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [partsResponse, brandsResponse, modelsResponse, moldsResponse] =
        await Promise.all([
          getTechnicalPartsRequest(),
          getVehicleBrandsRequest(),
          getVehicleModelsRequest(),
          getMoldsRequest(),
        ]);

      setParts(partsResponse?.data || []);
      setBrands(brandsResponse?.data || []);
      setModels(modelsResponse?.data || []);
      setMolds(moldsResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los moldes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredMolds = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return molds;

    return molds.filter((item) =>
      [
        item.code,
        item.title,
        item.vehicle_type,
        item.brand?.name,
        item.model?.name,
        item.technical_part?.name,
        item.version_label,
        item.material_reference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [molds, search]);

  async function openDetail(id) {
    setError("");

    try {
      const response = await getMoldByIdRequest(id);
      setSelectedMold(response?.data || null);
      setOpenDetailModal(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar el detalle del molde."
      );
    }
  }

  const handlePartSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createTechnicalPartRequest(partForm);
      setSuccess("Pieza técnica creada correctamente.");
      setPartForm(initialPartForm);
      setOpenPartModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la pieza técnica."
      );
    }
  };

  const handleMoldSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createMoldRequest({
        ...moldForm,
        brand_id: moldForm.brand_id ? Number(moldForm.brand_id) : null,
        model_id: moldForm.model_id ? Number(moldForm.model_id) : null,
        technical_part_id: Number(moldForm.technical_part_id),
        year_from: moldForm.year_from ? Number(moldForm.year_from) : null,
        year_to: moldForm.year_to ? Number(moldForm.year_to) : null,
        is_reference_verified: Boolean(moldForm.is_reference_verified),
      });

      setSuccess("Molde creado correctamente.");
      setMoldForm(initialMoldForm);
      setOpenMoldModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el molde."
      );
    }
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createMoldFileRequest(selectedMold.id, {
        ...fileForm,
        version_number: Number(fileForm.version_number || 1),
        file_size: fileForm.file_size ? Number(fileForm.file_size) : null,
        is_printable: Boolean(fileForm.is_printable),
        is_current: Boolean(fileForm.is_current),
      });

      setSuccess("Archivo de molde creado correctamente.");
      setFileForm(initialFileForm);
      setOpenFileModal(false);
      await openDetail(selectedMold.id);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el archivo del molde."
      );
    }
  };

  const moldColumns = [
    {
      key: "code",
      label: "Código",
      render: (row) => row.code || "-",
    },
    {
      key: "title",
      label: "Molde",
      render: (row) => row.title || "-",
    },
    {
      key: "technical_part",
      label: "Pieza",
      render: (row) => row.technical_part?.name || "-",
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
      key: "vehicle_type",
      label: "Tipo",
      render: (row) => <StatusBadge variant="default">{row.vehicle_type || "-"}</StatusBadge>,
    },
    {
      key: "is_reference_verified",
      label: "Verificado",
      render: (row) => (
        <StatusBadge variant={row.is_reference_verified ? "success" : "warning"}>
          {row.is_reference_verified ? "Sí" : "No"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <div className="molds-page__actions">
          <ActionButton onClick={() => openDetail(row.id)}>Ver</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="molds-page">
      <PageHeader
        title="Moldes"
        description="Gestioná piezas técnicas, moldes y archivos asociados."
        actionLabel="Nuevo molde"
        onAction={() => setOpenMoldModal(true)}
      />

      <SectionCard
        title="Listado de moldes"
        actions={
          <div className="molds-page__toolbar">
            <ActionButton onClick={() => setOpenPartModal(true)}>
              Nueva pieza técnica
            </ActionButton>
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, título, marca, modelo o pieza..."
            />
          </div>
        }
      >
        {error ? <div className="molds-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="molds-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="molds-page__messages">
            <StatelessMessage>Cargando moldes...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={moldColumns}
            rows={filteredMolds}
            emptyText="Todavía no hay moldes cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openPartModal}
        title="Crear pieza técnica"
        onClose={() => setOpenPartModal(false)}
      >
        <form className="molds-form" onSubmit={handlePartSubmit}>
          <div className="molds-form__grid">
            <div className="molds-form__field">
              <label>Código</label>
              <input
                value={partForm.code}
                onChange={(e) =>
                  setPartForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>

            <div className="molds-form__field">
              <label>Nombre</label>
              <input
                value={partForm.name}
                onChange={(e) =>
                  setPartForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={partForm.description}
                onChange={(e) =>
                  setPartForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="molds-form__actions">
            <button
              type="button"
              className="molds-form__secondary"
              onClick={() => setOpenPartModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="molds-form__primary">
              Guardar pieza
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openMoldModal}
        title="Crear molde"
        onClose={() => setOpenMoldModal(false)}
      >
        <form className="molds-form" onSubmit={handleMoldSubmit}>
          <div className="molds-form__grid">
            <div className="molds-form__field">
              <label>Pieza técnica</label>
              <select
                value={moldForm.technical_part_id}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    technical_part_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">Seleccionar</option>
                {parts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="molds-form__field">
              <label>Marca</label>
              <select
                value={moldForm.brand_id}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    brand_id: e.target.value,
                  }))
                }
              >
                <option value="">Seleccionar</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="molds-form__field">
              <label>Modelo</label>
              <select
                value={moldForm.model_id}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    model_id: e.target.value,
                  }))
                }
              >
                <option value="">Seleccionar</option>
                {models
                  .filter((item) =>
                    moldForm.brand_id
                      ? String(item.brand_id) === String(moldForm.brand_id)
                      : true
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="molds-form__field">
              <label>Tipo de vehículo</label>
              <input
                value={moldForm.vehicle_type}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    vehicle_type: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Código</label>
              <input
                value={moldForm.code}
                onChange={(e) =>
                  setMoldForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>

            <div className="molds-form__field">
              <label>Título</label>
              <input
                value={moldForm.title}
                onChange={(e) =>
                  setMoldForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="molds-form__field">
              <label>Año desde</label>
              <input
                value={moldForm.year_from}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    year_from: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Año hasta</label>
              <input
                value={moldForm.year_to}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    year_to: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Versión</label>
              <input
                value={moldForm.version_label}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    version_label: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Material referencia</label>
              <input
                value={moldForm.material_reference}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    material_reference: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Notas dimensiones</label>
              <textarea
                rows="3"
                value={moldForm.dimensions_notes}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    dimensions_notes: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Notas técnicas</label>
              <textarea
                rows="3"
                value={moldForm.technical_notes}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    technical_notes: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Notas impresión</label>
              <textarea
                rows="3"
                value={moldForm.print_notes}
                onChange={(e) =>
                  setMoldForm((prev) => ({
                    ...prev,
                    print_notes: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__checkbox molds-form__field--full">
              <label>
                <input
                  type="checkbox"
                  checked={moldForm.is_reference_verified}
                  onChange={(e) =>
                    setMoldForm((prev) => ({
                      ...prev,
                      is_reference_verified: e.target.checked,
                    }))
                  }
                />
                Referencia verificada
              </label>
            </div>
          </div>

          <div className="molds-form__actions">
            <button
              type="button"
              className="molds-form__secondary"
              onClick={() => setOpenMoldModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="molds-form__primary">
              Guardar molde
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openDetailModal}
        title={`Detalle ${selectedMold?.code || ""}`}
        onClose={() => setOpenDetailModal(false)}
      >
        {selectedMold ? (
          <div className="molds-detail">
            <div className="molds-detail__block">
              <h4>Información general</h4>
              <p><strong>Título:</strong> {selectedMold.title}</p>
              <p><strong>Pieza:</strong> {selectedMold.technical_part?.name || "-"}</p>
              <p><strong>Marca:</strong> {selectedMold.brand?.name || "-"}</p>
              <p><strong>Modelo:</strong> {selectedMold.model?.name || "-"}</p>
              <p><strong>Vehículo:</strong> {selectedMold.vehicle_type || "-"}</p>
              <p><strong>Años:</strong> {selectedMold.year_from || "-"} - {selectedMold.year_to || "-"}</p>
              <p><strong>Material:</strong> {selectedMold.material_reference || "-"}</p>
            </div>

            <div className="molds-detail__actions">
              <ActionButton onClick={() => setOpenFileModal(true)}>
                Agregar archivo
              </ActionButton>
            </div>

            <div className="molds-detail__block">
              <h4>Archivos del molde</h4>
              {selectedMold.files?.length ? (
                <ul className="molds-detail__list">
                  {selectedMold.files.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title || item.original_name || "Archivo"}</strong>
                      {" — "}
                      <StatusBadge variant="default">v{item.version_number}</StatusBadge>
                      {" "}
                      <StatusBadge variant={item.is_current ? "success" : "default"}>
                        {item.is_current ? "Actual" : "Histórico"}
                      </StatusBadge>
                      {" "}
                      {item.file_type}
                      {item.file_url ? (
                        <>
                          {" — "}
                          <a href={item.file_url} target="_blank" rel="noreferrer">
                            abrir
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay archivos cargados.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={openFileModal}
        title="Agregar archivo al molde"
        onClose={() => setOpenFileModal(false)}
      >
        <form className="molds-form" onSubmit={handleFileSubmit}>
          <div className="molds-form__grid">
            <div className="molds-form__field">
              <label>Tipo de archivo</label>
              <input
                value={fileForm.file_type}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file_type: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Versión</label>
              <input
                value={fileForm.version_number}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    version_number: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Título</label>
              <input
                value={fileForm.title}
                onChange={(e) =>
                  setFileForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={fileForm.description}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>File name</label>
              <input
                value={fileForm.file_name}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>Original name</label>
              <input
                value={fileForm.original_name}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    original_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>MIME type</label>
              <input
                value={fileForm.mime_type}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    mime_type: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field">
              <label>File size</label>
              <input
                value={fileForm.file_size}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file_size: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>File path</label>
              <input
                value={fileForm.file_path}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file_path: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__field molds-form__field--full">
              <label>File URL</label>
              <input
                value={fileForm.file_url}
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file_url: e.target.value,
                  }))
                }
              />
            </div>

            <div className="molds-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={fileForm.is_printable}
                  onChange={(e) =>
                    setFileForm((prev) => ({
                      ...prev,
                      is_printable: e.target.checked,
                    }))
                  }
                />
                Imprimible
              </label>
            </div>

            <div className="molds-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={fileForm.is_current}
                  onChange={(e) =>
                    setFileForm((prev) => ({
                      ...prev,
                      is_current: e.target.checked,
                    }))
                  }
                />
                Versión actual
              </label>
            </div>
          </div>

          <div className="molds-form__actions">
            <button
              type="button"
              className="molds-form__secondary"
              onClick={() => setOpenFileModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="molds-form__primary">
              Guardar archivo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MoldsPage;