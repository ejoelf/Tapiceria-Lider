import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  UserPlus,
  FileText,
  Pencil,
  Send,
  Copy,
  Sparkles,
  Download,
  MessageCircle,
} from 'lucide-react';
import { api, useData, API } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { opts } from '@/lib/resources';
import { date, download, type Row } from '@/lib/utils';
import { PageHeader, Loading, ErrorBox, Badge, Confirm } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
export default function Lead() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/leads/${id}`);
  const { refresh, notify, can } = useWorkshop();
  const [edit, setEdit] = useState(false),
    [message, setMessage] = useState(false),
    [body, setBody] = useState(''),
    [subject, setSubject] = useState('Tu consulta a Tapicería Líder'),
    [recipient, setRecipient] = useState(''),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(''),
    [send, setSend] = useState<Row | null>(null),
    [ai, setAi] = useState(false);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setActionError('');
    try {
      await fn();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        back="/leads"
        eyebrow={`CONSULTA · ${date(data.createdAt, true)}`}
        title={data.name}
        description={[data.phone, data.email].filter(Boolean).join(' · ')}
        actions={
          <>
            <Badge value={data.status} />
            <Button variant="outline" onClick={() => setEdit(true)}>
              <Pencil />
              Seguimiento
            </Button>
            {data.client_id ? (
              <Button asChild variant="outline">
                <Link to={`/clients/${data.client_id}`}>Ver cliente ↗</Link>
              </Button>
            ) : (
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await api(`/leads/${id}/client`, 'POST');
                    reload();
                    await refresh();
                    notify('Cliente creado y vinculado.');
                  })
                }
              >
                <UserPlus />
                Crear cliente
              </Button>
            )}
          </>
        }
      />
      {actionError && <ErrorBox message={actionError} />}
      <div className="detail-grid">
        <section className="panel padded">
          <span className="eyebrow">LO QUE NOS CONTÓ</span>
          <h2>{data.service}</h2>
          <p className="muted">{data.vehicle_description}</p>
          <p className="message-body">{data.message}</p>
          <div className="actions">
            {data.client_id && can('quotes') && (
              <Button asChild>
                <Link to={`/quotes?client_id=${data.client_id}&lead_id=${id}`}>
                  <FileText />
                  Armar presupuesto
                </Link>
              </Button>
            )}
            {data.phone && (
              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/${String(data.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle />
                  WhatsApp
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setRecipient(data.email || '');
                setMessage(true);
              }}
            >
              Preparar respuesta
            </Button>
          </div>
          <div className="media-grid spaced-small">
            {data.files.map((f: Row) => (
              <figure key={f.id}>
                <img
                  src={`${API}/files/${f.id}?inline=1`}
                  alt="Foto privada enviada con la consulta"
                />
                <figcaption>
                  <button className="text-link" onClick={() => download(`/files/${f.id}`)}>
                    <Download size={14} /> Descargar
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="panel padded">
          <h2>Próximo paso</h2>
          <p className="spaced-small">
            {data.next_contact_at
              ? date(data.next_contact_at, true)
              : 'Sin seguimiento programado.'}
          </p>
          <p className="preline">
            {data.notes || 'Agregá notas para que ambos sepan cómo sigue esta consulta.'}
          </p>
          <div className="hint spaced-small">
            Crear un cliente conserva esta consulta y sus fotos. Un presupuesto aceptado genera la
            orden de trabajo.
          </div>
        </section>
      </div>
      <section className="panel padded spaced-small">
        <h2>Respuestas guardadas</h2>
        {data.messages.length ? (
          data.messages.map((m: Row) => (
            <article className="saved-message" key={m.id}>
              <div>
                <strong>{m.subject}</strong>
                <Badge value={m.status} />
              </div>
              <p className="muted text-small">
                Para: {m.recipient} · {date(m.createdAt, true)}
              </p>
              <p className="preline">{m.body}</p>
              <div className="actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(m.body)
                      .then(() => notify('Texto copiado.'))
                      .catch(() =>
                        notify('El navegador no permitió copiar. Seleccioná el texto manualmente.'),
                      )
                  }
                >
                  <Copy />
                  Copiar
                </Button>
                {!['sent', 'sending'].includes(m.status) && (
                  <Button size="sm" onClick={() => setSend(m)}>
                    <Send />
                    Enviar email
                  </Button>
                )}
              </div>
              {m.error && <p className="muted text-small">{m.error}</p>}
            </article>
          ))
        ) : (
          <p className="muted spaced-small">Todavía no hay respuestas guardadas.</p>
        )}
      </section>
      <Modal open={edit} onClose={() => setEdit(false)} title="Seguimiento de consulta">
        <Form
          fields={[
            {
              key: 'status',
              label: 'Estado',
              type: 'select',
              options: opts('new', 'contacted', 'quoted', 'won', 'lost'),
              default: 'new',
            },
            { key: 'assigned_user_id', label: 'Responsable', lookup: 'users' },
            { key: 'next_contact_at', label: 'Volver a contactar', type: 'datetime-local' },
            { key: 'notes', label: 'Notas internas', type: 'textarea', wide: true },
          ]}
          initial={data}
          onSubmit={async (v) => {
            await api(`/leads/${id}`, 'PATCH', v);
            setEdit(false);
            reload();
          }}
        />
      </Modal>
      <Modal
        open={message}
        onClose={() => setMessage(false)}
        title="Preparar respuesta"
        description="Guardá un borrador, revisalo y después elegí si querés enviarlo."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api('/messages', 'POST', { lead_id: Number(id), recipient, subject, body });
              setMessage(false);
              setBody('');
              reload();
              notify('Borrador guardado. Todavía no se envió.');
            });
          }}
        >
          <label className="field">
            Email del cliente
            <input
              type="email"
              value={recipient}
              required
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
          <label className="field">
            Asunto
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="field">
            Respuesta
            <textarea
              rows={7}
              required
              minLength={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          {actionError && <ErrorBox message={actionError} />}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setAi(true)}>
              <Sparkles />
              Ayuda para redactar
            </Button>
            <Button disabled={busy}>Guardar borrador</Button>
          </div>
        </form>
      </Modal>
      <Confirm
        open={!!send}
        onClose={() => setSend(null)}
        title="Enviar respuesta por email"
        description={`Se enviará el texto guardado a ${send?.recipient || ''}. El envío requiere configurar Resend.`}
        onConfirm={async () => {
          await api(`/messages/${send?.id}/send`, 'POST', { confirmed: true });
          reload();
          notify('Email enviado.');
        }}
      />
      <Confirm
        open={ai}
        onClose={() => setAi(false)}
        title="Preparar un borrador con IA"
        description="El texto de la consulta se enviará al proveedor de IA configurado. Revisá que no incluya información sensible. La IA no envía mensajes ni confirma precios."
        onConfirm={async () => {
          const result = await api('/assistant/draft', 'POST', {
            context: `Servicio: ${data.service}. Vehículo: ${data.vehicle_description}. Consulta del cliente: ${data.message}`,
            confirmed: true,
          });
          setBody(result.text);
          notify('Borrador preparado. Revisalo antes de guardarlo.');
        }}
      />
    </>
  );
}
