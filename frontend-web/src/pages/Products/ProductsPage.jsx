import SectionHeading from "../../components/common/SectionHeading";
import { productHighlights } from "../../data/siteData";
import "./ProductsPage.css";

function ProductsPage() {
  return (
    <div className="products-public-page page-shell">
      <SectionHeading
        eyebrow="Productos"
        title="Productos disponibles para compra o consulta"
        description="Esta sección está pensada para mostrar productos del local sin convertir la web en un e-commerce."
      />

      <section className="products-public-page__grid">
        {productHighlights.map((product) => (
          <article key={product.id} className="products-public-page__card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>{product.price}</strong>
            <button>Consultar por WhatsApp</button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ProductsPage;