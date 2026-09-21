import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID, createHash } from 'node:crypto';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { db, sequelize } from '../database/v2.js';
import env from '../config/env.js';
import { supabase } from './auth.js';
import {
  wrap,
  ok,
  safe,
  id,
  must,
  optionalId,
  optionalText,
  allow,
  audit,
  list,
  HttpError,
} from './common.js';

export const filesRouter = Router();
export const publicUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3, fields: 15, fieldSize: 10000 },
});
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 6, fields: 20, fieldSize: 20000 },
});
const photoMimes = ['image/jpeg', 'image/png', 'image/webp'];
export async function prepare(file, kind) {
  if (!file) throw new HttpError(400, 'Elegí un archivo.');
  const detected = await fileTypeFromBuffer(file.buffer);
  let mime = detected?.mime;
  let ext = detected?.ext;
  let buffer = file.buffer;
  if (kind === 'mold') {
    if (
      !mime &&
      /\.svg$/i.test(file.originalname) &&
      /^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(buffer.toString('utf8').slice(0, 1000))
    ) {
      mime = 'image/svg+xml';
      ext = 'svg';
    }
    if (
      !mime &&
      /\.dxf$/i.test(file.originalname) &&
      /SECTION/.test(buffer.toString('utf8').slice(0, 2000))
    ) {
      mime = 'application/dxf';
      ext = 'dxf';
    }
    if (![...photoMimes, 'application/pdf', 'image/svg+xml', 'application/dxf'].includes(mime))
      throw new HttpError(400, 'Usá PDF, SVG, DXF, JPG, PNG o WebP.');
    // Los originales de moldes conservan bytes, resolución y escala.
  } else {
    if (!photoMimes.includes(mime))
      throw new HttpError(400, 'Las fotos deben ser JPG, PNG o WebP.');
    try {
      buffer = await sharp(buffer, { limitInputPixels: 50000000 })
        .rotate()
        .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toBuffer();
    } catch {
      throw new HttpError(400, 'La imagen no es válida o es demasiado grande.');
    }
    mime = 'image/webp';
    ext = 'webp';
  }
  return {
    buffer,
    mime,
    ext,
    original: file.originalname.replace(/[\x00-\x1f"\\/]/g, '_').slice(0, 220),
  };
}
export async function storeFile(req, file, ownerType, ownerId, transaction) {
  const data = await prepare(file, ownerType);
  const key = `${ownerType}/${ownerId}/${randomUUID()}.${data.ext}`;
  if (env.STORAGE_PROVIDER === 'supabase') {
    const { error } = await supabase.storage
      .from(env.SUPABASE_BUCKET)
      .upload(key, data.buffer, { contentType: data.mime, upsert: false });
    if (error) throw new HttpError(502, 'No se pudo guardar el archivo. Intentá nuevamente.');
  } else {
    await mkdir(path.dirname(path.join(env.STORAGE_ROOT, key)), { recursive: true });
    await writeFile(path.join(env.STORAGE_ROOT, key), data.buffer, { flag: 'wx' });
  }
  try {
    return await db.stored_files.create(
      {
        key,
        original_name: data.original,
        mime_type: data.mime,
        size: data.buffer.length,
        provider: env.STORAGE_PROVIDER,
        owner_type: ownerType,
        owner_id: ownerId,
        created_by_user_id: req.actor?.id || null,
      },
      { transaction },
    );
  } catch (error) {
    await removeObject({ key, provider: env.STORAGE_PROVIDER }).catch(() => {});
    throw error;
  }
}
export async function removeObject(file) {
  if (file.provider === 'supabase') {
    const { error } = await supabase.storage.from(env.SUPABASE_BUCKET).remove([file.key]);
    if (error) throw error;
  } else await unlink(path.join(env.STORAGE_ROOT, file.key));
}
export async function sendFile(res, file, { inline = false, publicPhoto = false } = {}) {
  let buffer;
  if (file.provider === 'supabase') {
    const { data, error } = await supabase.storage.from(env.SUPABASE_BUCKET).download(file.key);
    if (error) throw new HttpError(404, 'El archivo no está disponible.');
    buffer = Buffer.from(await data.arrayBuffer());
  } else {
    try {
      buffer = await readFile(path.join(env.STORAGE_ROOT, file.key));
    } catch {
      throw new HttpError(404, 'El archivo no está disponible.');
    }
  }
  const isPhoto = photoMimes.includes(file.mime_type);
  res.set({
    'Content-Type': file.mime_type,
    'Content-Disposition': `${inline && isPhoto ? 'inline' : 'attachment'}; filename="${encodeURIComponent(file.original_name)}"`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  });
  if (publicPhoto) res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.send(buffer);
}
filesRouter.get(
  '/files/:id',
  wrap(async (req, res, next) => {
    const file = await must(db.stored_files, req.params.id);
    const area = { mold: 'molds', order: 'orders', lead: 'leads', portfolio: 'portfolio' }[
      file.owner_type
    ];
    if (!area) throw new HttpError(403, 'Archivo no accesible.');
    allow(area)(req, res, (error) => {
      if (error) return next(error);
      sendFile(res, file, { inline: req.query.inline === '1' }).catch(next);
    });
  }),
);

filesRouter.post(
  '/orders/:id/media',
  allow('orders'),
  upload.single('file'),
  wrap(async (req, res) => {
    const order = await must(db.work_orders, req.params.id);
    const stage = z.enum(['before', 'during', 'after', 'other']).parse(req.body.stage || 'other');
    const file = await storeFile(req, req.file, 'order', order.id);
    try {
      const row = await db.work_order_media.create({
        work_order_id: order.id,
        uploaded_by_user_id: req.actor.id,
        media_type: 'image',
        stage,
        stored_file_id: file.id,
        storage_type: file.provider,
        original_name: file.original_name,
        mime_type: file.mime_type,
        file_size: file.size,
        file_name: path.basename(file.key),
        is_public_portfolio_asset: false,
      });
      await audit(req, 'upload', 'work_order_media', row.id, { stage });
      ok(res, safe(row));
    } catch (error) {
      await removeObject(file).catch(() => {});
      await file.destroy();
      throw error;
    }
  }),
);
filesRouter.post(
  '/molds/:id/files',
  allow('molds'),
  upload.single('file'),
  wrap(async (req, res) => {
    const mold = await must(db.molds, req.params.id);
    const file = await storeFile(req, req.file, 'mold', mold.id);
    const type =
      file.mime_type === 'application/pdf'
        ? 'master_pdf'
        : ['image/svg+xml', 'application/dxf'].includes(file.mime_type)
          ? 'source'
          : 'reference';
    try {
      const row = await sequelize.transaction(async (transaction) => {
        await mold.reload({ transaction, lock: transaction.LOCK.UPDATE });
        const latest = await db.mold_files.max('version_number', {
          where: { mold_id: mold.id, file_type: type },
          transaction,
        });
        await db.mold_files.update(
          { is_current: false },
          { where: { mold_id: mold.id, file_type: type }, transaction },
        );
        const row = await db.mold_files.create(
          {
            mold_id: mold.id,
            uploaded_by_user_id: req.actor.id,
            stored_file_id: file.id,
            file_type: type,
            version_number: (Number(latest) || 0) + 1,
            title: String(req.body.title || file.original_name).slice(0, 180),
            description: String(req.body.description || '').slice(0, 5000),
            storage_type: file.provider,
            original_name: file.original_name,
            mime_type: file.mime_type,
            file_size: file.size,
            file_name: path.basename(file.key),
            is_current: true,
            is_printable: false,
            validation_status: 'pending',
            scale: '1:1',
            metadata: { sha256: createHash('sha256').update(req.file.buffer).digest('hex') },
          },
          { transaction },
        );
        if (type === 'master_pdf')
          await mold.update({ is_reference_verified: false }, { transaction });
        await audit(
          req,
          'version',
          'molds',
          mold.id,
          { file_id: row.id, version: row.version_number },
          transaction,
        );
        return row;
      });
      ok(res, safe(row));
    } catch (error) {
      await removeObject(file).catch(() => {});
      await file.destroy();
      throw error;
    }
  }),
);
filesRouter.post(
  '/molds/:id/files/:fileId/validate',
  allow('molds'),
  wrap(async (req, res) => {
    const data = z
      .object({
        measured_mm: z.coerce.number().min(99.5).max(100.5),
        physical_check: z.literal(true),
        notes: z.string().trim().min(10).max(5000),
      })
      .parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const mold = await must(db.molds, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const row = await must(db.mold_files, req.params.fileId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.mold_id !== mold.id || row.file_type !== 'master_pdf' || !row.is_current)
        throw new HttpError(409, 'Solo se valida la versión PDF actual.');
      if (!mold.dimensions_notes)
        throw new HttpError(400, 'Registrá las medidas del molde antes de validarlo.');
      await row.update(
        {
          validation_status: 'verified',
          is_printable: true,
          scale: '1:1',
          calibration_mm: data.measured_mm,
          validated_by_user_id: req.actor.id,
          validated_at: new Date(),
          validation_notes: data.notes,
        },
        { transaction },
      );
      await mold.update({ is_reference_verified: true }, { transaction });
      await audit(req, 'validate', 'mold_files', row.id, { ...data, scale: '1:1' }, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
filesRouter.get(
  '/molds/:id/files/:fileId/print',
  allow('molds'),
  wrap(async (req, res) => {
    const row = await must(db.mold_files, req.params.fileId);
    if (
      row.mold_id !== id(req.params.id) ||
      row.validation_status !== 'verified' ||
      !row.is_current ||
      row.scale !== '1:1' ||
      !row.is_printable
    )
      throw new HttpError(
        409,
        'El PDF actual debe superar la verificación física antes de imprimir.',
      );
    await sendFile(res, await must(db.stored_files, row.stored_file_id));
  }),
);

const galleryItem = z.object({
  file_id: z.coerce.number().int().positive(),
  stage: z.enum(['before', 'during', 'after', 'other']),
  caption: z.string().max(300).default(''),
  alt: z.string().trim().min(3).max(300),
  pair: z.string().max(60).default(''),
  cover: z.boolean().default(false),
});
const portfolioSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3).max(180),
  service: z.string().min(2).max(100),
  vehicle_description: optionalText(180),
  summary: optionalText(5000),
  materials: optionalText(500),
  work_order_id: optionalId,
  gallery: z.array(galleryItem).max(60).default([]),
  featured: z.boolean().default(false),
  consent: z.boolean().default(false),
});
export function publicPortfolio(row) {
  const v = safe(row);
  return {
    id: v.id,
    slug: v.slug,
    title: v.title,
    service: v.service,
    vehicle_description: v.vehicle_description,
    summary: v.summary,
    materials: v.materials,
    featured: v.featured,
    published_at: v.published_at,
    gallery: v.gallery.map((g) => ({ ...g, url: `/api/public/media/${v.id}/${g.file_id}` })),
  };
}
async function checkGallery(data, portfolioId, transaction) {
  const seen = new Set();
  for (const item of data.gallery) {
    if (seen.has(item.file_id)) throw new HttpError(400, 'Hay imágenes repetidas en la galería.');
    seen.add(item.file_id);
    const file = await must(db.stored_files, item.file_id, { transaction });
    if (
      !photoMimes.includes(file.mime_type) ||
      !(
        (file.owner_type === 'portfolio' && file.owner_id === portfolioId) ||
        (file.owner_type === 'order' && file.owner_id === data.work_order_id)
      )
    )
      throw new HttpError(400, 'La foto no pertenece a esta galería ni a su orden.');
  }
  if (data.gallery.filter((g) => g.cover).length > 1)
    throw new HttpError(400, 'Elegí una única portada.');
}
filesRouter.get(
  '/portfolio',
  allow('portfolio'),
  wrap(async (req, res) => list(res, db.portfolio_entries, req.query)),
);
filesRouter.get(
  '/portfolio/:id',
  allow('portfolio'),
  wrap(async (req, res) => {
    const row = await must(db.portfolio_entries, req.params.id);
    const own = await db.stored_files.findAll({
      where: { owner_type: 'portfolio', owner_id: row.id },
    });
    const order = row.work_order_id
      ? await db.stored_files.findAll({
          where: { owner_type: 'order', owner_id: row.work_order_id },
        })
      : [];
    ok(res, { ...safe(row), available_files: [...own, ...order].map(safe) });
  }),
);
filesRouter.post(
  '/portfolio',
  allow('portfolio'),
  wrap(async (req, res) => {
    const data = portfolioSchema.parse(req.body);
    if (data.gallery.length) throw new HttpError(400, 'Creá la galería y luego cargá las fotos.');
    const row = await db.portfolio_entries.create({ ...data, created_by_user_id: req.actor.id });
    await audit(req, 'create', 'portfolio_entries', row.id, { title: row.title });
    ok(res, safe(row));
  }),
);
filesRouter.put(
  '/portfolio/:id',
  allow('portfolio'),
  wrap(async (req, res) => {
    const data = portfolioSchema.parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.portfolio_entries, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.status === 'published')
        throw new HttpError(409, 'Retirá la publicación para editarla y volver a revisarla.');
      await checkGallery(data, row.id, transaction);
      await row.update(data, { transaction });
      await audit(req, 'update', 'portfolio_entries', row.id, { title: row.title }, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
filesRouter.post(
  '/portfolio/:id/media',
  allow('portfolio'),
  upload.single('file'),
  wrap(async (req, res) => {
    const row = await must(db.portfolio_entries, req.params.id);
    if (row.status === 'published')
      throw new HttpError(409, 'Retirá la publicación para editarla.');
    const file = await storeFile(req, req.file, 'portfolio', row.id);
    await audit(req, 'upload', 'portfolio_entries', row.id, { file_id: file.id });
    ok(res, safe(file));
  }),
);
filesRouter.post(
  '/portfolio/:id/publish',
  allow('portfolio'),
  wrap(async (req, res) => {
    const { publish } = z.object({ publish: z.boolean() }).parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.portfolio_entries, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (publish) {
        if (!row.consent)
          throw new HttpError(400, 'Confirmá la autorización para publicar las fotos.');
        if (!row.gallery.length || !row.gallery.some((g) => g.cover))
          throw new HttpError(400, 'Agregá fotos y elegí una portada.');
        await checkGallery(row, row.id, transaction);
        const pairs = [...new Set(row.gallery.map((g) => g.pair).filter(Boolean))];
        for (const pair of pairs) {
          const images = row.gallery.filter((g) => g.pair === pair);
          if (
            images.length !== 2 ||
            !images.some((g) => g.stage === 'before') ||
            !images.some((g) => g.stage === 'after')
          )
            throw new HttpError(
              400,
              `El comparador ${pair} necesita una foto antes y una después.`,
            );
        }
      }
      await row.update(
        { status: publish ? 'published' : 'draft', published_at: publish ? new Date() : null },
        { transaction },
      );
      await audit(
        req,
        publish ? 'publish' : 'unpublish',
        'portfolio_entries',
        row.id,
        {},
        transaction,
      );
      return row;
    });
    ok(res, safe(row));
  }),
);
