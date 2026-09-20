import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';
import { getSite } from '@/lib/api';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getSite();
  const service = site.services.find((s) => s.id === slug && s.enabled);
  return {
    title: `${service?.title || 'Servicio'} en Río Cuarto`,
    description: service?.description,
    alternates: { canonical: `/servicios/${slug}` },
  };
}
export default async function Service({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getSite();
  const service = site.services.find((s) => s.id === slug && s.enabled);
  if (!service) notFound();
  return (
    <main id="contenido">
      <section className="section page-section service-page">
        <div>
          <span className="eyebrow">TAPICERÍA VEHICULAR · RÍO CUARTO</span>
          <h1>
            {service.title}
            <em> a tu manera.</em>
          </h1>
          <p className="lead">{service.description}</p>
          <p>
            El desgaste no tiene por qué definir tu interior. Revisamos la pieza, te mostramos las
            opciones de material y acordamos el trabajo antes de empezar.
          </p>
          <ul className="clean-list">
            <li>
              <Check size={18} /> Atención a particulares y concesionarias.
            </li>
            <li>
              <Check size={18} /> Materiales y terminaciones a elección.
            </li>
            <li>
              <Check size={18} /> Presupuesto según el estado de cada pieza.
            </li>
          </ul>
          <Link href="/contacto" className="button">
            Pedí tu presupuesto <ArrowUpRight size={18} />
          </Link>
        </div>
        <figure className="service-illustration">
          <Image
            src="/volante-lider.png"
            alt="Imagen ilustrativa del trabajo de tapicería en cuero"
            fill
            sizes="(max-width:760px) 100vw, 50vw"
          />
          <figcaption>Imagen ilustrativa · Tapicería vehicular</figcaption>
        </figure>
      </section>
      <section className="section process-section">
        <span className="eyebrow">SIMPLE, DE PRINCIPIO A FIN</span>
        <h2>Así trabajamos.</h2>
        <div className="process-grid">
          {[
            ['01', 'Nos contás tu idea', 'Mandanos el modelo del vehículo y fotos de la pieza.'],
            ['02', 'Definimos los detalles', 'Revisamos materiales, terminación y presupuesto.'],
            ['03', 'Nos ponemos a trabajar', 'Acordamos la entrega y cuidamos cada costura.'],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
