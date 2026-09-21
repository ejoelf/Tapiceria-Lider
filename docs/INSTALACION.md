# Instalación local

## Entorno nuevo

1. Usá Node.js 22.12 o superior (24 LTS recomendado) y PostgreSQL local o Docker Desktop. Node 22.14 es compatible. En Windows, usá la terminal integrada de VS Code.
2. Ejecutá los comandos del README desde la raíz del repositorio y elegí una de las dos opciones de base de datos.
3. Abrí `.local/credentials.json` para ingresar al CRM con una de las dos cuentas locales.
4. La API usa el puerto 4000, el CRM 5174, la web 3000 y PostgreSQL 5432. No ejecutes los viejos servidores al mismo tiempo.

`npm run setup:local` genera secretos aleatorios y cuatro configuraciones: `.env` de Docker, `backend/.env`, `frontend-admin/.env` y `frontend-web/.env.local`. Nunca sobrescribe archivos existentes. Avisa si Docker no está disponible. La conexión inicial usa el usuario `lider` y la contraseña del contenedor: no son automáticamente las credenciales de un PostgreSQL que ya estuviera instalado en tu equipo. `npm run db:seed` agrega catálogos y cuentas faltantes; no reinicia contraseñas ni carga movimientos ficticios.

Para detener las apps: Ctrl+C. Para detener PostgreSQL conservando los datos: `docker compose stop`. **No uses `docker compose down -v` si querés conservar la base**, porque elimina su volumen.

## PostgreSQL instalado en Windows, sin Docker

Después de `npm ci` y `npm run setup:local`:

```bash
npm run setup:postgres
```

El asistente pregunta:

| Campo | Valor habitual |
| --- | --- |
| Host | `127.0.0.1` |
| Puerto | `5432` |
| Usuario de PostgreSQL | `postgres`, o el usuario que creaste en tu instalación |
| Base del proyecto | `tapiceria_lider_v2`, una base separada para revisar esta versión |
| Contraseña | La de ese usuario de PostgreSQL; se ingresa sin mostrarse |

La contraseña de PostgreSQL es distinta de las cuentas de Joel y Lucas y puede ser distinta de la contraseña maestra de pgAdmin. No hace falta compartirla por chat. Si no la recordás, recuperá el acceso a tu instalación antes de continuar.

El asistente comprueba las credenciales y, si la base elegida no existe, la crea vacía con ese usuario como propietario. No borra ni reinicia bases. Si falta permiso `CREATEDB`, creá la base en pgAdmin con ese propietario y repetí el asistente. Solo admite servidores locales; las conexiones remotas se configuran manualmente.

Al validar la conexión actualiza únicamente `DATABASE_URL` y `DB_SSL` en `backend/.env`; conserva una copia privada de la configuración anterior dentro de `.local/`. Codifica símbolos como `@`, `#`, `/` y espacios de la contraseña. Una conexión rechazada no cambia la configuración.

Si Git Bash informa que falta una terminal interactiva, abrí una nueva terminal **PowerShell** dentro de VS Code, ubicada en la misma carpeta, y repetí `npm run setup:postgres`. Si PowerShell bloquea `npm.ps1`, usá `npm.cmd run setup:postgres`; no hace falta cambiar las políticas de ejecución.

Luego:

```bash
npm run db:check
npm run db:migrate
npm run db:seed
npm run dev
```

`db:migrate` ya comprueba la conexión antes de ejecutar las migraciones. No sigas con migraciones o seed mientras el chequeo indique un error. `DB_SSL=false` corresponde únicamente a una conexión local sin TLS.

También podés editar `DATABASE_URL` manualmente, conservando el resto del archivo. El formato es `postgresql://USUARIO:CONTRASEÑA_CODIFICADA@127.0.0.1:5432/NOMBRE_BASE`; los marcadores se reemplazan por valores reales. El asistente evita errores al codificar contraseñas con símbolos.

También podés usar una base remota de desarrollo con TLS. No apuntes pruebas automáticas ni desarrollo a una base con información de producción.

## Con Docker

Instalá y abrí Docker Desktop, reiniciá la terminal si no encuentra `docker`, y ejecutá `docker compose up -d`. Después, migraciones, seed y dev. Esta opción utiliza el usuario `lider` y la contraseña generada en `.env` de la raíz.

Si ya hay otro PostgreSQL usando el puerto 5432, usá el asistente de la sección anterior o asigná otro puerto al contenedor y actualizá el puerto en `backend/.env`. No detengas ni elimines una base existente para liberar el puerto.

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
| Git informa unknown option f-only | El comando correcto es `git pull --ff-only`, con dos letras f |
| bash: docker: command not found | Docker no está disponible en esa terminal; usá `npm run setup:postgres` con tu PostgreSQL instalado, o instalá/iniciá Docker Desktop |
| Contraseña rechazada para el usuario lider | La URL generada corresponde al contenedor; ejecutá `npm run setup:postgres` para usar el usuario y contraseña de tu PostgreSQL local |
| Falta DATABASE_URL / SESSION_SECRET | Corré setup o actualizá un `.env` anterior; no se sobreescriben configuraciones |
| Conexión rechazada en 5432 | Docker iniciado, `docker compose ps`, puerto libre |
| La API informa que faltan tablas | Ejecutá migraciones y luego seed en la misma base que usa el servidor |
| Login incorrecto después de repetir setup | El seed no cambia contraseñas existentes; usá el archivo de credenciales con el que se creó esa base |
| Web sin galería | Creá y publicá una entrada con portada y autorización |
| Email / IA no disponibles | Integraciones opcionales sin configurar; el resto del sistema sigue funcionando |
| El frontend no encuentra la API | Revisá los puertos y ejemplos de variables; no uses URLs del despliegue anterior |
| La conexión sigue usando una URL anterior | Una variable `DATABASE_URL` definida en la terminal tiene prioridad sobre el archivo; quitá esa variable o abrí una terminal sin ella |
| npm ci muestra avisos deprecated/funding | Son avisos de paquetes y financiación; revisá por separado el resultado de `npm audit`. Actualizá la rama y ejecutá `npm ci` para aplicar el lockfile corregido |

La actualización de dependencias corrige los cuatro avisos reproducidos con la primera V2. La auditoría de CI ahora incluye dependencias de desarrollo. No uses `npm audit fix --force` para este caso: aplicá la actualización del repositorio con `git pull --ff-only` y `npm ci`.

Todas las fechas de agenda y movimientos se introducen como hora del taller (Argentina, UTC−3), aunque el navegador esté en otro país.
