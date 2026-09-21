import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import pg from 'pg';
import dotenv from 'dotenv';
import {
  connectionUrl,
  connectionSettings,
  connectionHelp,
  configureDatabase,
} from '../scripts/local-postgres.mjs';

const settings = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'prueba local @:/#%?&$!\'"',
  database: 'lider_setup_test',
};
const original =
  '# Configuración del taller\r\nNODE_ENV=development\r\nSESSION_SECRET=conservar-este-secreto-de-prueba\r\nDATABASE_URL=postgresql://anterior@localhost:5432/anterior\r\nDB_SSL=true\r\nCUSTOM="primera línea\r\nsegunda línea"\r\n';
async function fixture(fn) {
  const root = await mkdtemp(path.join(tmpdir(), 'Líder con espacios '));
  try {
    await mkdir(path.join(root, 'backend'));
    await writeFile(path.join(root, 'backend', '.env'), original);
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('Las contraseñas con símbolos y espacios llegan intactas al driver PostgreSQL', () => {
  const config = new pg.Client({ connectionString: connectionUrl(settings) }).connectionParameters;
  assert.equal(config.password, settings.password);
  assert.equal(config.user, settings.user);
  assert.equal(config.database, settings.database);
  assert(!connectionUrl(settings).includes(settings.password));
  assert.equal(new URL(connectionUrl({ ...settings, host: '::1' })).hostname, '[::1]');
});

test('El asistente local rechaza servidores remotos, bases del sistema y nombres SQL', () => {
  for (const value of [
    { host: 'db.example.com' },
    { database: 'postgres' },
    { database: 'template1' },
    { database: 'taller"; DROP DATABASE otro;--' },
    { port: 70000 },
  ])
    assert.throws(() => connectionSettings({ ...settings, ...value }));
});

test('Un fallo de autenticación conserva el archivo de configuración sin copias de contraseñas nuevas', async () => {
  await fixture(async (root) => {
    const error = Object.assign(new Error('mensaje del servidor que no se muestra'), {
      code: '28P01',
    });
    await assert.rejects(
      configureDatabase(root, settings, async () => {
        throw error;
      }),
      { code: '28P01' },
    );
    assert.equal(await readFile(path.join(root, 'backend', '.env'), 'utf8'), original);
    assert(!(await readdir(root)).includes('.local'));
    assert.match(connectionHelp(error), /usuario o la contraseña/);
    assert(!connectionHelp(error).includes(error.message));
  });
});

test('Una conexión verificada guarda la URL y conserva comentarios, secretos, CRLF y valores multilínea', async () => {
  await fixture(async (root) => {
    const result = await configureDatabase(root, settings, async () => ({ created: false }));
    const saved = await readFile(path.join(root, 'backend', '.env'), 'utf8');
    const values = dotenv.parse(saved);
    assert.equal(values.SESSION_SECRET, dotenv.parse(original).SESSION_SECRET);
    assert.equal(values.CUSTOM, dotenv.parse(original).CUSTOM);
    assert.equal(values.DATABASE_URL, connectionUrl(settings));
    assert.equal(values.DB_SSL, 'false');
    assert(saved.startsWith('# Configuración del taller\r\n'));
    assert.equal(await readFile(path.join(root, result.backup), 'utf8'), original);
    const again = await configureDatabase(root, settings, async () => ({ created: false }));
    assert.equal(again.backup, null);
    assert.equal((await readdir(path.join(root, '.local'))).length, 1);
  });
});

test('El asistente no reemplaza una configuración de producción ni cambios concurrentes', async () => {
  await fixture(async (root) => {
    const file = path.join(root, 'backend', '.env');
    await writeFile(file, original.replace('NODE_ENV=development', 'NODE_ENV=production'));
    let connected = false;
    await assert.rejects(
      configureDatabase(root, settings, async () => {
        connected = true;
      }),
      /producción/,
    );
    assert.equal(connected, false);
    await writeFile(file, original);
    await assert.rejects(
      configureDatabase(root, settings, async () => {
        await writeFile(file, original + 'NUEVA_OPCION=conservar\r\n');
        return { created: false };
      }),
      /cambió/,
    );
    assert((await readFile(file, 'utf8')).includes('NUEVA_OPCION=conservar'));
  });
});

test('El setup funciona desde una ruta con espacios, avisa si falta Docker y conserva las cuentas al repetirlo', async () => {
  await fixture(async (root) => {
    await mkdir(path.join(root, 'scripts'));
    await mkdir(path.join(root, 'frontend-admin'));
    await mkdir(path.join(root, 'frontend-web'));
    const source = fileURLToPath(new URL('../../scripts/setup-local.mjs', import.meta.url));
    const script = path.join(root, 'scripts', 'setup-local.mjs');
    await copyFile(source, script);
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'path'),
    );
    env.PATH = '';
    const run = () =>
      spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8', timeout: 15000 });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /npm run setup:postgres/);
    const credentials = await readFile(path.join(root, '.local', 'credentials.json'), 'utf8');
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.equal(
      await readFile(path.join(root, '.local', 'credentials.json'), 'utf8'),
      credentials,
    );
    assert.equal(await readFile(path.join(root, 'backend', '.env'), 'utf8'), original);
    for (const account of JSON.parse(credentials)) {
      assert(!first.stdout.includes(account.password));
      assert(!second.stdout.includes(account.password));
    }
  });
});

test(
  'PostgreSQL nativo: crea una base vacía, la reutiliza y no guarda una contraseña rechazada',
  { skip: process.env.TEST_POSTGRES_PROVISIONING !== 'true' },
  async () => {
    const url = new URL(process.env.TEST_DATABASE_URL);
    assert(url.pathname.endsWith('_test'), 'Se requiere una base exclusiva de pruebas.');
    const config = {
      host: url.hostname,
      port: url.port || 5432,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: `lider_setup_${randomBytes(8).toString('hex')}_test`,
    };
    const admin = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
    await admin.connect();
    try {
      await fixture(async (root) => {
        const first = await configureDatabase(root, config);
        assert.equal(first.created, true);
        const again = await configureDatabase(root, config);
        assert.equal(again.created, false);
        assert.equal(again.backup, null);
        const saved = await readFile(path.join(root, 'backend', '.env'), 'utf8');
        await assert.rejects(
          configureDatabase(root, { ...config, password: randomBytes(32).toString('hex') }),
          { code: '28P01' },
        );
        assert.equal(await readFile(path.join(root, 'backend', '.env'), 'utf8'), saved);
      });
    } finally {
      // Solo la base aleatoria creada por esta prueba en el PostgreSQL desechable de CI.
      await admin.query(`DROP DATABASE IF EXISTS "${config.database}"`);
      await admin.end();
    }
  },
);
