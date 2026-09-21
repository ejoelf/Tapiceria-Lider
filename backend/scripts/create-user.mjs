import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, sequelize } from '../src/database/v2.js';
import env from '../src/config/env.js';
import { supabase } from '../src/v2/auth.js';
// El archivo de entrada debe estar fuera del repositorio o dentro de .local/.
try {
  const file = process.argv[2];
  if (!file) throw new Error('Uso: npm run user:create -w backend -- /ruta/cuenta.json');
  const user = z
    .object({
      first_name: z.string().min(2),
      last_name: z.string().default(''),
      email: z.email().transform((v) => v.toLowerCase()),
      password: z.string().min(12).max(200),
      role: z.enum(['owner', 'operator', 'accountant']).default('owner'),
    })
    .parse(JSON.parse(await readFile(file, 'utf8')));
  if (await db.users.findOne({ where: { email: user.email } }))
    throw new Error('La cuenta ya existe. No se modificó.');
  const role = await db.roles.findOne({ where: { name: user.role } });
  if (!role) throw new Error('Ejecutá db:seed primero.');
  let authId;
  if (env.AUTH_PROVIDER === 'supabase') {
    const result = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });
    if (result.error) throw new Error('No se pudo crear el usuario en Supabase.');
    authId = result.data.user.id;
  }
  try {
    await db.users.create({
      ...user,
      role_id: role.id,
      auth_user_id: authId,
      password_hash: await bcrypt.hash(
        env.AUTH_PROVIDER === 'local' ? user.password : randomBytes(48).toString('hex'),
        12,
      ),
    });
  } catch (error) {
    if (authId) await supabase.auth.admin.deleteUser(authId);
    throw error;
  }
  console.log('Cuenta creada. Guardá la contraseña en un administrador de contraseñas.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
