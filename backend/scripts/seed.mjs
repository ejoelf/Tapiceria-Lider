import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { db, sequelize } from '../src/database/v2.js';
import env from '../src/config/env.js';
import { siteDefaults } from '../src/v2/defaults.js';
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
export async function seed() {
  for (const [name, description] of [
    ['owner', 'Administración completa'],
    ['operator', 'Operación del taller y contenidos'],
    ['accountant', 'Administración financiera'],
  ])
    await db.roles.findOrCreate({ where: { name }, defaults: { description, is_system: true } });
  const [branch] = await db.branches.findOrCreate({
    where: { code: 'RC-CENTRAL' },
    defaults: { name: 'Taller Río Cuarto', city: 'Río Cuarto', province: 'Córdoba', is_main: true },
  });
  let order = 0;
  for (const [code, name] of [
    ['received', 'Recibido'],
    ['quoted', 'Presupuestado'],
    ['approved', 'Aprobado'],
    ['in_progress', 'En proceso'],
    ['paused', 'Pausado'],
    ['completed', 'Terminado'],
    ['delivered', 'Entregado'],
    ['cancelled', 'Cancelado'],
  ])
    await db.work_order_statuses.findOrCreate({
      where: { code },
      defaults: { name, sort_order: order++, is_final: ['delivered', 'cancelled'].includes(code) },
    });
  for (const name of [
    'Ford',
    'Chevrolet',
    'Volkswagen',
    'Renault',
    'Fiat',
    'Peugeot',
    'Citroën',
    'Toyota',
    'Honda',
    'Nissan',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Jeep',
  ])
    await db.vehicle_brands.findOrCreate({ where: { slug: slug(name) }, defaults: { name } });
  for (const [brandName, names] of [
    ['Ford', ['Fiesta', 'Focus', 'Ranger']],
    ['Chevrolet', ['Cruze', 'S10', 'Corsa']],
    ['Volkswagen', ['Gol', 'Amarok', 'Vento']],
    ['Renault', ['Clio', 'Kangoo', 'Duster']],
    ['Fiat', ['Cronos', 'Toro']],
    ['Toyota', ['Hilux', 'Corolla']],
    ['Peugeot', ['208', 'Partner']],
  ]) {
    const brand = await db.vehicle_brands.findOne({ where: { name: brandName } });
    for (const name of names)
      await db.vehicle_models.findOrCreate({
        where: { brand_id: brand.id, slug: slug(name) },
        defaults: { name },
      });
  }
  for (const [code, name] of [
    ['steering-wheel', 'Volante'],
    ['door-panel', 'Panel de puerta'],
    ['headliner', 'Techo'],
    ['gear-knob', 'Bocha de cambio'],
    ['seat', 'Asiento'],
    ['other', 'Otra pieza'],
  ])
    await db.technical_parts.findOrCreate({ where: { code }, defaults: { name } });
  for (const name of ['Cuero', 'Ecocuero', 'Tela', 'Hilos', 'Adhesivos', 'Insumos'])
    await db.material_categories.findOrCreate({ where: { name } });
  await db.settings.findOrCreate({
    where: { key: 'website_v2' },
    defaults: { value: siteDefaults, is_public: true, description: 'Contenido público de Líder' },
  });
  if (env.AUTH_PROVIDER === 'local' && env.NODE_ENV !== 'production') {
    let credentials;
    try {
      credentials = JSON.parse(
        await readFile(new URL('../../.local/credentials.json', import.meta.url), 'utf8'),
      );
    } catch {
      console.log('Sin cuentas locales: ejecutá npm run setup:local o user:create.');
      return;
    }
    const role = await db.roles.findOne({ where: { name: 'owner' } });
    for (const user of credentials)
      await db.users.findOrCreate({
        where: { email: user.email },
        defaults: {
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: role.id,
          branch_id: branch.id,
          password_hash: await bcrypt.hash(user.password, 12),
        },
      });
  }
}
if (
  process.argv[1] &&
  new URL(import.meta.url).pathname.endsWith(
    process.argv[1].replaceAll('\\', '/').split('/').slice(-2).join('/'),
  )
) {
  try {
    await seed();
    console.log('Catálogos listos. Los registros existentes se conservaron.');
  } finally {
    await sequelize.close();
  }
}
