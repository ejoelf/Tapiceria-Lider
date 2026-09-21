import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  Navigate,
} from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  ClipboardList,
  FileText,
  Users,
  Car,
  Layers,
  Package,
  Truck,
  ShoppingBag,
  CalendarDays,
  Wallet,
  HandCoins,
  Images,
  Settings,
  ShieldCheck,
  LogOut,
  Search,
  ArrowUpRight,
  Menu,
  X,
  Command,
  ChevronRight,
  Plus,
  LoaderCircle,
} from 'lucide-react';
import { api } from './lib/api';
import { type Row, label } from './lib/utils';
import { WorkshopProvider, useWorkshop } from './lib/context';
import { Loading, ErrorBox } from './components/common';
import { Button } from './components/ui/button';
import { Modal } from './components/ui/dialog';
import Dashboard from './pages/dashboard';
import Resources from './pages/resources';
const Order = lazy(() => import('./pages/order'));
const Quotes = lazy(() => import('./pages/quotes'));
const Portfolio = lazy(() => import('./pages/portfolio'));
const Lead = lazy(() => import('./pages/lead'));
const Finance = lazy(() => import('./pages/finance'));
const Partners = lazy(() => import('./pages/finance').then((m) => ({ default: m.Partners })));
const Purchase = lazy(() => import('./pages/finance').then((m) => ({ default: m.Purchase })));
const Mold = lazy(() => import('./pages/technical').then((m) => ({ default: m.Mold })));
const Material = lazy(() => import('./pages/technical').then((m) => ({ default: m.Material })));
const Client = lazy(() => import('./pages/technical').then((m) => ({ default: m.Client })));
const SettingsPage = lazy(() => import('./pages/settings').then((m) => ({ default: m.Settings })));
const UsersPage = lazy(() => import('./pages/settings').then((m) => ({ default: m.Users })));
const Catalogs = lazy(() => import('./pages/settings').then((m) => ({ default: m.Catalogs })));
const Audit = lazy(() => import('./pages/settings').then((m) => ({ default: m.Audit })));
const Account = lazy(() => import('./pages/settings').then((m) => ({ default: m.Account })));
const nav = [
  {
    group: 'EL TALLER',
    items: [
      ['/', 'Resumen', LayoutDashboard, 'dashboard'],
      ['/leads', 'Consultas', Inbox, 'leads'],
      ['/orders', 'Trabajos', ClipboardList, 'orders'],
      ['/quotes', 'Presupuestos', FileText, 'quotes'],
      ['/agenda', 'Agenda', CalendarDays, 'agenda'],
    ],
  },
  {
    group: 'TUS RECURSOS',
    items: [
      ['/clients', 'Clientes', Users, 'clients'],
      ['/vehicles', 'Vehículos', Car, 'vehicles'],
      ['/molds', 'Moldes', Layers, 'molds'],
      ['/materials', 'Materiales', Package, 'materials'],
      ['/suppliers', 'Proveedores', Truck, 'suppliers'],
      ['/purchases', 'Compras', ShoppingBag, 'purchases'],
    ],
  },
  {
    group: 'ADMINISTRACIÓN',
    items: [
      ['/finance', 'Finanzas', Wallet, 'finance'],
      ['/partners', 'Socios', HandCoins, 'partners'],
      ['/portfolio', 'Galería web', Images, 'portfolio'],
      ['/settings', 'Configuración', Settings, 'settings'],
    ],
  },
];
function Gate({ area, children }: { area: string; children: ReactNode }) {
  return useWorkshop().can(area) ? (
    children
  ) : (
    <ErrorBox message="Tu rol no tiene acceso a esta sección." />
  );
}
function Shell() {
  const { user, can, logout, lookups } = useWorkshop();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false),
    [query, setQuery] = useState('');
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  const current = nav
    .flatMap((g) => g.items)
    .find(([path]) =>
      String(path) === '/' ? location.pathname === '/' : location.pathname.startsWith(String(path)),
    );
  const searchRows =
    query.trim().length < 2
      ? []
      : ['clients', 'vehicles', 'orders', 'molds'].filter(can).flatMap((kind) =>
          (lookups[kind] || [])
            .filter((r) =>
              `${label(r)} ${r.code || ''} ${r.plate || ''}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .slice(0, 8)
            .map((r) => ({ kind, id: r.id, ...r })),
        );
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMenu(false)}
          aria-label="Cerrar menú"
        />
      )}
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <Link to="/" className="brand">
          LÍDER<span>GESTIÓN DEL TALLER</span>
        </Link>
        <div className="workspace-label">
          <span className="workspace-avatar">L</span>
          <span>
            Tapicería Líder<small>Río Cuarto, Córdoba</small>
          </span>
          <ChevronRight size={13} />
        </div>
        <nav aria-label="Secciones del CRM">
          {nav.map((group) => (
            <div className="nav-group" key={group.group}>
              <span>{group.group}</span>
              {group.items
                .filter((item) => can(String(item[3])))
                .map(([path, text, Icon]) => {
                  const I = Icon as typeof LayoutDashboard;
                  return (
                    <NavLink key={String(path)} to={String(path)} end={path === '/'}>
                      <I size={17} />
                      <span>{String(text)}</span>
                    </NavLink>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a
            href={import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noreferrer"
          >
            <GlobeIcon />
            Ver sitio web
            <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-user">
            <Link to="/account">
              <span className="avatar">
                {user.first_name?.[0]}
                {user.last_name?.[0] || ''}
              </span>
              <span>
                {user.first_name}
                <small>{user.role?.name === 'owner' ? 'Administrador' : 'Equipo Líder'}</small>
              </span>
            </Link>
            <button aria-label="Cerrar sesión" onClick={() => logout()}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Abrir menú"
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumbs">
            Taller <ChevronRight size={13} />
            <strong>{String(current?.[1] || 'Mi cuenta')}</strong>
          </div>
          <button className="global-search" onClick={() => setSearch(true)}>
            <Search size={16} />
            <span>Buscar en tu taller…</span>
            <kbd>↗</kbd>
          </button>
          <span className="today-label">
            {new Intl.DateTimeFormat('es-AR', {
              day: 'numeric',
              month: 'short',
              timeZone: 'America/Argentina/Cordoba',
            }).format(new Date())}
          </span>
          <Link to="/account" className="avatar small">
            {user.first_name?.[0]}
          </Link>
        </header>
        <main className="page-content" id="contenido">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {[
                'clients',
                'vehicles',
                'suppliers',
                'materials',
                'molds',
                'agenda',
                'orders',
                'leads',
                'purchases',
                'portfolio',
              ].map((kind) => (
                <Route
                  key={kind}
                  path={`/${kind}`}
                  element={
                    <Gate area={kind}>
                      <Resources key={kind} kind={kind} />
                    </Gate>
                  }
                />
              ))}
              <Route
                path="/orders/:id"
                element={
                  <Gate area="orders">
                    <Order />
                  </Gate>
                }
              />
              <Route
                path="/molds/:id"
                element={
                  <Gate area="molds">
                    <Mold />
                  </Gate>
                }
              />
              <Route
                path="/materials/:id"
                element={
                  <Gate area="materials">
                    <Material />
                  </Gate>
                }
              />
              <Route
                path="/clients/:id"
                element={
                  <Gate area="clients">
                    <Client />
                  </Gate>
                }
              />
              <Route
                path="/leads/:id"
                element={
                  <Gate area="leads">
                    <Lead />
                  </Gate>
                }
              />
              <Route
                path="/portfolio/:id"
                element={
                  <Gate area="portfolio">
                    <Portfolio />
                  </Gate>
                }
              />
              <Route
                path="/purchases/:id"
                element={
                  <Gate area="purchases">
                    <Purchase />
                  </Gate>
                }
              />
              <Route
                path="/quotes"
                element={
                  <Gate area="quotes">
                    <Quotes />
                  </Gate>
                }
              />
              <Route
                path="/finance"
                element={
                  <Gate area="finance">
                    <Finance />
                  </Gate>
                }
              />
              <Route
                path="/partners"
                element={
                  <Gate area="partners">
                    <Partners />
                  </Gate>
                }
              />
              <Route
                path="/settings"
                element={
                  <Gate area="settings">
                    <SettingsPage />
                  </Gate>
                }
              />
              <Route
                path="/users"
                element={
                  <Gate area="settings">
                    <UsersPage />
                  </Gate>
                }
              />
              <Route
                path="/catalogs"
                element={
                  <Gate area="settings">
                    <Catalogs />
                  </Gate>
                }
              />
              <Route
                path="/audit"
                element={
                  <Gate area="settings">
                    <Audit />
                  </Gate>
                }
              />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {can('settings') && (
            <nav className="admin-shortcuts" aria-label="Administración avanzada">
              <Link to="/users">Usuarios y accesos</Link>
              <Link to="/catalogs">Catálogos</Link>
              <Link to="/audit">Registro de actividad</Link>
              <span>
                Creado por{' '}
                <a href="https://nexodigital-ix6r.onrender.com/" target="_blank" rel="noreferrer">
                  NexoDigital ↗
                </a>
              </span>
            </nav>
          )}
        </main>
      </div>
      <Modal
        open={search}
        onClose={() => {
          setSearch(false);
          setQuery('');
        }}
        title="Buscar en el taller"
      >
        <label className="field">
          Cliente, vehículo, orden o molde
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribí al menos dos caracteres…"
          />
        </label>
        <div className="search-results">
          {searchRows.map((r) => (
            <Link
              key={`${r.kind}-${r.id}`}
              to={r.kind === 'vehicles' ? '/vehicles' : `/${r.kind}/${r.id}`}
              onClick={() => setSearch(false)}
            >
              <span>
                {label(r)}
                <small>
                  {
                    { clients: 'Cliente', vehicles: 'Vehículo', orders: 'Trabajo', molds: 'Molde' }[
                      r.kind as string
                    ]
                  }
                </small>
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ))}
          {query.length >= 2 && !searchRows.length && (
            <p className="muted">No se encontraron coincidencias.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
function GlobeIcon() {
  return <span className="web-dot" />;
}
function Login({ onLogin }: { onLogin: (user: Row) => void }) {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <main className="login-page">
      <section className="login-brand">
        <a href={import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000'} className="brand">
          LÍDER<span>ESPECIALISTAS EN VOLANTES</span>
        </a>
        <div>
          <span className="eyebrow">EL OFICIO TAMBIÉN SE ORGANIZA</span>
          <h1>
            Más tiempo
            <br />
            para los <em>detalles.</em>
          </h1>
          <p>
            Tu taller, tus clientes y cada trabajo.
            <br />
            Todo en el mismo lugar.
          </p>
        </div>
        <span className="login-credit">TAPICERÍA LÍDER · RÍO CUARTO</span>
        <div className="login-ring" />
      </section>
      <section className="login-form-side">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              onLogin(await api('/auth/login', 'POST', { email, password }));
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <span className="eyebrow">BIENVENIDO AL TALLER</span>
          <h2>
            Todo listo para
            <br />
            un buen día de trabajo.
          </h2>
          <p>Ingresá con tu cuenta para continuar.</p>
          <label className="field">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="tu@email.com"
            />
          </label>
          <label className="field">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
            />
          </label>
          {error && <ErrorBox message={error} />}
          <Button type="submit" className="login-submit" disabled={busy}>
            {busy ? <LoaderCircle className="spin" /> : null}
            {busy ? 'Ingresando…' : 'Ingresar al taller'}
            <ArrowUpRight />
          </Button>
          <div className="login-help">
            <ShieldCheck size={16} />
            <span>
              Acceso privado para el equipo de Líder.
              <br />
              Si necesitás una cuenta, contactá al administrador.
            </span>
          </div>
        </form>
        <a
          href="https://nexodigital-ix6r.onrender.com/"
          target="_blank"
          rel="noreferrer"
          className="powered-by"
        >
          Desarrollado por <strong>NexoDigital</strong> ↗
        </a>
      </section>
    </main>
  );
}
export default function App() {
  const [user, setUser] = useState<Row | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api('/auth/me')
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    const expired = () => setUser(null);
    window.addEventListener('lider:unauthorized', expired);
    return () => {
      active = false;
      window.removeEventListener('lider:unauthorized', expired);
    };
  }, []);
  const logout = async () => {
    try {
      await api('/auth/logout', 'POST');
    } finally {
      setUser(null);
    }
  };
  if (loading) return <Loading />;
  if (!user) return <Login onLogin={setUser} />;
  return (
    <BrowserRouter>
      <WorkshopProvider user={user} logout={logout}>
        <Shell />
      </WorkshopProvider>
    </BrowserRouter>
  );
}
