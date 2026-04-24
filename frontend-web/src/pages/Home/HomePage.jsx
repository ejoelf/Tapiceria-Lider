import { Link } from "react-router-dom";
import SectionHeading from "../../components/common/SectionHeading";
import {
  corePillars,
  courseList,
  featuredWorks,
  heroHighlights,
  productsCatalog,
  whyChooseUs,
} from "../../data/siteData";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import "./HomePage.css";

function HomePage() {
  const { companyInfo, siteSections } = useSiteSettings();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__content">
            <span className="home-hero__eyebrow">
              Especialistas en tapicería vehicular premium
            </span>

            <h1>{companyInfo.name}</h1>

            <p className="home-hero__lead">
              {companyInfo.shortDescription}
            </p>

            <div className="home-hero__actions">
              <Link to="/contacto" className="home-button home-button--primary">
                Solicitar presupuesto
              </Link>
              <Link to="/trabajos" className="home-button home-button--secondary">
                Ver trabajos
              </Link>
            </div>

            <div className="home-hero__badges">
              {heroHighlights.map((item) => (
                <article key={item.label} className="home-hero__badge">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-hero__visual-card">
              <span className="home-hero__visual-kicker">
                Línea principal del negocio
              </span>
              <h3>Tapizado especializado de volantes</h3>
              <p>
                Precisión, presencia, sensación de manejo y terminación premium.
              </p>

              <div className="home-hero__visual-tags">
                <span>Volantes</span>
                <span>Interior premium</span>
                <span>Personalización</span>
              </div>
            </div>

            <div className="home-hero__mini-grid">
              <article>
                <strong>Local</strong>
                <span>Atención en taller</span>
              </article>
              <article>
                <strong>Domicilio</strong>
                <span>Servicios puntuales</span>
              </article>
              <article>
                <strong>Productos</strong>
                <span>Venta desde la web</span>
              </article>
              <article>
                <strong>Cursos</strong>
                <span>Formación profesional</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      {siteSections.homeServices ? (
        <section className="home-section">
          <div className="container">
            <SectionHeading
              eyebrow="Estructura comercial"
              title="Una marca pensada como un ecosistema completo"
              description="Tapicería Líder no vende una sola cosa: construye una propuesta fuerte, profesional y escalable para el mundo vehicular."
            />

            <div className="home-pillars">
              {corePillars.map((pillar) => (
                <article key={pillar.title} className="home-pillar">
                  <span className="home-pillar__kicker">{pillar.kicker}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                  <Link to={pillar.path}>Explorar</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {siteSections.homeWhyUs ? (
        <section className="home-section">
          <div className="container">
            <SectionHeading
              eyebrow="Por qué elegirnos"
              title="Una propuesta que apunta a ser la mejor del país"
              description="La web tiene que transmitir exactamente eso: especialización, imagen premium, atención flexible y ambición de liderazgo."
            />

            <div className="home-advantages">
              {whyChooseUs.map((item) => (
                <article key={item.title} className="home-advantage">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {siteSections.homeWorks ? (
        <section className="home-section">
          <div className="container">
            <SectionHeading
              eyebrow="Trabajos"
              title="Resultados que fortalecen la marca"
              description="Cada trabajo tiene que verse como un caso premium. Esta sección después se conectará al portfolio real cargado desde el panel."
            />

            <div className="home-showcase">
              {featuredWorks.slice(0, 3).map((work) => (
                <article key={work.id} className="home-showcase__card">
                  <img src={work.image} alt={work.title} />
                  <div className="home-showcase__body">
                    <span>{work.category}</span>
                    <h3>{work.title}</h3>
                    <p>{work.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="home-section__cta">
              <Link to="/trabajos" className="home-button home-button--dark">
                Ver todos los trabajos
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {siteSections.homeProducts ? (
        <section className="home-section">
          <div className="container">
            <SectionHeading
              eyebrow="Productos"
              title="La web también está pensada para vender"
              description="Más adelante esta sección se va a conectar al e-commerce, pero ya dejamos la base visual y comercial preparada."
            />

            <div className="home-products">
              {productsCatalog.slice(0, 4).map((product) => (
                <article key={product.id} className="home-product">
                  <span className="home-product__badge">{product.badge}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <strong>{product.price}</strong>
                </article>
              ))}
            </div>

            <div className="home-section__cta">
              <Link to="/productos" className="home-button home-button--dark">
                Ir a productos
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {siteSections.homeCourses ? (
        <section className="home-section">
          <div className="container">
            <SectionHeading
              eyebrow="Cursos"
              title="Una marca que también enseña"
              description="Capacitación en tapicería vehicular y limpieza de tapizados para ampliar la propuesta comercial y posicionar la autoridad de la marca."
            />

            <div className="home-courses">
              {courseList.map((course) => (
                <article key={course.id} className="home-course">
                  <div className="home-course__meta">
                    <span>{course.level}</span>
                    <span>{course.mode}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <small>{course.duration}</small>
                </article>
              ))}
            </div>

            <div className="home-section__cta">
              <Link to="/cursos" className="home-button home-button--dark">
                Ver cursos
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="home-final-cta">
        <div className="container">
          <div className="home-final-cta__box">
            <div>
              <span className="home-final-cta__eyebrow">
                Tapicería vehicular premium
              </span>
              <h2>
                Si queremos construir la mejor tapicería del país, la experiencia
                digital tiene que estar a la altura.
              </h2>
              <p>
                Este es el inicio de una web preparada para vender, mostrar,
                enseñar y escalar la marca.
              </p>
            </div>

            <div className="home-final-cta__actions">
              <Link to="/contacto" className="home-button home-button--primary">
                Contactar ahora
              </Link>
              <Link to="/servicios" className="home-button home-button--secondary-dark">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;