# Instalación local

## Entorno nuevo

1. Instalá Node.js 24 LTS y Docker Desktop. En Windows, usá la terminal integrada de VS Code (PowerShell sirve).
2. Ejecutá los comandos del README desde la raíz del repositorio.
3. Abrí `.local/credentials.json` para ingresar al CRM con una de las dos cuentas locales.
4. La API usa el puerto 4000, el CRM 5174, la web 3000 y PostgreSQL 5432. No ejecutes los viejos servidores al mismo tiempo.

`npm run setup:local` genera secretos aleatorios y cuatro configuraciones: `.env` de Docker, `backend/.env`, `frontend-admin/.env` y `frontend-web/.env.local`. Nunca sobrescribe archivos existentes. `npm run db:seed` agrega catálogos y cuentas faltantes; no reinicia contraseñas ni carga movimientos ficticios.

Para detener las apps: Ctrl+C. Para detener PostgreSQL conservando los datos: `docker compose stop`. **No uses `docker compose down -v` si querés conservar la base**, porque elimina su volumen.

## Sin Docker

Creá una base PostgreSQL vacía llamada `tapiceria_lider` con un usuario dueño de esa base. Ejecutá `npm ci` y `npm run setup:local`, editá `DATABASE_URL` en `backend/.env` y luego ejecutá migración, seed y dev. `DB_SSL=false` corresponde únicamente a una conexión local sin TLS.

También podés usar una base remota de desarrollo con TLS. No apuntes pruebas automáticas ni desarrollo a una base con información de producción.

## Si ya tenías la versión anterior

1. Guardá una copia de los `.env`, de la base PostgreSQL y de `backend/uploads` fuera del repositorio antes de actualizar.
2. Hacé el pull. `node_modules` ya no se versiona y los `.env` reales se retiraron de Git.
3. Ejecutá `npm ci` desde la raíz. El lockfile de la raíz reemplaza a los locks de cada carpeta.
4. Compará `backend/.env.example` con tu configuración. La API ahora requiere `DATABASE_URL`, `SESSION_SECRET` (al menos 32 caracteres), `AUTH_PROVIDER` y `STORAGE_PROVIDER`. Ya no usa JWT en localStorage ni la antigua configuración de conexión por campos separados.
5. Para una revisión totalmente separada, elegí una base nueva y copiá los ejemplos de configuración. Para conservar la anterior, probá la migración sobre una copia y luego ejecutá `npm run db:migrate` sobre la base elegida. Las 27 migraciones históricas se mantienen; Sequelize ejecuta únicamente las pendientes.
6. Ejecutá `npm run db:seed`. Los administradores históricos `admin`/`super_admin` mantienen acceso. Las nuevas cuentas usan `owner`, `operator` o `accountant`.
7. Los archivos históricos y registros se conservan, pero la ruta pública `/uploads` se retiró. Reimportá los originales desde la ficha del molde o la orden para vincularlos al almacenamiento privado V2. No borres la carpeta anterior hasta comprobar la recuperación.
8. Cerrá las sesiones anteriores. Ingresá de nuevo al CRM; el sistema usa una cookie de sesión HTTP-only.

Las credenciales que alguna vez se versionaron en `.env` deben reemplazarse antes del despliegue: quitarlas del árbol actual no las elimina del historial Git. No se reescribió el historial del repositorio ni se modificaron credenciales externas.

## Crear una cuenta inicial

En local, el setup y el seed bastan. Para crear una cuenta explícita, guardá un JSON privado dentro de `.local/` con `first_name`, `last_name`, `email`, `password` (12 caracteres como mínimo) y `role` (`owner`, `operator`, `accountant`). Después:

```bash
npm run user:create -w backend -- ../.local/cuenta.json
```

En producción este comando provisiona el usuario interno en Supabase Auth y su ficha en la base. El administrador es responsable de verificar a la persona y entregar la contraseña inicial por un canal privado. Las cuentas posteriores se administran desde el CRM.

## Problemas comunes

| Síntoma | Qué revisar |
| --- | --- |
| Falta DATABASE_URL / SESSION_SECRET | Corré setup o actualizá un `.env` anterior; no se sobreescriben configuraciones |
| Conexión rechazada en 5432 | Docker iniciado, `docker compose ps`, puerto libre |
| La API informa que faltan tablas | Ejecutá migraciones y luego seed en la misma base que usa el servidor |
| Login incorrecto después de repetir setup | El seed no cambia contraseñas existentes; usá el archivo de credenciales con el que se creó esa base |
| Web sin galería | Creá y publicá una entrada con portada y autorización |
| Email / IA no disponibles | Integraciones opcionales sin configurar; el resto del sistema sigue funcionando |
| El frontend no encuentra la API | Revisá los puertos y ejemplos de variables; no uses URLs del despliegue anterior |

Todas las fechas de agenda y movimientos se introducen como hora del taller (Argentina, UTC−3), aunque el navegador esté en otro país.
