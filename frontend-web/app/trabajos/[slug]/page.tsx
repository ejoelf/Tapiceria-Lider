import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { publicData, type Work } from '@/lib/api';
import Comparison from '@/components/comparison';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await publicData<Work>(`/portfolio/${encodeURIComponent(slug)}`);
  return {
    title: work?.title || 'Trabajo',
    description: work?.summary,
    alternates: { canonical: `/trabajos/${slug}` },
  };
}
export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await publicData<Work>(`/portfolio/${encodeURIComponent(slug)}`);
  if (!work) notFound();
  const pairs = [...new Set(work.gallery.map((g) => g.pair).filter(Boolean))];
  return (
    <main id="contenido" className="section page-section">
      <Link href="/trabajos" className="text-link back-link">
        <ArrowLeft size={16} /> Volver a trabajos
      </Link>
      <span className="eyebrow">
        {work.service} · {work.vehicle_description}
      </span>
      <h1>{work.title}</h1>
      <p className="lead">{work.summary}</p>
      {work.materials && <p className="muted">Materiales: {work.materials}</p>}
      <div className="spaced">
        {pairs.map((pair) => {
          const before = work.gallery.find((g) => g.pair === pair && g.stage === 'before'),
            after = work.gallery.find((g) => g.pair === pair && g.stage === 'after');
          return before && after ? <Comparison key={pair} before={before} after={after} /> : null;
        })}
        <div className="photo-gallery">
          {work.gallery.map((g) => (
            <figure key={g.file_id}>
              <img src={g.url} alt={g.alt} loading="lazy" />
              <figcaption>
                {g.caption ||
                  { before: 'Antes', during: 'Durante el trabajo', after: 'Después' }[g.stage] ||
                  'Detalle'}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="inline-cta">
        <h2>¿Buscás algo así?</h2>
        <Link href="/contacto" className="button">
          Consultanos por tu vehículo <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}
