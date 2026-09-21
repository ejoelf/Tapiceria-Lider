import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import { connectionHelp } from './local-postgres.mjs';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
let client;
try {
  if (!process.env.DATABASE_URL)
    throw new Error(
      'Falta DATABASE_URL. Ejecutá npm run setup:local y npm run setup:postgres, o configurá Docker.',
    );
  const url = new URL(process.env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error('DATABASE_URL no tiene formato PostgreSQL.');
  client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });
  await client.connect();
  await client.query('SELECT 1');
  console.log('Conexión con PostgreSQL comprobada.');
} catch (error) {
  const ownMessage =
    !error.code &&
    ['Falta DATABASE_URL.', 'DATABASE_URL no tiene'].some((prefix) =>
      error.message?.startsWith(prefix),
    );
  console.error(ownMessage ? error.message : connectionHelp(error));
  process.exitCode = 1;
} finally {
  await client?.end().catch(() => {});
}
