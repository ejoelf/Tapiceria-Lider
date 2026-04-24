import SectionHeading from "../../components/common/SectionHeading";
import { contactCards } from "../../data/siteData";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import "./ContactPage.css";

function ContactPage() {
  const { companyInfo } = useSiteSettings();

  const mapUrl =
    import.meta.env.VITE_GOOGLE_MAPS_EMBED ||
    "https://www.google.com/maps?q=Rio%20Cuarto%20Cordoba&output=embed";

  return (
    <div className="contact-page">
      <section className="contact-page__hero">
        <div className="container">
          <div className="contact-page__hero-box">
            <span>Contacto</span>
            <h1>Hablemos del próximo trabajo, producto o servicio</h1>
            <p>
              Esta sección está pensada para ser un punto fuerte de conversión:
              contacto, mapa, redes, WhatsApp y formulario.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-page__section">
        <div className="container">
          <SectionHeading
            eyebrow="Canales"
            title="Una sección de contacto pensada para convertir"
            description="Más adelante este formulario se conectará con el backend y el panel admin."
          />

          <div className="contact-page__grid">
            <div className="contact-page__form-card">
              <h3>Solicitar contacto</h3>

              <form className="contact-page__form">
                <div className="contact-page__field">
                  <label>Nombre</label>
                  <input type="text" placeholder="Tu nombre" />
                </div>

                <div className="contact-page__field">
                  <label>Teléfono</label>
                  <input type="text" placeholder="Tu teléfono" />
                </div>

                <div className="contact-page__field">
                  <label>Email</label>
                  <input type="email" placeholder="Tu email" />
                </div>

                <div className="contact-page__field">
                  <label>Vehículo</label>
                  <input type="text" placeholder="Marca, modelo y año" />
                </div>

                <div className="contact-page__field contact-page__field--full">
                  <label>Mensaje</label>
                  <textarea rows="6" placeholder="Contanos qué necesitás" />
                </div>

                <button type="button">Enviar consulta</button>
              </form>
            </div>

            <div className="contact-page__side">
              <div className="contact-page__cards">
                {contactCards.map((card) => (
                  <article key={card.title} className="contact-page__mini-card">
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>

              <div className="contact-page__details">
                <p>
                  <strong>Teléfono:</strong> {companyInfo.phone}
                </p>
                <p>
                  <strong>Email:</strong> {companyInfo.email}
                </p>
                <p>
                  <strong>Ubicación:</strong> {companyInfo.address}
                </p>
                <p>
                  <strong>Ciudad:</strong> {companyInfo.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-page__section">
        <div className="container">
          <div className="contact-page__map">
            <iframe
              src={mapUrl}
              title="Mapa Tapicería Líder"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;