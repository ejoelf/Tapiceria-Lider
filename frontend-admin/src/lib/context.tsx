import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api } from './api';
import { type Row, label } from './utils';
type Context = {
  user: Row;
  lookups: Record<string, Row[]>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  notify: (text: string) => void;
  can: (area: string) => boolean;
  name: (kind: string, id: unknown) => string;
};
const Store = createContext<Context | null>(null);
export function useWorkshop() {
  const c = useContext(Store);
  if (!c) throw new Error('Workshop context missing');
  return c;
}
export function WorkshopProvider({
  user,
  logout,
  children,
}: {
  user: Row;
  logout: () => Promise<void>;
  children: ReactNode;
}) {
  const [lookups, setLookups] = useState<Record<string, Row[]>>({}),
    [toast, setToast] = useState('');
  const refresh = useCallback(async () => setLookups(await api('/lookups')), []);
  useEffect(() => {
    refresh().catch((e) => setToast(e.message));
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const roles: Record<string, string[]> = {
    operator: [
      'dashboard',
      'clients',
      'vehicles',
      'orders',
      'leads',
      'agenda',
      'materials',
      'molds',
      'portfolio',
    ],
    accountant: [
      'dashboard',
      'finance',
      'partners',
      'suppliers',
      'purchases',
      'quotes',
      'clients',
      'orders',
    ],
  };
  const can = (area: string) =>
    ['owner', 'admin', 'super_admin', 'superadmin'].includes(user.role?.name) ||
    !!roles[user.role?.name]?.includes(area);
  const name = (kind: string, id: unknown) =>
    label(lookups[kind]?.find((r) => r.id === Number(id)));
  return (
    <Store.Provider value={{ user, lookups, refresh, logout, notify: setToast, can, name }}>
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button aria-label="Cerrar aviso" onClick={() => setToast('')}>
            ×
          </button>
        </div>
      )}
    </Store.Provider>
  );
}
