import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { configureDatabase, connectionHelp } from './local-postgres.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
let muted = false;
let rl;
try {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error(
      'Abrí una terminal interactiva de PowerShell en VS Code y ejecutá npm run setup:postgres. La contraseña se ingresa allí sin mostrarse.',
    );
  console.log('PostgreSQL local · Tapicería Líder');
  console.log('Usá el usuario y la contraseña de PostgreSQL, no los del CRM.');
  console.log(
    'La base elegida se creará vacía si no existe. Los datos de bases existentes se conservan.',
  );
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stdout.write(chunk, encoding);
      callback();
    },
  });
  rl = createInterface({ input: process.stdin, output, terminal: true, historySize: 0 });
  const abort = new AbortController();
  rl.on('SIGINT', () => abort.abort());
  const ask = async (label, value) =>
    (await rl.question(`${label} [${value}]: `, { signal: abort.signal })).trim() || value;
  const host = await ask('Host', '127.0.0.1');
  const port = await ask('Puerto', '5432');
  const user = await ask('Usuario de PostgreSQL', 'postgres');
  const database = await ask('Base del proyecto', 'tapiceria_lider_v2');
  process.stdout.write('Contraseña de PostgreSQL (no se muestra): ');
  muted = true;
  const password = await rl.question('', { signal: abort.signal });
  muted = false;
  process.stdout.write('\n');
  rl.close();
  console.log('Comprobando la conexión…');
  const result = await configureDatabase(root, { host, port, user, database, password });
  console.log(
    result.created
      ? 'Base vacía creada y conexión comprobada.'
      : 'Conexión comprobada. Se conservó la base existente.',
  );
  console.log('backend/.env quedó configurado. No se modificaron las cuentas del CRM.');
  if (result.backup) console.log(`Copia privada de la configuración anterior: ${result.backup}`);
  if (process.env.DATABASE_URL)
    console.log(
      'Tu terminal tiene DATABASE_URL definida. Quitá esa variable o abrí una terminal nueva para usar backend/.env.',
    );
  console.log('Siguiente: npm run db:migrate · npm run db:seed · npm run dev');
} catch (error) {
  if (muted) process.stdout.write('\n');
  if (error.name === 'AbortError') console.error('Configuración cancelada.');
  else console.error(error.code ? connectionHelp(error) : error.message);
  process.exitCode = 1;
} finally {
  muted = false;
  rl?.close();
}
