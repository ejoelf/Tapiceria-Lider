import SectionHeading from "../../components/common/SectionHeading";
import { aboutBlocks } from "../../data/siteData";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page page-shell">
      <SectionHeading
        eyebrow="Nosotros"
        title="Una marca pensada para liderar"
        description="Tapicería Líder nace con una visión clara: construir una empresa referente en tapicería vehicular en Argentina."
      />

      <section className="about-page__grid">
        {aboutBlocks.map((block) => (
          <article key={block.title} className="about-page__card">
            <h3>{block.title}</h3>
            <p>{block.text}</p>
          </article>
        ))}
      </section>

      <section className="about-page__story">
        <div>
          <h3>Cómo entendemos el negocio</h3>
          <p>
            No se trata solo de tapizar. Se trata de elevar la percepción del
            vehículo, mejorar la experiencia interior y entregar un trabajo que
            se note apenas alguien abre una puerta o toca un volante.
          </p>
        </div>

        <div>
          <h3>A quién apuntamos</h3>
          <p>
            Trabajamos con clientes particulares que buscan exclusividad y
            también con concesionarias que necesitan una presentación más fuerte
            de sus unidades.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;