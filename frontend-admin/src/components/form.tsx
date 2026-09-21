import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { LoaderCircle, Check } from 'lucide-react';
import { type Field } from '@/lib/resources';
import { type Row, label } from '@/lib/utils';
import { useWorkshop } from '@/lib/context';
import { Button } from './ui/button';
import { ErrorBox } from './common';
export function Form({
  fields,
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  children,
}: {
  fields: Field[];
  initial?: Row;
  onSubmit: (data: Row) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  children?: ReactNode;
}) {
  const id = useId();
  const { lookups } = useWorkshop();
  const [values, setValues] = useState<Row>(() =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        initial[f.key] ?? f.default ?? (f.type === 'checkbox' ? false : ''),
      ]),
    ),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const update = (key: string, value: unknown) =>
    setValues((v) => ({
      ...v,
      [key]: value,
      ...(key === 'client_id' ? { vehicle_id: '' } : {}),
      ...(key === 'brand_id' ? { model_id: '' } : {}),
    }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data: Row = {};
      for (const f of fields) {
        let v = values[f.key];
        if (f.type === 'number') v = v === '' ? null : Number(v);
        if (f.lookup) v = v === '' ? null : Number(v);
        if (f.type === 'datetime-local')
          v = v
            ? new Date(
                /[Z]|[+-]\d{2}:\d{2}$/.test(String(v)) ? v : String(v) + '-03:00',
              ).toISOString()
            : null;
        if (f.type === 'password' && !v) continue;
        data[f.key] = v;
      }
      await onSubmit(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="entity-form">
      <div className="form-grid">
        {fields
          .filter((f) => !f.show || f.show(values))
          .map((f) => {
            let options = f.options || [];
            if (f.lookup) {
              let rows = lookups[f.lookup] || [];
              if (f.lookup === 'models' && values.brand_id)
                rows = rows.filter((r) => r.brand_id === Number(values.brand_id));
              if (f.lookup === 'vehicles' && values.client_id)
                rows = rows.filter((r) => r.client_id === Number(values.client_id));
              if (f.lookup === 'roles')
                rows = rows.filter((r) => ['owner', 'operator', 'accountant'].includes(r.name));
              options = rows.map((r) => ({ value: String(r.id), label: label(r) }));
            }
            let value = values[f.key] ?? '';
            if (
              f.type === 'datetime-local' &&
              value &&
              /[Z]|[+-]\d{2}:\d{2}$/.test(String(value))
            ) {
              const d = new Date(value);
              if (!Number.isNaN(d.getTime())) {
                const parts = new Intl.DateTimeFormat('en-CA', {
                  timeZone: 'America/Argentina/Cordoba',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hourCycle: 'h23',
                }).formatToParts(d);
                const part = (type: string) => parts.find((p) => p.type === type)?.value;
                value = `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
              }
            }
            return (
              <label
                className={`field ${f.wide ? 'full' : ''} ${f.type === 'checkbox' ? 'checkbox-field' : ''}`}
                key={f.key}
                htmlFor={`${id}-${f.key}`}
              >
                {f.type === 'checkbox' ? (
                  <>
                    <input
                      id={`${id}-${f.key}`}
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => update(f.key, e.target.checked)}
                    />
                    <span>{f.label}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {f.label}
                      {f.required && <b className="required"> *</b>}
                    </span>
                    {f.lookup || f.type === 'select' ? (
                      <select
                        id={`${id}-${f.key}`}
                        value={String(value)}
                        required={f.required}
                        onChange={(e) => update(f.key, e.target.value)}
                      >
                        {f.lookup && <option value="">Seleccionar…</option>}
                        {options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        id={`${id}-${f.key}`}
                        value={String(value)}
                        required={f.required}
                        rows={3}
                        maxLength={10000}
                        onChange={(e) => update(f.key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`${id}-${f.key}`}
                        type={f.type || 'text'}
                        value={value}
                        required={f.required}
                        min={f.type === 'number' ? (f.min ?? 0) : undefined}
                        max={f.max}
                        step={f.type === 'number' ? '0.01' : undefined}
                        minLength={
                          f.type === 'password' && f.key !== 'current_password' ? 12 : undefined
                        }
                        maxLength={f.type === 'password' ? 200 : 500}
                        onChange={(e) => update(f.key, e.target.value)}
                        autoComplete={f.type === 'password' ? 'new-password' : undefined}
                      />
                    )}
                  </>
                )}
                {f.type === 'datetime-local' && <small>Hora del taller · Argentina (UTC−3)</small>}
                {f.help && <small>{f.help}</small>}
              </label>
            );
          })}
      </div>
      {children}
      {error && <ErrorBox message={error} />}
      <div className="form-actions">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button disabled={busy} type="submit">
          {busy ? <LoaderCircle className="spin" /> : <Check />}
          {busy ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
