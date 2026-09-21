'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="section page-section">
      <h1>No pudimos cargar esta página.</h1>
      <p>Intentá nuevamente en un momento.</p>
      <button className="button" onClick={reset}>
        Volver a intentar
      </button>
    </main>
  );
}
