import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { ZodError } from 'zod';
import { rateLimit } from 'express-rate-limit';
import env from './config/env.js';
import { sequelize } from './database/v2.js';
import { HttpError } from './v2/common.js';
import { authRouter, authenticate } from './v2/auth.js';
import { catalogRouter } from './v2/catalog.js';
import { workshopRouter } from './v2/workshop.js';
import { filesRouter } from './v2/files.js';
import { publicRouter, systemRouter } from './v2/system.js';
const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false);
app.use((req, res, next) => {
  req.id = randomUUID();
  res.set('X-Request-Id', req.id);
  next();
});
app.use(helmet());
const origins = new Set([env.FRONTEND_WEB_URL, env.FRONTEND_ADMIN_URL, env.API_URL]);
app.use(
  cors({
    origin(origin, cb) {
      cb(origin && !origins.has(origin) ? new HttpError(403, 'Origen no permitido.') : null, true);
    },
    credentials: true,
  }),
);
// Cookie de sesión + origen explícito: las mutaciones del navegador no son CSRF.
app.use((req, res, next) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.get('origin') &&
    !origins.has(req.get('origin'))
  )
    return next(new HttpError(403, 'Origen no permitido.'));
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.get('sec-fetch-site') === 'cross-site' &&
    !req.get('origin')
  )
    return next(new HttpError(403, 'Solicitud no permitida.'));
  next();
});
app.use(express.json({ limit: '300kb' }));
app.use(cookieParser());
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, service: 'lider-api' });
  } catch {
    res.status(503).json({ ok: false, message: 'La base de datos no está disponible.' });
  }
});
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(
  '/api',
  rateLimit({ windowMs: 60000, limit: 600, standardHeaders: 'draft-8', legacyHeaders: false }),
);
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api', authenticate, catalogRouter, workshopRouter, filesRouter, systemRouter);
app.use((req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = error.statusCode || 500,
    message = error.statusCode ? error.message : 'No se pudo completar la operación.';
  if (error instanceof ZodError) {
    status = 400;
    message = error.issues.map((i) => `${i.path.join('.') || 'Datos'}: ${i.message}`).join(' · ');
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Ya existe un registro con esos datos.';
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    message = 'Uno de los registros relacionados no existe o está en uso.';
  }
  if (error.name === 'SequelizeValidationError') {
    status = 400;
    message = 'Revisá los campos obligatorios.';
  }
  if (error.name === 'MulterError') {
    status = 400;
    message = req.originalUrl.startsWith('/api/public/leads')
      ? 'Revisá las fotos: hasta 3 archivos de 10 MB cada uno.'
      : 'Revisá los archivos: hasta 25 MB cada uno.';
  }
  if (error.type === 'entity.too.large') {
    status = 413;
    message = 'La solicitud es demasiado grande.';
  }
  if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'El contenido de la solicitud no es válido.';
  }
  if (status >= 500)
    console.error(
      JSON.stringify({
        request_id: req.id,
        error: error.name,
        message: error.message?.slice(0, 200),
      }),
    );
  res.status(status).json({ ok: false, message, request_id: req.id });
});
export default app;
