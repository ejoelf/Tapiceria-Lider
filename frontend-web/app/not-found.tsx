import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="contenido" className="section page-section">
      <span className="eyebrow">404</span>
      <h1>Por acá no era.</h1>
      <p className="lead">La página que buscás no está disponible.</p>
      <Link className="button" href="/">
        Volver al inicio ↗
      </Link>
    </main>
  );
}
