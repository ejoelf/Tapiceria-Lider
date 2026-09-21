import type { MetadataRoute } from 'next';
import { getSite, getWorks } from '@/lib/api';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [site, works] = await Promise.all([getSite(), getWorks()]);
  return [
    '',
    '/contacto',
    '/concesionarias',
    '/trabajos',
    '/privacidad',
    ...site.services.filter((s) => s.enabled).map((s) => `/servicios/${s.id}`),
    ...(works || []).map((w) => `/trabajos/${w.slug}`),
  ].map((route) => ({
    url: base + route,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
