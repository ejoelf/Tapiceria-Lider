# Alcance y próximos pasos

## Disponible para revisión

Web pública, formularios con fotos, CRM del taller, presupuestos versionados y PDF, órdenes con costos/consumos, clientes/vehículos, proveedores/compras, caja, socios, agenda, biblioteca privada de moldes, galería publicable, roles y auditoría. Arranque local sin credenciales de servicios externos.

## Antes de publicar

Revisar los flujos con Joel y Lucas; cargar identidad/contacto/fotos reales; seleccionar dominio y planes; configurar Supabase, CORS, cookies y TLS; provisionar las cuentas de producción; probar las integraciones reales; definir backups y restauración. La API de emails y los borradores IA son opcionales y permanecen inactivos sin configuración.

## Mejoras según uso real

- Filtros de reportes por período, conciliación de caja y cierres mensuales.
- Paginación/filtros en pantallas auxiliares de reportes: hoy muestran hasta 500 movimientos; los CSV incluyen el conjunto completo.
- Recuperación de contraseña por email e invitaciones autoservicio; hoy las altas son administrativas y el cambio de contraseña requiere la actual.
- Notificaciones automáticas, integración de WhatsApp Business y automatizaciones n8n si el volumen lo justifica.
- Registro detallado de tiempo por tarea, capacidad del taller y calendario visual.
- Portal de concesionarias y consulta del estado del trabajo por cliente.
- Editor vectorial/CAD, plantillas de calibración e importación automática de moldes antiguos. Hoy se conservan e imprimen los originales subidos.
- Contratos TypeScript compartidos, especificación OpenAPI y búsquedas remotas para catálogos que superen 1.000 registros.
- Idempotencia por clave para todas las altas financieras y conciliación de envíos inciertos de email.

## Expansión del negocio

Limpieza especializada de tapizados, unidad móvil, náutica, aeronaves y nuevas sedes requieren herramientas, procedimientos y capacidad operativa. No se anuncian como servicios activos. Tampoco se agrega e-commerce, cursos, detailing, pagos online ni facturación fiscal sin definir su necesidad.
