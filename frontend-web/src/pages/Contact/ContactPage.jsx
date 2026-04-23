import SectionHeading from "../../components/common/SectionHeading";
import { companyInfo, contactCards } from "../../data/siteData";
import "./ContactPage.css";

function ContactPage() {
  const mapUrl =
    import.meta.env.VITE_GOOGLE_MAPS_EMBED ||
    "https://www.google.com/maps?q=Rio%20Cuarto%20Cordoba&output=embed";

  return (
    <div className="contact-page page-shell">
      <SectionHeading
        eyebrow="Contacto"
        title="Hablemos de tu próximo trabajo"
        description="Esta página después la vamos a conectar con el backend para guardar mensajes y gestionar consultas desde el panel."
      />

      <section className="contact-page__grid">
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

        <div className="contact-page__info">
          <div className="contact-page__cards">
            {contactCards.map((card) => (
              <article key={card.title} className="contact-page__mini-card">
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </article>
            ))}
          </div>

          <div className="contact-page__details">
            <p><strong>Teléfono:</strong> {companyInfo.phone}</p>
            <p><strong>Email:</strong> {companyInfo.email}</p>
            <p><strong>Ubicación:</strong> {companyInfo.address}</p>
          </div>
        </div>
      </section>

      <section className="contact-page__map">
        <iframe
          src={mapUrl}
          title="Mapa Tapicería Líder"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}

export default ContactPage;