import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import {
  createVehicleCatalogBrandRequest,
  createVehicleCatalogModelRequest,
  createVehicleTypeRequest,
  getVehicleCatalogBrandsRequest,
  getVehicleCatalogModelsRequest,
  getVehicleTypesRequest,
  updateVehicleCatalogBrandRequest,
  updateVehicleCatalogModelRequest,
  updateVehicleTypeRequest,
} from "../../services/masterCatalogsService";
import { getSettingsRequest, saveSettingRequest } from "../../services/settingsService";
import "./MasterCatalogsPage.css";

const initialBrandForm = { id: null, name: "", code: "", is_active: true };
const initialModelForm = { id: null, brand_id: "", name: "", code: "", is_active: true };
const initialTypeForm = { id: null, code: "", name: "", description: "", is_active: true };
const initialSettingForm = {
  key: "",
  value: "",
  description: "",
  is_public: false,
};

function MasterCatalogsPage() {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [brandForm, setBrandForm] = useState(initialBrandForm);
  const [modelForm, setModelForm] = useState(initialModelForm);
  const [typeForm, setTypeForm] = useState(initialTypeForm);
  const [settingForm, setSettingForm] = useState(initialSettingForm);

  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [openModelModal, setOpenModelModal] = useState(false);
  const [openTypeModal, setOpenTypeModal] = useState(false);
  const [openSettingModal, setOpenSettingModal] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [brandsRes, modelsRes, typesRes, settingsRes] = await Promise.all([
        getVehicleCatalogBrandsRequest(),
        getVehicleCatalogModelsRequest(),
        getVehicleTypesRequest(),
        getSettingsRequest(),
      ]);

      setBrands(brandsRes?.data || []);
      setModels(modelsRes?.data || []);
      setTypes(typesRes?.data || []);
      setSettings(settingsRes?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los catálogos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleBrandSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (brandForm.id) {
        await updateVehicleCatalogBrandRequest(brandForm.id, brandForm);
        setSuccess("Marca actualizada correctamente.");
      } else {
        await createVehicleCatalogBrandRequest(brandForm);
        setSuccess("Marca creada correctamente.");
      }

      setBrandForm(initialBrandForm);
      setOpenBrandModal(false);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo guardar la marca.");
    }
  }

  async function handleModelSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...modelForm,
        brand_id: Number(modelForm.brand_id),
      };

      if (modelForm.id) {
        await updateVehicleCatalogModelRequest(modelForm.id, payload);
        setSuccess("Modelo actualizado correctamente.");
      } else {
        await createVehicleCatalogModelRequest(payload);
        setSuccess("Modelo creado correctamente.");
      }

      setModelForm(initialModelForm);
      setOpenModelModal(false);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo guardar el modelo.");
    }
  }

  async function handleTypeSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (typeForm.id) {
        await updateVehicleTypeRequest(typeForm.id, typeForm);
        setSuccess("Tipo actualizado correctamente.");
      } else {
        await createVehicleTypeRequest(typeForm);
        setSuccess("Tipo creado correctamente.");
      }

      setTypeForm(initialTypeForm);
      setOpenTypeModal(false);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo guardar el tipo.");
    }
  }

  async function handleSettingSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      let parsedValue = null;
      if (settingForm.value.trim()) {
        parsedValue = JSON.parse(settingForm.value);
      }

      await saveSettingRequest({
        key: settingForm.key,
        value: parsedValue,
        description: settingForm.description,
        is_public: settingForm.is_public,
      });

      setSuccess("Configuración guardada correctamente.");
      setSettingForm(initialSettingForm);
      setOpenSettingModal(false);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo guardar la configuración.");
    }
  }

  const brandColumns = [
    { key: "name", label: "Marca", render: (row) => row.name || "-" },
    { key: "code", label: "Código", render: (row) => row.code || "-" },
    {
      key: "is_active",
      label: "Estado",
      render: (row) => (row.is_active ? "Activa" : "Inactiva"),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <button
          className="master-catalogs__action"
          onClick={() => {
            setBrandForm({
              id: row.id,
              name: row.name || "",
              code: row.code || "",
              is_active: Boolean(row.is_active),
            });
            setOpenBrandModal(true);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  const modelColumns = [
    { key: "name", label: "Modelo", render: (row) => row.name || "-" },
    { key: "brand", label: "Marca", render: (row) => row.brand?.name || "-" },
    { key: "code", label: "Código", render: (row) => row.code || "-" },
    {
      key: "is_active",
      label: "Estado",
      render: (row) => (row.is_active ? "Activo" : "Inactivo"),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <button
          className="master-catalogs__action"
          onClick={() => {
            setModelForm({
              id: row.id,
              brand_id: row.brand_id || "",
              name: row.name || "",
              code: row.code || "",
              is_active: Boolean(row.is_active),
            });
            setOpenModelModal(true);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  const typeColumns = [
    { key: "name", label: "Tipo", render: (row) => row.name || "-" },
    { key: "code", label: "Código", render: (row) => row.code || "-" },
    { key: "description", label: "Descripción", render: (row) => row.description || "-" },
    {
      key: "is_active",
      label: "Estado",
      render: (row) => (row.is_active ? "Activo" : "Inactivo"),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row) => (
        <button
          className="master-catalogs__action"
          onClick={() => {
            setTypeForm({
              id: row.id,
              code: row.code || "",
              name: row.name || "",
              description: row.description || "",
              is_active: Boolean(row.is_active),
            });
            setOpenTypeModal(true);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  const settingColumns = [
    { key: "key", label: "Key", render: (row) => row.key || "-" },
    {
      key: "value",
      label: "Value",
      render: (row) => (row.value ? JSON.stringify(row.value) : "-"),
    },
    { key: "description", label: "Descripción", render: (row) => row.description || "-" },
    {
      key: "is_public",
      label: "Pública",
      render: (row) => (row.is_public ? "Sí" : "No"),
    },
  ];

  return (
    <div className="master-catalogs">
      <PageHeader
        title="Catálogos maestros"
        description="Administrá marcas, modelos, tipos de vehículo y configuraciones base."
      />

      <div className="master-catalogs__toolbar">
        <button onClick={() => setOpenBrandModal(true)}>Nueva marca</button>
        <button onClick={() => setOpenModelModal(true)}>Nuevo modelo</button>
        <button onClick={() => setOpenTypeModal(true)}>Nuevo tipo</button>
        <button onClick={() => setOpenSettingModal(true)}>Nueva configuración</button>
      </div>

      {error ? <StatelessMessage type="error">{error}</StatelessMessage> : null}
      {success ? <StatelessMessage type="success">{success}</StatelessMessage> : null}

      {loading ? (
        <StatelessMessage>Cargando catálogos...</StatelessMessage>
      ) : (
        <>
          <SimpleTable columns={brandColumns} rows={brands} emptyText="No hay marcas." />
          <SimpleTable columns={modelColumns} rows={models} emptyText="No hay modelos." />
          <SimpleTable columns={typeColumns} rows={types} emptyText="No hay tipos." />
          <SimpleTable columns={settingColumns} rows={settings} emptyText="No hay configuraciones." />
        </>
      )}

      <Modal
        open={openBrandModal}
        title={brandForm.id ? "Editar marca" : "Crear marca"}
        onClose={() => {
          setBrandForm(initialBrandForm);
          setOpenBrandModal(false);
        }}
      >
        <form className="master-catalogs__form" onSubmit={handleBrandSubmit}>
          <div className="master-catalogs__grid">
            <div className="master-catalogs__field">
              <label>Nombre</label>
              <input
                value={brandForm.name}
                onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="master-catalogs__field">
              <label>Código</label>
              <input
                value={brandForm.code}
                onChange={(e) => setBrandForm((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>

            <div className="master-catalogs__checkbox master-catalogs__field--full">
              <label>
                <input
                  type="checkbox"
                  checked={brandForm.is_active}
                  onChange={(e) => setBrandForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Activa
              </label>
            </div>
          </div>

          <div className="master-catalogs__actions">
            <button type="button" className="master-catalogs__secondary" onClick={() => setOpenBrandModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="master-catalogs__primary">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openModelModal}
        title={modelForm.id ? "Editar modelo" : "Crear modelo"}
        onClose={() => {
          setModelForm(initialModelForm);
          setOpenModelModal(false);
        }}
      >
        <form className="master-catalogs__form" onSubmit={handleModelSubmit}>
          <div className="master-catalogs__grid">
            <div className="master-catalogs__field">
              <label>Marca</label>
              <select
                value={modelForm.brand_id}
                onChange={(e) => setModelForm((prev) => ({ ...prev, brand_id: e.target.value }))}
                required
              >
                <option value="">Seleccionar</option>
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="master-catalogs__field">
              <label>Nombre</label>
              <input
                value={modelForm.name}
                onChange={(e) => setModelForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="master-catalogs__field">
              <label>Código</label>
              <input
                value={modelForm.code}
                onChange={(e) => setModelForm((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>

            <div className="master-catalogs__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={modelForm.is_active}
                  onChange={(e) => setModelForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Activo
              </label>
            </div>
          </div>

          <div className="master-catalogs__actions">
            <button type="button" className="master-catalogs__secondary" onClick={() => setOpenModelModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="master-catalogs__primary">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openTypeModal}
        title={typeForm.id ? "Editar tipo de vehículo" : "Crear tipo de vehículo"}
        onClose={() => {
          setTypeForm(initialTypeForm);
          setOpenTypeModal(false);
        }}
      >
        <form className="master-catalogs__form" onSubmit={handleTypeSubmit}>
          <div className="master-catalogs__grid">
            <div className="master-catalogs__field">
              <label>Código</label>
              <input
                value={typeForm.code}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>

            <div className="master-catalogs__field">
              <label>Nombre</label>
              <input
                value={typeForm.name}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="master-catalogs__field master-catalogs__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={typeForm.description}
                onChange={(e) => setTypeForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="master-catalogs__checkbox master-catalogs__field--full">
              <label>
                <input
                  type="checkbox"
                  checked={typeForm.is_active}
                  onChange={(e) => setTypeForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
                Activo
              </label>
            </div>
          </div>

          <div className="master-catalogs__actions">
            <button type="button" className="master-catalogs__secondary" onClick={() => setOpenTypeModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="master-catalogs__primary">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openSettingModal}
        title="Guardar configuración"
        onClose={() => {
          setSettingForm(initialSettingForm);
          setOpenSettingModal(false);
        }}
      >
        <form className="master-catalogs__form" onSubmit={handleSettingSubmit}>
          <div className="master-catalogs__grid">
            <div className="master-catalogs__field">
              <label>Key</label>
              <input
                value={settingForm.key}
                onChange={(e) => setSettingForm((prev) => ({ ...prev, key: e.target.value }))}
                required
              />
            </div>

            <div className="master-catalogs__field master-catalogs__field--full">
              <label>Value JSON</label>
              <textarea
                rows="4"
                value={settingForm.value}
                onChange={(e) => setSettingForm((prev) => ({ ...prev, value: e.target.value }))}
                placeholder='{"phone":"+54358..."}'
              />
            </div>

            <div className="master-catalogs__field master-catalogs__field--full">
              <label>Descripción</label>
              <input
                value={settingForm.description}
                onChange={(e) => setSettingForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="master-catalogs__checkbox master-catalogs__field--full">
              <label>
                <input
                  type="checkbox"
                  checked={settingForm.is_public}
                  onChange={(e) => setSettingForm((prev) => ({ ...prev, is_public: e.target.checked }))}
                />
                Pública
              </label>
            </div>
          </div>

          <div className="master-catalogs__actions">
            <button type="button" className="master-catalogs__secondary" onClick={() => setOpenSettingModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="master-catalogs__primary">
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MasterCatalogsPage;