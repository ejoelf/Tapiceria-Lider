import SectionHeading from "../../components/common/SectionHeading";
import { featuredWorks } from "../../data/siteData";
import "./WorksPage.css";

function WorksPage() {
  return (
    <div className="works-page page-shell">
      <SectionHeading
        eyebrow="Trabajos"
        title="Una muestra del nivel de detalle que buscamos"
        description="Más adelante esta sección va a conectarse al portfolio real cargado desde el admin."
      />

      <section className="works-page__filters">
        <button>Todos</button>
        <button>Volantes</button>
        <button>Butacas</button>
        <button>Paneles</button>
      </section>

      <section className="works-page__grid">
        {featuredWorks.map((work) => (
          <article key={work.id} className="works-page__card">
            <img src={work.image} alt={work.title} />
            <div className="works-page__body">
              <span>{work.category}</span>
              <h3>{work.title}</h3>
              <p>{work.description}</p>
              <button>Ver detalle</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default WorksPage;