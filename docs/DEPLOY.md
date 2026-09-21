# Preparación del despliegue

Esta guía no despliega nada. La publicación se realiza después de la revisión local.

## Topología propuesta

- Web Next.js en Vercel; proyecto con raíz `frontend-web` y acceso a los archivos del workspace raíz.
- CRM Vite en un segundo proyecto Vercel; raíz `frontend-admin`, build `npm run build` y salida `dist`.
- API Node en Render; **raíz del repositorio**, build `npm ci --include=dev`, start `npm start -w backend` y health check `/api/health`. Se deja la raíz porque el lockfile y los workspaces están fuera de `backend`.
- PostgreSQL, Auth y un bucket privado en Supabase.

Render excluye de un servicio los archivos que están fuera de su root directory; por eso este monorepo conserva la raíz para la API. Referencia: [monorepos en Render](https://render.com/docs/monorepo-support). Vercel admite proyectos separados sobre el mismo monorepo: [documentación oficial](https://vercel.com/docs/monorepos).

## Variables

| Backend (solo servidor) | Valor / propósito |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Conexión PostgreSQL del propietario de las tablas; usar la conexión adecuada del proyecto |
| `DB_SSL` | `true`; no se desactiva la verificación del certificado |
| `SESSION_SECRET` | Secreto aleatorio independiente de desarrollo, mínimo 32 caracteres |
| `AUTH_PROVIDER` | `supabase` |
| `STORAGE_PROVIDER` | `supabase` |
| `SUPABASE_URL` | URL del proyecto |
| `SUPABASE_SECRET_KEY` | Clave privada de servidor; jamás una variable VITE/NEXT_PUBLIC |
| `SUPABASE_BUCKET` | `lider-private` |
| `FRONTEND_WEB_URL` | Origen HTTPS público, sin barra final |
| `FRONTEND_ADMIN_URL` | Origen HTTPS del CRM, sin barra final |
| `API_URL` | Origen HTTPS de la API |
| `COOKIE_SAME_SITE` | `lax` si se usa un proxy del mismo origen o subdominios del mismo sitio |

Si se usan dominios independientes sin proxy, se necesita `none` con cookie segura y puede haber restricciones de cookies de terceros. Preferí subdominios propios o un proxy `/api` en el dominio del CRM. Hay que probar login, recarga, expiración y logout en las URLs definitivas.

En la web: `API_INTERNAL_URL` apunta a Render y `NEXT_PUBLIC_SITE_URL` al dominio público real. Next ya tiene el rewrite `/api`.

En el CRM: `VITE_API_BASE=/api`, `VITE_PUBLIC_SITE_URL` con el dominio de la web. En Vercel configurá **antes del fallback SPA** un rewrite `/api/:path*` hacia la API de Render. Después, el fallback `/(.*)` a `/index.html`. La URL de Render no se incluye inventada en un `vercel.json`: se completa al crear el servicio. Alternativamente, configurá `VITE_API_BASE` con la URL de la API y ajustá cookies/CORS.

## Migración y cuentas

1. Guardar un backup de la base y de los archivos si se migra información existente.
2. Ejecutar `npm run db:migrate` como paso único de liberación, desde un entorno con las variables de producción y las dependencias CLI instaladas. No hacerlo dentro de cada arranque del servidor.
3. Ejecutar `npm run db:seed` para catálogos. En Supabase no crea cuentas locales ni contraseñas de demostración.
4. Provisionar las cuentas de Joel y Lucas con el comando `user:create` documentado en instalación.
5. Retirar los archivos JSON temporales con contraseñas después de almacenarlas de forma segura.

La API debe operar con el propietario de las tablas o un rol del servidor correctamente configurado. Los roles de navegador no deben obtener acceso directo a estas tablas. Probar RLS en el proyecto concreto antes de publicar.

## Storage

Crear `lider-private` como **bucket privado**, con un máximo de al menos 25 MB por archivo. Tipos usados: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` y `application/dxf`. La API recibe consultas de hasta tres fotos de 10 MB y archivos técnicos de hasta 25 MB.

No agregar políticas públicas ni usar `getPublicUrl` para moldes o fotos internas. La API usa la clave privada del servidor y comprueba permisos antes de responder. La documentación de Supabase distingue el acceso de [buckets privados y públicos](https://supabase.com/docs/guides/storage/buckets/fundamentals).

## Integraciones opcionales

- Resend: dominio verificado, `RESEND_API_KEY`, `EMAIL_FROM`. Los emails se envían solo al confirmar un borrador. Se utiliza una clave de idempotencia estable por mensaje. Si un envío queda incierto por una caída, revisar el registro del proveedor antes de reintentar fuera de su ventana de idempotencia.
- IA: `AI_API_KEY`, `AI_API_URL` (endpoint HTTPS completo de Chat Completions) y `AI_MODEL`. El botón informa que se transmitirá el texto de la consulta; el resultado debe revisarse. La IA no tiene herramientas para modificar datos ni enviar mensajes.

## Comprobación previa al lanzamiento

Completar datos comerciales y dominio; sustituir cualquier secreto histórico; comprobar formulario→CRM, fotos privadas, publicación/retiro, PDF y moldes, sesión en móvil y permisos. Probar directamente Supabase Auth/Storage y las integraciones que se activen. Definir respaldos de base y objetos y ensayar una restauración. Revisar con el negocio los textos públicos y de privacidad.
