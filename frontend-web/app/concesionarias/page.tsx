import Link from 'next/link';
import { ArrowUpRight, ClipboardList, Car, Handshake } from 'lucide-react';
export const metadata = {
  title: 'Tapicería para concesionarias',
  description:
    'Prepará el interior de tus vehículos para la venta. Tapizado de volantes, paneles y techos para concesionarias en Río Cuarto.',
  alternates: { canonical: '/concesionarias' },
};
export default function Dealerships() {
  return (
    <main id="contenido">
      <section className="section page-section">
        <span className="eyebrow">UN ALIADO PARA TU CONCESIONARIA</span>
        <h1>
          El interior también
          <br />
          cierra la <em>venta.</em>
        </h1>
        <p className="lead">
          Un volante gastado o un techo despegado cambian la primera impresión.
          <br />
          Te ayudamos a que cada vehículo se presente como merece.
        </p>
        <Link href="/contacto" className="button">
          Hablemos de tus unidades <ArrowUpRight size={18} />
        </Link>
        <div className="process-grid spaced">
          {[
            [
              Car,
              'Cada unidad, bien identificada',
              'Seguimos el vehículo, las piezas y el trabajo acordado.',
            ],
            [
              ClipboardList,
              'Presupuestos claros',
              'Definimos el alcance y registramos los cambios antes de avanzar.',
            ],
            [
              Handshake,
              'Una relación de trabajo',
              'Coordinamos las entregas según el trabajo y las necesidades de tu negocio.',
            ],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof Car;
            return (
              <article key={i}>
                <I size={28} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="closing-cta">
        <span className="eyebrow">VOLANTES · PANELES · TECHOS · OTRAS PIEZAS</span>
        <h2>
          Vos preparás la venta.
          <br />
          Nosotros, los <em>detalles.</em>
        </h2>
        <Link href="/contacto" className="button">
          Solicitar una evaluación <ArrowUpRight size={18} />
        </Link>
      </section>
    </main>
  );
}
