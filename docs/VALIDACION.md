# Validación

## Comandos

```bash
npm ci
npm run typecheck
npm run build
npm test
npm audit
```

La suite de integración exige `TEST_DATABASE_URL` apuntando a una base cuyo nombre termine en `_test`. No elimina tablas de otra base. Crea registros de prueba con identificadores únicos y usa una carpeta temporal para archivos.

Ejemplo en PowerShell, después de crear una base exclusiva `lider_test`:

```powershell
$env:DATABASE_URL="postgresql://usuario:password@localhost:5432/lider_test"
$env:TEST_DATABASE_URL=$env:DATABASE_URL
$env:NODE_ENV="test"
$env:SESSION_SECRET="secreto-local-exclusivo-de-pruebas-de-32-caracteres"
npm run db:migrate
npm test
```

Eliminar esas variables de la terminal o abrir una nueva al volver a desarrollar. No reutilizar credenciales de producción. GitHub Actions prepara una base PostgreSQL 17 desechable y ejecuta los mismos comandos. Su auditoría incluye las dependencias de desarrollo, además de las de producción.

## Configuración local en Windows

`npm run test:setup` comprueba contraseñas con símbolos, rutas con espacios, mensajes cuando falta Docker, conservación de cuentas existentes y del contenido de `.env`, copias privadas y rechazo de cambios cuando la conexión falla. CI lo ejecuta también en Windows con Node 22.14.0.

La prueba de creación de bases requiere adicionalmente `TEST_POSTGRES_PROVISIONING=true`, un servidor PostgreSQL nativo desechable y un usuario con permiso `CREATEDB`. La usa CI: crea una base de nombre aleatorio exclusivo de la prueba, verifica su reutilización y el rechazo de una contraseña errónea, y elimina únicamente esa base al terminar. No se habilita sobre la base del taller ni en el entorno PGlite.

## Cobertura ejecutada durante el desarrollo

15 comprobaciones de dominio e integración, incluyendo el contenedor de la suite:

- Redondeo monetario, descuentos y fechas inválidas.
- Sesiones HTTP-only, origen y restricciones de roles.
- Consulta pública con foto privada y conversión idempotente a cliente.
- Presupuesto, vehículo perteneciente al cliente, estados, PDF y generación única de orden.
- Stock insuficiente, consumo y costos.
- Recepción idempotente de compra, costo promedio y límite del pago.
- Cobros parciales, rechazo de sobrecobro, anulación y separación de aportes.
- Transiciones de trabajo, historial y consumos bloqueados en órdenes cerradas.
- PDFs originales intactos, verificación física y nueva versión de molde.
- Consentimiento para publicar, rechazo de moldes como fotos, borradores privados y retiro de publicación.
- Catálogos, agenda, ajustes, auditoría y borradores sin simular envíos.
- Revocación de cuenta y cierre de sesión.

En este entorno de desarrollo la integración se ejecutó contra PostgreSQL 18.3 compilado a WASM (PGlite), a través del driver `pg`, con una conexión y una base efímera nueva. Las migraciones y consultas SQL no se reemplazaron por mocks. GitHub Actions queda configurado para repetir la suite en PostgreSQL 17 nativo. Esta validación local no prueba concurrencia entre procesos o nodos múltiples.

La web Next.js y el CRM Vite se compilan para producción y pasan TypeScript. Se generó HTML real del servidor para revisar la estructura de la home. El entorno de navegador remoto no pudo conectarse al servidor local; la verificación visual interactiva y móvil queda incluida en el recorrido manual de `REVISION.md`, sin presentarla como una prueba ejecutada.

También se iniciaron simultáneamente la API, Next.js y Vite contra una base nueva y se verificó por HTTP el recorrido entre aplicaciones: ocho rutas públicas, footer de NexoDigital, páginas 404, protección de rutas privadas, envío del formulario por el proxy de Next.js, aparición de la consulta en la bandeja del CRM, ingreso mediante el proxy de Vite, dashboard y cierre de sesión. Esto comprueba la conexión entre servidores, sin sustituir una revisión visual en navegador.

## Límites

No se desplegó ninguna aplicación ni se utilizaron credenciales reales de Supabase, Resend o un proveedor IA. Su funcionamiento en producción y las cookies entre dominios se verifican al configurar infraestructura. Tampoco se probó una impresión física de un molde real: esa calibración corresponde al taller.

Las dependencias están fijadas en el lockfile. El override de UUID 11.1.1 resuelve el aviso de la dependencia transitiva de Sequelize; las migraciones y las transacciones se prueban con esa resolución.
