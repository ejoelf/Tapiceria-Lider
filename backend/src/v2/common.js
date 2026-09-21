import { z } from 'zod';
import Decimal from 'decimal.js';
import { db } from '../database/v2.js';
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.statusCode = status;
  }
}
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const id = (value) => z.coerce.number().int().positive().parse(value);
export const amount = z.coerce
  .number()
  .finite()
  .min(0)
  .max(9999999999)
  .refine((v) => new Decimal(v).decimalPlaces() <= 2, 'Usá como máximo 2 decimales.');
export const positive = amount.refine((v) => v > 0, 'El importe debe ser mayor a cero.');
export const optionalId = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.number().int().positive().nullable(),
);
export const optionalText = (max = 255) => z.string().trim().max(max).nullable().optional();
export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v + 'T12:00:00Z')) &&
      new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v,
    'Fecha inválida.',
  );
export const money = (v) => new Decimal(v || 0).toDecimalPlaces(2).toFixed(2);
export const safe = (row) => {
  if (!row) return null;
  const data = row.get ? row.get({ plain: true }) : { ...row };
  delete data.password_hash;
  delete data.auth_user_id;
  delete data.provider_session;
  delete data.token_hash;
  return data;
};
export const ok = (res, data, meta) => res.json({ ok: true, data, ...(meta ? { meta } : {}) });
export const must = async (model, key, opts = {}) => {
  const row = await model.findByPk(id(key), opts);
  if (!row) throw new HttpError(404, 'No se encontró el registro.');
  return row;
};
export const isOwner = (req) =>
  ['owner', 'admin', 'super_admin', 'superadmin'].includes(req.actor?.role?.name);
const roleAreas = {
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
export const allow = (area) => (req, res, next) => {
  if (isOwner(req) || roleAreas[req.actor?.role?.name]?.includes(area)) return next();
  next(new HttpError(403, 'Tu rol no permite esta acción.'));
};
export const owner = (req, res, next) =>
  isOwner(req) ? next() : next(new HttpError(403, 'Solo los administradores pueden hacer esto.'));
export async function audit(req, action, entity, entityId, changes = {}, transaction) {
  const clean = { ...changes };
  for (const k of Object.keys(clean))
    if (/password|token|secret|file_path|key/i.test(k)) delete clean[k];
  await db.audit_logs.create(
    {
      user_id: req.actor?.id || null,
      action,
      entity,
      entity_id: String(entityId),
      changes: clean,
      request_id: req.id,
    },
    { transaction },
  );
}
export function pagination(query) {
  const page = Math.max(1, Math.min(100000, Math.floor(Number(query.page)) || 1));
  const pageSize = Math.max(1, Math.min(500, Math.floor(Number(query.pageSize)) || 50));
  return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize };
}
export async function list(res, model, query, where = {}, options = {}) {
  const { page, pageSize, limit, offset } = pagination(query);
  const { rows, count } = await model.findAndCountAll({
    where,
    limit,
    offset,
    order: [['id', 'DESC']],
    ...options,
  });
  ok(res, rows.map(safe), { page, pageSize, total: count });
}
export function quoteTotals(items, discount = 0, tax = 0) {
  const subtotal = items.reduce(
    (sum, item) => sum.plus(new Decimal(item.quantity).times(item.unit_price).toDecimalPlaces(2)),
    new Decimal(0),
  );
  if (new Decimal(discount).gt(subtotal))
    throw new HttpError(400, 'El descuento supera el subtotal.');
  return {
    subtotal: money(subtotal),
    discount: money(discount),
    tax_rate: money(tax),
    total: money(subtotal.minus(discount).times(new Decimal(1).plus(new Decimal(tax).div(100)))),
  };
}
