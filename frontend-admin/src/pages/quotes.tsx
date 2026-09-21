import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Download, Trash2, FileText, Check, Copy, Send, Pencil } from 'lucide-react';
import { api, useData } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { currency, date, download, type Row } from '@/lib/utils';
import { type Field } from '@/lib/resources';
import { PageHeader, Loading, ErrorBox, Badge, Table, Confirm } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
const fields: Field[] = [
  { key: 'client_id', label: 'Cliente', lookup: 'clients', required: true },
  { key: 'vehicle_id', label: 'Vehículo', lookup: 'vehicles' },
  { key: 'valid_until', label: 'Válido hasta', type: 'date' },
  { key: 'discount', label: 'Descuento (ARS)', type: 'number', default: 0 },
  { key: 'tax_rate', label: 'Impuestos (%)', type: 'number', default: 0, max: 100 },
  { key: 'notes', label: 'Condiciones y observaciones', type: 'textarea', wide: true },
];
function QuoteForm({
  initial,
  onDone,
  onCancel,
}: {
  initial: Row;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<Row[]>(
    initial.items || [{ description: 'Tapizado de volante', quantity: 1, unit_price: 0 }],
  );
  const update = (i: number, k: string, v: unknown) =>
    setItems((rows) => rows.map((r, index) => (index === i ? { ...r, [k]: v } : r)));
  return (
    <Form
      fields={fields}
      initial={initial}
      onCancel={onCancel}
      onSubmit={async (values) => {
        await api(`/quotes${initial.id ? '/' + initial.id : ''}`, initial.id ? 'PUT' : 'POST', {
          ...values,
          lead_id: initial.lead_id || null,
          items: items.map((i) => ({
            ...i,
            quantity: Number(i.quantity),
            unit_price: Number(i.unit_price),
          })),
        });
        onDone();
      }}
    >
      <div className="quote-lines">
        <h3>Detalle del presupuesto</h3>
        {items.map((item, i) => (
          <div className="quote-line" key={i}>
            <label className="field grow">
              Descripción
              <input
                required
                minLength={2}
                maxLength={180}
                value={item.description}
                onChange={(e) => update(i, 'description', e.target.value)}
              />
            </label>
            <label className="field narrow">
              Cantidad
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(e) => update(i, 'quantity', e.target.value)}
              />
            </label>
            <label className="field">
              Precio unitario
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => update(i, 'unit_price', e.target.value)}
              />
            </label>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Eliminar ítem ${i + 1}`}
              disabled={items.length === 1}
              onClick={() => setItems((rows) => rows.filter((_, n) => n !== i))}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <div className="spread">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItems((rows) => [...rows, { description: '', quantity: 1, unit_price: 0 }])
            }
          >
            <Plus />
            Agregar ítem
          </Button>
          <span className="text-small muted">
            Subtotal estimado:{' '}
            {currency(items.reduce((a, i) => a + Number(i.quantity) * Number(i.unit_price), 0))}
          </span>
        </div>
      </div>
    </Form>
  );
}
export default function Quotes() {
  const { data, loading, error, reload } = useData('/quotes?pageSize=500');
  const { name, refresh, notify } = useWorkshop();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<Row | null>(null),
    [edit, setEdit] = useState<Row | null>(null),
    [action, setAction] = useState(''),
    [actionError, setActionError] = useState('');
  useEffect(() => {
    if (params.get('client_id')) {
      setEdit({
        client_id: Number(params.get('client_id')),
        lead_id: params.get('lead_id') ? Number(params.get('lead_id')) : null,
      });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);
  const done = () => {
    setEdit(null);
    setSelected(null);
    reload();
    notify('Presupuesto guardado.');
  };
  if (error) return <ErrorBox message={error} retry={reload} />;
  return (
    <>
      <PageHeader
        eyebrow="ACORDAR PARA TRABAJAR MEJOR"
        title="Presupuestos"
        description="Propuestas claras, versiones registradas y aceptación con seguimiento."
        actions={
          <Button onClick={() => setEdit({})}>
            <Plus />
            Nuevo presupuesto
          </Button>
        }
      />
      <section className="panel">
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              {
                key: 'code',
                label: 'Presupuesto',
                render: (r) => (
                  <div className="row-name">
                    <strong>{r.code}</strong>
                    <small>Versión {r.version}</small>
                  </div>
                ),
              },
              { key: 'client_id', label: 'Cliente', render: (r) => name('clients', r.client_id) },
              { key: 'status', label: 'Estado', render: (r) => <Badge value={r.status} /> },
              { key: 'valid_until', label: 'Vigencia', render: (r) => date(r.valid_until) },
              { key: 'total', label: 'Total', render: (r) => currency(r.total) },
            ]}
            onRow={(r) => {
              setSelected(r);
              setActionError('');
            }}
          />
        )}
      </section>
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Editar borrador' : 'Nuevo presupuesto'}
        wide
      >
        {edit && (
          <QuoteForm
            key={edit.id || 'new'}
            initial={edit}
            onDone={done}
            onCancel={() => setEdit(null)}
          />
        )}
      </Modal>
      <Modal
        open={!!selected && !edit}
        onClose={() => setSelected(null)}
        title={selected?.code || 'Presupuesto'}
        description="Los importes se calculan en el servidor. Un presupuesto aceptado genera una única orden de trabajo."
        wide
      >
        {selected && (
          <>
            <div className="spread">
              <strong>{name('clients', selected.client_id)}</strong>
              <Badge value={selected.status} />
            </div>
            <Table
              rows={selected.items.map((i: Row, index: number) => ({ ...i, id: index }))}
              columns={[
                { key: 'description', label: 'Detalle' },
                { key: 'quantity', label: 'Cantidad' },
                {
                  key: 'unit_price',
                  label: 'Precio unitario',
                  render: (r) => currency(r.unit_price),
                },
                {
                  key: 'total',
                  label: 'Importe',
                  render: (r) => currency(Number(r.quantity) * Number(r.unit_price)),
                },
              ]}
            />
            <div className="quote-totals">
              <span>
                Subtotal <b>{currency(selected.subtotal)}</b>
              </span>
              <span>
                Descuento <b>{currency(selected.discount)}</b>
              </span>
              <span>
                Impuestos <b>{Number(selected.tax_rate)}%</b>
              </span>
              <strong>
                Total <b>{currency(selected.total)}</b>
              </strong>
            </div>
            <p className="preline">{selected.notes}</p>
            {selected.acceptance_note && (
              <div className="hint">Aceptación: {selected.acceptance_note}</div>
            )}
            {actionError && <ErrorBox message={actionError} />}
            <div className="form-actions wrap">
              <Button variant="outline" onClick={() => download(`/quotes/${selected.id}/pdf`)}>
                <Download />
                PDF
              </Button>
              {selected.status === 'draft' && (
                <>
                  <Button variant="outline" onClick={() => setEdit(selected)}>
                    <Pencil />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={() => setAction('sent')}>
                    <Send />
                    Marcar enviado
                  </Button>
                </>
              )}
              {selected.status === 'sent' && (
                <>
                  <Button onClick={() => setAction('accepted')}>
                    <Check />
                    Registrar aceptación
                  </Button>
                  <Button variant="outline" onClick={() => setAction('rejected')}>
                    No aceptado
                  </Button>
                </>
              )}
              {['draft', 'sent', 'rejected'].includes(selected.status) && (
                <Button variant="outline" onClick={() => setAction('revise')}>
                  <Copy />
                  Crear revisión
                </Button>
              )}
              {selected.work_order_id && (
                <Button asChild>
                  <Link to={`/orders/${selected.work_order_id}`}>Abrir orden ↗</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>
      <Confirm
        open={!!action}
        onClose={() => setAction('')}
        title={
          {
            sent: 'Marcar como enviado',
            accepted: 'Registrar aceptación del cliente',
            rejected: 'Marcar como no aceptado',
            revise: 'Crear una nueva versión',
          }[action] || ''
        }
        reason={action === 'accepted'}
        description={
          {
            sent: 'Confirmá que ya compartiste este presupuesto con el cliente. Este botón registra el estado; no envía emails.',
            accepted:
              'Indicá cómo y cuándo aceptó el cliente. Se creará la orden con el precio y los ítems acordados.',
            rejected: 'El presupuesto quedará registrado como no aceptado.',
            revise:
              'Se conservará la versión actual como reemplazada y se abrirá un nuevo borrador.',
          }[action] || ''
        }
        onConfirm={async (reason) => {
          if (action === 'revise') {
            const row = await api(`/quotes/${selected?.id}/revise`, 'POST');
            setEdit(row);
            setSelected(null);
            reload();
          } else {
            const row = await api(`/quotes/${selected?.id}/status`, 'POST', {
              status: action,
              acceptance_note: reason,
            });
            setSelected(row);
            reload();
            await refresh();
            if (action === 'accepted') notify('Presupuesto aceptado. La orden ya está creada.');
          }
        }}
      />
    </>
  );
}
