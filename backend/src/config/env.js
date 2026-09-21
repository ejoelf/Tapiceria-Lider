import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
const production = process.env.NODE_ENV === 'production';
const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Falta ${key}. Consultá backend/.env.example.`);
  return value;
};
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: required('DATABASE_URL'),
  DB_SSL: process.env.DB_SSL === 'true',
  SESSION_SECRET: required('SESSION_SECRET'),
  AUTH_PROVIDER: process.env.AUTH_PROVIDER || 'local',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  STORAGE_ROOT: path.resolve(
    fileURLToPath(new URL('../../', import.meta.url)),
    process.env.STORAGE_ROOT || 'uploads',
  ),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_SECRET_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'lider-private',
  FRONTEND_WEB_URL: process.env.FRONTEND_WEB_URL || 'http://localhost:3000',
  FRONTEND_ADMIN_URL: process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_API_URL: process.env.AI_API_URL || '',
  AI_MODEL: process.env.AI_MODEL || '',
};
if (!['lax', 'strict', 'none'].includes(env.COOKIE_SAME_SITE))
  throw new Error('COOKIE_SAME_SITE inválido.');
if (env.SESSION_SECRET.length < 32)
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.');
if (
  !['local', 'supabase'].includes(env.AUTH_PROVIDER) ||
  !['local', 'supabase'].includes(env.STORAGE_PROVIDER)
)
  throw new Error('Proveedor inválido.');
if (production && env.AUTH_PROVIDER !== 'supabase')
  throw new Error('Producción requiere AUTH_PROVIDER=supabase.');
if (production && env.STORAGE_PROVIDER !== 'supabase')
  throw new Error('Producción requiere STORAGE_PROVIDER=supabase.');
if (
  (env.AUTH_PROVIDER === 'supabase' || env.STORAGE_PROVIDER === 'supabase') &&
  (!env.SUPABASE_URL || !env.SUPABASE_KEY)
)
  throw new Error('Faltan las credenciales de Supabase.');
export default env;
