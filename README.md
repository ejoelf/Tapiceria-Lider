# Tapicería Líder · V2

Web pública y sistema privado de gestión para el taller de Joel y Lucas en Río Cuarto. Atención a particulares, concesionarias y empresas. Creado por [NexoDigital](https://nexodigital-ix6r.onrender.com/).

La V2 está preparada para revisión local. No se creó ni se desplegó infraestructura externa. Los datos comerciales reales, la conexión con Supabase y el dominio se completan antes de publicar.

## Empezar en VS Code

Requisitos: **Node.js 24 LTS**, npm y **Docker Desktop** iniciado. También podés usar un PostgreSQL existente siguiendo `docs/INSTALACION.md`.

La versión para revisar está en la rama `codex/lider-v2`. Si ya tenés el repositorio, guardá tus cambios locales antes de cambiar de rama. Desde la raíz del repositorio:

```bash
git fetch origin
git switch codex/lider-v2
git pull --ff-only
npm ci
npm run setup:local
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

| Aplicación | Dirección local |
| --- | --- |
| Web pública | http://localhost:3000 |
| CRM | http://localhost:5174 |
| API / salud | http://localhost:4000/api/health |

**Las cuentas locales de Joel y Lucas y sus contraseñas aleatorias están en `.local/credentials.json`.** Abrí ese archivo en VS Code después del setup. Es privado, está excluido de Git y no contiene credenciales de producción. El setup conserva los `.env` existentes; si venís de la primera versión, seguí la sección de actualización de la guía.

Los catálogos iniciales incluyen marcas, modelos, piezas y categorías. No se inventan clientes, cobros, reseñas ni trabajos reales. La foto de portada es ilustrativa. Las galerías empiezan vacías hasta que carguen sus fotos.

## Qué incluye

- Web con identidad negro/plata, servicios, sección de concesionarias, trabajos, comparadores antes/después, contacto con fotos, metadatos SEO y sitemap.
- Consultas privadas, seguimiento, conversión a cliente y borradores de respuesta.
- Clientes particulares y empresas, vehículos e historial de trabajos.
- Presupuestos con ítems, descuentos, impuestos, PDF, revisiones y aceptación registrada. Aceptarlos genera una única orden.
- Órdenes, responsables, fechas, estados con historial, fotos privadas, materiales consumidos y costos.
- Inventario con entradas, consumos y ajustes; proveedores, compras, recepción y pagos separados.
- Caja, cobros parciales, saldos, gastos, margen estimado, aportes/retiros de socios y exportaciones CSV. Anulaciones con motivo; no se borran movimientos financieros.
- Moldes con PDF maestro, originales SVG/DXF, fotos de referencia, versiones y validación física de escala 1:1.
- Galería administrada desde el CRM: selección, portada, orden, títulos, pares antes/después, vista previa y publicación/retiro explícitos.
- Agenda, roles, usuarios, ajustes de la web y auditoría.
- Adaptadores opcionales para Supabase Auth/Storage, email con Resend y redacción asistida por IA. Sin credenciales, no simulan envíos ni respuestas de IA.

## Arquitectura

| Proyecto | Tecnología | Responsabilidad |
| --- | --- | --- |
| `frontend-web` | Next.js 16 + React + TypeScript | Sitio público renderizado en servidor y SEO |
| `frontend-admin` | React + Vite + TypeScript + Tailwind + componentes basados en shadcn/Radix | CRM privado |
| `backend` | Express 5 + Sequelize 6 + Zod | API, permisos y reglas del negocio |
| Datos | PostgreSQL + migraciones | Información relacional |
| Producción prevista | Supabase Auth + Storage privado | Identidades y archivos |

Un único `package-lock.json` y workspaces npm. El backend concentra las reglas de negocio; los frontends no acceden directamente a tablas ni usan claves privadas. Se conservan las migraciones históricas y se agrega la estructura V2 sin reemplazar tablas con `sync({ force: true })`.

## Comprobaciones

```bash
npm run typecheck
npm run build
npm test
```

`npm test` ejecuta las pruebas de dominio y **solo ejecuta la integración completa si existe `TEST_DATABASE_URL`**. La configuración reproducible está en `docs/VALIDACION.md`; GitHub Actions usa PostgreSQL y valida migraciones, backend y builds.

## Documentación

- [Instalación y actualización](docs/INSTALACION.md)
- [Recorrido de revisión para Joel y Lucas](docs/REVISION.md)
- [Arquitectura y selección de tecnologías](docs/arquitectura-general.md)
- [Datos, dinero y archivos](docs/base-de-datos.md)
- [Alcance y próximos pasos](docs/roadmap.md)
- [Validación y límites de las pruebas](docs/VALIDACION.md)
- [Preparación del despliegue](docs/DEPLOY.md)
- [API y permisos](docs/API.md)

El despliegue se hace después de revisar esta versión y configurar los datos reales. No hay pagos online, facturación fiscal ni servicios de limpieza anunciados como disponibles.
