import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Pencil, Upload, Eye, Globe, ArrowUp, ArrowDown, Save, ImagePlus } from 'lucide-react';
import { api, useData, API } from '@/lib/api';
import { useWorkshop } from '@/lib/context';
import { portfolio, opts } from '@/lib/resources';
import { type Row, translate } from '@/lib/utils';
import { PageHeader, Loading, ErrorBox, Badge, Empty, Confirm } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { Form } from '@/components/form';
export default function Portfolio() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/portfolio/${id}`);
  const { notify } = useWorkshop();
  const [gallery, setGallery] = useState<Row[]>([]),
    [edit, setEdit] = useState(false),
    [preview, setPreview] = useState(false),
    [publish, setPublish] = useState(false),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState('');
  useEffect(() => {
    if (data) setGallery(data.gallery);
  }, [data]);
  if (error) return <ErrorBox message={error} retry={reload} />;
  if (loading || !data) return <Loading />;
  const isPublic = data.status === 'published';
  const change = (fileId: number, field: string, value: unknown) =>
    setGallery((g) =>
      g.map((x) => ({
        ...x,
        ...(field === 'cover'
          ? { cover: x.file_id === fileId }
          : x.file_id === fileId
            ? { [field]: value }
            : {}),
      })),
    );
  const save = async () => api(`/portfolio/${id}`, 'PUT', { ...data, gallery });
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setActionError('');
    try {
      await fn();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const move = (index: number, direction: number) =>
    setGallery((g) => {
      const copy = [...g];
      [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
      return copy;
    });
  return (
    <>
      <PageHeader
        back="/portfolio"
        eyebrow="CONTENIDO DE LA WEB"
        title={data.title}
        description={`${data.service} · ${data.vehicle_description || 'Sin descripción de vehículo'}`}
        actions={
          <>
            <Badge value={data.status} />
            <Button variant="outline" onClick={() => setPreview(true)}>
              <Eye />
              Vista previa
            </Button>
            <Button variant="outline" disabled={isPublic} onClick={() => setEdit(true)}>
              <Pencil />
              Editar ficha
            </Button>
            <Button onClick={() => setPublish(true)}>
              <Globe />
              {isPublic ? 'Retirar de la web' : 'Publicar'}
            </Button>
          </>
        }
      />
      {actionError && <ErrorBox message={actionError} />}
      <div className="hint">
        {isPublic
          ? 'Este trabajo está publicado. Retirá la publicación para modificarlo; luego podés volver a publicarlo.'
          : 'Las imágenes permanecen privadas hasta que publiques. Revisá las patentes, los rostros y la autorización del cliente.'}
      </div>
      <section className="panel padded spaced-small">
        <div className="panel-title no-padding">
          <div>
            <h2>Imágenes disponibles</h2>
            <p>Subí un trabajo anterior o elegí fotos de la orden vinculada.</p>
          </div>
        </div>
        {!isPublic && (
          <form
            className="upload-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const body = new FormData(form);
              run(async () => {
                await save();
                await api(`/portfolio/${id}/media`, 'POST', body);
                form.reset();
                reload();
                notify('Imagen guardada en privado.');
              });
            }}
          >
            <label className="field grow">
              Foto del trabajo
              <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
            </label>
            <Button disabled={busy}>
              <Upload />
              {busy ? 'Guardando…' : 'Subir imagen'}
            </Button>
          </form>
        )}
        <div className="available-photos">
          {data.available_files.map((file: Row) => {
            const selected = gallery.some((g) => g.file_id === file.id);
            return (
              <button
                className={`photo-choice ${selected ? 'selected' : ''}`}
                key={file.id}
                disabled={isPublic || busy}
                aria-pressed={selected}
                aria-label={`${selected ? 'Quitar' : 'Agregar'} ${file.original_name}`}
                onClick={() =>
                  setGallery((g) =>
                    selected
                      ? g.filter((x) => x.file_id !== file.id)
                      : [
                          ...g,
                          {
                            file_id: file.id,
                            stage: 'after',
                            caption: '',
                            alt: data.title,
                            pair: '',
                            cover: g.length === 0,
                          },
                        ],
                  )
                }
              >
                <img src={`${API}/files/${file.id}?inline=1`} alt={file.original_name} />
                <span>{selected ? '✓ Seleccionada' : 'Agregar a la galería'}</span>
              </button>
            );
          })}
        </div>
        {!data.available_files.length && (
          <Empty
            title="Elegí el trabajo que querés mostrar"
            text="Agregá fotos para empezar a preparar la publicación."
          />
        )}
      </section>
      <section className="panel padded spaced-small">
        <div className="panel-title no-padding">
          <div>
            <h2>Así se verá la galería</h2>
            <p>La primera posición aparece primero. Marcá una portada y describí cada imagen.</p>
          </div>
          {!isPublic && (
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await save();
                  reload();
                  notify('Galería guardada como borrador.');
                })
              }
            >
              <Save />
              Guardar galería
            </Button>
          )}
        </div>
        <div className="gallery-editor">
          {gallery.map((g, i) => (
            <article key={g.file_id}>
              <img src={`${API}/files/${g.file_id}?inline=1`} alt={g.alt} />
              <div className="gallery-fields">
                <div className="form-grid">
                  <label className="field">
                    Etapa
                    <select
                      disabled={isPublic}
                      value={g.stage}
                      onChange={(e) => change(g.file_id, 'stage', e.target.value)}
                    >
                      {opts('before', 'during', 'after', 'other').map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Comparador antes / después
                    <input
                      disabled={isPublic}
                      value={g.pair}
                      placeholder="Ej.: volante (mismo nombre en ambas)"
                      onChange={(e) => change(g.file_id, 'pair', e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Texto debajo de la foto
                    <input
                      disabled={isPublic}
                      value={g.caption}
                      onChange={(e) => change(g.file_id, 'caption', e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Descripción accesible
                    <input
                      disabled={isPublic}
                      value={g.alt}
                      required
                      onChange={(e) => change(g.file_id, 'alt', e.target.value)}
                    />
                  </label>
                </div>
                <div className="actions">
                  <label className="checkbox-field">
                    <input
                      type="radio"
                      name="cover"
                      checked={g.cover}
                      disabled={isPublic}
                      onChange={() => change(g.file_id, 'cover', true)}
                    />
                    Portada del trabajo
                  </label>
                  <span className="grow" />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Mover foto hacia arriba"
                    disabled={isPublic || i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Mover foto hacia abajo"
                    disabled={isPublic || i === gallery.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!gallery.length && (
          <p className="muted spaced-small">
            Seleccioná las imágenes que querés incluir desde la sección anterior.
          </p>
        )}
      </section>
      <Modal open={edit} onClose={() => setEdit(false)} title="Editar la publicación" wide>
        {edit && (
          <Form
            fields={portfolio}
            initial={data}
            onSubmit={async (v) => {
              await api(`/portfolio/${id}`, 'PUT', { ...v, gallery });
              setEdit(false);
              reload();
            }}
          />
        )}
      </Modal>
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        title="Vista previa de la publicación"
        description="Este contenido solo se vuelve público cuando lo publicás."
        wide
      >
        <div className="portfolio-preview">
          <span className="eyebrow">{data.service}</span>
          <h2>{data.title}</h2>
          <p>{data.summary}</p>
          {gallery.map((g) => (
            <figure key={g.file_id}>
              <img src={`${API}/files/${g.file_id}?inline=1`} alt={g.alt} />
              <figcaption>
                {g.caption || translate(g.stage)}
                {g.cover ? ' · Portada' : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      </Modal>
      <Confirm
        open={publish}
        onClose={() => setPublish(false)}
        title={isPublic ? 'Retirar esta publicación' : 'Publicar en la web'}
        description={
          isPublic
            ? 'El trabajo y sus imágenes dejarán de ser accesibles desde la web pública.'
            : 'Las imágenes seleccionadas y la descripción serán visibles para todos. Confirmá que tenés autorización y que no muestran datos privados.'
        }
        onConfirm={async () => {
          if (!isPublic) await save();
          await api(`/portfolio/${id}/publish`, 'POST', { publish: !isPublic });
          reload();
          notify(isPublic ? 'Publicación retirada.' : 'El trabajo ya está visible en la web.');
        }}
      />
    </>
  );
}
