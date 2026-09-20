# API V2

Base `/api`. Respuestas JSON: `{ ok: true, data, meta? }` o `{ ok: false, message, request_id? }`. Las listas de recursos admiten `page`, `pageSize` (hasta 500) y, cuando corresponde, `q`. Los archivos y exportaciones responden contenido binario/CSV.

## Público

| Ruta | Función |
| --- | --- |
| `GET /health` | Conexión de la API y PostgreSQL |
| `GET /public/site` | Contenido público del taller |
| `GET /public/portfolio` | Trabajos publicados; `featured=true` opcional |
| `GET /public/portfolio/:slug` | Trabajo publicado, sin datos internos |
| `GET /public/media/:entryId/:fileId` | Solo fotos incluidas en una publicación activa |
| `POST /public/leads` | JSON o multipart: nombre, contacto, servicio, mensaje, consentimiento; `photos` opcional |

## Sesión

`POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/password`. Usar cookie y `credentials: include`. El cambio de contraseña requiere la actual. No existe registro público de usuarios.

## Recursos autenticados

- `GET/POST /clients`, `/vehicles`, `/suppliers`, `/materials`, `/molds`, `/agenda`; `GET/PUT /:recurso/:id`.
- `GET /lookups`: listas acotadas para selectores, sin secretos.
- `GET/POST /leads`; `GET/PATCH /leads/:id`; `POST /leads/:id/client`.
- `GET/POST /orders`; `GET/PUT /orders/:id`; `POST /orders/:id/status`, `/consume`, `/media`.
- `GET/POST /quotes`; `GET/PUT /quotes/:id`; `POST /quotes/:id/status`, `/revise`; `GET /quotes/:id/pdf`.
- `GET/POST /inventory`. El ajuste indica el **nuevo stock total**; una entrada o consumo indica cantidad de movimiento.
- `GET/POST /purchases`; `GET /purchases/:id`; `POST /purchases/:id/receive`, `/cancel`.
- `GET/POST /finance/incomes`, `/finance/expenses`; `POST /finance/:tipo/:id/void` con motivo.
- `GET /finance/summary`, `GET /finance/export/:kind`.
- `GET/POST /partners`; `POST /partners/:id/void`.
- `POST /molds/:id/files`; `POST /molds/:id/files/:fileId/validate`; `GET /molds/:id/files/:fileId/print`.
- `GET /files/:id`: valida el área del archivo. `inline=1` solo permite visualizar imágenes raster.
- `GET/POST /portfolio`; `GET/PUT /portfolio/:id`; `POST /portfolio/:id/media`, `/publish` con `{ publish: boolean }`.
- `POST /messages`: guarda borrador; `POST /messages/:id/send` requiere `{ confirmed: true }`.
- `POST /assistant/draft`: contexto y `{ confirmed: true }`; necesita configuración externa.
- `GET /dashboard`; `GET/PUT /settings/site`; `GET/POST /users`; `PUT /users/:id`; `GET /audit`, `/integrations`; `POST /catalogs/:kind`.

## Roles

| Área | Administrador | Operador | Administración financiera |
| --- | --- | --- | --- |
| Clientes y órdenes | Sí | Sí | Sí |
| Vehículos, agenda, consultas, moldes, galería | Sí | Sí | No |
| Materiales / consumos desde órdenes | Sí | Sí | Lectura de selectores / consumos desde órdenes |
| Ajustes manuales de stock | Sí | No | No |
| Presupuestos, proveedores, compras, finanzas | Sí | No | Sí |
| Socios | Sí | No | Lectura |
| Anular caja, crear usuarios, ajustes, auditoría | Sí | No | No |

Los operadores pueden ver precios/costos en las órdenes para trabajar sobre ellas; la restricción financiera protege la caja y los movimientos generales, no oculta esos importes dentro de una orden. No hay separación por socio ni sucursal.
