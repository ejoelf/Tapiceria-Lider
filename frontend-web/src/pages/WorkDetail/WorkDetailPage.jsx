import { Link, useParams } from "react-router-dom";
import { featuredWorks } from "../../data/siteData";
import "./WorkDetailPage.css";

function WorkDetailPage() {
  const { slug } = useParams();
  const work = featuredWorks.find((item) => item.slug === slug);

  if (!work) {
    return (
      <div className="work-detail-page">
        <div className="container">
          <div className="work-detail-page__empty">
            <h1>Trabajo no encontrado</h1>
            <Link to="/trabajos">Volver a trabajos</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="work-detail-page">
      <section className="work-detail-page__hero">
        <div className="container">
          <div className="work-detail-page__hero-grid">
            <div className="work-detail-page__hero-copy">
              <span>{work.category}</span>
              <h1>{work.title}</h1>
              <p>{work.longDescription}</p>

              <div className="work-detail-page__tags">
                {work.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="work-detail-page__hero-image">
              <img src={work.image} alt={work.title} />
            </div>
          </div>
        </div>
      </section>

      <section className="work-detail-page__section">
        <div className="container">
          <div className="work-detail-page__highlights">
            {work.highlights.map((item) => (
              <article key={item}>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="work-detail-page__section">
        <div className="container">
          <div className="work-detail-page__gallery">
            {work.gallery.map((image, index) => (
              <img key={`${work.slug}-${index}`} src={image} alt={`${work.title} ${index + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="work-detail-page__section">
        <div className="container">
          <div className="work-detail-page__cta">
            <div>
              <span>¿Querés algo así?</span>
              <h2>Podemos ayudarte a lograr un resultado premium en tu vehículo</h2>
            </div>

            <div className="work-detail-page__cta-actions">
              <Link to="/contacto">Contactar</Link>
              <Link to="/trabajos">Volver a trabajos</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WorkDetailPage;