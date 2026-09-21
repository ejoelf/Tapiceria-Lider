import { Router } from 'express';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { Op } from 'sequelize';
import env from '../config/env.js';
import { db } from '../database/v2.js';
import { wrap, ok, safe, HttpError } from './common.js';
export const supabase =
  env.SUPABASE_URL && env.SUPABASE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
const cookieName = 'lider_session';
const digest = (v) => createHash('sha256').update(v).digest('hex');
const encryptionKey = createHash('sha256').update(env.SESSION_SECRET).digest();
function encrypt(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}
function decrypt(value) {
  const data = Buffer.from(value, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString(),
  );
}
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api',
};
export const authenticate = wrap(async (req, res, next) => {
  const token = req.cookies[cookieName];
  if (!token) throw new HttpError(401, 'Iniciá sesión para continuar.');
  const session = await db.sessions.findOne({
    where: { token_hash: digest(token), expires_at: { [Op.gt]: new Date() } },
  });
  if (!session) throw new HttpError(401, 'La sesión venció. Volvé a ingresar.');
  const user = await db.users.findByPk(session.user_id);
  if (!user?.is_active) throw new HttpError(401, 'La cuenta no está activa.');
  if (env.AUTH_PROVIDER === 'supabase') {
    let provider = decrypt(session.provider_session);
    if (provider.expires_at * 1000 < Date.now() + 30000) {
      const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const refreshed = await client.auth.refreshSession({ refresh_token: provider.refresh_token });
      if (refreshed.error || !refreshed.data.session) throw new HttpError(401, 'La sesión venció.');
      provider = refreshed.data.session;
      await session.update({ provider_session: encrypt(provider) });
    }
    const { data, error } = await supabase.auth.getUser(provider.access_token);
    if (error || data.user?.id !== user.auth_user_id)
      throw new HttpError(401, 'La sesión no es válida.');
  }
  req.actor = { ...safe(user), role: safe(await db.roles.findByPk(user.role_id)) };
  req.session = session;
  next();
});
export const authRouter = Router();
authRouter.post(
  '/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, message: 'Demasiados intentos. Esperá unos minutos.' },
  }),
  wrap(async (req, res) => {
    const { email, password } = z
      .object({
        email: z
          .email()
          .max(150)
          .transform((v) => v.toLowerCase().trim()),
        password: z.string().min(1).max(200),
      })
      .parse(req.body);
    let user, provider;
    if (env.AUTH_PROVIDER === 'supabase') {
      const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const result = await client.auth.signInWithPassword({ email, password });
      if (!result.error && result.data.user) {
        user = await db.users.findOne({ where: { auth_user_id: result.data.user.id } });
        provider = result.data.session;
      }
    } else {
      const candidate = await db.users.findOne({ where: { email } });
      const valid = await bcrypt.compare(
        password,
        candidate?.password_hash || '$2b$10$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      );
      if (valid) user = candidate;
    }
    if (!user?.is_active) throw new HttpError(401, 'Email o contraseña incorrectos.');
    const token = randomBytes(48).toString('base64url');
    await db.sessions.destroy({ where: { expires_at: { [Op.lt]: new Date() } } });
    await db.sessions.create({
      token_hash: digest(token),
      user_id: user.id,
      expires_at: new Date(Date.now() + 12 * 3600000),
      provider_session: provider ? encrypt(provider) : null,
    });
    await user.update({ last_login_at: new Date() });
    res.cookie(cookieName, token, { ...cookieOptions, maxAge: 12 * 3600000 });
    ok(res, { ...safe(user), role: safe(await db.roles.findByPk(user.role_id)) });
  }),
);
authRouter.get('/me', authenticate, (req, res) => ok(res, req.actor));
authRouter.post(
  '/logout',
  wrap(async (req, res) => {
    if (req.cookies[cookieName])
      await db.sessions.destroy({ where: { token_hash: digest(req.cookies[cookieName]) } });
    res.clearCookie(cookieName, cookieOptions);
    ok(res, { success: true });
  }),
);
authRouter.post(
  '/password',
  authenticate,
  wrap(async (req, res) => {
    const { current_password, new_password } = z
      .object({ current_password: z.string().min(1), new_password: z.string().min(12).max(200) })
      .parse(req.body);
    const user = await db.users.findByPk(req.actor.id);
    if (env.AUTH_PROVIDER === 'local') {
      if (!(await bcrypt.compare(current_password, user.password_hash)))
        throw new HttpError(400, 'La contraseña actual no coincide.');
      await user.update({ password_hash: await bcrypt.hash(new_password, 12) });
    } else {
      const client = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const login = await client.auth.signInWithPassword({
        email: user.email,
        password: current_password,
      });
      if (login.error) throw new HttpError(400, 'La contraseña actual no coincide.');
      const result = await client.auth.updateUser({ password: new_password });
      if (result.error) throw new HttpError(400, 'No se pudo cambiar la contraseña.');
      await client.auth.signOut({ scope: 'global' });
    }
    await db.sessions.destroy({ where: { user_id: user.id } });
    res.clearCookie(cookieName, cookieOptions);
    ok(res, { success: true });
  }),
);
