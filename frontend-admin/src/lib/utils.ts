import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export type Row = Record<string, any>;
export const currency = (n: unknown) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
export const number = (n: unknown) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(Number(n || 0));
export const date = (value: unknown, time = false) => {
  if (!value) return '—';
  const s = String(value);
  const d = new Date(s.length === 10 ? s + 'T12:00:00Z' : s);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Cordoba',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(time ? { hour: '2-digit', minute: '2-digit' } : {}),
      }).format(d);
};
export const label = (r: Row | undefined) =>
  r
    ? r.company_name ||
      [r.first_name, r.last_name].filter(Boolean).join(' ') ||
      r.name ||
      r.nickname ||
      [r.code, r.title].filter(Boolean).join(' · ') ||
      r.title ||
      `#${r.id}`
    : '—';
export const today = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Cordoba' });
export const labels: Record<string, string> = {
  individual: 'Particular',
  company: 'Empresa',
  dealership: 'Concesionaria',
  fleet: 'Flota',
  other: 'Otro',
  draft: 'Borrador',
  sent: 'Enviado',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  superseded: 'Reemplazado',
  new: 'Nueva',
  contacted: 'Contactado',
  quoted: 'Presupuestado',
  won: 'Ganada',
  lost: 'No concretada',
  received: 'Recibido',
  approved: 'Aprobado',
  in_progress: 'En proceso',
  paused: 'Pausado',
  completed: 'Terminado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  ordered: 'Pendiente',
  scheduled: 'Programado',
  done: 'Realizado',
  before: 'Antes',
  during: 'Durante',
  after: 'Después',
  cover: 'Portada',
  published: 'Publicado',
  verified: 'Verificado',
  pending: 'Pendiente',
  in: 'Entrada',
  out: 'Consumo',
  adjustment: 'Ajuste',
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  contribution: 'Aporte',
  withdrawal: 'Retiro',
  owner: 'Administrador',
  operator: 'Operador',
  accountant: 'Administración financiera',
  low: 'Baja',
  medium: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
  car: 'Auto',
  truck: 'Camión / camioneta',
  van: 'Utilitario',
  bus: 'Colectivo',
  boat: 'Náutico',
  aircraft: 'Aeronave',
  unit: 'Unidad',
  m: 'Metro',
  m2: 'm²',
  l: 'Litro',
  kg: 'Kg',
  master_pdf: 'PDF maestro',
  source: 'Archivo editable',
  reference: 'Referencia',
  web: 'Web',
  whatsapp: 'WhatsApp',
  referral: 'Recomendación',
  phone: 'Teléfono',
  sending: 'Enviando',
  failed: 'Error de envío',
};
export const translate = (value: unknown) => labels[String(value)] || String(value ?? '—');
export const download = (path: string) =>
  window.open((import.meta.env.VITE_API_BASE || '/api') + path, '_blank', 'noopener,noreferrer');
