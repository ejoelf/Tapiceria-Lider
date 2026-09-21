import { getWorks } from '@/lib/api';
import WorkGrid from '@/components/work-grid';
export const metadata = { title: 'Nuestros trabajos', alternates: { canonical: '/trabajos' } };
export default async function Works() {
  const works = await getWorks();
  return (
    <main id="contenido" className="section page-section">
      <span className="eyebrow">EL TALLER, EN IMÁGENES</span>
      <h1>
        El cuidado está
        <br />
        en los <em>detalles.</em>
      </h1>
      <p className="lead">Trabajos reales, materiales elegidos y cada transformación de cerca.</p>
      <div className="spaced">
        <WorkGrid works={works} />
      </div>
    </main>
  );
}
