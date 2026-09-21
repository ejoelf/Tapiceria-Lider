import { useEffect, useState } from 'react';
import { Plus, Settings2, Globe, ShieldCheck, Pencil, KeyRound } from 'lucide-react';
import { api, useData } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { type Field } from '@/lib/resources';
import { date, type Row } from '@/lib/utils';
import { PageHeader, Loading, ErrorBox, Badge, Table } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
const siteFields: Field[] = [
  { key: 'name', label: 'Nombre del taller', required: true },
  { key: 'tagline', label: 'Frase de marca', required: true },
  { key: 'city', label: 'Ciudad y provincia', required: true },
  { key: 'phone', label: 'Teléfono', type: 'tel' },
  {
    key: 'whatsapp',
    label: 'WhatsApp con código de país',
    help: 'Ejemplo de formato: 549 + código de área + número. Sin el 0 ni el 15.',
  },
  { key: 'email', label: 'Email público', type: 'email' },
  { key: 'address', label: 'Dirección del taller' },
  { key: 'show_address', label: 'Mostrar dirección en la web', type: 'checkbox' },
  { key: 'hours', label: 'Horarios de atención', type: 'textarea', wide: true },
  { key: 'instagram', label: 'Instagram', type: 'url' },
  { key: 'facebook', label: 'Facebook', type: 'url' },
  { key: 'about', label: 'Quiénes somos', type: 'textarea', wide: true },
  { key: 'privacy_text', label: 'Texto de privacidad', type: 'textarea', wide: true },
];
export function Settings() {
  const { data, loading, error, reload } = useData('/settings/site');
  const integrations = useData('/integrations');
  const { notify } = useWorkshop();
  const [services, setServices] = useState<Row[]>([]);
  useEffect(() => {
    if (data) setServices(data.services);
  }, [data]);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  return (
    <>
      <PageHeader
        eyebrow="LÍDER, A TU MANERA"
        title="Configuración de la web"
        description="Actualizá la información que ven tus clientes, sin tocar código."
      />
      <div className="settings-grid">
        <section className="panel padded">
          <h2>Información del taller</h2>
          <Form
            fields={siteFields}
            initial={data}
            onSubmit={async (v) => {
              await api('/settings/site', 'PUT', { ...data, ...v, services });
              reload();
              notify('La información pública se actualizó.');
            }}
          >
            <div className="services-editor">
              <h3>Servicios visibles</h3>
              {services.map((s, i) => (
                <div className="service-setting" key={s.id}>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) =>
                        setServices((rows) =>
                          rows.map((r, n) => (n === i ? { ...r, enabled: e.target.checked } : r)),
                        )
                      }
                    />
                    <strong>{s.id}</strong>
                  </label>
                  <label className="field">
                    Nombre del servicio
                    <input
                      required
                      value={s.title}
                      onChange={(e) =>
                        setServices((rows) =>
                          rows.map((r, n) => (n === i ? { ...r, title: e.target.value } : r)),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    Descripción
                    <textarea
                      required
                      value={s.description}
                      onChange={(e) =>
                        setServices((rows) =>
                          rows.map((r, n) => (n === i ? { ...r, description: e.target.value } : r)),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </Form>
        </section>
        <aside>
          <section className="panel padded">
            <h2>Conexiones</h2>
            <p className="muted text-small spaced-small">
              El estado depende de la configuración del servidor.
            </p>
            {integrations.data && (
              <dl className="details">
                <div>
                  <dt>Autenticación</dt>
                  <dd>
                    {integrations.data.authentication === 'local'
                      ? 'Prueba local'
                      : 'Supabase Auth'}
                  </dd>
                </div>
                <div>
                  <dt>Archivos</dt>
                  <dd>
                    {integrations.data.storage === 'local'
                      ? 'Archivos locales'
                      : 'Supabase Storage'}
                  </dd>
                </div>
                <div>
                  <dt>Emails</dt>
                  <dd>
                    <Badge value={integrations.data.email ? 'Configurado' : 'Pendiente'} />
                  </dd>
                </div>
                <div>
                  <dt>Asistente IA</dt>
                  <dd>
                    <Badge value={integrations.data.ai ? 'Configurado' : 'Opcional'} />
                  </dd>
                </div>
              </dl>
            )}
            <div className="hint">
              La web usa solo servicios activos y datos de contacto que completes. Los campos vacíos
              no muestran información inventada.
            </div>
          </section>
          <section className="panel padded spaced-small">
            <span className="eyebrow">CREADO POR NEXODIGITAL</span>
            <h2>Una base para crecer.</h2>
            <p className="spaced-small">El pie de página incluye el enlace a NexoDigital.</p>
            <a
              className="text-link"
              target="_blank"
              rel="noreferrer"
              href="https://nexodigital-ix6r.onrender.com/"
            >
              Conocer NexoDigital ↗
            </a>
          </section>
        </aside>
      </div>
    </>
  );
}
export function Users() {
  const { data, loading, error, reload } = useData('/users?pageSize=100');
  const { name, refresh, notify } = useWorkshop();
  const [edit, setEdit] = useState<Row | null>(null);
  const fields: Field[] = [
    { key: 'first_name', label: 'Nombre', required: true },
    { key: 'last_name', label: 'Apellido' },
    ...(!edit?.id
      ? [
          { key: 'email', label: 'Email', type: 'email', required: true },
          {
            key: 'password',
            label: 'Contraseña inicial',
            type: 'password',
            required: true,
            help: 'Al menos 12 caracteres. Compartila por un medio privado.',
          },
        ]
      : []),
    { key: 'role_id', label: 'Rol', lookup: 'roles', required: true },
    { key: 'is_active', label: 'Cuenta activa', type: 'checkbox', default: true },
  ];
  return (
    <>
      <PageHeader
        eyebrow="EL EQUIPO"
        title="Usuarios y accesos"
        description="Cada persona con su cuenta. Cada acción con su responsable."
        actions={
          <Button onClick={() => setEdit({})}>
            <Plus />
            Nuevo usuario
          </Button>
        }
      />
      <div className="hint">
        Administrador: acceso completo. Operador: taller, clientes, consultas, moldes y galería.
        Administración financiera: presupuestos, caja, compras, proveedores y órdenes.
      </div>
      <section className="panel spaced-small">
        {error ? (
          <ErrorBox message={error} />
        ) : loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              {
                key: 'first_name',
                label: 'Persona',
                render: (r) => `${r.first_name} ${r.last_name}`,
              },
              { key: 'email', label: 'Email' },
              {
                key: 'role_id',
                label: 'Rol',
                render: (r) => <Badge value={name('roles', r.role_id)} />,
              },
              { key: 'is_active', label: 'Acceso', render: (r) => <Badge value={r.is_active} /> },
              {
                key: 'last_login_at',
                label: 'Último ingreso',
                render: (r) => date(r.last_login_at, true),
              },
            ]}
            onRow={setEdit}
          />
        )}
      </section>
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? 'Editar acceso' : 'Crear una cuenta'}
      >
        {edit && (
          <Form
            fields={fields}
            initial={edit}
            onSubmit={async (v) => {
              await api(`/users${edit.id ? '/' + edit.id : ''}`, edit.id ? 'PUT' : 'POST', v);
              setEdit(null);
              reload();
              await refresh();
              notify('Cuenta actualizada.');
            }}
          />
        )}
      </Modal>
    </>
  );
}
export function Catalogs() {
  const { lookups, refresh, notify } = useWorkshop();
  const [kind, setKind] = useState('brands'),
    [create, setCreate] = useState(false);
  const names: Record<string, string> = {
    brands: 'Marcas',
    models: 'Modelos',
    parts: 'Piezas',
    categories: 'Categorías de materiales',
  };
  const fields: Field[] = [
    { key: 'name', label: 'Nombre', required: true },
    ...(kind === 'models'
      ? [{ key: 'brand_id', label: 'Marca', lookup: 'brands', required: true }]
      : []),
    ...(kind === 'parts' ? [{ key: 'code', label: 'Código único', required: true }] : []),
  ];
  return (
    <>
      <PageHeader
        eyebrow="DATOS DE REFERENCIA"
        title="Catálogos del taller"
        description="Agregá las marcas, modelos, piezas y categorías con las que trabajás."
        actions={
          <Button onClick={() => setCreate(true)}>
            <Plus />
            Agregar
          </Button>
        }
      />
      <div className="tabs" role="tablist">
        {Object.entries(names).map(([k, n]) => (
          <button
            key={k}
            role="tab"
            aria-selected={kind === k}
            className={kind === k ? 'active' : ''}
            onClick={() => setKind(k)}
          >
            {n}
          </button>
        ))}
      </div>
      <section className="panel">
        <Table
          rows={lookups[kind] || []}
          columns={[
            { key: 'name', label: names[kind] },
            { key: kind === 'parts' ? 'code' : 'slug', label: 'Referencia' },
          ]}
        />
      </section>
      <Modal open={create} onClose={() => setCreate(false)} title={`Agregar · ${names[kind]}`}>
        <Form
          fields={fields}
          onSubmit={async (v) => {
            await api(`/catalogs/${kind}`, 'POST', v);
            setCreate(false);
            await refresh();
            notify('Catálogo actualizado.');
          }}
        />
      </Modal>
    </>
  );
}
export function Audit() {
  const { data, loading, error, reload } = useData('/audit?pageSize=100');
  const { name } = useWorkshop();
  return (
    <>
      <PageHeader
        eyebrow="TRAZABILIDAD"
        title="Registro de actividad"
        description="Las últimas 100 acciones del equipo. Los registros financieros se anulan, no se borran."
      />
      <section className="panel">
        {error ? (
          <ErrorBox message={error} retry={reload} />
        ) : loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              { key: 'createdAt', label: 'Fecha', render: (r) => date(r.createdAt, true) },
              { key: 'user_id', label: 'Persona', render: (r) => name('users', r.user_id) },
              { key: 'action', label: 'Acción' },
              { key: 'entity', label: 'Sección' },
              { key: 'entity_id', label: 'Registro' },
              {
                key: 'changes',
                label: 'Detalle',
                render: (r) => (
                  <details>
                    <summary>Ver cambios</summary>
                    <pre>{JSON.stringify(r.changes, null, 2)}</pre>
                  </details>
                ),
              },
            ]}
          />
        )}
      </section>
    </>
  );
}
export function Account() {
  const { user, logout } = useWorkshop();
  return (
    <>
      <PageHeader
        eyebrow="TU ACCESO AL TALLER"
        title="Mi cuenta"
        description={`${user.first_name} · ${user.email}`}
      />
      <section className="panel padded narrow-panel">
        <h2>Cambiar contraseña</h2>
        <p className="muted spaced-small">Se cerrarán todas tus sesiones después del cambio.</p>
        <Form
          fields={[
            {
              key: 'current_password',
              label: 'Contraseña actual',
              type: 'password',
              required: true,
              wide: true,
            },
            {
              key: 'new_password',
              label: 'Nueva contraseña',
              type: 'password',
              required: true,
              wide: true,
              help: 'Usá al menos 12 caracteres y una contraseña exclusiva para el taller.',
            },
          ]}
          onSubmit={async (v) => {
            await api('/auth/password', 'POST', v);
            await logout();
          }}
        />
      </section>
    </>
  );
}
