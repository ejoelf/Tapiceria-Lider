import { useState, type ReactNode } from 'react';
import { AlertCircle, Check, Inbox, LoaderCircle, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Modal } from './ui/dialog';
import { translate, type Row } from '@/lib/utils';
export function Badge({ value }: { value: unknown }) {
  return (
    <span className={`badge badge-${String(value)}`}>
      {typeof value === 'boolean' ? (value ? 'Activo' : 'Archivado') : translate(value)}
    </span>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} />
      <span>Cargando el taller…</span>
    </div>
  );
}
export function ErrorBox({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      <AlertCircle size={20} />
      <span>{message}</span>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          <RefreshCw />
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function Empty({
  title = 'Todo listo para empezar',
  text = 'Todavía no hay registros. Creá el primero para organizar tu taller.',
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span>
        <Inbox size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: string;
}) {
  return (
    <div className="page-heading">
      <div>
        {back && (
          <Link to={back} className="back-link">
            <ArrowLeft size={14} /> Volver
          </Link>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="actions">{actions}</div>
    </div>
  );
}
export function Stat({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div>
        <span>{title}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      {caption && <p>{caption}</p>}
    </div>
  );
}
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  description,
  reason = false,
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: string;
  reason?: boolean;
  destructive?: boolean;
}) {
  const [text, setText] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await onConfirm(text);
            onClose();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {reason && (
          <label className="field">
            Motivo
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={5}
              maxLength={500}
              autoFocus
            />
          </label>
        )}
        {error && <ErrorBox message={error} />}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={busy} variant={destructive ? 'destructive' : 'default'}>
            {busy ? <LoaderCircle className="spin" /> : <Check />}Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export type Column = { key: string; label: string; render?: (row: Row) => ReactNode };
export function Table({
  rows,
  columns,
  onRow,
}: {
  rows: Row[];
  columns: Column[];
  onRow?: (r: Row) => void;
}) {
  if (!rows.length) return <Empty />;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
            {onRow && (
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '—')}</td>
              ))}
              {onRow && (
                <td className="table-action">
                  <Button variant="ghost" size="sm" onClick={() => onRow(row)}>
                    Abrir ↗
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
