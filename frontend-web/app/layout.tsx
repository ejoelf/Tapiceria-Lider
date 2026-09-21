import type { Metadata } from 'next';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import { getSite } from '@/lib/api';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Tapicería Líder · Especialistas en volantes en Río Cuarto',
    template: '%s | Tapicería Líder',
  },
  description:
    'Tapizado de volantes, paneles, techos y piezas del interior de tu vehículo. Atención a particulares y concesionarias en Río Cuarto, Córdoba.',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Tapicería Líder',
    images: [
      {
        url: '/volante-lider.png',
        width: 1672,
        height: 941,
        alt: 'Ilustración de un volante tapizado en cuero',
      },
    ],
  },
  robots: { index: true, follow: true },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="es-AR">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <Nav />
        {children}
        <Footer site={site} />
      </body>
    </html>
  );
}
