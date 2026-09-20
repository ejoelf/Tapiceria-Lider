import 'server-only';
export type Service = { id: string; title: string; description: string; enabled: boolean };
export type Site = {
  name: string;
  tagline: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  show_address: boolean;
  about: string;
  services: Service[];
  privacy_text: string;
  nexodigital_url: string;
};
export type GalleryImage = {
  file_id: number;
  stage: string;
  caption: string;
  alt: string;
  pair: string;
  cover: boolean;
  url: string;
};
export type Work = {
  id: number;
  slug: string;
  title: string;
  service: string;
  vehicle_description: string;
  summary: string;
  materials: string;
  featured: boolean;
  published_at: string;
  gallery: GalleryImage[];
};
export const defaults: Site = {
  name: 'Tapicería Líder',
  tagline: 'Especialistas en volantes',
  city: 'Río Cuarto, Córdoba',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  hours: '',
  instagram: '',
  facebook: '',
  show_address: false,
  about:
    'Somos Joel y Lucas. Trabajamos cada pieza con dedicación, combinando materiales, costuras y terminaciones para recuperar el interior de tu vehículo.',
  services: [
    {
      id: 'volantes',
      title: 'Tapizado de volantes',
      description: 'Cuero, ecocuero y costuras que vuelven a conectar tus manos con el camino.',
      enabled: true,
    },
    {
      id: 'paneles',
      title: 'Paneles de puertas',
      description: 'Recuperamos la textura y el carácter de cada detalle del interior.',
      enabled: true,
    },
    {
      id: 'techos',
      title: 'Tapizado de techos',
      description: 'Renovamos el revestimiento para un interior cuidado de punta a punta.',
      enabled: true,
    },
    {
      id: 'bochas',
      title: 'Bochas y otras piezas',
      description: 'Palancas, apoyabrazos y las piezas que hacen la diferencia.',
      enabled: true,
    },
  ],
  privacy_text:
    'Usamos tus datos de contacto y las fotos que nos enviás para responder tu consulta y preparar un presupuesto. Las imágenes se mantienen privadas y solo se publican con tu autorización. Podés solicitar acceso, corrección o eliminación de tus datos contactando a Tapicería Líder.',
  nexodigital_url: 'https://nexodigital-ix6r.onrender.com/',
};
export async function publicData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(
      `${process.env.API_INTERNAL_URL || 'http://localhost:4000'}/api/public${path}`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return null;
    const body = await response.json();
    return body.data as T;
  } catch {
    return null;
  }
}
export async function getSite(): Promise<Site> {
  return (await publicData<Site>('/site')) || defaults;
}
export async function getWorks(): Promise<Work[] | null> {
  return publicData<Work[]>('/portfolio');
}
