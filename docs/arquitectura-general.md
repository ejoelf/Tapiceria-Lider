# Arquitectura V2

## Separación

- `frontend-web`: Next.js App Router, renderizado en servidor, páginas de servicios/trabajos, SEO, sitemap y formulario. Lee solamente la API pública.
- `frontend-admin`: React/Vite, TypeScript, Tailwind y componentes accesibles con Radix/shadcn. Rutas y vistas separadas por dominio; gráficos cargados cuando hacen falta.
- `backend`: Express, validación Zod, módulos `auth`, `catalog`, `workshop`, `files`, `system` y utilidades compartidas. API única para reglas, permisos y cálculos.
- `backend/src/database/models`: modelos históricos, extendidos por `v2.js`. Migraciones aditivas; no se usa sincronización destructiva.
- `scripts`: preparación local. Un solo lockfile permite reproducir las dependencias de los tres proyectos.

## Tecnologías seleccionadas

| Tecnología | Uso en Líder |
| --- | --- |
| Next.js / React / TypeScript | Web indexable y CRM interactivo |
| Vite | Desarrollo y distribución del CRM como aplicación estática |
| Tailwind + Radix/shadcn | Interfaz privada, controles accesibles y componentes mantenibles |
| Express + Sequelize + PostgreSQL | Aprovechar el modelo existente sin cambiar innecesariamente de ORM |
| Zod + Decimal.js | Validar solicitudes y calcular dinero sin sumar importes con coma flotante |
| Supabase Auth / Storage | Identidad y archivos privados al desplegar |
| Resend | Envío opcional de respuestas revisadas por el equipo |
| Proveedor IA compatible con Chat Completions | Borradores opcionales, sin acciones autónomas ni precios inventados |
| GitHub Actions | Migraciones, pruebas y compilaciones en cada cambio |

No se agregaron agentes múltiples, RAG, colas, Redis, n8n, microservicios ni una segunda base sin una necesidad comprobada. Los datos pueden permanecer en PostgreSQL de Neon si más adelante se decide; usar Supabase para Auth/Storage y también para la base simplifica la primera operación. No hay dependencias directas del frontend a la API de tablas de Supabase.

## Sesiones y permisos

Cookie HTTP-only con token aleatorio; solo su hash se guarda en `sessions`. En producción la sesión contiene las credenciales de Supabase cifradas con AES-GCM, y la API verifica el usuario con `getUser`. La clave privada y `DATABASE_URL` permanecen en el backend. Desactivar un usuario o cambiar su contraseña invalida sus sesiones.

Control de origen para mutaciones, límites de solicitudes, límites de archivos, cabeceras de seguridad, respuestas privadas sin caché y roles verificados en la API. No se confía en ocultar botones del frontend.

## Archivos

Objetos privados en Supabase; carpeta local exclusivamente para desarrollo. Los PDFs/SVG/DXF del molde conservan sus bytes originales. Las fotos destinadas a consultas, órdenes o galería se convierten a WebP y se eliminan metadatos EXIF. La API comprueba el acceso y sirve el contenido; no entrega rutas internas ni URLs permanentes de archivos privados.

Solo las fotos seleccionadas en publicaciones activas y autorizadas tienen una URL pública. Retirar la publicación corta ese acceso inmediatamente, sin caché compartida.

## Crecimiento

La estructura conserva sucursales históricas, pero esta versión opera **un único taller compartido**. No es SaaS multiempresa ni implementa aislamiento por sucursal. Para abrir sedes independientes habrá que definir permisos, stock/caja por sede y filtros antes de habilitar esa operación.

El CRM está escrito en TypeScript; los registros dinámicos usan un tipo genérico y los contratos se validan en el backend con Zod. Se puede endurecer el tipado compartido/OpenAPI conforme se estabilicen las pantallas con la revisión de Joel y Lucas.
