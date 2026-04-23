import SectionHeading from "../../components/common/SectionHeading";
import { serviceList } from "../../data/siteData";
import "./ServicesPage.css";

function ServicesPage() {
  return (
    <div className="services-page page-shell">
      <SectionHeading
        eyebrow="Servicios"
        title="Todo lo que hacemos dentro del universo de la tapicería vehicular"
        description="La idea es mostrar con claridad la amplitud del servicio y el nivel de especialización del taller."
      />

      <section className="services-page__grid">
        {serviceList.map((service) => (
          <article key={service.title} className="services-page__card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default ServicesPage;