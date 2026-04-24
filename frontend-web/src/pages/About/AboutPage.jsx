import SectionHeading from "../../components/common/SectionHeading";
import { aboutHighlights, processSteps } from "../../data/siteData";
import "./AboutPage.css";

function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-page__hero">
        <div className="container">
          <div className="about-page__hero-box">
            <span>Nosotros</span>
            <h1>Una empresa pensada para elevar el estándar del rubro</h1>
            <p>
              Tapicería Líder nace con una visión clara: convertirse en una
              referencia nacional dentro del mundo de la tapicería vehicular,
              combinando oficio, detalle, estética, servicio y estructura.
            </p>
          </div>
        </div>
      </section>

      <section className="about-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Identidad de marca"
            title="No buscamos ser una tapicería más"
            description="La propuesta está armada desde el inicio con mentalidad grande: una marca ordenada, visualmente fuerte y preparada para crecer."
          />

          <div className="about-page__highlights">
            {aboutHighlights.map((item) => (
              <article key={item.title} className="about-page__card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Cómo trabajamos"
            title="Una forma de hacer las cosas que mezcla oficio y visión empresarial"
            description="Queremos que cada trabajo se vea bien, se sienta bien y hable bien de la marca."
          />

          <div className="about-page__process">
            {processSteps.map((step) => (
              <article key={step.number} className="about-page__step">
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section">
        <div className="container">
          <div className="about-page__manifesto">
            <div>
              <span>Visión</span>
              <h2>Construir una marca líder en Argentina</h2>
            </div>

            <p>
              El objetivo no es solo hacer buenos tapizados. El objetivo es
              construir una empresa sólida, profesional y memorable, con una
              imagen que transmita autoridad y un servicio que esté a la altura
              de esa promesa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;