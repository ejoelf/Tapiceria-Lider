import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Pencil,
  ArrowRight,
  Plus,
  Upload,
  Package,
  ImagePlus,
  Clock,
  FileText,
} from 'lucide-react';
import { api, useData, API } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { orders, opts, type Field } from '@/lib/resources';
import { currency, date, translate, type Row } from '@/lib/utils';
import { PageHeader, Stat, Loading, ErrorBox, Badge, Table, Empty } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
const transitions: Record<string, string[]> = {
  received: ['quoted', 'approved', 'cancelled'],
  quoted: ['approved', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'completed', 'cancelled'],
  paused: ['in_progress', 'cancelled'],
  completed: ['in_progress', 'delivered'],
  delivered: ['in_progress'],
  cancelled: ['received'],
};
export default function Order() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/orders/${id}`);
  const { lookups, name, refresh, notify, can } = useWorkshop();
  const [modal, setModal] = useState(''),
    [tab, setTab] = useState('detail'),
    [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState('');
  const changed = async () => {
    setModal('');
    reload();
    await refresh();
    notify('Trabajo actualizado.');
  };
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  const status = lookups.statuses?.find((s) => s.id === data.current_status_id);
  const statusFields: Field[] = [
    {
      key: 'status_id',
      label: 'Nuevo estado',
      type: 'select',
      required: true,
      options: (lookups.statuses || [])
        .filter((s) => (transitions[status?.code] || []).includes(s.code))
        .map((s) => ({ value: String(s.id), label: s.name })),
      default: '',
    },
    { key: 'note', label: 'Qué cambió', type: 'textarea', required: true, wide: true },
  ];
  return (
    <>
      <PageHeader
        back="/orders"
        eyebrow={data.code}
        title={data.title}
        description={`${name('clients', data.client_id)} · ${name('vehicles', data.vehicle_id)}`}
        actions={
          <>
            <Badge value={status?.code || ''} />
            <Button variant="outline" onClick={() => setModal('edit')}>
              <Pencil />
              Editar
            </Button>
            <Button onClick={() => setModal('status')}>
              Cambiar estado
              <ArrowRight />
            </Button>
          </>
        }
      />
      <div className="stats-grid">
        <Stat title="Precio acordado" value={currency(data.final_price)} />
        <Stat title="Cobrado" value={currency(data.finances.paid)} />
        <Stat title="Saldo pendiente" value={currency(data.finances.balance)} />
        <Stat
          title="Margen estimado"
          value={currency(data.finances.margin)}
          caption={`Costo registrado: ${currency(data.finances.total_cost)}`}
        />
      </div>
      <div className="tabs" role="tablist">
        {[
          ['detail', 'Detalle del trabajo'],
          ['materials', 'Materiales y cobros'],
          ['photos', 'Fotos del trabajo'],
          ['history', 'Historial'],
        ].map(([key, label]) => (
          <button
            role="tab"
            aria-selected={tab === key}
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'detail' && (
        <div className="detail-grid">
          <section className="panel padded">
            <h2>El trabajo acordado</h2>
            <p className="preline spaced-small">
              {data.description || 'Todavía no se registró el alcance del trabajo.'}
            </p>
            <dl className="details">
              <div>
                <dt>Servicio</dt>
                <dd>{data.service_type}</dd>
              </div>
              <div>
                <dt>Responsable</dt>
                <dd>{name('users', data.assigned_user_id)}</dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>
                  <Badge value={data.priority} />
                </dd>
              </div>
              <div>
                <dt>Entrega prevista</dt>
                <dd>{date(data.estimated_end_date)}</dd>
              </div>
              <div>
                <dt>Mano de obra</dt>
                <dd>
                  {Number(data.labor_hours)} h × {currency(data.labor_hour_cost)}
                </dd>
              </div>
              <div>
                <dt>Molde</dt>
                <dd>
                  {data.mold_id ? (
                    <Link className="text-link" to={`/molds/${data.mold_id}`}>
                      {name('molds', data.mold_id)} ↗
                    </Link>
                  ) : (
                    'Sin molde vinculado'
                  )}
                </dd>
              </div>
            </dl>
          </section>
          <section className="panel padded">
            <h2>Notas del taller</h2>
            <p className="preline spaced-small">
              {data.internal_notes ||
                'Este espacio es privado. Registrá detalles útiles para el trabajo.'}
            </p>
            <div className="hint spaced-small">
              Las fotos de esta orden son privadas. Para mostrarlas en la web, creá una publicación
              desde la galería.
            </div>
            <Button variant="outline" asChild>
              <Link to="/portfolio">
                <ImagePlus />
                Ir a la galería
              </Link>
            </Button>
          </section>
        </div>
      )}
      {tab === 'materials' && (
        <>
          <section className="panel">
            <div className="panel-title">
              <h2>Materiales consumidos</h2>
              <Button size="sm" onClick={() => setModal('consume')}>
                <Package />
                Registrar consumo
              </Button>
            </div>
            <Table
              rows={data.movements}
              columns={[
                {
                  key: 'material_id',
                  label: 'Material',
                  render: (r) => name('materials', r.material_id),
                },
                { key: 'quantity', label: 'Cantidad' },
                { key: 'unit_cost', label: 'Costo unitario', render: (r) => currency(r.unit_cost) },
                { key: 'note', label: 'Motivo' },
              ]}
            />
          </section>
          <section className="panel spaced-small">
            <div className="panel-title">
              <h2>Cobros de la orden</h2>
              {can('finance') && (
                <Button size="sm" onClick={() => setModal('payment')}>
                  <Plus />
                  Registrar cobro
                </Button>
              )}
            </div>
            <Table
              rows={data.incomes}
              columns={[
                { key: 'concept', label: 'Concepto' },
                { key: 'amount', label: 'Importe', render: (r) => currency(r.amount) },
                { key: 'paid_at', label: 'Fecha', render: (r) => date(r.paid_at, true) },
                {
                  key: 'voided_at',
                  label: 'Estado',
                  render: (r) => <Badge value={r.voided_at ? 'Anulado' : 'Registrado'} />,
                },
              ]}
            />
          </section>
        </>
      )}
      {tab === 'photos' && (
        <section className="panel padded">
          <div className="panel-title no-padding">
            <div>
              <h2>El proceso, en imágenes</h2>
              <p>Solo visibles para el equipo.</p>
            </div>
          </div>
          <form
            className="upload-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setUploading(true);
              setUploadError('');
              try {
                await api(`/orders/${id}/media`, 'POST', new FormData(form));
                form.reset();
                reload();
                notify('Foto guardada en privado.');
              } catch (err) {
                setUploadError((err as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          >
            <label className="field">
              Etapa
              <select name="stage">
                {opts('before', 'during', 'after', 'other').map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field grow">
              Imagen
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
            </label>
            <Button disabled={uploading}>
              <Upload />
              {uploading ? 'Subiendo…' : 'Subir foto'}
            </Button>
          </form>
          {uploadError && <ErrorBox message={uploadError} />}
          <div className="media-grid">
            {data.media.map((m: Row) => (
              <figure key={m.id}>
                {m.stored_file_id ? (
                  <img
                    src={`${API}/files/${m.stored_file_id}?inline=1`}
                    alt={`Foto del trabajo: ${translate(m.stage)}`}
                  />
                ) : (
                  <div className="legacy-file">Archivo de la versión anterior</div>
                )}
                <figcaption>
                  <Badge value={m.stage} />
                  {m.stored_file_id && (
                    <a target="_blank" rel="noreferrer" href={`${API}/files/${m.stored_file_id}`}>
                      Descargar ↗
                    </a>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
          {!data.media.length && (
            <Empty
              title="Guardá el antes, el proceso y el resultado"
              text="Subí fotos para documentar el trabajo. Después podés elegir cuáles publicar."
            />
          )}
        </section>
      )}
      {tab === 'history' && (
        <section className="panel">
          <Table
            rows={data.history}
            columns={[
              { key: 'createdAt', label: 'Fecha', render: (r) => date(r.createdAt, true) },
              {
                key: 'new_status_id',
                label: 'Estado',
                render: (r) => name('statuses', r.new_status_id),
              },
              {
                key: 'changed_by_user_id',
                label: 'Registrado por',
                render: (r) => name('users', r.changed_by_user_id),
              },
              { key: 'note', label: 'Detalle' },
            ]}
          />
        </section>
      )}
      <Modal
        open={!!modal}
        onClose={() => setModal('')}
        title={
          {
            edit: 'Editar trabajo',
            status: 'Actualizar estado',
            consume: 'Registrar consumo',
            payment: 'Registrar cobro',
          }[modal] || ''
        }
        wide={modal === 'edit'}
      >
        {modal === 'edit' && (
          <Form
            fields={orders}
            initial={data}
            onCancel={() => setModal('')}
            onSubmit={async (v) => {
              await api(`/orders/${id}`, 'PUT', v);
              await changed();
            }}
          />
        )}
        {modal === 'status' && (
          <Form
            fields={statusFields}
            onCancel={() => setModal('')}
            onSubmit={async (v) => {
              await api(`/orders/${id}/status`, 'POST', v);
              await changed();
            }}
          />
        )}
        {modal === 'consume' && (
          <Form
            fields={[
              { key: 'material_id', label: 'Material', lookup: 'materials', required: true },
              {
                key: 'quantity',
                label: 'Cantidad a consumir',
                type: 'number',
                required: true,
                min: 0.01,
              },
              { key: 'note', label: 'Uso / pieza', required: true, wide: true },
            ]}
            onSubmit={async (v) => {
              await api(`/orders/${id}/consume`, 'POST', v);
              await changed();
            }}
          />
        )}
        {modal === 'payment' && (
          <Form
            fields={[
              { key: 'concept', label: 'Concepto', required: true, default: `Cobro ${data.code}` },
              {
                key: 'amount',
                label: 'Importe (ARS)',
                type: 'number',
                required: true,
                default: Number(data.finances.balance),
              },
              {
                key: 'payment_method',
                label: 'Medio de pago',
                type: 'select',
                options: opts('transfer', 'cash', 'card', 'other'),
                default: 'transfer',
              },
              {
                key: 'paid_at',
                label: 'Fecha y hora',
                type: 'datetime-local',
                required: true,
                default: new Date().toISOString(),
              },
            ]}
            onSubmit={async (v) => {
              await api('/finance/incomes', 'POST', { ...v, work_order_id: data.id });
              await changed();
            }}
          />
        )}
      </Modal>
    </>
  );
}
