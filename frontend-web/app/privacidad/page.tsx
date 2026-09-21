import { getSite } from '@/lib/api';
import Link from 'next/link';
export const metadata = { title: 'Privacidad', alternates: { canonical: '/privacidad' } };
export default async function Privacy() {
  const site = await getSite();
  return (
    <main id="contenido" className="section page-section prose">
      <span className="eyebrow">TUS DATOS</span>
      <h1>Privacidad.</h1>
      <p className="preline">{site.privacy_text}</p>
      <h2>Consultas y fotografías</h2>
      <p>
        La información del formulario llega al panel privado del taller. No publicamos las fotos que
        envíes como parte de una consulta sin una autorización adicional. Evitá incluir rostros,
        patentes u otros datos que no necesitemos para evaluar la pieza.
      </p>
      <h2>Contacto</h2>
      <p>
        Para consultar por tus datos o solicitar su actualización o eliminación,{' '}
        <Link href="/contacto">escribinos desde el formulario de contacto</Link>
        {site.email && (
          <>
            {' '}
            o a <a href={`mailto:${site.email}`}>{site.email}</a>
          </>
        )}
        .
      </p>
    </main>
  );
}
