import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  Car,
  Users,
  Inbox,
  Clock,
  PackageCheck,
  CalendarDays,
  ArrowRight,
  Scissors,
} from 'lucide-react';
import { useData } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { currency, date } from '@/lib/utils';
import { PageHeader, Stat, Loading, ErrorBox, Badge, Empty } from '@/components/common';
import { Button } from '@/components/ui/button';
export default function Dashboard() {
  const { user, name, can } = useWorkshop();
  const { data, loading, error, reload } = useData('/dashboard');
  const finance = useData(can('finance') ? '/finance/summary' : null);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        eyebrow="UN NUEVO DÍA EN EL TALLER"
        title={`Hola, ${user.first_name}.`}
        description="Cada detalle cuenta. Acá tenés lo que pasa hoy en Líder."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/leads">
                <Inbox />
                Ver consultas
              </Link>
            </Button>
            <Button asChild>
              <Link to="/orders">
                <Plus />
                Nuevo trabajo
              </Link>
            </Button>
          </>
        }
      />
      <div className="stats-grid">
        <Stat
          title="Trabajos en curso"
          value={data.active_orders}
          caption="En el taller, desde la recepción"
          icon={<Car />}
        />
        <Stat
          title="Consultas nuevas"
          value={data.new_leads}
          caption="Nuevas oportunidades por responder"
          icon={<Inbox />}
        />
        <Stat
          title="Entregas demoradas"
          value={data.overdue}
          caption="Revisá las fechas acordadas"
          icon={<Clock />}
        />
        <Stat
          title={can('finance') ? 'Saldo por cobrar' : 'Clientes del taller'}
          value={can('finance') ? currency(finance.data?.receivables) : data.clients}
          caption={
            can('finance') ? 'Órdenes activas, cobros pendientes' : 'Particulares y empresas'
          }
          icon={<Users />}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">EN MARCHA</span>
              <h2>La actividad del taller</h2>
            </div>
            <Link to="/orders" className="text-link">
              Ver todos <ArrowUpRight size={15} />
            </Link>
          </div>
          {data.orders.length ? (
            <div className="work-list">
              {data.orders.map((o: any) => (
                <Link className="work-list-row" to={`/orders/${o.id}`} key={o.id}>
                  <div className="work-icon">
                    <Scissors size={20} />
                  </div>
                  <div className="work-info">
                    <strong>{o.title}</strong>
                    <span>
                      {name('clients', o.client_id)} · {o.code}
                    </span>
                  </div>
                  <div className="work-meta">
                    <Badge value={name('statuses', o.current_status_id)} />
                    <small>
                      {o.estimated_end_date
                        ? `Entrega ${date(o.estimated_end_date)}`
                        : 'Entrega a coordinar'}
                    </small>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Tu próximo trabajo empieza acá"
              text="Creá una orden y seguí cada paso, desde la recepción hasta la entrega."
              action={
                <Button asChild size="sm">
                  <Link to="/orders">
                    Crear mi primer trabajo
                    <ArrowRight />
                  </Link>
                </Button>
              }
            />
          )}
          <div className="pipeline">
            {data.pipeline
              .filter((s: any) => !['cancelled', 'delivered'].includes(s.code))
              .map((s: any) => (
                <div key={s.id}>
                  <span>{s.name}</span>
                  <strong>{s.count}</strong>
                  <i
                    style={{
                      width: `${Math.max(5, Math.min(100, (s.count / Math.max(1, data.active_orders)) * 100))}%`,
                    }}
                  />
                </div>
              ))}
          </div>
        </section>
        <div className="dashboard-side">
          <section className="panel">
            <div className="panel-title">
              <h2>Próximos compromisos</h2>
              <CalendarDays size={18} />
            </div>
            {data.appointments.length ? (
              <div className="agenda-mini">
                {data.appointments.map((a: any) => (
                  <Link to="/agenda" key={a.id}>
                    <div className="day-tile">
                      {new Intl.DateTimeFormat('es-AR', {
                        day: 'numeric',
                        timeZone: 'America/Argentina/Cordoba',
                      }).format(new Date(a.starts_at))}
                      <span>
                        {new Intl.DateTimeFormat('es-AR', {
                          month: 'short',
                          timeZone: 'America/Argentina/Cordoba',
                        }).format(new Date(a.starts_at))}
                      </span>
                    </div>
                    <div>
                      <strong>{a.title}</strong>
                      <span>{date(a.starts_at, true)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="compact-empty">
                <CalendarDays size={22} />
                <p>Un espacio para organizar lo que viene.</p>
                <Link to="/agenda">Programar una actividad ↗</Link>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-title">
              <h2>Materiales por reponer</h2>
              <PackageCheck size={18} />
            </div>
            {data.low_stock.length ? (
              <div className="stock-list">
                {data.low_stock.slice(0, 5).map((m: any) => (
                  <Link key={m.id} to={`/materials/${m.id}`}>
                    <span>
                      {m.name}
                      <small>{m.code}</small>
                    </span>
                    <Badge value={`${Number(m.stock_current)} ${m.unit}`} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="compact-empty">
                <p>Sin alertas de stock por ahora.</p>
                <Link to="/materials">Ver inventario ↗</Link>
              </div>
            )}
          </section>
        </div>
      </div>
      <div className="workshop-banner">
        <div>
          <span className="eyebrow">EL OFICIO TAMBIÉN SE ORGANIZA</span>
          <h2>
            Tus moldes. Tu experiencia.
            <br />
            <span>Siempre a mano.</span>
          </h2>
          <Link to="/molds" className="text-link">
            Abrir la biblioteca <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="pattern-art">
          <span>1:1</span>
          <i />
          <small>LÍDER · BIBLIOTECA TÉCNICA</small>
        </div>
      </div>
    </>
  );
}
