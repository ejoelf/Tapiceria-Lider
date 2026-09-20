import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, Check, MoveUpRight, Car, Building2 } from 'lucide-react';
import { getSite, getWorks } from '@/lib/api';
import WorkGrid from '@/components/work-grid';
export default async function Home() {
  const [site, works] = await Promise.all([getSite(), getWorks()]);
  const featured = works ? works.filter((w) => w.featured) : null;
  return (
    <main id="contenido">
      <section className="hero">
        <Image
          src="/volante-lider.png"
          alt="Volante de cuero negro con costura artesanal, imagen ilustrativa"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow">
            <i /> TAPICERÍA VEHICULAR · RÍO CUARTO
          </span>
          <h1>
            El detalle que
            <br />
            cambia <em>todo.</em>
          </h1>
          <p>
            Tu volante, como te gusta sentirlo.
            <br />
            Tu interior, como merece verse.
          </p>
          <div className="hero-actions">
            <Link href="/contacto" className="button">
              Renová tu vehículo <ArrowUpRight size={18} />
            </Link>
            <Link href="/trabajos" className="text-link">
              Explorá nuestros trabajos <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hero-note">
            <span className="mini-line" /> Especialistas en volantes. Apasionados por los detalles.
          </div>
        </div>
        <span className="image-caption">IMAGEN ILUSTRATIVA</span>
        <a href="#servicios" className="scroll-cue" aria-label="Conocer los servicios">
          <ArrowDown size={18} />
        </a>
      </section>
      <div className="trust-strip">
        <span>
          <Check size={16} /> Trabajo artesanal
        </span>
        <span>
          <Check size={16} /> Materiales según tu estilo
        </span>
        <span>
          <Car size={17} /> Particulares
        </span>
        <span>
          <Building2 size={17} /> Concesionarias
        </span>
      </div>
      <section id="servicios" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LO QUE HACEMOS</span>
            <h2>
              Recuperamos el placer
              <br />
              de estar <em>al volante.</em>
            </h2>
          </div>
          <p>
            Autos, camionetas y camiones.
            <br />
            Una pieza o todo lo que tu interior necesite.
          </p>
        </div>
        <div className="services-grid">
          {site.services
            .filter((s) => s.enabled)
            .map((s, i) => (
              <Link
                className={`service-card ${i === 0 ? 'service-featured' : ''}`}
                href={`/servicios/${s.id}`}
                key={s.id}
              >
                <span className="service-number">0{i + 1}</span>
                {i === 0 && (
                  <Image
                    src="/volante-lider.png"
                    alt="Detalle ilustrativo de cuero y costura"
                    fill
                    sizes="(max-width: 760px) 100vw, 45vw"
                  />
                )}
                <div className="service-content">
                  <span>{i === 0 ? 'NUESTRA ESPECIALIDAD' : 'HECHO A MEDIDA'}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <span className="round-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </section>
      <section className="section works-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EL CAMBIO SE VE</span>
            <h2>
              De vuelta a su
              <br />
              <em>mejor versión.</em>
            </h2>
          </div>
          <Link href="/trabajos" className="text-link">
            Todos los trabajos <ArrowUpRight size={18} />
          </Link>
        </div>
        <WorkGrid works={featured?.length ? featured.slice(0, 3) : (works?.slice(0, 3) ?? null)} />
      </section>
      <section id="nosotros" className="section about-section">
        <div className="about-art">
          <div className="stitch-ring" />
          <span className="brand big-brand">LÍDER</span>
          <span className="eyebrow">HECHO CON DEDICACIÓN, EN RÍO CUARTO.</span>
        </div>
        <div className="about-copy">
          <span className="eyebrow">DOS SOCIOS. UNA MISMA FORMA DE TRABAJAR.</span>
          <h2>
            Las manos hacen.
            <br />
            Los detalles <em>hablan.</em>
          </h2>
          <p>{site.about}</p>
          <p>
            Escuchamos lo que buscás, revisamos la pieza y te acompañamos a elegir una terminación
            que vaya con vos.
          </p>
          <div className="founders">
            Joel & Lucas<span>Los que están detrás de cada trabajo.</span>
          </div>
        </div>
      </section>
      <section className="section b2b-section">
        <div>
          <span className="eyebrow">TAMBIÉN TRABAJAMOS CON TU CONCESIONARIA</span>
          <h2>
            Una mejor primera impresión.
            <br />
            <em>En cada vehículo.</em>
          </h2>
          <p>
            Te ayudamos a preparar el interior para la venta, con presupuestos claros y seguimiento
            de cada unidad.
          </p>
          <Link href="/concesionarias" className="button secondary">
            Conozcamos tu negocio <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="b2b-mark">
          <MoveUpRight strokeWidth={0.65} />
        </span>
      </section>
      <section className="closing-cta">
        <span className="eyebrow">TU PRÓXIMO CAMBIO EMPIEZA ACÁ</span>
        <h2>
          ¿Le damos otra vida
          <br />a ese <em>interior?</em>
        </h2>
        <Link href="/contacto" className="button">
          Contanos tu idea <ArrowUpRight size={18} />
        </Link>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoRepair',
            name: site.name,
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            description: 'Tapicería vehicular. Especialistas en volantes.',
            areaServed: { '@type': 'City', name: 'Río Cuarto' },
            ...(site.phone ? { telephone: site.phone } : {}),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  );
}
