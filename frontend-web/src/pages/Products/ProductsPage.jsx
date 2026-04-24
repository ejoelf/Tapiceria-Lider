import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "../../components/common/SectionHeading";
import { productsCatalog } from "../../data/siteData";
import "./ProductsPage.css";

function ProductsPage() {
  const categories = useMemo(() => {
    const unique = [...new Set(productsCatalog.map((item) => item.category))];
    return ["Todos", ...unique];
  }, []);

  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return productsCatalog;
    return productsCatalog.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "543584000000";

  function buildWhatsAppLink(productName) {
    const message = encodeURIComponent(
      `Hola, quiero consultar por el producto: ${productName}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  return (
    <div className="products-page">
      <section className="products-page__hero">
        <div className="container">
          <div className="products-page__hero-box">
            <span>Productos</span>
            <h1>La web también está preparada para funcionar como canal de venta</h1>
            <p>
              Acá dejamos la base premium para la futura tienda online: catálogo
              visual, filtros, precios, CTA de compra y consulta por WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="products-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Tienda"
            title="Productos del negocio organizados por categoría"
            description="Ahora también dejamos preparado el detalle individual de cada producto."
          />

          <div className="products-page__filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "products-page__filter products-page__filter--active"
                    : "products-page__filter"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="products-page__grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="products-page__card">
                <span className="products-page__badge">{product.badge}</span>
                <small className="products-page__category">{product.category}</small>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <strong>{product.price}</strong>

                <div className="products-page__actions">
                  <button type="button">Agregar al carrito</button>
                  <a
                    href={buildWhatsAppLink(product.name)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Consultar por WhatsApp
                  </a>
                  <Link to={`/productos/${product.slug}`} className="products-page__detail-link">
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;