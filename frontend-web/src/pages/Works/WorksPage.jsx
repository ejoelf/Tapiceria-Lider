import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "../../components/common/SectionHeading";
import { featuredWorks } from "../../data/siteData";
import "./WorksPage.css";

function WorksPage() {
  const categories = useMemo(() => {
    const unique = [...new Set(featuredWorks.map((item) => item.category))];
    return ["Todos", ...unique];
  }, []);

  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredWorks = useMemo(() => {
    if (activeCategory === "Todos") return featuredWorks;
    return featuredWorks.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="works-page">
      <section className="works-page__hero">
        <div className="container">
          <div className="works-page__hero-box">
            <span>Trabajos</span>
            <h1>El portfolio tiene que sostener la promesa de marca</h1>
            <p>
              Acá vamos a mostrar los trabajos realizados con una lógica mucho
              más profesional, visual y comercial.
            </p>
          </div>
        </div>
      </section>

      <section className="works-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Portfolio"
            title="Trabajos organizados por categoría"
            description="Ahora ya dejamos la estructura lista para tener detalle individual de cada trabajo."
          />

          <div className="works-page__filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "works-page__filter works-page__filter--active"
                    : "works-page__filter"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="works-page__grid">
            {filteredWorks.map((work) => (
              <article key={work.id} className="works-page__card">
                <img src={work.image} alt={work.title} />

                <div className="works-page__body">
                  <span className="works-page__category">{work.category}</span>
                  <h3>{work.title}</h3>
                  <p>{work.description}</p>

                  <div className="works-page__tags">
                    {work.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <Link to={`/trabajos/${work.slug}`} className="works-page__link">
                    Ver detalle del trabajo
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

export default WorksPage;