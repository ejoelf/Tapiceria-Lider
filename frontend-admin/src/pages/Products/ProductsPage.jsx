import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import SearchBar from "../../components/ui/SearchBar";
import SectionCard from "../../components/ui/SectionCard";
import SimpleTable from "../../components/ui/SimpleTable";
import StatelessMessage from "../../components/ui/StatelessMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  createProductCategoryRequest,
  createProductRequest,
  getProductCategoriesRequest,
  getProductsRequest,
} from "../../services/productsService";
import "./ProductsPage.css";

const initialCategoryForm = {
  name: "",
  description: "",
};

const initialProductForm = {
  category_id: "",
  branch_id: 1,
  code: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  status: "available",
  image_url: "",
  is_featured: false,
  is_visible_public: true,
};

function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [productForm, setProductForm] = useState(initialProductForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [categoriesResponse, productsResponse] = await Promise.all([
        getProductCategoriesRequest(),
        getProductsRequest(),
      ]);

      setCategories(categoriesResponse?.data || []);
      setProducts(productsResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [
        product.code,
        product.name,
        product.category?.name,
        product.status,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [products, search]);

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createProductCategoryRequest(categoryForm);
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

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createProductRequest({
        ...productForm,
        category_id: productForm.category_id ? Number(productForm.category_id) : null,
        branch_id: productForm.branch_id ? Number(productForm.branch_id) : null,
        price: productForm.price ? Number(productForm.price) : 0,
        stock: productForm.stock ? Number(productForm.stock) : 0,
        is_featured: Boolean(productForm.is_featured),
        is_visible_public: Boolean(productForm.is_visible_public),
      });

      setSuccess("Producto creado correctamente.");
      setProductForm(initialProductForm);
      setOpenProductModal(false);
      await loadData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo crear el producto."
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
      key: "name",
      label: "Producto",
      render: (row) => row.name || "-",
    },
    {
      key: "category",
      label: "Categoría",
      render: (row) => row.category?.name || "-",
    },
    {
      key: "price",
      label: "Precio",
      render: (row) => `$${Number(row.price || 0).toLocaleString("es-AR")}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) =>
        Number(row.stock || 0) > 0 ? (
          <StatusBadge variant="success">{row.stock ?? 0}</StatusBadge>
        ) : (
          <StatusBadge variant="danger">{row.stock ?? 0}</StatusBadge>
        ),
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => <StatusBadge>{row.status || "-"}</StatusBadge>,
    },
  ];

  return (
    <div className="products-page">
      <PageHeader
        title="Productos"
        description="Administrá el catálogo de productos del negocio."
        actionLabel="Nuevo producto"
        onAction={() => setOpenProductModal(true)}
      />

      <SectionCard
        title="Listado de productos"
        actions={
          <div className="products-page__toolbar">
            <button onClick={() => setOpenCategoryModal(true)}>Nueva categoría</button>
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
            />
          </div>
        }
      >
        {error ? <div className="products-page__messages"><StatelessMessage type="error">{error}</StatelessMessage></div> : null}
        {success ? <div className="products-page__messages"><StatelessMessage type="success">{success}</StatelessMessage></div> : null}

        {loading ? (
          <div className="products-page__messages">
            <StatelessMessage>Cargando productos...</StatelessMessage>
          </div>
        ) : (
          <SimpleTable
            columns={columns}
            rows={filteredProducts}
            emptyText="Todavía no hay productos cargados."
          />
        )}
      </SectionCard>

      <Modal
        open={openCategoryModal}
        title="Crear categoría"
        onClose={() => setOpenCategoryModal(false)}
      >
        <form className="products-form" onSubmit={handleCategorySubmit}>
          <div className="products-form__grid">
            <div className="products-form__field">
              <label>Nombre</label>
              <input
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="products-form__field products-form__field--full">
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

          <div className="products-form__actions">
            <button
              type="button"
              className="products-form__secondary"
              onClick={() => setOpenCategoryModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="products-form__primary">
              Guardar categoría
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={openProductModal}
        title="Crear producto"
        onClose={() => setOpenProductModal(false)}
      >
        <form className="products-form" onSubmit={handleProductSubmit}>
          <div className="products-form__grid">
            <div className="products-form__field">
              <label>Categoría</label>
              <select
                value={productForm.category_id}
                onChange={(e) =>
                  setProductForm((prev) => ({
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

            <div className="products-form__field">
              <label>Sucursal</label>
              <input
                value={productForm.branch_id}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    branch_id: e.target.value,
                  }))
                }
              />
            </div>

            <div className="products-form__field">
              <label>Código</label>
              <input
                value={productForm.code}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>

            <div className="products-form__field">
              <label>Nombre</label>
              <input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="products-form__field">
              <label>Precio</label>
              <input
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            <div className="products-form__field">
              <label>Stock</label>
              <input
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
            </div>

            <div className="products-form__field">
              <label>Estado</label>
              <input
                value={productForm.status}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, status: e.target.value }))
                }
              />
            </div>

            <div className="products-form__field">
              <label>Imagen URL</label>
              <input
                value={productForm.image_url}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
              />
            </div>

            <div className="products-form__field products-form__field--full">
              <label>Descripción</label>
              <textarea
                rows="3"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="products-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={productForm.is_featured}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                />
                Destacado
              </label>
            </div>

            <div className="products-form__checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={productForm.is_visible_public}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      is_visible_public: e.target.checked,
                    }))
                  }
                />
                Visible públicamente
              </label>
            </div>
          </div>

          <div className="products-form__actions">
            <button
              type="button"
              className="products-form__secondary"
              onClick={() => setOpenProductModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="products-form__primary">
              Guardar producto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductsPage;