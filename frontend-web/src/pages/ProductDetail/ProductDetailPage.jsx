import { Link, useParams } from "react-router-dom";
import { productsCatalog } from "../../data/siteData";
import "./ProductDetailPage.css";

function ProductDetailPage() {
  const { slug } = useParams();
  const product = productsCatalog.find((item) => item.slug === slug);
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "543584000000";

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-detail-page__empty">
            <h1>Producto no encontrado</h1>
            <Link to="/productos">Volver a productos</Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hola, quiero consultar por el producto: ${product.name}`
  );

  return (
    <div className="product-detail-page">
      <section className="product-detail-page__hero">
        <div className="container">
          <div className="product-detail-page__grid">
            <div className="product-detail-page__image">
              <div className="product-detail-page__placeholder">
                <span>{product.badge}</span>
                <strong>{product.category}</strong>
              </div>
            </div>

            <div className="product-detail-page__copy">
              <small>{product.category}</small>
              <h1>{product.name}</h1>
              <p>{product.longDescription}</p>
              <strong>{product.price}</strong>

              <div className="product-detail-page__actions">
                <button type="button">Agregar al carrito</button>
                <a
                  href={`https://wa.me/${phone}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-detail-page__section">
        <div className="container">
          <div className="product-detail-page__features">
            {product.features.map((feature) => (
              <article key={feature}>
                <strong>{feature}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="product-detail-page__section">
        <div className="container">
          <div className="product-detail-page__cta">
            <div>
              <span>Venta directa</span>
              <h2>La base ya está lista para evolucionar a e-commerce real</h2>
            </div>

            <div className="product-detail-page__cta-actions">
              <Link to="/productos">Volver a productos</Link>
              <Link to="/contacto">Ir a contacto</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;