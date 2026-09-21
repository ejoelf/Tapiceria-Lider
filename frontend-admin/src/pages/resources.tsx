import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { api, request } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { resources } from '@/lib/resources';
import { currency, date, label, number, type Row } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
import { PageHeader, Table, Badge, Loading, ErrorBox, type Column } from '@/components/common';
export default function Resources({ kind }: { kind: string }) {
  const def = resources[kind];
  const { can, name, refresh, notify } = useWorkshop();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [revision, setRevision] = useState(0),
    [edit, setEdit] = useState<Row | null>(null);
  const reload = () => setRevision((v) => v + 1);
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    request<Row[]>(`/${kind}?page=${page}&pageSize=25&q=${encodeURIComponent(query)}`)
      .then((r) => {
        if (active) {
          setRows(r.data);
          setTotal(r.meta?.total || 0);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [kind, page, query, revision]);
  const titleCol: Column = {
    key: 'name',
    label: 'Nombre',
    render: (r) => (
      <div className="row-name">
        <strong>{label(r)}</strong>
        <small>{r.code || r.email || ''}</small>
      </div>
    ),
  };
  const columns: Record<string, Column[]> = {
    clients: [
      titleCol,
      {
        key: 'client_type',
        label: 'Tipo',
        render: (r) => (
          <Badge value={r.company_kind === 'dealership' ? 'dealership' : r.client_type} />
        ),
      },
      { key: 'phone', label: 'Contacto' },
      { key: 'city', label: 'Ciudad' },
      { key: 'is_active', label: 'Estado', render: (r) => <Badge value={r.is_active} /> },
    ],
    vehicles: [
      {
        ...titleCol,
        render: (r) => (
          <div className="row-name">
            <strong>{r.nickname}</strong>
            <small>{r.plate || 'Sin patente registrada'}</small>
          </div>
        ),
      },
      { key: 'client_id', label: 'Cliente', render: (r) => name('clients', r.client_id) },
      { key: 'year', label: 'Año' },
      { key: 'vehicle_type', label: 'Tipo', render: (r) => <Badge value={r.vehicle_type} /> },
    ],
    suppliers: [
      titleCol,
      { key: 'contact_name', label: 'Contacto' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'email', label: 'Email' },
    ],
    materials: [
      titleCol,
      {
        key: 'stock_current',
        label: 'Disponible',
        render: (r) => (
          <span
            className={Number(r.stock_current) <= Number(r.stock_minimum) ? 'stock-warning' : ''}
          >
            {number(r.stock_current)} {r.unit}
          </span>
        ),
      },
      { key: 'stock_minimum', label: 'Mínimo', render: (r) => number(r.stock_minimum) },
      { key: 'cost_reference', label: 'Costo / unidad', render: (r) => currency(r.cost_reference) },
      { key: 'storage_location', label: 'Ubicación' },
    ],
    molds: [
      titleCol,
      {
        key: 'technical_part_id',
        label: 'Pieza',
        render: (r) => name('parts', r.technical_part_id),
      },
      {
        key: 'brand_id',
        label: 'Vehículo',
        render: (r) => `${name('brands', r.brand_id)} ${name('models', r.model_id)}`,
      },
      {
        key: 'is_reference_verified',
        label: 'PDF para imprimir',
        render: (r) => <Badge value={r.is_reference_verified ? 'verified' : 'pending'} />,
      },
    ],
    agenda: [
      { ...titleCol, render: (r) => <strong>{r.title}</strong> },
      { key: 'starts_at', label: 'Fecha y hora', render: (r) => date(r.starts_at, true) },
      {
        key: 'assigned_user_id',
        label: 'Responsable',
        render: (r) => name('users', r.assigned_user_id),
      },
      { key: 'status', label: 'Estado', render: (r) => <Badge value={r.status} /> },
    ],
    orders: [
      {
        ...titleCol,
        render: (r) => (
          <div className="row-name">
            <strong>{r.title}</strong>
            <small>{r.code}</small>
          </div>
        ),
      },
      { key: 'client_id', label: 'Cliente', render: (r) => name('clients', r.client_id) },
      {
        key: 'current_status_id',
        label: 'Estado',
        render: (r) => (
          <Badge value={r.current_status_id ? name('statuses', r.current_status_id) : 'received'} />
        ),
      },
      { key: 'estimated_end_date', label: 'Entrega', render: (r) => date(r.estimated_end_date) },
      { key: 'final_price', label: 'Precio acordado', render: (r) => currency(r.final_price) },
    ],
    leads: [
      {
        ...titleCol,
        render: (r) => (
          <div className="row-name">
            <strong>{r.name}</strong>
            <small>{r.email || r.phone}</small>
          </div>
        ),
      },
      { key: 'vehicle_description', label: 'Vehículo' },
      { key: 'service', label: 'Servicio' },
      { key: 'status', label: 'Estado', render: (r) => <Badge value={r.status} /> },
      { key: 'createdAt', label: 'Recibida', render: (r) => date(r.createdAt) },
    ],
    purchases: [
      { key: 'id', label: 'Compra', render: (r) => `#${r.id}` },
      { key: 'supplier_id', label: 'Proveedor', render: (r) => name('suppliers', r.supplier_id) },
      { key: 'material_id', label: 'Material', render: (r) => name('materials', r.material_id) },
      { key: 'quantity', label: 'Cantidad', render: (r) => number(r.quantity) },
      { key: 'total', label: 'Total', render: (r) => currency(r.total) },
      { key: 'status', label: 'Estado', render: (r) => <Badge value={r.status} /> },
    ],
    portfolio: [
      {
        ...titleCol,
        render: (r) => (
          <div className="row-name">
            <strong>{r.title}</strong>
            <small>{r.vehicle_description}</small>
          </div>
        ),
      },
      { key: 'service', label: 'Servicio' },
      { key: 'gallery', label: 'Fotos', render: (r) => r.gallery?.length || 0 },
      { key: 'status', label: 'Publicación', render: (r) => <Badge value={r.status} /> },
      { key: 'featured', label: 'En el inicio', render: (r) => (r.featured ? 'Destacado' : '—') },
    ],
  };
  if (!can(def.area || kind)) return <ErrorBox message="Tu rol no tiene acceso a esta sección." />;
  return (
    <>
      <PageHeader
        eyebrow="TU TALLER, ORGANIZADO"
        title={def.title}
        description={def.description}
        actions={
          <Button onClick={() => setEdit({})}>
            <Plus />
            Nuevo {def.singular}
          </Button>
        }
      />
      <section className="panel">
        <div className="toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              aria-label={`Buscar ${def.title.toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
            />
          </div>
          <span className="muted text-small">
            {total} registro{total === 1 ? '' : 's'}
          </span>
        </div>
        {error ? (
          <ErrorBox message={error} retry={reload} />
        ) : loading ? (
          <Loading />
        ) : (
          <Table
            rows={rows}
            columns={columns[kind] || [titleCol]}
            onRow={(r) =>
              [
                'orders',
                'molds',
                'materials',
                'leads',
                'portfolio',
                'purchases',
                'clients',
              ].includes(kind)
                ? navigate(`/${kind}/${r.id}`)
                : setEdit(r)
            }
          />
        )}
        <div className="pagination">
          <span>
            Página {page} de {Math.max(1, Math.ceil(total / 25))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((v) => v - 1)}
          >
            <ArrowLeft />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 25 >= total}
            onClick={() => setPage((v) => v + 1)}
          >
            Siguiente
            <ArrowRight />
          </Button>
        </div>
      </section>
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={`${edit?.id ? 'Editar' : 'Nuevo'} ${def.singular}`}
        wide
      >
        {edit && (
          <Form
            key={edit.id || 'new'}
            fields={def.fields}
            initial={edit}
            onCancel={() => setEdit(null)}
            onSubmit={async (data) => {
              const saved = await api(
                `/${kind}${edit.id ? '/' + edit.id : ''}`,
                edit.id ? 'PUT' : 'POST',
                data,
              );
              setEdit(null);
              notify('Guardado correctamente.');
              reload();
              await refresh();
              if (!edit.id && ['orders', 'molds', 'portfolio'].includes(kind))
                navigate(`/${kind}/${saved.id}`);
            }}
          />
        )}
      </Modal>
    </>
  );
}
