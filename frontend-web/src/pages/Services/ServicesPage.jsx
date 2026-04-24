import SectionHeading from "../../components/common/SectionHeading";
import { coverageOptions, serviceCategories } from "../../data/siteData";
import "./ServicesPage.css";

function ServicesPage() {
  return (
    <div className="services-page">
      <section className="services-page__hero">
        <div className="container">
          <div className="services-page__hero-box">
            <span>Servicios</span>
            <h1>Todo lo que hacemos dentro del universo de la tapicería vehicular</h1>
            <p>
              La estructura de servicios de Tapicería Líder está pensada para
              comunicar amplitud, especialización y capacidad operativa.
            </p>
          </div>
        </div>
      </section>

      <section className="services-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Líneas principales"
            title="Servicios con foco claro y valor comercial fuerte"
            description="Estas son las líneas que definen la propuesta de Tapicería Líder."
          />

          <div className="services-page__grid">
            {serviceCategories.map((service) => (
              <article key={service.title} className="services-page__card">
                <span className="services-page__card-kicker">{service.subtitle}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <ul>
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Modalidades"
            title="Atención pensada para adaptarse al trabajo"
            description="No todos los servicios se resuelven igual. Por eso la web también tiene que comunicar flexibilidad."
          />

          <div className="services-page__coverage">
            {coverageOptions.map((item) => (
              <article key={item.title} className="services-page__coverage-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-page__section">
        <div className="container">
          <div className="services-page__cta">
            <div>
              <span>Próximo paso</span>
              <h2>
                Más adelante estos bloques se podrán editar desde Ajustes del admin
              </h2>
            </div>

            <p>
              La idea es que cada sección de la web pueda activarse, desactivarse
              o modificarse sin tocar el código.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;