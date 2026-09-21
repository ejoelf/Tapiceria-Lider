import { lazy, Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Check,
  PackageCheck,
} from 'lucide-react';
import { api, useData } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { opts, type Field } from '@/lib/resources';
import { currency, date, today, download, type Row } from '@/lib/utils';
import {
  PageHeader,
  Stat,
  Loading,
  ErrorBox,
  Badge,
  Table,
  Confirm,
  Empty,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
const FinanceChart = lazy(() => import('./finance-chart'));
export function paymentFields(income: boolean): Field[] {
  return [
    { key: 'concept', label: 'Concepto', required: true, wide: true },
    { key: 'amount', label: 'Importe (ARS)', type: 'number', required: true, min: 0.01 },
    {
      key: 'payment_method',
      label: 'Medio de pago',
      type: 'select',
      options: opts('transfer', 'cash', 'card', 'other'),
      default: 'transfer',
    },
    {
      key: income ? 'paid_at' : 'spent_at',
      label: 'Fecha y hora',
      type: 'datetime-local',
      required: true,
      default: new Date().toISOString(),
    },
    { key: 'work_order_id', label: 'Orden de trabajo', lookup: 'orders' },
    ...(!income
      ? [
          { key: 'supplier_id', label: 'Proveedor', lookup: 'suppliers' },
          { key: 'purchase_id', label: 'Nº de compra (opcional)', type: 'number' },
          {
            key: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
              'general',
              'alquiler',
              'servicios',
              'herramientas',
              'transporte',
              'otros',
            ].map((v) => ({ value: v, label: v })),
            default: 'general',
          },
        ]
      : []),
    { key: 'notes', label: 'Notas', type: 'textarea', wide: true },
  ];
}
export default function Finance() {
  const { data, loading, error, reload } = useData('/finance/summary');
  const [tab, setTab] = useState('summary'),
    [create, setCreate] = useState(''),
    [voidRow, setVoidRow] = useState<Row | null>(null);
  const ledger = useData(
    tab === 'incomes' || tab === 'expenses' ? `/finance/${tab}?pageSize=500` : null,
  );
  const { can, notify } = useWorkshop();
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        eyebrow="LOS NÚMEROS, CLAROS"
        title="Finanzas del taller"
        description="Cobros, gastos y rentabilidad. Todo en pesos argentinos."
        actions={
          <>
            <Button variant="outline" onClick={() => setCreate('expenses')}>
              <ArrowUpRight />
              Registrar gasto
            </Button>
            <Button onClick={() => setCreate('incomes')}>
              <ArrowDownLeft />
              Registrar cobro
            </Button>
          </>
        }
      />
      <div className="stats-grid">
        <Stat
          title="Saldo de caja"
          value={currency(data.cash_balance)}
          caption="Cobros − gastos + aportes − retiros"
          icon={<Wallet />}
        />
        <Stat
          title="Por cobrar"
          value={currency(data.receivables)}
          caption="Saldo de las órdenes no canceladas"
        />
        <Stat
          title="Por pagar"
          value={currency(data.payables)}
          caption="Compras pendientes de pago"
        />
        <Stat
          title="Margen operativo estimado"
          value={currency(data.operating_margin)}
          caption="Trabajos terminados menos costos registrados"
        />
      </div>
      <div className="tabs" role="tablist">
        {[
          ['summary', 'Resumen'],
          ['incomes', 'Cobros'],
          ['expenses', 'Gastos'],
          ['receivables', 'Cuentas por cobrar'],
          ['payables', 'Cuentas por pagar'],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={key === tab}
            className={key === tab ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'summary' && (
        <div className="detail-grid">
          <section className="panel padded">
            <h2>Cobros y gastos por mes</h2>
            <p className="muted text-small">Hasta los últimos 12 meses con movimientos.</p>
            {data.months.length ? (
              <Suspense fallback={<Loading />}>
                <FinanceChart months={data.months} />
              </Suspense>
            ) : (
              <Empty
                title="Tus números van a contar una historia"
                text="Registrá cobros y gastos para ver su evolución."
              />
            )}
          </section>
          <section className="panel padded">
            <h2>Lo que entra y lo que sale</h2>
            <dl className="details">
              <div>
                <dt>Cobros acumulados</dt>
                <dd>{currency(data.collected)}</dd>
              </div>
              <div>
                <dt>Gastos pagados</dt>
                <dd>{currency(data.spent)}</dd>
              </div>
              <div>
                <dt>Aportes de socios</dt>
                <dd>{currency(data.contributions)}</dd>
              </div>
              <div>
                <dt>Retiros de socios</dt>
                <dd>{currency(data.withdrawals)}</dd>
              </div>
            </dl>
            <div className="hint">
              Caja y ganancia son distintas. Los materiales se reconocen como costo cuando se
              consumen; los aportes y retiros no alteran el margen. Es una vista de gestión, no un
              balance contable.
            </div>
            <Button variant="outline" asChild>
              <Link to="/partners">Ver movimientos de socios ↗</Link>
            </Button>
          </section>
        </div>
      )}
      {['incomes', 'expenses'].includes(tab) && (
        <section className="panel">
          <div className="panel-title">
            <h2>{tab === 'incomes' ? 'Cobros registrados' : 'Gastos registrados'}</h2>
            <Button size="sm" variant="outline" onClick={() => download(`/finance/export/${tab}`)}>
              <Download />
              Exportar CSV
            </Button>
          </div>
          {ledger.error ? (
            <ErrorBox message={ledger.error} />
          ) : ledger.loading ? (
            <Loading />
          ) : (
            <Table
              rows={ledger.data || []}
              columns={[
                { key: 'concept', label: 'Concepto' },
                {
                  key: tab === 'incomes' ? 'paid_at' : 'spent_at',
                  label: 'Fecha',
                  render: (r) => date(r.paid_at || r.spent_at, true),
                },
                { key: 'amount', label: 'Importe', render: (r) => currency(r.amount) },
                {
                  key: 'payment_method',
                  label: 'Medio',
                  render: (r) => <Badge value={r.payment_method} />,
                },
                {
                  key: 'voided_at',
                  label: 'Estado',
                  render: (r) =>
                    r.voided_at ? (
                      <Badge value="Anulado" />
                    ) : can('settings') ? (
                      <Button variant="ghost" size="sm" onClick={() => setVoidRow(r)}>
                        Anular
                      </Button>
                    ) : (
                      <Badge value="Registrado" />
                    ),
                },
              ]}
            />
          )}
        </section>
      )}
      {tab === 'receivables' && (
        <section className="panel">
          <Table
            rows={data.orders.filter((o: Row) => Number(o.balance) > 0)}
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
              { key: 'final_price', label: 'Acordado', render: (r) => currency(r.final_price) },
              { key: 'paid', label: 'Cobrado', render: (r) => currency(r.paid) },
              {
                key: 'balance',
                label: 'Pendiente',
                render: (r) => <strong>{currency(r.balance)}</strong>,
              },
            ]}
          />
        </section>
      )}
      {tab === 'payables' && (
        <section className="panel">
          <Table
            rows={data.purchases.filter((p: Row) => Number(p.balance) > 0)}
            columns={[
              {
                key: 'id',
                label: 'Compra',
                render: (r) => (
                  <Link className="text-link" to={`/purchases/${r.id}`}>
                    Compra #{r.id} ↗
                  </Link>
                ),
              },
              { key: 'total', label: 'Total', render: (r) => currency(r.total) },
              { key: 'paid', label: 'Pagado', render: (r) => currency(r.paid) },
              {
                key: 'balance',
                label: 'Pendiente',
                render: (r) => <strong>{currency(r.balance)}</strong>,
              },
            ]}
          />
        </section>
      )}
      <Modal
        open={!!create}
        onClose={() => setCreate('')}
        title={create === 'incomes' ? 'Registrar cobro' : 'Registrar gasto'}
        wide
      >
        {create && (
          <Form
            fields={paymentFields(create === 'incomes')}
            onSubmit={async (v) => {
              await api(`/finance/${create}`, 'POST', v);
              setCreate('');
              reload();
              ledger.reload();
              notify('Movimiento registrado.');
            }}
          />
        )}
      </Modal>
      <Confirm
        open={!!voidRow}
        onClose={() => setVoidRow(null)}
        title="Anular movimiento"
        description="El registro se conserva para auditoría y deja de afectar los totales. No mueve dinero en una cuenta bancaria."
        reason
        destructive
        onConfirm={async (reason) => {
          await api(`/finance/${tab}/${voidRow?.id}/void`, 'POST', { reason });
          reload();
          ledger.reload();
          notify('Movimiento anulado.');
        }}
      />
    </>
  );
}
export function Partners() {
  const { data, loading, error, reload } = useData('/partners?pageSize=500');
  const [create, setCreate] = useState(false),
    [voidRow, setVoidRow] = useState<Row | null>(null);
  const { can } = useWorkshop();
  return (
    <>
      <PageHeader
        eyebrow="CUENTAS ENTRE SOCIOS"
        title="Aportes y retiros"
        description="El dinero de los socios, separado del resultado del negocio."
        actions={
          can('settings') && (
            <Button onClick={() => setCreate(true)}>
              <Plus />
              Nuevo movimiento
            </Button>
          )
        }
      />
      <section className="panel">
        <div className="panel-title">
          <h2>Movimientos registrados</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => download('/finance/export/partner_movements')}
          >
            <Download />
            Exportar
          </Button>
        </div>
        {error ? (
          <ErrorBox message={error} />
        ) : loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              { key: 'partner', label: 'Socio' },
              { key: 'date', label: 'Fecha', render: (r) => date(r.date) },
              { key: 'type', label: 'Movimiento', render: (r) => <Badge value={r.type} /> },
              { key: 'concept', label: 'Concepto' },
              { key: 'amount', label: 'Importe', render: (r) => currency(r.amount) },
              {
                key: 'voided_at',
                label: 'Estado',
                render: (r) =>
                  r.voided_at ? (
                    <Badge value="Anulado" />
                  ) : can('settings') ? (
                    <Button size="sm" variant="ghost" onClick={() => setVoidRow(r)}>
                      Anular
                    </Button>
                  ) : (
                    'Registrado'
                  ),
              },
            ]}
          />
        )}
      </section>
      <Modal open={create} onClose={() => setCreate(false)} title="Movimiento de socio">
        <Form
          fields={[
            {
              key: 'partner',
              label: 'Socio',
              type: 'select',
              options: [
                { value: 'Joel', label: 'Joel' },
                { value: 'Lucas', label: 'Lucas' },
              ],
              default: 'Joel',
            },
            {
              key: 'type',
              label: 'Tipo',
              type: 'select',
              options: opts('contribution', 'withdrawal'),
              default: 'contribution',
            },
            { key: 'amount', label: 'Importe (ARS)', type: 'number', required: true, min: 0.01 },
            { key: 'date', label: 'Fecha', type: 'date', required: true, default: today() },
            { key: 'concept', label: 'Concepto', required: true, wide: true },
            { key: 'notes', label: 'Notas', type: 'textarea', wide: true },
          ]}
          onSubmit={async (v) => {
            await api('/partners', 'POST', v);
            setCreate(false);
            reload();
          }}
        />
      </Modal>
      <Confirm
        open={!!voidRow}
        onClose={() => setVoidRow(null)}
        title="Anular movimiento de socio"
        description="El movimiento se conserva en el historial y deja de afectar la caja."
        reason
        onConfirm={async (reason) => {
          await api(`/partners/${voidRow?.id}/void`, 'POST', { reason });
          reload();
        }}
      />
    </>
  );
}
export function Purchase() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/purchases/${id}`);
  const { name, refresh, notify, can } = useWorkshop();
  const [action, setAction] = useState(''),
    [payment, setPayment] = useState(false);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        back="/purchases"
        eyebrow="REPOSICIÓN DEL TALLER"
        title={`Compra #${data.id}`}
        description={name('suppliers', data.supplier_id)}
        actions={
          <>
            <Badge value={data.status} />
            {data.status === 'ordered' && (
              <>
                <Button variant="outline" onClick={() => setAction('cancel')}>
                  Cancelar compra
                </Button>
                <Button onClick={() => setAction('receive')}>
                  <PackageCheck />
                  Recibir material
                </Button>
              </>
            )}
            {data.status !== 'cancelled' && can('finance') && (
              <Button variant="outline" onClick={() => setPayment(true)}>
                Registrar pago
              </Button>
            )}
          </>
        }
      />
      <div className="stats-grid three">
        <Stat title="Material" value={name('materials', data.material_id)} />
        <Stat title="Cantidad" value={Number(data.quantity)} />
        <Stat
          title="Total"
          value={currency(data.total)}
          caption={`Costo unitario: ${currency(data.unit_cost)}`}
        />
      </div>
      <section className="panel padded">
        <h2>Seguimiento de la compra</h2>
        <p className="spaced-small">
          {data.received_at
            ? `Recibida el ${date(data.received_at, true)}.`
            : 'Todavía no se recibieron los materiales.'}
        </p>
        <p className="preline">{data.notes}</p>
        <div className="hint spaced-small">
          Recibir material actualiza el inventario una sola vez. Los pagos se registran por separado
          para llevar el saldo del proveedor.
        </div>
      </section>
      <section className="panel spaced-small">
        <div className="panel-title">
          <h2>Pagos de esta compra</h2>
          <strong>Saldo: {currency(data.balance)}</strong>
        </div>
        <Table
          rows={data.payments || []}
          columns={[
            { key: 'concept', label: 'Concepto' },
            { key: 'spent_at', label: 'Fecha', render: (r) => date(r.spent_at, true) },
            { key: 'amount', label: 'Importe', render: (r) => currency(r.amount) },
            {
              key: 'voided_at',
              label: 'Estado',
              render: (r) => <Badge value={r.voided_at ? 'Anulado' : 'Registrado'} />,
            },
          ]}
        />
      </section>
      <Confirm
        open={!!action}
        onClose={() => setAction('')}
        title={action === 'receive' ? 'Recibir los materiales' : 'Cancelar compra'}
        description={
          action === 'receive'
            ? 'Se sumarán las existencias al inventario y se actualizará el costo promedio. Confirmá que recibiste el pedido completo.'
            : 'La compra pendiente quedará cancelada.'
        }
        onConfirm={async () => {
          await api(`/purchases/${id}/${action}`, 'POST');
          reload();
          await refresh();
          notify('Compra actualizada.');
        }}
      />
      <Modal open={payment} onClose={() => setPayment(false)} title="Registrar pago al proveedor">
        <Form
          fields={paymentFields(false).filter(
            (f) => !['work_order_id', 'supplier_id', 'purchase_id', 'category'].includes(f.key),
          )}
          initial={{ concept: `Pago compra #${data.id}`, amount: Number(data.balance) }}
          onSubmit={async (v) => {
            await api('/finance/expenses', 'POST', { ...v, purchase_id: Number(id) });
            setPayment(false);
            reload();
            notify('Pago registrado.');
          }}
        />
      </Modal>
    </>
  );
}
