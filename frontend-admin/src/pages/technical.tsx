import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Upload, Download, CheckCircle2, Printer, Plus, FileText } from 'lucide-react';
import { api, useData, API } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { resources, opts } from '@/lib/resources';
import { currency, date, number, download, type Row } from '@/lib/utils';
import {
  PageHeader,
  Loading,
  ErrorBox,
  Badge,
  Table,
  Empty,
  Stat,
  Confirm,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
export function Mold() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/molds/${id}`);
  const { name, refresh, notify } = useWorkshop();
  const [edit, setEdit] = useState(false),
    [validate, setValidate] = useState<Row | null>(null),
    [busy, setBusy] = useState(false),
    [uploadError, setUploadError] = useState('');
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        back="/molds"
        eyebrow={data.code}
        title={data.title}
        description={`${name('brands', data.brand_id)} · ${name('models', data.model_id)} · ${data.year_from || '—'} a ${data.year_to || '—'}`}
        actions={
          <>
            <Badge value={data.is_reference_verified ? 'verified' : 'pending'} />
            <Button variant="outline" onClick={() => setEdit(true)}>
              <Pencil />
              Editar ficha
            </Button>
          </>
        }
      />
      <div className="detail-grid">
        <section className="panel padded">
          <h2>La ficha técnica</h2>
          <dl className="details">
            <div>
              <dt>Pieza</dt>
              <dd>{name('parts', data.technical_part_id)}</dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{data.material_reference || '—'}</dd>
            </div>
            <div>
              <dt>Versión del vehículo</dt>
              <dd>{data.version_label || '—'}</dd>
            </div>
          </dl>
          <h3 className="spaced-small">Medidas y costuras</h3>
          <p className="preline">
            {data.dimensions_notes || 'Completá las medidas, unidades y márgenes de costura.'}
          </p>
          <h3 className="spaced-small">Notas de confección</h3>
          <p className="preline">{data.technical_notes || 'Sin notas.'}</p>
          <h3 className="spaced-small">Impresión</h3>
          <p className="preline">{data.print_notes || 'Imprimir al 100%, sin ajustar a página.'}</p>
        </section>
        <section className="panel padded">
          <h2>Un respaldo que respeta la escala</h2>
          <p className="spaced-small">
            Guardá el PDF maestro a tamaño real, el SVG o DXF editable y las fotos de referencia.
          </p>
          <ol className="steps">
            <li>Incluí una referencia de 100 mm en el PDF.</li>
            <li>
              Imprimí en tamaño real, sin ajustar a página. Para piezas grandes, usá impresión en
              mosaico.
            </li>
            <li>Medí la referencia con una regla y contrastá el molde con la pieza física.</li>
            <li>Registrá esa verificación para habilitar la impresión de esa versión.</li>
          </ol>
          <div className="hint">
            Una foto no garantiza escala 1:1. El sistema conserva los originales; la verificación de
            medidas se hace en el taller.
          </div>
        </section>
      </div>
      <section className="panel padded spaced-small">
        <h2>Archivos y versiones</h2>
        <form
          className="upload-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setBusy(true);
            setUploadError('');
            try {
              await api(`/molds/${id}/files`, 'POST', new FormData(form));
              form.reset();
              reload();
              notify('Nueva versión guardada.');
            } catch (err) {
              setUploadError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field grow">
            Original (PDF, SVG, DXF o imagen)
            <input type="file" name="file" accept=".pdf,.svg,.dxf,.jpg,.jpeg,.png,.webp" required />
          </label>
          <label className="field">
            Descripción de la versión
            <input name="title" placeholder="Ej.: Ajuste del margen de costura" maxLength={180} />
          </label>
          <Button disabled={busy}>
            <Upload />
            {busy ? 'Subiendo…' : 'Guardar versión'}
          </Button>
        </form>
        {uploadError && <ErrorBox message={uploadError} />}
        <Table
          rows={data.files}
          columns={[
            {
              key: 'title',
              label: 'Archivo',
              render: (r) => (
                <div className="row-name">
                  <strong>{r.title || r.original_name}</strong>
                  <small>
                    {r.original_name} · {Math.round((r.file_size || 0) / 1024)} KB
                  </small>
                </div>
              ),
            },
            { key: 'file_type', label: 'Tipo', render: (r) => <Badge value={r.file_type} /> },
            {
              key: 'version_number',
              label: 'Versión',
              render: (r) => `v${r.version_number}${r.is_current ? ' · actual' : ''}`,
            },
            {
              key: 'validation_status',
              label: 'Verificación',
              render: (r) => <Badge value={r.validation_status} />,
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (r) => (
                <div className="actions">
                  {r.stored_file_id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => download(`/files/${r.stored_file_id}`)}
                    >
                      <Download />
                      Original
                    </Button>
                  ) : (
                    <span className="muted">Reimportar archivo anterior</span>
                  )}
                  {r.file_type === 'master_pdf' &&
                    r.is_current &&
                    r.stored_file_id &&
                    (r.validation_status === 'verified' ? (
                      <Button
                        size="sm"
                        onClick={() => download(`/molds/${id}/files/${r.id}/print`)}
                      >
                        <Printer />
                        PDF 1:1
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setValidate(r)}>
                        <CheckCircle2 />
                        Verificar
                      </Button>
                    ))}
                </div>
              ),
            },
          ]}
        />
      </section>
      <Modal open={edit} onClose={() => setEdit(false)} title="Editar molde" wide>
        {edit && (
          <Form
            fields={resources.molds.fields}
            initial={data}
            onSubmit={async (v) => {
              await api(`/molds/${id}`, 'PUT', v);
              setEdit(false);
              reload();
              await refresh();
            }}
          />
        )}
      </Modal>
      <Modal
        open={!!validate}
        onClose={() => setValidate(null)}
        title="Registrar verificación física"
        description="Comprobá el PDF impreso en tamaño real antes de confirmar."
      >
        {validate && (
          <Form
            fields={[
              {
                key: 'measured_mm',
                label: 'Medida real de la referencia de 100 mm',
                type: 'number',
                min: 99.5,
                max: 100.5,
                required: true,
                help: 'Tolerancia admitida: 99,5 a 100,5 mm.',
              },
              {
                key: 'notes',
                label: 'Resultado de la prueba y observaciones',
                type: 'textarea',
                required: true,
                wide: true,
              },
              {
                key: 'physical_check',
                label: 'Medí el papel y verifiqué el molde contra la pieza física',
                type: 'checkbox',
                default: false,
              },
            ]}
            onSubmit={async (v) => {
              await api(`/molds/${id}/files/${validate.id}/validate`, 'POST', v);
              setValidate(null);
              reload();
              notify('Versión verificada para impresión 1:1.');
            }}
          />
        )}
      </Modal>
    </>
  );
}
export function Material() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/materials/${id}`);
  const ledger = useData(`/inventory?material_id=${id}&pageSize=100`);
  const { can, refresh } = useWorkshop();
  const [modal, setModal] = useState('');
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        back="/materials"
        eyebrow={data.code}
        title={data.name}
        description={`${data.color || 'Sin color'} · ${data.storage_location || 'Sin ubicación'}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setModal('edit')}>
              <Pencil />
              Editar
            </Button>
            {can('settings') && (
              <Button onClick={() => setModal('movement')}>
                <Plus />
                Movimiento de stock
              </Button>
            )}
          </>
        }
      />
      <div className="stats-grid three">
        <Stat title="Stock disponible" value={`${number(data.stock_current)} ${data.unit}`} />
        <Stat title="Mínimo de reposición" value={`${number(data.stock_minimum)} ${data.unit}`} />
        <Stat title="Costo por unidad" value={currency(data.cost_reference)} />
      </div>
      <section className="panel">
        <div className="panel-title">
          <h2>Movimientos del material</h2>
          <span className="muted text-small">Últimos 100 registros</span>
        </div>
        {ledger.error ? (
          <ErrorBox message={ledger.error} />
        ) : (
          <Table
            rows={ledger.data || []}
            columns={[
              { key: 'createdAt', label: 'Fecha', render: (r) => date(r.createdAt, true) },
              {
                key: 'movement_type',
                label: 'Tipo',
                render: (r) => <Badge value={r.movement_type} />,
              },
              { key: 'quantity', label: 'Cantidad' },
              { key: 'unit_cost', label: 'Costo unitario', render: (r) => currency(r.unit_cost) },
              { key: 'note', label: 'Detalle' },
            ]}
          />
        )}
      </section>
      <div className="hint spaced-small">
        Los consumos de trabajos se cargan desde cada orden. Recibir una compra suma existencias;
        pagarla se registra por separado en caja.
      </div>
      <Modal
        open={!!modal}
        onClose={() => setModal('')}
        title={modal === 'edit' ? 'Editar material' : 'Movimiento de inventario'}
        wide={modal === 'edit'}
      >
        {modal === 'edit' ? (
          <Form
            fields={resources.materials.fields}
            initial={data}
            onSubmit={async (v) => {
              await api(`/materials/${id}`, 'PUT', v);
              setModal('');
              reload();
              await refresh();
            }}
          />
        ) : modal === 'movement' ? (
          <Form
            fields={[
              {
                key: 'movement_type',
                label: 'Movimiento',
                type: 'select',
                options: opts('in', 'out', 'adjustment'),
                default: 'in',
              },
              {
                key: 'quantity',
                label: 'Cantidad (en ajuste: nuevo stock total)',
                type: 'number',
                required: true,
              },
              {
                key: 'unit_cost',
                label: 'Costo unitario de la entrada (ARS)',
                type: 'number',
                default: Number(data.cost_reference),
              },
              { key: 'note', label: 'Motivo', type: 'textarea', required: true, wide: true },
            ]}
            onSubmit={async (v) => {
              await api('/inventory', 'POST', { ...v, material_id: Number(id) });
              setModal('');
              reload();
              ledger.reload();
              await refresh();
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}
export function Client() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/clients/${id}`);
  const jobs = useData(`/orders?client_id=${id}&pageSize=100`);
  const { refresh } = useWorkshop();
  const [edit, setEdit] = useState(false);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        back="/clients"
        title={data.company_name || [data.first_name, data.last_name].filter(Boolean).join(' ')}
        description={[data.phone, data.email, data.city].filter(Boolean).join(' · ')}
        actions={
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil />
            Editar cliente
          </Button>
        }
      />
      <div className="detail-grid">
        <section className="panel padded">
          <h2>Ficha del cliente</h2>
          <dl className="details">
            <div>
              <dt>Tipo</dt>
              <dd>
                <Badge value={data.client_type} />
              </dd>
            </div>
            <div>
              <dt>Empresa</dt>
              <dd>
                <Badge value={data.company_kind} />
              </dd>
            </div>
            <div>
              <dt>CUIT / documento</dt>
              <dd>{data.tax_id || '—'}</dd>
            </div>
            <div>
              <dt>Condiciones de pago</dt>
              <dd>{data.payment_terms || 'A convenir'}</dd>
            </div>
            <div>
              <dt>Crédito de referencia</dt>
              <dd>{currency(data.credit_limit)}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{data.address || '—'}</dd>
            </div>
          </dl>
          <p className="preline">{data.notes}</p>
        </section>
        <section className="panel">
          <div className="panel-title">
            <h2>Sus vehículos</h2>
            <Link to="/vehicles" className="text-link">
              Gestionar ↗
            </Link>
          </div>
          <Table
            rows={data.vehicles}
            columns={[
              { key: 'nickname', label: 'Vehículo' },
              { key: 'plate', label: 'Patente' },
              { key: 'year', label: 'Año' },
            ]}
          />
        </section>
      </div>
      <section className="panel spaced-small">
        <div className="panel-title">
          <h2>Historial de trabajos</h2>
        </div>
        <Table
          rows={jobs.data || []}
          columns={[
            {
              key: 'code',
              label: 'Orden',
              render: (r) => (
                <Link to={`/orders/${r.id}`} className="text-link">
                  {r.code} ↗
                </Link>
              ),
            },
            { key: 'title', label: 'Trabajo' },
            {
              key: 'final_price',
              label: 'Precio acordado',
              render: (r) => currency(r.final_price),
            },
            {
              key: 'estimated_end_date',
              label: 'Entrega',
              render: (r) => date(r.estimated_end_date),
            },
          ]}
        />
      </section>
      <Modal open={edit} onClose={() => setEdit(false)} title="Editar cliente" wide>
        {edit && (
          <Form
            fields={resources.clients.fields}
            initial={data}
            onSubmit={async (v) => {
              await api(`/clients/${id}`, 'PUT', v);
              setEdit(false);
              reload();
              await refresh();
            }}
          />
        )}
      </Modal>
    </>
  );
}
