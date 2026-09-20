import { getSite } from '@/lib/api';
import ContactForm from '@/components/contact-form';
import { MapPin, ArrowUpRight, MessageCircle } from 'lucide-react';
export const metadata = {
  title: 'Contanos qué querés renovar',
  alternates: { canonical: '/contacto' },
};
export default async function Contact() {
  const site = await getSite();
  const whatsapp = site.whatsapp.replace(/\D/g, '');
  return (
    <main id="contenido" className="section page-section">
      <div className="contact-layout">
        <div>
          <span className="eyebrow">ESTAMOS PARA ESCUCHARTE</span>
          <h1>
            Todo empieza
            <br />
            con una <em>idea.</em>
          </h1>
          <p className="lead">
            Mandanos unas fotos y contanos qué te gustaría cambiar. Nosotros nos ocupamos de los
            detalles.
          </p>
          <div className="contact-details">
            <p>
              <MapPin size={18} /> {site.city}
            </p>
            {site.show_address && site.address && <p>{site.address}</p>}
            {site.hours && <p className="preline">{site.hours}</p>}
            {whatsapp && (
              <a
                className="button secondary"
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('¡Hola Líder! Quisiera consultar por un tapizado.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} /> Hablemos por WhatsApp <ArrowUpRight size={18} />
              </a>
            )}
          </div>
          <div className="contact-aside">
            <span>PARTICULARES Y CONCESIONARIAS</span>
            <p>
              Volantes, paneles, techos y otras piezas. Cada trabajo se evalúa según el vehículo, el
              material y su estado.
            </p>
          </div>
        </div>
        <ContactForm services={site.services} />
      </div>
    </main>
  );
}
