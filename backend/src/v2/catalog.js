import { Router } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import { db, sequelize } from '../database/v2.js';
import {
  wrap,
  ok,
  safe,
  id,
  must,
  amount,
  optionalId,
  optionalText,
  allow,
  owner,
  audit,
  list,
  HttpError,
} from './common.js';
import { siteDefaults } from './defaults.js';
const name = (n) => z.string().trim().min(1).max(n);
const active = z.boolean().default(true);
const email = z.union([z.email().max(150), z.literal(''), z.null()]).optional();
const baseClient = z.object({
  client_type: z.enum(['individual', 'company']).default('individual'),
  first_name: optionalText(120),
  last_name: optionalText(120),
  company_name: optionalText(180),
  company_kind: z.enum(['other', 'dealership', 'fleet']).default('other'),
  tax_id: optionalText(30),
  email,
  phone: optionalText(50),
  secondary_phone: optionalText(50),
  address: optionalText(),
  city: optionalText(120),
  province: optionalText(100),
  notes: optionalText(5000),
  payment_terms: optionalText(),
  credit_limit: amount.default(0),
  is_active: active,
});
const clientSchema = baseClient.refine(
  (v) => (v.client_type === 'company' ? !!v.company_name : !!(v.first_name || v.last_name)),
  'Completá el nombre del cliente o de la empresa.',
);
const definitions = {
  clients: {
    model: 'clients',
    area: 'clients',
    schema: clientSchema,
    search: ['first_name', 'last_name', 'company_name', 'phone'],
  },
  vehicles: {
    model: 'vehicles',
    area: 'vehicles',
    schema: z.object({
      client_id: z.coerce.number().int().positive(),
      brand_id: optionalId,
      model_id: optionalId,
      vehicle_type: z
        .enum(['car', 'truck', 'van', 'bus', 'boat', 'aircraft', 'other'])
        .default('car'),
      nickname: name(120),
      year: z.preprocess(
        (v) => (v === '' ? null : v),
        z.coerce.number().int().min(1900).max(2100).nullable().optional(),
      ),
      version: optionalText(120),
      plate: optionalText(20),
      vin: optionalText(100),
      color: optionalText(60),
      notes: optionalText(5000),
      is_active: active,
    }),
    search: ['nickname', 'plate', 'version'],
  },
  suppliers: {
    model: 'suppliers',
    area: 'suppliers',
    schema: z.object({
      name: name(180),
      contact_name: optionalText(120),
      email,
      phone: optionalText(50),
      tax_id: optionalText(30),
      address: optionalText(),
      notes: optionalText(5000),
      is_active: active,
    }),
    search: ['name', 'contact_name', 'phone'],
  },
  materials: {
    model: 'materials',
    area: 'materials',
    schema: z.object({
      code: name(50).transform((v) => v.toUpperCase()),
      name: name(150),
      category_id: optionalId,
      description: optionalText(5000),
      unit: z.enum(['unit', 'm', 'm2', 'l', 'kg']).default('m2'),
      color: optionalText(80),
      stock_minimum: amount.default(0),
      cost_reference: amount.default(0),
      storage_location: optionalText(150),
      notes: optionalText(5000),
      is_active: active,
    }),
    search: ['name', 'code', 'color'],
  },
  molds: {
    model: 'molds',
    area: 'molds',
    schema: z
      .object({
        code: name(80).transform((v) => v.toUpperCase()),
        title: name(180),
        technical_part_id: z.coerce.number().int().positive(),
        brand_id: optionalId,
        model_id: optionalId,
        vehicle_type: name(40).default('car'),
        year_from: z.preprocess(
          (v) => (v === '' ? null : v),
          z.coerce.number().int().min(1900).max(2100).nullable().optional(),
        ),
        year_to: z.preprocess(
          (v) => (v === '' ? null : v),
          z.coerce.number().int().min(1900).max(2100).nullable().optional(),
        ),
        version_label: optionalText(120),
        material_reference: optionalText(120),
        dimensions_notes: optionalText(5000),
        technical_notes: optionalText(10000),
        print_notes: optionalText(5000),
        is_active: active,
      })
      .refine(
        (v) => !v.year_from || !v.year_to || v.year_to >= v.year_from,
        'El rango de años es inválido.',
      ),
    search: ['title', 'code', 'version_label', 'material_reference'],
  },
  agenda: {
    model: 'appointments',
    area: 'agenda',
    schema: z
      .object({
        title: name(180),
        starts_at: z.iso.datetime({ offset: true }),
        ends_at: z.union([z.iso.datetime({ offset: true }), z.null()]).optional(),
        work_order_id: optionalId,
        client_id: optionalId,
        assigned_user_id: optionalId,
        status: z.enum(['scheduled', 'done', 'cancelled']).default('scheduled'),
        notes: optionalText(5000),
      })
      .refine(
        (v) => !v.ends_at || Date.parse(v.ends_at) > Date.parse(v.starts_at),
        'La finalización debe ser posterior al inicio.',
      ),
    search: ['title'],
  },
};
export const catalogRouter = Router();
for (const [route, d] of Object.entries(definitions)) {
  const model = db[d.model];
  catalogRouter.get(
    '/' + route,
    allow(d.area),
    wrap(async (req, res) => {
      const where = {};
      if (req.query.q) {
        const term = String(req.query.q).slice(0, 100);
        where[Op.or] = d.search.map((k) => ({ [k]: { [Op.iLike]: `%${term}%` } }));
      }
      if (route === 'clients' && req.query.kind === 'dealership') where.company_kind = 'dealership';
      if (route === 'agenda' && req.query.from)
        where.starts_at = {
          [Op.gte]: new Date(z.iso.datetime({ offset: true }).parse(req.query.from)),
        };
      await list(res, model, req.query, where);
    }),
  );
  catalogRouter.get(
    '/' + route + '/:id',
    allow(d.area),
    wrap(async (req, res) => {
      const row = await must(model, req.params.id);
      const value = safe(row);
      if (route === 'molds')
        value.files = (
          await db.mold_files.findAll({
            where: { mold_id: row.id },
            order: [['version_number', 'DESC']],
          })
        ).map(safe);
      if (route === 'clients')
        value.vehicles = (await db.vehicles.findAll({ where: { client_id: row.id } })).map(safe);
      ok(res, value);
    }),
  );
  const save = (update) =>
    wrap(async (req, res) => {
      const data = d.schema.parse(req.body);
      if (data.model_id) {
        const m = await must(db.vehicle_models, data.model_id);
        if (data.brand_id && m.brand_id !== data.brand_id)
          throw new HttpError(400, 'El modelo no corresponde a la marca.');
      }
      const record = await sequelize.transaction(async (transaction) => {
        let row;
        if (update) {
          row = await must(model, req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
          await row.update(data, { transaction });
        } else
          row = await model.create(
            {
              ...data,
              ...(route === 'molds' ? { created_by_user_id: req.actor.id } : {}),
              ...(route === 'materials' ? { stock_current: 0 } : {}),
            },
            { transaction },
          );
        await audit(req, update ? 'update' : 'create', d.model, row.id, data, transaction);
        return row;
      });
      ok(res, safe(record));
    });
  catalogRouter.post('/' + route, allow(d.area), save(false));
  catalogRouter.put('/' + route + '/:id', allow(d.area), save(true));
}
catalogRouter.get(
  '/lookups',
  wrap(async (req, res) => {
    const [
      users,
      statuses,
      brands,
      models,
      parts,
      categories,
      clients,
      vehicles,
      materials,
      molds,
      suppliers,
      orders,
      roles,
    ] = await Promise.all([
      db.users.findAll({
        attributes: ['id', 'first_name', 'last_name', 'role_id'],
        where: { is_active: true },
      }),
      db.work_order_statuses.findAll({ order: [['sort_order', 'ASC']] }),
      db.vehicle_brands.findAll(),
      db.vehicle_models.findAll(),
      db.technical_parts.findAll(),
      db.material_categories.findAll(),
      db.clients.findAll({
        attributes: ['id', 'first_name', 'last_name', 'company_name', 'client_type'],
        where: { is_active: true },
        limit: 1000,
      }),
      db.vehicles.findAll({
        attributes: ['id', 'client_id', 'nickname', 'plate'],
        where: { is_active: true },
        limit: 1000,
      }),
      db.materials.findAll({
        attributes: ['id', 'code', 'name', 'unit', 'stock_current', 'cost_reference'],
        where: { is_active: true },
        limit: 1000,
      }),
      db.molds.findAll({
        attributes: ['id', 'code', 'title'],
        where: { is_active: true },
        limit: 1000,
      }),
      db.suppliers.findAll({ attributes: ['id', 'name'], where: { is_active: true }, limit: 1000 }),
      db.work_orders.findAll({
        attributes: ['id', 'code', 'title', 'client_id'],
        where: { is_active: true },
        limit: 1000,
        order: [['id', 'DESC']],
      }),
      db.roles.findAll({ attributes: ['id', 'name', 'description'] }),
    ]);
    ok(res, {
      users,
      statuses,
      brands,
      models,
      parts,
      categories,
      clients,
      vehicles,
      materials,
      molds,
      suppliers,
      orders,
      roles,
    });
  }),
);
catalogRouter.post(
  '/catalogs/:kind',
  owner,
  wrap(async (req, res) => {
    const table = {
      brands: 'vehicle_brands',
      models: 'vehicle_models',
      parts: 'technical_parts',
      categories: 'material_categories',
    }[req.params.kind];
    if (!table) throw new HttpError(404, 'Catálogo inexistente.');
    const data = z
      .object({ name: name(120), code: optionalText(60), brand_id: optionalId })
      .parse(req.body);
    if (table === 'technical_parts' && !data.code) throw new HttpError(400, 'Completá el código.');
    if (table === 'vehicle_models' && !data.brand_id) throw new HttpError(400, 'Elegí la marca.');
    if (['vehicle_brands', 'vehicle_models'].includes(table))
      data.slug = data.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const row = await db[table].create(data);
    await audit(req, 'create', table, row.id, data);
    ok(res, safe(row));
  }),
);
export async function getSiteSettings() {
  const item = await db.settings.findOne({ where: { key: 'website_v2' } });
  return { ...siteDefaults, ...item?.value };
}
const siteSchema = z.object({
  name: name(100),
  tagline: name(150),
  city: name(150),
  phone: z.string().max(50),
  whatsapp: z
    .string()
    .max(30)
    .regex(/^[+\d\s()-]*$/),
  email: z.union([z.email(), z.literal('')]),
  address: z.string().max(255),
  hours: z.string().max(1000),
  instagram: z.union([z.url().startsWith('https://'), z.literal('')]),
  facebook: z.union([z.url().startsWith('https://'), z.literal('')]),
  show_address: z.boolean(),
  about: z.string().max(5000),
  services: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: name(120),
        description: name(1000),
        enabled: z.boolean(),
      }),
    )
    .min(1)
    .max(20),
  privacy_text: z.string().min(20).max(10000),
  nexodigital_url: z.literal('https://nexodigital-ix6r.onrender.com/'),
});
catalogRouter.get(
  '/settings/site',
  owner,
  wrap(async (req, res) => ok(res, await getSiteSettings())),
);
catalogRouter.put(
  '/settings/site',
  owner,
  wrap(async (req, res) => {
    const value = siteSchema.parse(req.body);
    await db.settings.upsert({
      key: 'website_v2',
      value,
      is_public: true,
      description: 'Contenido público de Líder',
    });
    await audit(req, 'update', 'settings', 'website_v2', { fields: Object.keys(value) });
    ok(res, value);
  }),
);
catalogRouter.get(
  '/audit',
  owner,
  wrap(async (req, res) => {
    const where = {};
    if (req.query.entity) where.entity = String(req.query.entity);
    await list(res, db.audit_logs, req.query, where);
  }),
);
