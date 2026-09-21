import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

if (!process.env.TEST_DATABASE_URL) {
  test(
    'Integración PostgreSQL (requiere TEST_DATABASE_URL)',
    { skip: 'Ver docs/VALIDACION.md para ejecutar sobre una base exclusiva de pruebas.' },
    () => {},
  );
} else {
  const database = new URL(process.env.TEST_DATABASE_URL);
  if (!database.pathname.endsWith('_test'))
    throw new Error('TEST_DATABASE_URL debe apuntar a una base cuyo nombre termine en _test.');
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.NODE_ENV = 'test';
  process.env.AUTH_PROVIDER = 'local';
  process.env.STORAGE_PROVIDER = 'local';
  process.env.SESSION_SECRET = randomBytes(48).toString('hex');
  const storage = await mkdtemp(path.join(tmpdir(), 'lider-tests-'));
  process.env.STORAGE_ROOT = storage;
  const [
    { default: app },
    { db, sequelize },
    { default: request },
    { default: bcrypt },
    { default: sharp },
    { default: PDFDocument },
  ] = await Promise.all([
    import('../src/app.js'),
    import('../src/database/v2.js'),
    import('supertest'),
    import('bcryptjs'),
    import('sharp'),
    import('pdfkit'),
  ]);
  const { seed } = await import('../scripts/seed.mjs');
  const prefix = randomUUID().slice(0, 8);
  const password = randomBytes(20).toString('base64url');
  const owner = request.agent(app);
  const anon = request(app);
  const origin = process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174';
  let client,
    vehicle,
    quote,
    order,
    material,
    supplier,
    purchase,
    mold,
    portfolio,
    file,
    receipt,
    lookups;
  const call = async (method, url, body, status = 200, agent = owner) => {
    let req = agent[method]('/api' + url).set('Origin', origin);
    if (body !== undefined) req = req.send(body);
    const r = await req;
    assert.equal(r.status, status, `${method} ${url}: ${JSON.stringify(r.body)}`);
    return r.body.data;
  };
  async function user(roleName) {
    const role = await db.roles.findOne({ where: { name: roleName } });
    return db.users.create({
      first_name: 'Prueba',
      last_name: roleName,
      email: `${prefix}-${roleName}@lider.test`,
      password_hash: await bcrypt.hash(password, 10),
      role_id: role.id,
    });
  }
  const png = await sharp({
    create: { width: 60, height: 60, channels: 3, background: { r: 20, g: 30, b: 40 } },
  })
    .png()
    .toBuffer();
  const pdf = await new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.text('Molde exclusivo de prueba. Referencia 100 mm.');
    doc.end();
  });
  test('Flujos integrales del taller con PostgreSQL', async (t) => {
    try {
      await seed();
      const admin = await user('owner');
      await t.test('Sesiones privadas, control de origen y roles', async () => {
        await anon.get('/api/clients').expect(401);
        await anon.get('/uploads/archivo.pdf').expect(404);
        const response = await owner
          .post('/api/auth/login')
          .set('Origin', origin)
          .send({ email: admin.email, password })
          .expect(200);
        assert(!('password_hash' in response.body.data));
        assert.match(response.headers['set-cookie'][0], /HttpOnly/);
        assert.match(response.headers['set-cookie'][0], /SameSite=Lax/);
        await owner.post('/api/clients').set('Origin', 'https://ajeno.test').send({}).expect(403);
        const staff = await user('operator');
        const operator = request.agent(app);
        await call('post', '/auth/login', { email: staff.email, password }, 200, operator);
        await call('get', '/finance/summary', undefined, 403, operator);
        await call('get', '/molds', undefined, 200, operator);
        lookups = await call('get', '/lookups');
        assert(lookups.parts.length);
        assert(!JSON.stringify(lookups).includes('password_hash'));
      });
      await t.test('Consulta pública y conversión sin duplicar cliente', async () => {
        await anon
          .post('/api/public/leads')
          .field('name', 'Consulta de prueba')
          .field('email', `${prefix}@example.test`)
          .field('service', 'Volantes')
          .field('message', 'Quiero recuperar el volante de mi vehículo.')
          .field('consent', 'true')
          .attach('photos', png, 'foto.png')
          .expect(201);
        const leads = await call('get', '/leads');
        const lead = leads.find((l) => l.email === `${prefix}@example.test`);
        assert(lead);
        const detail = await call('get', `/leads/${lead.id}`);
        assert.equal(detail.files.length, 1);
        await anon.get(`/api/files/${detail.files[0].id}`).expect(401);
        client = await call('post', `/leads/${lead.id}/client`);
        const again = await call('post', `/leads/${lead.id}/client`);
        assert.equal(again.id, client.id);
        await anon
          .post('/api/public/leads')
          .send({
            name: 'Prueba',
            service: 'Volante',
            message: 'Consulta de prueba sin consentimiento',
            phone: '123',
          })
          .expect(400);
        const count = await db.leads.count();
        await anon.post('/api/public/leads').send({ website: 'spam' }).expect(200);
        assert.equal(await db.leads.count(), count);
      });
      await t.test('Presupuesto aceptado crea una única orden y valida su vehículo', async () => {
        vehicle = await call('post', '/vehicles', {
          client_id: client.id,
          nickname: 'Vehículo de prueba',
          vehicle_type: 'car',
        });
        const other = await call('post', '/clients', {
          client_type: 'individual',
          first_name: 'Otro cliente',
        });
        await call(
          'post',
          '/quotes',
          {
            client_id: other.id,
            vehicle_id: vehicle.id,
            items: [{ description: 'Tapizado', quantity: 1, unit_price: 1000 }],
          },
          400,
        );
        quote = await call('post', '/quotes', {
          client_id: client.id,
          vehicle_id: vehicle.id,
          items: [{ description: 'Tapizado de volante', quantity: 1, unit_price: 1000 }],
          discount: 0,
          tax_rate: 0,
        });
        assert.equal(Number(quote.total), 1000);
        await call(
          'post',
          `/quotes/${quote.id}/status`,
          { status: 'accepted', acceptance_note: 'Aceptado por teléfono' },
          409,
        );
        await call('post', `/quotes/${quote.id}/status`, { status: 'sent' });
        const accepted = await call('post', `/quotes/${quote.id}/status`, {
          status: 'accepted',
          acceptance_note: 'Aceptado por teléfono en esta prueba',
        });
        const again = await call('post', `/quotes/${quote.id}/status`, {
          status: 'accepted',
          acceptance_note: 'Reintento de la misma acción',
        });
        assert.equal(accepted.work_order_id, again.work_order_id);
        order = await call('get', `/orders/${accepted.work_order_id}`);
        await call(
          'put',
          `/quotes/${quote.id}`,
          {
            client_id: client.id,
            items: [{ description: 'Cambio indebido', quantity: 1, unit_price: 500 }],
          },
          409,
        );
        await owner.get(`/api/quotes/${quote.id}/pdf`).expect(200).expect('Content-Type', /pdf/);
      });
      await t.test('Inventario impide negativos y calcula el costo del consumo', async () => {
        material = await call('post', '/materials', {
          code: `CUERO-${prefix}`,
          name: 'Cuero prueba',
          unit: 'm2',
          cost_reference: 100,
          stock_minimum: 2,
        });
        await call('post', '/inventory', {
          material_id: material.id,
          movement_type: 'in',
          quantity: 10,
          unit_cost: 100,
          note: 'Stock inicial de prueba',
        });
        await call(
          'post',
          `/orders/${order.id}/consume`,
          { material_id: material.id, quantity: 11, note: 'Consumo imposible' },
          409,
        );
        await call('post', `/orders/${order.id}/consume`, {
          material_id: material.id,
          quantity: 2,
          note: 'Consumo del volante',
        });
        const updated = await call('get', `/materials/${material.id}`);
        assert.equal(Number(updated.stock_current), 8);
        const detail = await call('get', `/orders/${order.id}`);
        assert.equal(Number(detail.finances.material_cost), 200);
        assert.equal(Number(detail.finances.margin), 800);
      });
      await t.test('Recepción de compra idempotente y pagos sin superar su saldo', async () => {
        supplier = await call('post', '/suppliers', { name: 'Proveedor de prueba' });
        purchase = await call('post', '/purchases', {
          supplier_id: supplier.id,
          material_id: material.id,
          quantity: 3,
          unit_cost: 120,
        });
        await call('post', `/purchases/${purchase.id}/receive`);
        await call('post', `/purchases/${purchase.id}/receive`);
        const updated = await call('get', `/materials/${material.id}`);
        assert.equal(Number(updated.stock_current), 11);
        assert.equal(Number(updated.cost_reference), 105.45);
        await call(
          'post',
          '/finance/expenses',
          {
            concept: 'Pago compra',
            amount: 400,
            spent_at: new Date().toISOString(),
            purchase_id: purchase.id,
          },
          409,
        );
        await call('post', '/finance/expenses', {
          concept: 'Pago compra',
          amount: 360,
          spent_at: new Date().toISOString(),
          purchase_id: purchase.id,
        });
        const detail = await call('get', `/purchases/${purchase.id}`);
        assert.equal(Number(detail.balance), 0);
        assert.equal(detail.payments.length, 1);
      });
      await t.test('Cobros, anulaciones y aportes se contabilizan por separado', async () => {
        receipt = await call('post', '/finance/incomes', {
          concept: 'Anticipo de prueba',
          amount: 300,
          paid_at: new Date().toISOString(),
          work_order_id: order.id,
        });
        await call(
          'post',
          '/finance/incomes',
          {
            concept: 'Cobro excesivo',
            amount: 701,
            paid_at: new Date().toISOString(),
            work_order_id: order.id,
          },
          409,
        );
        let detail = await call('get', `/orders/${order.id}`);
        assert.equal(Number(detail.finances.balance), 700);
        const before = await call('get', '/finance/summary');
        await call('post', '/partners', {
          partner: 'Joel',
          type: 'contribution',
          amount: 250,
          date: '2026-09-19',
          concept: 'Aporte de prueba',
        });
        const after = await call('get', '/finance/summary');
        assert.equal(Number(after.cash_balance) - Number(before.cash_balance), 250);
        assert.equal(after.operating_margin, before.operating_margin);
        await call('post', `/finance/incomes/${receipt.id}/void`, {
          reason: 'Movimiento creado para prueba',
        });
        detail = await call('get', `/orders/${order.id}`);
        assert.equal(Number(detail.finances.balance), 1000);
        await call(
          'post',
          `/finance/incomes/${receipt.id}/void`,
          { reason: 'Intento duplicado de anulación' },
          409,
        );
        await owner
          .get('/api/finance/export/incomes')
          .expect(200)
          .expect('Content-Type', /text\/csv/);
      });
      await t.test('Los cambios de estado dejan historial y cierran consumos', async () => {
        const status = (code) => lookups.statuses.find((s) => s.code === code).id;
        await call(
          'post',
          `/orders/${order.id}/status`,
          { status_id: status('delivered'), note: 'No se puede saltar todo' },
          409,
        );
        for (const code of ['in_progress', 'completed', 'delivered'])
          await call('post', `/orders/${order.id}/status`, {
            status_id: status(code),
            note: `Prueba de cambio a ${code}`,
          });
        const detail = await call('get', `/orders/${order.id}`);
        assert.equal(detail.history.length, 4);
        await call(
          'post',
          `/orders/${order.id}/consume`,
          { material_id: material.id, quantity: 1, note: 'Orden ya entregada' },
          409,
        );
      });
      await t.test(
        'Moldes privados, originales intactos y verificación 1:1 por versión',
        async () => {
          mold = await call('post', '/molds', {
            code: `MOLDE-${prefix}`,
            title: 'Molde prueba',
            technical_part_id: lookups.parts[0].id,
            dimensions_notes: 'Referencia 100 mm, margen 5 mm.',
          });
          const r = await owner
            .post(`/api/molds/${mold.id}/files`)
            .set('Origin', origin)
            .attach('file', pdf, 'molde.pdf')
            .expect(200);
          const f = r.body.data;
          await owner.get(`/api/molds/${mold.id}/files/${f.id}/print`).expect(409);
          await anon.get(`/api/files/${f.stored_file_id}`).expect(401);
          await call(
            'post',
            `/molds/${mold.id}/files/${f.id}/validate`,
            { measured_mm: 95, physical_check: true, notes: 'Prueba con medida incorrecta' },
            400,
          );
          await call('post', `/molds/${mold.id}/files/${f.id}/validate`, {
            measured_mm: 100,
            physical_check: true,
            notes: 'Medido en papel, sin ajustar la escala.',
          });
          const printed = await owner.get(`/api/molds/${mold.id}/files/${f.id}/print`).expect(200);
          assert.deepEqual(printed.body, pdf);
          await owner
            .post(`/api/molds/${mold.id}/files`)
            .set('Origin', origin)
            .attach('file', pdf, 'molde-v2.pdf')
            .expect(200);
          const updated = await call('get', `/molds/${mold.id}`);
          assert.equal(updated.files[0].version_number, 2);
          assert.equal(updated.is_reference_verified, false);
          await owner.get(`/api/molds/${mold.id}/files/${f.id}/print`).expect(409);
        },
      );
      await t.test(
        'La publicación exige consentimiento y nunca expone moldes ni borradores',
        async () => {
          portfolio = await call('post', '/portfolio', {
            slug: `trabajo-${prefix}`,
            title: 'Trabajo exclusivo de prueba',
            service: 'Volantes',
          });
          const response = await owner
            .post(`/api/portfolio/${portfolio.id}/media`)
            .set('Origin', origin)
            .attach('file', png, 'foto.png')
            .expect(200);
          file = response.body.data;
          await anon.get(`/api/public/media/${portfolio.id}/${file.id}`).expect(404);
          const gallery = [
            {
              file_id: file.id,
              stage: 'after',
              alt: 'Foto de prueba',
              caption: 'Prueba',
              pair: '',
              cover: true,
            },
          ];
          await call('put', `/portfolio/${portfolio.id}`, { ...portfolio, gallery });
          await call('post', `/portfolio/${portfolio.id}/publish`, { publish: true }, 400);
          const moldFile = (await call('get', `/molds/${mold.id}`)).files[0];
          await call(
            'put',
            `/portfolio/${portfolio.id}`,
            {
              ...portfolio,
              consent: true,
              gallery: [{ ...gallery[0], file_id: moldFile.stored_file_id }],
            },
            400,
          );
          portfolio = await call('put', `/portfolio/${portfolio.id}`, {
            ...portfolio,
            consent: true,
            gallery,
          });
          await call('post', `/portfolio/${portfolio.id}/publish`, { publish: true });
          const published = await anon.get(`/api/public/portfolio/${portfolio.slug}`).expect(200);
          assert(!('work_order_id' in published.body.data));
          assert(!('created_by_user_id' in published.body.data));
          await anon
            .get(`/api/public/media/${portfolio.id}/${file.id}`)
            .expect(200)
            .expect('Content-Type', 'image/webp');
          await call(
            'put',
            `/portfolio/${portfolio.id}`,
            { ...portfolio, title: 'Edición directa' },
            409,
          );
          await call('post', `/portfolio/${portfolio.id}/publish`, { publish: false });
          await anon.get(`/api/public/media/${portfolio.id}/${file.id}`).expect(404);
        },
      );
      await t.test(
        'Catálogos, agenda, ajustes y bandeja de emails funcionan sin credenciales externas',
        async () => {
          const brand = await call('post', '/catalogs/brands', { name: `Marca ${prefix}` });
          const model = await call('post', '/catalogs/models', {
            name: 'Modelo prueba',
            brand_id: brand.id,
          });
          assert(model.id);
          await call('post', '/agenda', {
            title: 'Entrega de prueba',
            starts_at: new Date().toISOString(),
            work_order_id: order.id,
          });
          const site = await call('get', '/settings/site');
          await call('put', '/settings/site', site);
          await call('get', '/dashboard');
          await call('get', '/audit');
          await call('get', '/integrations');
          const lead = (await call('get', '/leads')).find(
            (l) => l.email === `${prefix}@example.test`,
          );
          const draft = await call('post', '/messages', {
            lead_id: lead.id,
            recipient: lead.email,
            subject: 'Consulta recibida',
            body: 'Gracias por escribir. Revisaremos la pieza antes de confirmar el trabajo.',
          });
          assert.equal(draft.status, 'draft');
          await call('post', `/messages/${draft.id}/send`, { confirmed: true }, 503);
        },
      );
      await t.test('La desactivación revoca el acceso y el logout invalida la sesión', async () => {
        const staff = await db.users.findOne({ where: { email: `${prefix}-operator@lider.test` } });
        const operator = request.agent(app);
        await call('post', '/auth/login', { email: staff.email, password }, 200, operator);
        await call('put', `/users/${staff.id}`, {
          first_name: 'Prueba',
          last_name: 'operador',
          role_id: staff.role_id,
          is_active: false,
        });
        await call('get', '/auth/me', undefined, 401, operator);
        await call('post', '/auth/logout');
        await call('get', '/auth/me', undefined, 401);
      });
    } finally {
      await sequelize.close();
      await rm(storage, { recursive: true, force: true });
    }
  });
}
