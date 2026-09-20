import Link from 'next/link';
import { ArrowUpRight, Camera } from 'lucide-react';
import type { Work } from '@/lib/api';
export default function WorkGrid({ works }: { works: Work[] | null }) {
  if (!works?.length)
    return (
      <div className="portfolio-empty">
        <Camera size={30} />
        <div>
          <h3>
            {works === null
              ? 'La galería no está disponible por el momento.'
              : 'Cada detalle tiene una historia.'}
          </h3>
          <p>
            {works === null
              ? 'Podés dejarnos una consulta para conocer nuestro trabajo.'
              : 'Estamos preparando las fotos de nuestros trabajos. Mientras tanto, contanos qué querés renovar.'}
          </p>
        </div>
        <Link href="/contacto" className="text-link">
          Hablemos <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="work-grid">
      {works.map((work) => {
        const cover = work.gallery.find((g) => g.cover) || work.gallery[0];
        return (
          <Link key={work.id} href={`/trabajos/${work.slug}`} className="work-card">
            {cover && <img src={cover.url} alt={cover.alt} loading="lazy" />}
            <div>
              <span className="eyebrow">{work.service}</span>
              <h3>
                {work.title}
                <ArrowUpRight size={22} />
              </h3>
              <p>{work.vehicle_description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
