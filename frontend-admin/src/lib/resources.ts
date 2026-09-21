import { type Row, translate } from './utils';
export type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  default?: unknown;
  lookup?: string;
  options?: { value: string; label: string }[];
  wide?: boolean;
  help?: string;
  show?: (data: Row) => boolean;
  min?: number;
  max?: number;
};
export const opts = (...values: string[]) =>
  values.map((value) => ({ value, label: translate(value) }));
const active: Field = {
  key: 'is_active',
  label: 'Registro activo',
  type: 'checkbox',
  default: true,
};
const notes: Field = { key: 'notes', label: 'Notas internas', type: 'textarea', wide: true };
export const clients: Field[] = [
  {
    key: 'client_type',
    label: 'Tipo de cliente',
    type: 'select',
    options: opts('individual', 'company'),
    default: 'individual',
  },
  {
    key: 'company_kind',
    label: 'Tipo de empresa',
    type: 'select',
    options: opts('other', 'dealership', 'fleet'),
    default: 'other',
    show: (d) => d.client_type === 'company',
  },
  { key: 'first_name', label: 'Nombre', show: (d) => d.client_type !== 'company' },
  { key: 'last_name', label: 'Apellido', show: (d) => d.client_type !== 'company' },
  {
    key: 'company_name',
    label: 'Razón social / empresa',
    required: true,
    show: (d) => d.client_type === 'company',
  },
  { key: 'tax_id', label: 'CUIT / documento' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Teléfono / WhatsApp', type: 'tel' },
  { key: 'secondary_phone', label: 'Teléfono alternativo', type: 'tel' },
  { key: 'address', label: 'Dirección' },
  { key: 'city', label: 'Ciudad', default: 'Río Cuarto' },
  { key: 'province', label: 'Provincia', default: 'Córdoba' },
  { key: 'payment_terms', label: 'Condiciones de pago', wide: true },
  {
    key: 'credit_limit',
    label: 'Límite de crédito de referencia (ARS)',
    type: 'number',
    default: 0,
    help: 'Referencia para acordar condiciones; no bloquea nuevos trabajos.',
  },
  active,
  notes,
];
export const vehicles: Field[] = [
  { key: 'client_id', label: 'Cliente', lookup: 'clients', required: true },
  {
    key: 'nickname',
    label: 'Nombre del vehículo',
    required: true,
    help: 'Ejemplo: Toyota Hilux blanca',
  },
  { key: 'brand_id', label: 'Marca', lookup: 'brands' },
  { key: 'model_id', label: 'Modelo', lookup: 'models' },
  { key: 'year', label: 'Año', type: 'number', min: 1900, max: 2100 },
  {
    key: 'vehicle_type',
    label: 'Tipo',
    type: 'select',
    options: opts('car', 'truck', 'van', 'bus', 'other'),
    default: 'car',
  },
  { key: 'version', label: 'Versión' },
  { key: 'plate', label: 'Patente' },
  { key: 'color', label: 'Color' },
  { key: 'vin', label: 'Número de chasis' },
  active,
  notes,
];
export const suppliers: Field[] = [
  { key: 'name', label: 'Proveedor', required: true },
  { key: 'contact_name', label: 'Persona de contacto' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Teléfono', type: 'tel' },
  { key: 'tax_id', label: 'CUIT' },
  { key: 'address', label: 'Dirección' },
  active,
  notes,
];
export const materials: Field[] = [
  { key: 'code', label: 'Código', required: true },
  { key: 'name', label: 'Material', required: true },
  { key: 'category_id', label: 'Categoría', lookup: 'categories' },
  {
    key: 'unit',
    label: 'Unidad',
    type: 'select',
    options: opts('m2', 'm', 'unit', 'kg', 'l'),
    default: 'm2',
  },
  { key: 'color', label: 'Color' },
  { key: 'stock_minimum', label: 'Stock mínimo', type: 'number', default: 0 },
  {
    key: 'cost_reference',
    label: 'Costo por unidad (ARS)',
    type: 'number',
    default: 0,
    help: 'Los ingresos posteriores recalculan el costo promedio.',
  },
  { key: 'storage_location', label: 'Ubicación en el taller' },
  { key: 'description', label: 'Descripción', type: 'textarea', wide: true },
  active,
  notes,
];
export const molds: Field[] = [
  { key: 'code', label: 'Código del molde', required: true },
  { key: 'title', label: 'Nombre', required: true },
  { key: 'technical_part_id', label: 'Pieza', lookup: 'parts', required: true },
  { key: 'brand_id', label: 'Marca', lookup: 'brands' },
  { key: 'model_id', label: 'Modelo', lookup: 'models' },
  {
    key: 'vehicle_type',
    label: 'Tipo de vehículo',
    type: 'select',
    options: opts('car', 'truck', 'van', 'bus', 'other'),
    default: 'car',
  },
  { key: 'year_from', label: 'Desde el año', type: 'number', min: 1900, max: 2100 },
  { key: 'year_to', label: 'Hasta el año', type: 'number', min: 1900, max: 2100 },
  { key: 'version_label', label: 'Versión del vehículo / volante' },
  { key: 'material_reference', label: 'Material de referencia' },
  {
    key: 'dimensions_notes',
    label: 'Medidas y márgenes de costura',
    type: 'textarea',
    wide: true,
    help: 'Indicá unidades, largo, ancho, espesor, margen y referencia de calibración de 100 mm.',
  },
  { key: 'technical_notes', label: 'Notas de confección', type: 'textarea', wide: true },
  {
    key: 'print_notes',
    label: 'Instrucciones de impresión',
    type: 'textarea',
    wide: true,
    default:
      'Imprimir al 100%, sin ajustar a página. Verificar la referencia de 100 mm antes de cortar.',
  },
  active,
];
export const agenda: Field[] = [
  { key: 'title', label: 'Actividad', required: true },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: opts('scheduled', 'done', 'cancelled'),
    default: 'scheduled',
  },
  { key: 'starts_at', label: 'Inicio', type: 'datetime-local', required: true },
  { key: 'ends_at', label: 'Finalización', type: 'datetime-local' },
  { key: 'client_id', label: 'Cliente', lookup: 'clients' },
  { key: 'work_order_id', label: 'Orden de trabajo', lookup: 'orders' },
  { key: 'assigned_user_id', label: 'Responsable', lookup: 'users' },
  notes,
];
export const orders: Field[] = [
  { key: 'title', label: 'Trabajo a realizar', required: true, wide: true },
  { key: 'client_id', label: 'Cliente', lookup: 'clients', required: true },
  { key: 'vehicle_id', label: 'Vehículo', lookup: 'vehicles' },
  {
    key: 'service_type',
    label: 'Servicio',
    type: 'select',
    options: ['Volantes', 'Paneles', 'Techos', 'Bochas', 'Otros tapizados'].map((v) => ({
      value: v,
      label: v,
    })),
    default: 'Volantes',
  },
  {
    key: 'priority',
    label: 'Prioridad',
    type: 'select',
    options: opts('low', 'medium', 'high', 'urgent'),
    default: 'medium',
  },
  { key: 'assigned_user_id', label: 'Responsable', lookup: 'users' },
  { key: 'mold_id', label: 'Molde de referencia', lookup: 'molds' },
  { key: 'estimated_start_date', label: 'Inicio previsto', type: 'date' },
  { key: 'estimated_end_date', label: 'Entrega prevista', type: 'date' },
  { key: 'estimated_price', label: 'Precio estimado (ARS)', type: 'number', default: 0 },
  { key: 'final_price', label: 'Precio acordado (ARS)', type: 'number', default: 0 },
  { key: 'labor_hours', label: 'Horas de mano de obra', type: 'number', default: 0 },
  { key: 'labor_hour_cost', label: 'Costo por hora (ARS)', type: 'number', default: 0 },
  {
    key: 'other_costs',
    label: 'Otros costos estimados (ARS)',
    type: 'number',
    default: 0,
    help: 'No repitas gastos que ya cargaste en caja vinculados a esta orden.',
  },
  {
    key: 'source_channel',
    label: 'Origen',
    type: 'select',
    options: opts('web', 'whatsapp', 'dealership', 'referral', 'other'),
    default: 'other',
  },
  { key: 'description', label: 'Alcance del trabajo', type: 'textarea', wide: true },
  { key: 'internal_notes', label: 'Notas internas', type: 'textarea', wide: true },
];
export const leads: Field[] = [
  { key: 'name', label: 'Nombre / empresa', required: true },
  {
    key: 'client_type',
    label: 'Tipo de cliente',
    type: 'select',
    options: opts('individual', 'company'),
    default: 'individual',
  },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Teléfono', type: 'tel' },
  { key: 'vehicle_description', label: 'Vehículo' },
  { key: 'service', label: 'Servicio', default: 'Volantes' },
  {
    key: 'source',
    label: 'Origen',
    type: 'select',
    options: opts('whatsapp', 'phone', 'referral', 'other'),
    default: 'whatsapp',
  },
  { key: 'message', label: 'Consulta', type: 'textarea', required: true, wide: true },
  {
    key: 'consent',
    label: 'El cliente autorizó el uso de sus datos para esta consulta',
    type: 'checkbox',
    default: false,
  },
];
export const purchases: Field[] = [
  { key: 'supplier_id', label: 'Proveedor', lookup: 'suppliers', required: true },
  { key: 'material_id', label: 'Material', lookup: 'materials', required: true },
  { key: 'quantity', label: 'Cantidad', type: 'number', required: true, min: 0.01 },
  { key: 'unit_cost', label: 'Costo por unidad (ARS)', type: 'number', required: true },
  notes,
];
export const portfolio: Field[] = [
  { key: 'title', label: 'Título público', required: true, wide: true },
  {
    key: 'slug',
    label: 'Dirección del trabajo',
    required: true,
    help: 'Solo minúsculas, números y guiones. Ejemplo: volante-hilux-cuero.',
  },
  { key: 'service', label: 'Servicio', required: true, default: 'Volantes' },
  {
    key: 'vehicle_description',
    label: 'Modelo del vehículo (público)',
    help: 'Sin patentes ni datos del cliente.',
  },
  { key: 'work_order_id', label: 'Vincular con una orden (opcional)', lookup: 'orders' },
  { key: 'summary', label: 'Descripción pública', type: 'textarea', wide: true },
  { key: 'materials', label: 'Materiales utilizados', wide: true },
  { key: 'featured', label: 'Destacar en el inicio de la web', type: 'checkbox', default: false },
  {
    key: 'consent',
    label: 'Tenemos autorización del cliente para publicar estas imágenes',
    type: 'checkbox',
    default: false,
  },
];
export const resources: Record<
  string,
  { title: string; singular: string; description: string; fields: Field[]; area?: string }
> = {
  clients: {
    title: 'Clientes',
    singular: 'cliente',
    description: 'Particulares, concesionarias y empresas. Todas tus relaciones, en un lugar.',
    fields: clients,
  },
  vehicles: {
    title: 'Vehículos',
    singular: 'vehículo',
    description: 'La ficha de cada unidad que pasa por el taller.',
    fields: vehicles,
  },
  suppliers: {
    title: 'Proveedores',
    singular: 'proveedor',
    description: 'Tus contactos para conseguir los mejores materiales.',
    fields: suppliers,
  },
  materials: {
    title: 'Materiales e inventario',
    singular: 'material',
    description: 'Controlá existencias, costos y consumos de cada trabajo.',
    fields: materials,
  },
  molds: {
    title: 'Biblioteca de moldes',
    singular: 'molde',
    description: 'Cada medida, cada versión. Tu experiencia siempre a mano.',
    fields: molds,
  },
  agenda: {
    title: 'Agenda del taller',
    singular: 'actividad',
    description: 'Organizá recepciones, trabajos y entregas.',
    fields: agenda,
  },
  orders: {
    title: 'Órdenes de trabajo',
    singular: 'trabajo',
    description: 'Desde que recibís la pieza hasta que vuelve a su dueño.',
    fields: orders,
  },
  leads: {
    title: 'Bandeja de consultas',
    singular: 'consulta',
    description: 'Cada consulta es el comienzo de un nuevo trabajo.',
    fields: leads,
  },
  purchases: {
    title: 'Compras',
    singular: 'compra',
    description: 'Prepará pedidos, recibí materiales y registrá sus pagos por separado.',
    fields: purchases,
  },
  portfolio: {
    title: 'Galería de la web',
    singular: 'trabajo para la web',
    description: 'Elegí qué mostrar. Publicá los detalles que hacen la diferencia.',
    fields: portfolio,
  },
};
