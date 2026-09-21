import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';

const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const encode = (value) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

export function connectionSettings(input) {
  const host = String(input.host || '127.0.0.1')
    .trim()
    .toLowerCase();
  const port = Number(input.port || 5432);
  const user = String(input.user || '').trim();
  const database = String(input.database || '').trim();
  const password = String(input.password ?? '');
  if (!localHosts.has(host))
    throw new Error('Este asistente configura PostgreSQL local. Usá localhost, 127.0.0.1 o ::1.');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('El puerto debe estar entre 1 y 65535.');
  if (!user || user.length > 63 || /[\r\n\0]/.test(user))
    throw new Error('Ingresá un usuario válido de PostgreSQL.');
  if (!password || /[\r\n\0]/.test(password))
    throw new Error('Ingresá la contraseña de ese usuario de PostgreSQL.');
  if (
    !/^[a-z][a-z0-9_]{0,62}$/.test(database) ||
    ['postgres', 'template0', 'template1'].includes(database)
  )
    throw new Error(
      'Usá una base del proyecto: letras minúsculas, números y guiones bajos (hasta 63 caracteres).',
    );
  return { host, port, user, password, database };
}

export function connectionUrl(input) {
  const config = connectionSettings(input);
  const host = config.host === '::1' ? '[::1]' : config.host;
  return `postgresql://${encode(config.user)}:${encode(config.password)}@${host}:${config.port}/${encode(config.database)}`;
}

export function connectionHelp(error) {
  const code = error?.code || error?.cause?.code;
  if (['28P01', '28000'].includes(code))
    return 'PostgreSQL rechazó el usuario o la contraseña. Usá los de tu instalación local (por ejemplo, el usuario postgres), no las cuentas del CRM. Volvé a ejecutar npm run setup:postgres.';
  if (code === '3D000')
    return 'La base indicada no existe. Ejecutá npm run setup:postgres para elegirla o crear una base vacía del proyecto.';
  if (code === '42501')
    return 'El usuario no tiene permiso para crear o usar esa base. Creala con su propietario en pgAdmin o elegí un usuario local con permiso CREATEDB.';
  if (['ECONNREFUSED', 'ENOTFOUND', 'EHOSTUNREACH', 'ETIMEDOUT'].includes(code))
    return 'No se pudo conectar a PostgreSQL. Revisá que el servicio esté iniciado, el host y el puerto. Con PostgreSQL instalado en Windows no necesitás Docker.';
  return 'No se pudo verificar PostgreSQL. Revisá el servicio y las credenciales en backend/.env; no compartas contraseñas. Consultá docs/INSTALACION.md.';
}

async function withClient(config, fn) {
  const client = new pg.Client({
    ...config,
    ssl: false,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export async function ensureDatabase(input) {
  const config = connectionSettings(input);
  const check = () => withClient(config, (client) => client.query('SELECT current_database()'));
  try {
    await check();
    return { created: false };
  } catch (error) {
    if (error.code !== '3D000') throw error;
  }
  // El nombre ya está restringido a un identificador simple. No se ejecutan DROP ni ALTER.
  let created = true;
  await withClient({ ...config, database: 'postgres' }, async (client) => {
    try {
      await client.query(`CREATE DATABASE "${config.database}"`);
    } catch (error) {
      if (error.code !== '42P04') throw error;
      created = false;
    }
  });
  await check();
  return { created };
}

export function updateDatabaseEnv(source, url) {
  const values = { DATABASE_URL: url, DB_SSL: 'false' };
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const seen = new Set();
  const lines = source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*(?:export\s+)?(DATABASE_URL|DB_SSL)\s*=\s*(.*)$/);
    if (!match) return [line];
    // Estas dos opciones deben ocupar una línea. No tocar otros valores multilínea.
    const raw = match[2].trim();
    if (/^["'`]/.test(raw) && !raw.slice(1).includes(raw[0]))
      throw new Error(
        'DATABASE_URL o DB_SSL ocupan varias líneas. Corregí esas opciones en backend/.env antes de continuar.',
      );
    if (seen.has(match[1])) return [];
    seen.add(match[1]);
    return [`${match[1]}=${values[match[1]]}`];
  });
  while (lines.at(-1) === '') lines.pop();
  for (const [key, value] of Object.entries(values))
    if (!seen.has(key)) lines.push(`${key}=${value}`);
  return lines.join(newline) + newline;
}

export async function configureDatabase(root, input, verify = ensureDatabase) {
  const target = path.join(root, 'backend', '.env');
  let previous;
  try {
    previous = await readFile(target, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Primero ejecutá npm run setup:local.');
    throw error;
  }
  if (dotenv.parse(previous).NODE_ENV === 'production' || process.env.NODE_ENV === 'production')
    throw new Error(
      'Este asistente es solo para desarrollo local. No cambia una configuración de producción.',
    );
  const config = connectionSettings(input);
  const next = updateDatabaseEnv(previous, connectionUrl(config));
  const result = await verify(config);
  if (next === previous) return { ...result, backup: null };
  if ((await readFile(target, 'utf8')) !== previous)
    throw new Error('backend/.env cambió durante la conexión. Volvé a ejecutar el asistente.');
  await mkdir(path.join(root, '.local'), { recursive: true });
  const backup = `.local/backend-env-${randomUUID()}.backup`;
  await writeFile(path.join(root, backup), previous, { mode: 0o600, flag: 'wx' });
  const temp = path.join(root, 'backend', `.env.postgres-${randomUUID()}`);
  try {
    await writeFile(temp, next, { mode: 0o600, flag: 'wx' });
    await rename(temp, target);
  } finally {
    await rm(temp, { force: true });
  }
  return { ...result, backup };
}
