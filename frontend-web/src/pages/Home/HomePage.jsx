import { Link } from "react-router-dom";
import SectionHeading from "../../components/common/SectionHeading";
import {
  companyInfo,
  featuredWorks,
  heroStats,
  productHighlights,
  serviceList,
} from "../../data/siteData";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-hero__eyebrow">Tapicería vehicular de alto nivel</span>
          <h1>{companyInfo.name}</h1>
          <p>
            Especialistas en tapizados para autos, motos, camionetas, camiones,
            barcos, veleros, avionetas y todo vehículo que merezca una terminación
            profesional y personalizada.
          </p>

          <div className="home-hero__actions">
            <Link to="/contacto" className="home-hero__primary">
              Pedir presupuesto
            </Link>
            <Link to="/trabajos" className="home-hero__secondary">
              Ver trabajos
            </Link>
          </div>
        </div>

        <div className="home-hero__panel">
          {heroStats.map((item) => (
            <article key={item.label} className="home-hero__stat">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <SectionHeading
          eyebrow="Servicios"
          title="Soluciones completas para interiores vehiculares"
          description="Trabajamos tanto para particulares como para concesionarias, con foco en calidad, detalle y presentación final."
        />

        <div className="home-services-grid">
          {serviceList.slice(0, 6).map((service) => (
            <article key={service.title} className="home-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <SectionHeading
          eyebrow="Trabajos destacados"
          title="Resultados que hablan por el taller"
          description="Una selección visual para mostrar la calidad, la prolijidad y el enfoque profesional de Tapicería Líder."
        />

        <div className="home-works-grid">
          {featuredWorks.map((work) => (
            <article key={work.id} className="home-work-card">
              <img src={work.image} alt={work.title} />
              <div className="home-work-card__body">
                <span>{work.category}</span>
                <h3>{work.title}</h3>
                <p>{work.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <SectionHeading
          eyebrow="Productos"
          title="También contamos con productos disponibles"
          description="Más adelante esta sección va a conectarse al panel admin para mostrar el catálogo real del negocio."
        />

        <div className="home-products-grid">
          {productHighlights.map((product) => (
            <article key={product.id} className="home-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>{product.price}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta__content">
          <h2>¿Querés renovar o personalizar el interior de tu vehículo?</h2>
          <p>
            Contactanos y te ayudamos a definir la mejor solución según el tipo
            de unidad, el trabajo a realizar y el resultado que buscás.
          </p>
          <Link to="/contacto" className="home-hero__primary">
            Ir a contacto
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;