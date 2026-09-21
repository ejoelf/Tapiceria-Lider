import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Site } from '@/lib/api';
export default function Footer({ site }: { site: Site }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="brand">
            LÍDER<span>ESPECIALISTAS EN VOLANTES</span>
          </Link>
          <p>
            Un buen trabajo se siente.
            <br />
            En cada curva. En cada detalle.
          </p>
        </div>
        <div>
          <span className="eyebrow">VENÍ A CONOCERNOS</span>
          <p>
            <MapPin size={16} /> {site.city}
          </p>
          {site.show_address && site.address && <p>{site.address}</p>}
          {site.hours && <p className="preline">{site.hours}</p>}
        </div>
        <div>
          <span className="eyebrow">HABLEMOS DE TU VEHÍCULO</span>
          <Link href="/contacto">
            Solicitar un presupuesto <ArrowUpRight size={15} />
          </Link>
          {site.phone && <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}>{site.phone}</a>}
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tapicería Líder</span>
        <Link href="/privacidad">Privacidad</Link>
        <a href="https://nexodigital-ix6r.onrender.com/" target="_blank" rel="noopener noreferrer">
          Desarrollado por <strong>NexoDigital</strong> ↗
        </a>
      </div>
    </footer>
  );
}
