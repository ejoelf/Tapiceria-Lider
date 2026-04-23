import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  createInventoryMovementRequest,
  createMaterialCategoryRequest,
  createMaterialRequest,
  getInventoryMovementsRequest,
  getMaterialCategoriesRequest,
  getMaterialsRequest,
} from "../../services/materialsService";
import "./MaterialsPage.css";

const initialCategoryForm = {
  name: "",
  description: "",
};

const initialMaterialForm = {
  category_id: "",
  branch_id: 1,
  code: "",
  name: "",
  description: "",
  unit: "unit",
  color: "",
  stock_current: "",
  stock_minimum: "",
  cost_reference: "",
  storage_location: "",
  notes: "",
};

const initialMovementForm = {
  material_id: "",
  work_order_id: "",
  movement_type: "in",
  quantity: "",
  unit_cost: "",
  note: "",
};

function MaterialsPage() {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMaterials, setSearchMaterials] = useState("");
  const [searchMovements, setSearchMovements] = useState("");

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openMaterialModal, setOpenMaterialModal] = useState(false);
  const [openMovementModal, setOpenMovementModal] = useState(false);

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [materialForm, setMaterialForm] = useState(initialMaterialForm);
  const [movementForm, setMovementForm] = useState(initialMovementForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [categoriesResponse, materialsResponse, movementsResponse] =
        await Promise.all([
          getMaterialCategoriesRequest(),
          getMaterialsRequest(),
          getInventoryMovementsRequest(),
        ]);

      setCategories(categoriesResponse?.data || []);
      setMaterials(materialsResponse?.data || []);
      setMovements(movementsResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los materiales."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredMaterials = useMemo(() => {
    const term = searchMaterials.trim().toLowerCase();
    if (!term) return materials;

    return materials.filter((item) =>
      [
        item.code,
        item.name,
        item.category?.name,
        item.unit,
        item.color,
        item.storage_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [materials, searchMaterials]);

  const filteredMovements = useMemo(() => {
    const term = searchMovements.trim().toLowerCase();
    if (!term) return movements;

    return movements.filter((item) =>
      [
        item.material?.name,
        item.movement_type,
        item.note,
        item.work_order?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [movements, searchMovements]);

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createMaterialCategoryRequest(categoryForm);
      setSuccess("Categoría creada correctamente.");
      setCategoryForm(initialCategoryForm);
      setOpenCategoryModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear la categoría."
      );
    }
  };

  const handleMaterialSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createMaterialRequest({
        ...materialForm,
        category_id: materialForm.category_id ? Number(materialForm.category_id) : null,
        branch_id: materialForm.branch_id ? Number(materialForm.branch_id) : null,
        stock_current: materialForm.stock_current ? Number(materialForm.stock_current) : 0,
        stock_minimum: materialForm.stock_minimum ? Number(materialForm.stock_minimum) : 0,
        cost_reference: materialForm.cost_reference ? Number(materialForm.cost_reference) : 0,
      });

      setSuccess("Material creado correctamente.");
      setMaterialForm(initialMaterialForm);
      setOpenMaterialModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el material."
      );
    }
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createInventoryMovementRequest({
        material_id: Number(movementForm.material_id),
        work_order_id: movementForm.work_order_id
          ? Number(movementForm.work_order_id)
          : null,
        movement_type: movementForm.movement_type,
        quantity: Number(movementForm.quantity),
        unit_cost: movementForm.unit_cost ? Number(movementForm.unit_cost) : 0,
        note: movementForm.note,
      });

      setSuccess("Movimiento registrado correctamente.");
      setMovementForm(initialMovementForm);
      setOpenMovementModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo registrar el movimiento."
      );
    }
  };

  const materialColumns = [
    {
      key: "code",
      label: "Código",
      render: (row) => row.code || "-",
    },
    {
      key: "name",
      label: "Material",
      render: (row) => row.name || "-",
    },
    {
      key: "category",
      label: "Categoría",
      render: (row) => row.category?.name || "-",
    },
    {
      key: "unit",
      label: "Unidad",
      render: (row) => row.unit || "-",
    },
    {
      key: "stock_current",
      label: "Stock actual",
      render: (row) => {
        const current = Number(row.stock_current || 0);
        const minimum = Number(row.stock_minimum || 0);

        return current <= minimum ? (
          <StatusBadge variant="danger">{current}</StatusBadge>
        ) : (
          <StatusBadge variant="success">{current}</StatusBadge>
        );
      },
    },
    {
      key: "stock_minimum",
      label: "Stock mínimo",
      render: (row) => row.stock_minimum || "0",
    },
  ];

  const movementColumns = [
    {
      key: "material",
      label: "Material",
      render: (row) => row.material?.name || "-",
    },
    {
      key: "movement_type",
      label: "Tipo",
      render: (row) => {
        const labels = {
          in: "Ingreso",
          out: "Egreso",
          adjustment: "Ajuste",
        };
        const variants = {
          in: "success",
          out: "danger",
          adjustment: "warning",
        };

        return (
          <StatusBadge variant={variants[row.movement_type] || "default"}>
            {labels[row.movement_type] || row.movement_type || "-"}
          </StatusBadge>
        );
      },
    },
    {
      key: "quantity",
      label: "Cantidad",
      render: (row) => row.quantity || "0",
    },
    {
      key: "unit_cost",
      label: "Costo unitario",
      render: (row) => row.unit_cost || "0",
    },
    {
      key: "note",
      label: "Nota",
      render: (row) => row.note || "-",
    },
  ];

  return (
    <div className="materials-page">
      <PageHeader
        title="Materiales"
        description="Administrá categorías, materiales y movimientos de inventario."
        actionLabel="Nuevo material"
        onAction={() => setOpenMaterialModal(true)}
      />

      <SectionCard
        title="Materiales"
        actions={
          <div className="materials-page__toolbar">
            <button onClick={() => setOpenCategoryModal(true)}>Nueva categoría</button>
            <SearchBar
              value={searchMaterials}
              onChange={(e) => setSearchMaterials(e.target.value)}
              placeholder="Buscar materiales..."
            />
          </div>
        }
      >
        {error ? <div className="materials-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="materials-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="materials-page__messages">
            <StatelessMessage>Cargando materiales...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={materialColumns}
            rows={filteredMaterials}
            emptyText="Todavía no hay materiales cargados."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Movimientos de inventario"
        actions={
          <div className="materials-page__toolbar">
            <button onClick={() => setOpenMovementModal(true)}>Nuevo movimiento</button>
            <SearchBar
              value={searchMovements}
              onChange={(e) => setSearchMovements(e.target.value)}
              placeholder="Buscar movimientos..."
            />
          </div>
        }
      >
        {loading ? (
          <div className="materials-page__messages">
            <StatelessMessage>Cargando movimientos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={movementColumns}
            rows={filteredMovements}
            emptyText="Todavía no hay movimientos cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openCategoryModal}
        title="Crear categoría"
        onClose={() => setOpenCategoryModal(false)}
      >
        <form className="materials-form" onSubmit={handleCategorySubmit}>
          <div className="materials-form__grid">
            <div className="materials-form__field">
              <label>Nombre</label>
              <input
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="materials-form__field materials-form__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="materials-form__actions">
            <button
              type="button"
              className="materials-form__secondary"
              onClick={() => setOpenCategoryModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="materials-form__primary">
              Guardar categoría
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openMaterialModal}
        title="Crear material"
        onClose={() => setOpenMaterialModal(false)}
      >
        <form className="materials-form" onSubmit={handleMaterialSubmit}>
          <div className="materials-form__grid">
            <div className="materials-form__field">
              <label>Categoría</label>
              <select
                value={materialForm.category_id}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
              >
                <option value="">Seleccionar</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="materials-form__field">
              <label>Sucursal</label>
              <input
                value={materialForm.branch_id}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    branch_id: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Código</label>
              <input
                value={materialForm.code}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>

            <div className="materials-form__field">
              <label>Nombre</label>
              <input
                value={materialForm.name}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="materials-form__field">
              <label>Unidad</label>
              <input
                value={materialForm.unit}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, unit: e.target.value }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Color</label>
              <input
                value={materialForm.color}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, color: e.target.value }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Stock actual</label>
              <input
                value={materialForm.stock_current}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    stock_current: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Stock mínimo</label>
              <input
                value={materialForm.stock_minimum}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    stock_minimum: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Costo referencia</label>
              <input
                value={materialForm.cost_reference}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    cost_reference: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>Ubicación</label>
              <input
                value={materialForm.storage_location}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    storage_location: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field materials-form__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={materialForm.description}
                onChange={(e) =>
                  setMaterialForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field materials-form__field--full">
              <label>Notas</label>
              <textarea
                rows="3"
                value={materialForm.notes}
                onChange={(e) =>
                  setMaterialForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="materials-form__actions">
            <button
              type="button"
              className="materials-form__secondary"
              onClick={() => setOpenMaterialModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="materials-form__primary">
              Guardar material
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openMovementModal}
        title="Registrar movimiento"
        onClose={() => setOpenMovementModal(false)}
      >
        <form className="materials-form" onSubmit={handleMovementSubmit}>
          <div className="materials-form__grid">
            <div className="materials-form__field">
              <label>Material</label>
              <select
                value={movementForm.material_id}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    material_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">Seleccionar</option>
                {materials.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="materials-form__field">
              <label>Tipo</label>
              <select
                value={movementForm.movement_type}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    movement_type: e.target.value,
                  }))
                }
              >
                <option value="in">Ingreso</option>
                <option value="out">Egreso</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>

            <div className="materials-form__field">
              <label>Cantidad</label>
              <input
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="materials-form__field">
              <label>Costo unitario</label>
              <input
                value={movementForm.unit_cost}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    unit_cost: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field">
              <label>ID orden (opcional)</label>
              <input
                value={movementForm.work_order_id}
                onChange={(e) =>
                  setMovementForm((prev) => ({
                    ...prev,
                    work_order_id: e.target.value,
                  }))
                }
              />
            </div>

            <div className="materials-form__field materials-form__field--full">
              <label>Nota</label>
              <textarea
                rows="3"
                value={movementForm.note}
                onChange={(e) =>
                  setMovementForm((prev) => ({ ...prev, note: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="materials-form__actions">
            <button
              type="button"
              className="materials-form__secondary"
              onClick={() => setOpenMovementModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="materials-form__primary">
              Guardar movimiento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MaterialsPage;