import { Router } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import { db, sequelize } from '../database/v2.js';
import {
  wrap,
  ok,
  safe,
  id,
  must,
  amount,
  positive,
  optionalId,
  optionalText,
  dateOnly,
  money,
  allow,
  owner,
  audit,
  list,
  HttpError,
  quoteTotals,
} from './common.js';
import { getSiteSettings } from './catalog.js';

export const workshopRouter = Router();
const title = z.string().trim().min(2).max(180);
const code = (prefix) =>
  `${prefix}-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
const payment = z.enum(['cash', 'transfer', 'card', 'other']).default('transfer');
const optionalDate = z
  .union([dateOnly, z.null(), z.literal('')])
  .optional()
  .transform((v) => v || null);
async function checkVehicle(clientId, vehicleId, transaction) {
  if (vehicleId) {
    const v = await must(db.vehicles, vehicleId, { transaction });
    if (v.client_id !== clientId)
      throw new HttpError(400, 'El vehículo no pertenece al cliente elegido.');
  }
}

const leadSchema = z.object({
  name: title,
  email: z.union([z.email().max(150), z.literal('')]).optional(),
  phone: optionalText(50),
  client_type: z.enum(['individual', 'company']).default('individual'),
  vehicle_description: optionalText(),
  service: optionalText(100),
  message: z.string().trim().min(5).max(5000),
  source: z.enum(['web', 'whatsapp', 'phone', 'referral', 'other']).default('other'),
  consent: z.boolean().default(false),
});
workshopRouter.get(
  '/leads',
  allow('leads'),
  wrap(async (req, res) => {
    const where = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.q)
      where[Op.or] = ['name', 'phone', 'email'].map((k) => ({
        [k]: { [Op.iLike]: `%${String(req.query.q).slice(0, 100)}%` },
      }));
    await list(res, db.leads, req.query, where);
  }),
);
workshopRouter.post(
  '/leads',
  allow('leads'),
  wrap(async (req, res) => {
    const row = await db.leads.create(leadSchema.parse(req.body));
    await audit(req, 'create', 'leads', row.id);
    ok(res, safe(row));
  }),
);
workshopRouter.get(
  '/leads/:id',
  allow('leads'),
  wrap(async (req, res) => {
    const row = await must(db.leads, req.params.id);
    ok(res, {
      ...safe(row),
      files: (
        await db.stored_files.findAll({ where: { owner_type: 'lead', owner_id: row.id } })
      ).map(safe),
      messages: (
        await db.outbox_messages.findAll({ where: { lead_id: row.id }, order: [['id', 'DESC']] })
      ).map(safe),
    });
  }),
);
workshopRouter.patch(
  '/leads/:id',
  allow('leads'),
  wrap(async (req, res) => {
    const data = z
      .object({
        status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
        assigned_user_id: optionalId,
        next_contact_at: z.union([z.iso.datetime({ offset: true }), z.null()]).optional(),
        notes: optionalText(5000),
      })
      .parse(req.body);
    const row = await must(db.leads, req.params.id);
    await row.update(data);
    await audit(req, 'update', 'leads', row.id, data);
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/leads/:id/client',
  allow('leads'),
  wrap(async (req, res) => {
    const client = await sequelize.transaction(async (transaction) => {
      const lead = await must(db.leads, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (lead.client_id) return must(db.clients, lead.client_id, { transaction });
      const row = await db.clients.create(
        {
          client_type: lead.client_type,
          first_name: lead.client_type === 'individual' ? lead.name : null,
          company_name: lead.client_type === 'company' ? lead.name : null,
          email: lead.email || null,
          phone: lead.phone,
          notes: 'Creado desde una consulta web.',
        },
        { transaction },
      );
      await lead.update({ client_id: row.id, status: 'contacted' }, { transaction });
      await audit(req, 'convert', 'leads', lead.id, { client_id: row.id }, transaction);
      return row;
    });
    ok(res, safe(client));
  }),
);

const orderSchema = z
  .object({
    title,
    client_id: z.coerce.number().int().positive(),
    vehicle_id: optionalId,
    service_type: z.string().min(1).max(100),
    description: optionalText(5000),
    internal_notes: optionalText(10000),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assigned_user_id: optionalId,
    mold_id: optionalId,
    estimated_start_date: optionalDate,
    estimated_end_date: optionalDate,
    estimated_price: amount.default(0),
    final_price: amount.default(0),
    labor_hours: amount.default(0),
    labor_hour_cost: amount.default(0),
    other_costs: amount.default(0),
    customer_reference: optionalText(120),
    source_channel: z.enum(['web', 'whatsapp', 'dealership', 'referral', 'other']).default('other'),
  })
  .refine(
    (v) =>
      !v.estimated_start_date ||
      !v.estimated_end_date ||
      v.estimated_end_date >= v.estimated_start_date,
    'Revisá las fechas de entrega.',
  );
workshopRouter.get(
  '/orders',
  allow('orders'),
  wrap(async (req, res) => {
    const where = {};
    if (req.query.status) where.current_status_id = id(req.query.status);
    if (req.query.client_id) where.client_id = id(req.query.client_id);
    if (req.query.q)
      where[Op.or] = ['code', 'title'].map((k) => ({
        [k]: { [Op.iLike]: `%${String(req.query.q).slice(0, 100)}%` },
      }));
    await list(res, db.work_orders, req.query, where);
  }),
);
async function createOrder(req, data, transaction, statusCode = 'received') {
  await checkVehicle(data.client_id, data.vehicle_id, transaction);
  const client = await must(db.clients, data.client_id, { transaction });
  const vehicle = data.vehicle_id
    ? await must(db.vehicles, data.vehicle_id, { transaction })
    : null;
  const status = await db.work_order_statuses.findOne({ where: { code: statusCode }, transaction });
  if (!status) throw new HttpError(409, 'Faltan los catálogos iniciales. Ejecutá db:seed.');
  const row = await db.work_orders.create(
    {
      ...data,
      code: code('OT'),
      current_status_id: status.id,
      created_by_user_id: req.actor.id,
      client_snapshot: safe(client),
      vehicle_snapshot: safe(vehicle),
    },
    { transaction },
  );
  await db.work_order_status_history.create(
    {
      work_order_id: row.id,
      new_status_id: status.id,
      changed_by_user_id: req.actor.id,
      note: 'Alta de orden',
    },
    { transaction },
  );
  await audit(req, 'create', 'work_orders', row.id, { title: row.title }, transaction);
  return row;
}
workshopRouter.post(
  '/orders',
  allow('orders'),
  wrap(async (req, res) => {
    const data = orderSchema.parse(req.body);
    ok(res, safe(await sequelize.transaction((t) => createOrder(req, data, t))));
  }),
);
workshopRouter.put(
  '/orders/:id',
  allow('orders'),
  wrap(async (req, res) => {
    const data = orderSchema.parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      await checkVehicle(data.client_id, data.vehicle_id, transaction);
      const row = await must(db.work_orders, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const status = await must(db.work_order_statuses, row.current_status_id, { transaction });
      if (['delivered', 'cancelled'].includes(status.code))
        throw new HttpError(409, 'Reabrí la orden antes de editarla.');
      const paid =
        (await db.incomes.sum('amount', {
          where: { work_order_id: row.id, voided_at: null },
          transaction,
        })) || 0;
      if (new Decimal(data.final_price).lt(paid))
        throw new HttpError(409, 'El precio no puede ser menor al importe ya cobrado.');
      await row.update(data, { transaction });
      await audit(req, 'update', 'work_orders', row.id, data, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
const transitions = {
  received: ['quoted', 'approved', 'cancelled'],
  quoted: ['approved', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['paused', 'completed', 'cancelled'],
  paused: ['in_progress', 'cancelled'],
  completed: ['in_progress', 'delivered'],
  delivered: ['in_progress'],
  cancelled: ['received'],
};
workshopRouter.post(
  '/orders/:id/status',
  allow('orders'),
  wrap(async (req, res) => {
    const data = z
      .object({
        status_id: z.coerce.number().int().positive(),
        note: z.string().trim().min(3).max(2000),
      })
      .parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.work_orders, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const before = await must(db.work_order_statuses, row.current_status_id, { transaction });
      const after = await must(db.work_order_statuses, data.status_id, { transaction });
      if (!transitions[before.code]?.includes(after.code))
        throw new HttpError(409, 'Ese cambio de estado no está permitido.');
      await db.work_order_status_history.create(
        {
          work_order_id: row.id,
          previous_status_id: before.id,
          new_status_id: after.id,
          changed_by_user_id: req.actor.id,
          note: data.note,
        },
        { transaction },
      );
      await row.update(
        {
          current_status_id: after.id,
          ...(after.code === 'in_progress'
            ? {
                actual_start_date: row.actual_start_date || new Date(),
                completed_at: null,
                delivered_at: null,
              }
            : {}),
          ...(after.code === 'completed' ? { completed_at: new Date() } : {}),
          ...(after.code === 'delivered' ? { delivered_at: new Date() } : {}),
          ...(after.code === 'received'
            ? { actual_start_date: null, completed_at: null, delivered_at: null }
            : {}),
        },
        { transaction },
      );
      await audit(
        req,
        'status',
        'work_orders',
        row.id,
        { from: before.code, to: after.code, note: data.note },
        transaction,
      );
      return row;
    });
    ok(res, safe(row));
  }),
);
export async function orderFinancials(row) {
  const movements = await db.inventory_movements.findAll({
    where: { work_order_id: row.id, movement_type: 'out' },
  });
  const materialCost = movements.reduce(
    (sum, m) => sum.plus(new Decimal(m.quantity).times(m.unit_cost)),
    new Decimal(0),
  );
  const expenses = new Decimal(
    (await db.expenses.sum('amount', {
      where: { work_order_id: row.id, voided_at: null, purchase_id: null },
    })) || 0,
  );
  const costs = materialCost
    .plus(new Decimal(row.labor_hours).times(row.labor_hour_cost))
    .plus(row.other_costs)
    .plus(expenses);
  const paid = new Decimal(
    (await db.incomes.sum('amount', { where: { work_order_id: row.id, voided_at: null } })) || 0,
  );
  return {
    material_cost: money(materialCost),
    expenses: money(expenses),
    total_cost: money(costs),
    paid: money(paid),
    balance: money(new Decimal(row.final_price).minus(paid)),
    margin: money(new Decimal(row.final_price).minus(costs)),
  };
}
workshopRouter.get(
  '/orders/:id',
  allow('orders'),
  wrap(async (req, res) => {
    const row = await must(db.work_orders, req.params.id);
    const [history, media, movements, incomes, finances] = await Promise.all([
      db.work_order_status_history.findAll({
        where: { work_order_id: row.id },
        order: [['id', 'DESC']],
      }),
      db.work_order_media.findAll({ where: { work_order_id: row.id, is_active: true } }),
      db.inventory_movements.findAll({ where: { work_order_id: row.id } }),
      db.incomes.findAll({ where: { work_order_id: row.id } }),
      orderFinancials(row),
    ]);
    ok(res, {
      ...safe(row),
      history: history.map(safe),
      media: media.map(safe),
      movements: movements.map(safe),
      incomes: incomes.map(safe),
      finances,
    });
  }),
);

const quoteSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  vehicle_id: optionalId,
  lead_id: optionalId,
  items: z
    .array(z.object({ description: title, quantity: positive, unit_price: amount }))
    .min(1)
    .max(100),
  discount: amount.default(0),
  tax_rate: amount.max(100).default(0),
  valid_until: optionalDate,
  notes: optionalText(10000),
});
workshopRouter.get(
  '/quotes',
  allow('quotes'),
  wrap(async (req, res) => {
    const where = {};
    if (req.query.client_id) where.client_id = id(req.query.client_id);
    await list(res, db.quotes, req.query, where);
  }),
);
workshopRouter.get(
  '/quotes/:id',
  allow('quotes'),
  wrap(async (req, res) => ok(res, safe(await must(db.quotes, req.params.id)))),
);
workshopRouter.post(
  '/quotes',
  allow('quotes'),
  wrap(async (req, res) => {
    const data = quoteSchema.parse(req.body);
    await checkVehicle(data.client_id, data.vehicle_id);
    const row = await db.quotes.create({
      ...data,
      ...quoteTotals(data.items, data.discount, data.tax_rate),
      code: code('PRE'),
      created_by_user_id: req.actor.id,
    });
    await audit(req, 'create', 'quotes', row.id, { total: row.total });
    ok(res, safe(row));
  }),
);
workshopRouter.put(
  '/quotes/:id',
  allow('quotes'),
  wrap(async (req, res) => {
    const data = quoteSchema.parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.quotes, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.status !== 'draft')
        throw new HttpError(409, 'Creá una revisión para modificar un presupuesto enviado.');
      await checkVehicle(data.client_id, data.vehicle_id, transaction);
      await row.update(
        { ...data, ...quoteTotals(data.items, data.discount, data.tax_rate) },
        { transaction },
      );
      await audit(req, 'update', 'quotes', row.id, { total: row.total }, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/quotes/:id/revise',
  allow('quotes'),
  wrap(async (req, res) => {
    const row = await sequelize.transaction(async (transaction) => {
      const old = await must(db.quotes, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (['accepted', 'superseded'].includes(old.status))
        throw new HttpError(409, 'El presupuesto ya fue aceptado o reemplazado.');
      const copy = safe(old);
      delete copy.id;
      delete copy.createdAt;
      delete copy.updatedAt;
      await old.update({ status: 'superseded' }, { transaction });
      const revision = await db.quotes.create(
        {
          ...copy,
          code: code('PRE'),
          parent_quote_id: old.id,
          version: old.version + 1,
          status: 'draft',
          created_by_user_id: req.actor.id,
        },
        { transaction },
      );
      await audit(req, 'revise', 'quotes', revision.id, { parent_quote_id: old.id }, transaction);
      return revision;
    });
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/quotes/:id/status',
  allow('quotes'),
  wrap(async (req, res) => {
    const data = z
      .object({
        status: z.enum(['sent', 'accepted', 'rejected']),
        acceptance_note: optionalText(3000),
      })
      .parse(req.body);
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.quotes, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.status === 'accepted' && data.status === 'accepted') return row;
      if (
        !(
          { draft: ['sent', 'rejected'], sent: ['accepted', 'rejected'] }[row.status] || []
        ).includes(data.status)
      )
        throw new HttpError(409, 'Cambio de estado inválido.');
      const changes = { status: data.status };
      if (data.status === 'accepted') {
        if (!data.acceptance_note || data.acceptance_note.trim().length < 5)
          throw new HttpError(400, 'Registrá cómo y cuándo aceptó el cliente.');
        if (
          row.valid_until &&
          row.valid_until <
            new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Cordoba' })
        )
          throw new HttpError(409, 'El presupuesto venció. Creá una revisión.');
        const order = await createOrder(
          req,
          {
            title: row.items[0].description,
            client_id: row.client_id,
            vehicle_id: row.vehicle_id,
            service_type: 'Tapicería',
            description: row.items.map((i) => `${i.quantity} × ${i.description}`).join('\n'),
            estimated_price: row.total,
            final_price: row.total,
          },
          transaction,
          'approved',
        );
        Object.assign(changes, {
          work_order_id: order.id,
          accepted_at: new Date(),
          acceptance_note: data.acceptance_note,
        });
        if (row.lead_id)
          await db.leads.update({ status: 'won' }, { where: { id: row.lead_id }, transaction });
      }
      await row.update(changes, { transaction });
      await audit(req, 'status', 'quotes', row.id, changes, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
workshopRouter.get(
  '/quotes/:id/pdf',
  allow('quotes'),
  wrap(async (req, res) => {
    const row = await must(db.quotes, req.params.id);
    const client = await must(db.clients, row.client_id);
    const site = await getSiteSettings();
    const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true });
    res.type('pdf').set('Content-Disposition', `attachment; filename="${row.code}.pdf"`);
    doc.pipe(res);
    doc.fontSize(26).text('LÍDER').fontSize(10).text(site.tagline).text(site.city).moveDown();
    doc
      .fontSize(18)
      .text(`Presupuesto ${row.code}`)
      .fontSize(10)
      .text(`Versión ${row.version} · ${row.status}`)
      .text(
        `Cliente: ${client.company_name || [client.first_name, client.last_name].filter(Boolean).join(' ')}`,
      )
      .text(`Válido hasta: ${row.valid_until || 'A convenir'}`)
      .moveDown();
    for (const item of row.items) {
      if (doc.y > 695) doc.addPage();
      doc
        .fontSize(11)
        .text(item.description)
        .fontSize(10)
        .text(
          `${item.quantity} × ARS ${money(item.unit_price)}     ARS ${money(new Decimal(item.quantity).times(item.unit_price))}`,
          { align: 'right' },
        )
        .moveDown(0.7);
    }
    if (doc.y > 610) doc.addPage();
    doc
      .moveDown()
      .fontSize(10)
      .text(`Subtotal: ARS ${row.subtotal}`, { align: 'right' })
      .text(`Descuento: ARS ${row.discount}`, { align: 'right' })
      .text(`Impuestos: ${row.tax_rate}%`, { align: 'right' })
      .fontSize(16)
      .text(`Total: ARS ${row.total}`, { align: 'right' })
      .moveDown()
      .fontSize(10)
      .text(row.notes || 'El alcance se confirma con la revisión de la pieza.')
      .moveDown()
      .fontSize(9)
      .fillColor('#555555')
      .text('Presupuesto comercial. No válido como factura.');
    doc.end();
  }),
);

export async function inventoryMovement(req, data, transaction) {
  const material = await must(db.materials, data.material_id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const quantity = new Decimal(data.quantity);
  const stock = new Decimal(material.stock_current);
  let next;
  if (data.movement_type === 'in') next = stock.plus(quantity);
  else if (data.movement_type === 'out') next = stock.minus(quantity);
  else next = quantity;
  if (next.gt(9999999999))
    throw new HttpError(400, 'El stock resultante supera el límite admitido.');
  if (next.lt(0)) throw new HttpError(409, 'No hay stock suficiente.');
  if (data.work_order_id) {
    const order = await must(db.work_orders, data.work_order_id, { transaction });
    const status = await must(db.work_order_statuses, order.current_status_id, { transaction });
    if (['delivered', 'cancelled'].includes(status.code))
      throw new HttpError(409, 'La orden está cerrada.');
  }
  const row = await db.inventory_movements.create(
    {
      ...data,
      quantity: money(quantity),
      unit_cost: data.movement_type === 'out' ? material.cost_reference : data.unit_cost,
      created_by_user_id: req.actor.id,
    },
    { transaction },
  );
  const changes = { stock_current: money(next) };
  if (data.movement_type === 'in' && next.gt(0))
    changes.cost_reference = money(
      stock.times(material.cost_reference).plus(quantity.times(data.unit_cost)).div(next),
    );
  await material.update(changes, { transaction });
  await audit(
    req,
    'movement',
    'materials',
    material.id,
    { ...data, stock_before: money(stock), stock_after: money(next) },
    transaction,
  );
  return row;
}
const movementSchema = z
  .object({
    material_id: z.coerce.number().int().positive(),
    work_order_id: optionalId,
    movement_type: z.enum(['in', 'out', 'adjustment']),
    quantity: amount,
    unit_cost: amount.default(0),
    note: z.string().trim().min(3).max(2000),
  })
  .refine(
    (v) => v.movement_type === 'adjustment' || v.quantity > 0,
    'La cantidad debe ser mayor a cero.',
  )
  .refine(
    (v) => !v.work_order_id || v.movement_type === 'out',
    'Solo los consumos se asignan a una orden.',
  );
workshopRouter.get(
  '/inventory',
  allow('materials'),
  wrap(async (req, res) => {
    const where = {};
    if (req.query.material_id) where.material_id = id(req.query.material_id);
    await list(res, db.inventory_movements, req.query, where);
  }),
);
workshopRouter.post(
  '/inventory',
  owner,
  wrap(async (req, res) =>
    ok(
      res,
      safe(
        await sequelize.transaction((t) =>
          inventoryMovement(req, movementSchema.parse(req.body), t),
        ),
      ),
    ),
  ),
);
workshopRouter.post(
  '/orders/:id/consume',
  allow('orders'),
  wrap(async (req, res) => {
    const data = movementSchema.parse({
      ...req.body,
      work_order_id: id(req.params.id),
      movement_type: 'out',
    });
    ok(res, safe(await sequelize.transaction((t) => inventoryMovement(req, data, t))));
  }),
);

workshopRouter.get(
  '/purchases',
  allow('purchases'),
  wrap(async (req, res) => list(res, db.purchases, req.query)),
);
workshopRouter.get(
  '/purchases/:id',
  allow('purchases'),
  wrap(async (req, res) => {
    const row = await must(db.purchases, req.params.id);
    const payments = await db.expenses.findAll({
      where: { purchase_id: row.id },
      order: [['id', 'DESC']],
    });
    const paid = payments
      .filter((p) => !p.voided_at)
      .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));
    ok(res, {
      ...safe(row),
      payments: payments.map(safe),
      paid: money(paid),
      balance: money(new Decimal(row.total).minus(paid)),
    });
  }),
);
workshopRouter.post(
  '/purchases',
  allow('purchases'),
  wrap(async (req, res) => {
    const data = z
      .object({
        supplier_id: z.coerce.number().int().positive(),
        material_id: z.coerce.number().int().positive(),
        quantity: positive,
        unit_cost: amount,
        notes: optionalText(5000),
      })
      .parse(req.body);
    const row = await db.purchases.create({
      ...data,
      total: money(new Decimal(data.quantity).times(data.unit_cost)),
      created_by_user_id: req.actor.id,
    });
    await audit(req, 'create', 'purchases', row.id, data);
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/purchases/:id/receive',
  allow('purchases'),
  wrap(async (req, res) => {
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.purchases, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.status === 'received') return row;
      if (row.status !== 'ordered') throw new HttpError(409, 'La compra no está pendiente.');
      await inventoryMovement(
        req,
        {
          material_id: row.material_id,
          movement_type: 'in',
          quantity: row.quantity,
          unit_cost: row.unit_cost,
          note: `Recepción de compra #${row.id}`,
        },
        transaction,
      );
      await row.update({ status: 'received', received_at: new Date() }, { transaction });
      await audit(req, 'receive', 'purchases', row.id, {}, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/purchases/:id/cancel',
  allow('purchases'),
  wrap(async (req, res) => {
    const row = await sequelize.transaction(async (transaction) => {
      const row = await must(db.purchases, req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (row.status !== 'ordered')
        throw new HttpError(409, 'Solo se puede cancelar una compra pendiente.');
      if (await db.expenses.count({ where: { purchase_id: row.id, voided_at: null }, transaction }))
        throw new HttpError(409, 'Anulá los pagos antes de cancelar la compra.');
      await row.update({ status: 'cancelled' }, { transaction });
      await audit(req, 'cancel', 'purchases', row.id, {}, transaction);
      return row;
    });
    ok(res, safe(row));
  }),
);

for (const kind of ['incomes', 'expenses']) {
  const income = kind === 'incomes';
  const dateField = income ? 'paid_at' : 'spent_at';
  workshopRouter.get(
    '/finance/' + kind,
    allow('finance'),
    wrap(async (req, res) => list(res, db[kind], req.query)),
  );
  workshopRouter.post(
    '/finance/' + kind,
    allow('finance'),
    wrap(async (req, res) => {
      const data = z
        .object({
          concept: title,
          amount: positive,
          payment_method: payment,
          [dateField]: z.iso.datetime({ offset: true }),
          work_order_id: optionalId,
          supplier_id: optionalId,
          purchase_id: optionalId,
          category: z.string().max(80).default('general'),
          notes: optionalText(3000),
        })
        .parse(req.body);
      if (income) {
        delete data.supplier_id;
        delete data.purchase_id;
        delete data.category;
      }
      const row = await sequelize.transaction(async (transaction) => {
        if (data.purchase_id) {
          const purchase = await must(db.purchases, data.purchase_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (purchase.status === 'cancelled')
            throw new HttpError(409, 'La compra está cancelada.');
          const paid =
            (await db.expenses.sum('amount', {
              where: { purchase_id: purchase.id, voided_at: null },
              transaction,
            })) || 0;
          if (new Decimal(paid).plus(data.amount).gt(purchase.total))
            throw new HttpError(409, 'El pago supera el saldo de la compra.');
          data.supplier_id = purchase.supplier_id;
          data.work_order_id = null;
          data.category = 'materials';
        }
        if (data.work_order_id) {
          const order = await must(db.work_orders, data.work_order_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (income) {
            const paid =
              (await db.incomes.sum('amount', {
                where: { work_order_id: order.id, voided_at: null },
                transaction,
              })) || 0;
            if (new Decimal(paid).plus(data.amount).gt(order.final_price))
              throw new HttpError(
                409,
                'El cobro supera el saldo. Revisá el precio final de la orden.',
              );
          }
        }
        const row = await db[kind].create(
          { ...data, created_by_user_id: req.actor.id },
          { transaction },
        );
        await audit(req, 'create', kind, row.id, data, transaction);
        return row;
      });
      ok(res, safe(row));
    }),
  );
  workshopRouter.post(
    '/finance/' + kind + '/:id/void',
    owner,
    wrap(async (req, res) => {
      const { reason } = z.object({ reason: z.string().trim().min(5).max(500) }).parse(req.body);
      const row = await sequelize.transaction(async (transaction) => {
        const row = await must(db[kind], req.params.id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (row.voided_at) throw new HttpError(409, 'El movimiento ya está anulado.');
        await row.update({ voided_at: new Date(), reversal_reason: reason }, { transaction });
        await audit(req, 'void', kind, row.id, { reason }, transaction);
        return row;
      });
      ok(res, safe(row));
    }),
  );
}
workshopRouter.get(
  '/partners',
  allow('partners'),
  wrap(async (req, res) => list(res, db.partner_movements, req.query)),
);
workshopRouter.post(
  '/partners',
  owner,
  wrap(async (req, res) => {
    const data = z
      .object({
        partner: z.string().min(2).max(100),
        type: z.enum(['contribution', 'withdrawal']),
        amount: positive,
        date: dateOnly,
        concept: title,
        notes: optionalText(3000),
      })
      .parse(req.body);
    const row = await db.partner_movements.create({ ...data, created_by_user_id: req.actor.id });
    await audit(req, 'create', 'partner_movements', row.id, data);
    ok(res, safe(row));
  }),
);
workshopRouter.post(
  '/partners/:id/void',
  owner,
  wrap(async (req, res) => {
    const { reason } = z.object({ reason: z.string().min(5).max(500) }).parse(req.body);
    const row = await must(db.partner_movements, req.params.id);
    if (row.voided_at) throw new HttpError(409, 'El movimiento ya está anulado.');
    await row.update({ voided_at: new Date() });
    await audit(req, 'void', 'partner_movements', row.id, { reason });
    ok(res, safe(row));
  }),
);

workshopRouter.get(
  '/dashboard',
  allow('dashboard'),
  wrap(async (req, res) => {
    const [clients, leads, orders, statuses, materials, appointments] = await Promise.all([
      db.clients.count({ where: { is_active: true } }),
      db.leads.count({ where: { status: 'new' } }),
      db.work_orders.findAll({ where: { is_active: true }, order: [['id', 'DESC']] }),
      db.work_order_statuses.findAll({ order: [['sort_order', 'ASC']] }),
      db.materials.findAll({
        where: { is_active: true, stock_current: { [Op.lte]: sequelize.col('stock_minimum') } },
      }),
      db.appointments.findAll({
        where: { starts_at: { [Op.gte]: new Date() }, status: 'scheduled' },
        order: [['starts_at', 'ASC']],
        limit: 6,
      }),
    ]);
    const finalIds = statuses
      .filter((s) => ['delivered', 'cancelled'].includes(s.code))
      .map((s) => s.id);
    const active = orders.filter((o) => !finalIds.includes(o.current_status_id));
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Cordoba' });
    ok(res, {
      clients,
      new_leads: leads,
      active_orders: active.length,
      overdue: active.filter((o) => o.estimated_end_date && o.estimated_end_date < today).length,
      orders: active.slice(0, 8).map(safe),
      low_stock: materials.map(safe),
      appointments: appointments.map(safe),
      pipeline: statuses.map((s) => ({
        ...safe(s),
        count: orders.filter((o) => o.current_status_id === s.id).length,
      })),
    });
  }),
);
workshopRouter.get(
  '/finance/summary',
  allow('finance'),
  wrap(async (req, res) => {
    const [incomes, expenses, partners, orders, statuses, purchases] = await Promise.all([
      db.incomes.findAll({ where: { voided_at: null } }),
      db.expenses.findAll({ where: { voided_at: null } }),
      db.partner_movements.findAll({ where: { voided_at: null } }),
      db.work_orders.findAll({ where: { is_active: true } }),
      db.work_order_statuses.findAll(),
      db.purchases.findAll({ where: { status: { [Op.ne]: 'cancelled' } } }),
    ]);
    const sum = (rows, field = 'amount') =>
      rows.reduce((a, r) => a.plus(r[field] || 0), new Decimal(0));
    const collected = sum(incomes),
      spent = sum(expenses),
      contributions = sum(partners.filter((p) => p.type === 'contribution')),
      withdrawals = sum(partners.filter((p) => p.type === 'withdrawal'));
    const cancelled = statuses.find((s) => s.code === 'cancelled')?.id;
    const completed = statuses
      .filter((s) => ['completed', 'delivered'].includes(s.code))
      .map((s) => s.id);
    const detail = [];
    for (const order of orders.filter((o) => o.current_status_id !== cancelled)) {
      const f = await orderFinancials(order);
      detail.push({
        id: order.id,
        code: order.code,
        title: order.title,
        client_id: order.client_id,
        final_price: order.final_price,
        recognized: completed.includes(order.current_status_id),
        ...f,
      });
    }
    const grossMargin = sum(
      detail.filter((d) => d.recognized),
      'margin',
    );
    const generalExpenses = sum(expenses.filter((e) => !e.purchase_id && !e.work_order_id));
    const receivables = sum(detail, 'balance');
    const months = {};
    for (const r of incomes) {
      const k = new Date(r.paid_at)
        .toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Cordoba' })
        .slice(0, 7);
      months[k] ??= { month: k, income: 0, expense: 0 };
      months[k].income = Number(money(new Decimal(months[k].income).plus(r.amount)));
    }
    for (const r of expenses) {
      const k = new Date(r.spent_at)
        .toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Cordoba' })
        .slice(0, 7);
      months[k] ??= { month: k, income: 0, expense: 0 };
      months[k].expense = Number(money(new Decimal(months[k].expense).plus(r.amount)));
    }
    const payable = purchases.map((p) => ({
      ...safe(p),
      paid: money(sum(expenses.filter((e) => e.purchase_id === p.id))),
      balance: money(
        new Decimal(p.total).minus(sum(expenses.filter((e) => e.purchase_id === p.id))),
      ),
    }));
    ok(res, {
      collected: money(collected),
      spent: money(spent),
      contributions: money(contributions),
      withdrawals: money(withdrawals),
      cash_balance: money(collected.minus(spent).plus(contributions).minus(withdrawals)),
      receivables: money(receivables),
      payables: money(sum(payable, 'balance')),
      operating_margin: money(grossMargin.minus(generalExpenses)),
      orders: detail,
      purchases: payable,
      months: Object.values(months)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12),
    });
  }),
);
