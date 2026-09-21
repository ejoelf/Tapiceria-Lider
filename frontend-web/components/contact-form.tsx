'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, ImagePlus, LoaderCircle } from 'lucide-react';
import type { Service } from '@/lib/api';
export default function ContactForm({ services }: { services: Service[] }) {
  const [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState(''),
    [files, setFiles] = useState(0);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('consent', 'true');
    const photos = data.getAll('photos').filter((p): p is File => p instanceof File && p.size > 0);
    if (photos.length > 3 || photos.some((p) => p.size > 10 * 1024 * 1024)) {
      setError('Elegí hasta 3 fotos de un máximo de 10 MB cada una.');
      return;
    }
    if (!String(data.get('phone') || '').trim() && !String(data.get('email') || '').trim()) {
      setError('Dejanos un teléfono o email para poder responderte.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/public/leads', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'No pudimos enviar la consulta.');
      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos enviar la consulta. Intentá nuevamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="contact-success" role="status">
        <CheckCircle2 size={42} />
        <h3>Tu consulta ya está en el taller.</h3>
        <p>Vamos a revisar lo que nos contaste y contactarte por el medio que dejaste.</p>
        <button className="button secondary" onClick={() => setSuccess(false)}>
          Enviar otra consulta
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Tu nombre
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            placeholder="¿Cómo te llamás?"
          />
        </label>
        <label>
          ¿Para quién es el trabajo?
          <select name="client_type">
            <option value="individual">Soy particular</option>
            <option value="company">Empresa o concesionaria</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          WhatsApp
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={50}
            placeholder="Código de área + número"
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={150}
            placeholder="tu@email.com"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Vehículo
          <input name="vehicle_description" maxLength={255} placeholder="Marca, modelo y año" />
        </label>
        <label>
          ¿Qué querés renovar?
          <select name="service" required>
            {services
              .filter((s) => s.enabled)
              .map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
            <option>Otra pieza del vehículo</option>
          </select>
        </label>
      </div>
      <label>
        Contanos un poco más
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder="Qué pieza necesitás tapizar, cómo está y qué tenés en mente…"
        />
      </label>
      <label className="upload-zone">
        <ImagePlus size={22} />
        <span>
          {files
            ? `${files} foto${files === 1 ? '' : 's'} seleccionada${files === 1 ? '' : 's'}`
            : 'Sumá fotos de la pieza'}
          <small>Opcional · hasta 3 fotos JPG, PNG o WebP · 10 MB cada una</small>
        </span>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setFiles(e.target.files?.length || 0)}
        />
      </label>
      <div className="honey" aria-hidden="true">
        <label>
          Tu sitio web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="check-row">
        <input type="checkbox" required />{' '}
        <span>
          Acepto que usen mis datos para responder mi consulta. Mis fotos son privadas.{' '}
          <Link href="/privacidad">Ver privacidad</Link>.
        </span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button disabled={busy} className="button" type="submit">
        {busy ? (
          <>
            <LoaderCircle className="spin" size={18} /> Enviando…
          </>
        ) : (
          <>
            Enviar consulta <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="form-note">Evaluamos cada pieza antes de confirmar el presupuesto.</p>
    </form>
  );
}
