import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
async function exists(p) {
  try {
    await access(path.join(root, p));
    return true;
  } catch {
    return false;
  }
}
async function create(p, content) {
  if (await exists(p)) {
    console.log(`${p}: se conservó la configuración existente.`);
    return false;
  }
  await writeFile(path.join(root, p), content, { mode: 0o600, flag: 'wx' });
  return true;
}
await mkdir(path.join(root, '.local'), { recursive: true });
let password = randomBytes(24).toString('hex');
if (await exists('.env')) {
  const match = (await readFile(path.join(root, '.env'), 'utf8')).match(
    /^LOCAL_DB_PASSWORD=(.+)$/m,
  );
  if (!match) throw new Error('Tu .env raíz debe definir LOCAL_DB_PASSWORD para Docker.');
  password = match[1].trim();
}
await create('.env', `LOCAL_DB_PASSWORD=${password}\n`);
await create(
  'backend/.env',
  `NODE_ENV=development\nPORT=4000\nDATABASE_URL=postgresql://lider:${password}@127.0.0.1:5432/tapiceria_lider\nDB_SSL=false\nSESSION_SECRET=${randomBytes(48).toString('hex')}\nAUTH_PROVIDER=local\nSTORAGE_PROVIDER=local\nSTORAGE_ROOT=uploads\nFRONTEND_WEB_URL=http://localhost:3000\nFRONTEND_ADMIN_URL=http://localhost:5174\nAPI_URL=http://localhost:4000\nCOOKIE_SAME_SITE=lax\n`,
);
await create(
  'frontend-admin/.env',
  'VITE_API_BASE=/api\nVITE_API_PROXY=http://localhost:4000\nVITE_PUBLIC_SITE_URL=http://localhost:3000\n',
);
await create(
  'frontend-web/.env.local',
  'API_INTERNAL_URL=http://localhost:4000\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n',
);
await create(
  '.local/credentials.json',
  JSON.stringify(
    [
      {
        first_name: 'Joel',
        last_name: '',
        email: 'joel@lider.test',
        password: randomBytes(18).toString('base64url'),
      },
      {
        first_name: 'Lucas',
        last_name: '',
        email: 'lucas@lider.test',
        password: randomBytes(18).toString('base64url'),
      },
    ],
    null,
    2,
  ) + '\n',
);
console.log(
  'Configuración preparada. Las cuentas LOCALES están en .local/credentials.json (no se sube a Git).',
);
console.log('Siguiente: docker compose up -d · npm run db:migrate · npm run db:seed · npm run dev');
