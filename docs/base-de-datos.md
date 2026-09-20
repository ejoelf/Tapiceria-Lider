# Datos y reglas

Se mantienen las tablas de la primera versión. La migración `20260919000100-workshop-v2.cjs` agrega consultas, proveedores, compras, presupuestos, sesiones, archivos, publicaciones, agenda, movimientos de socios, auditoría y bandeja de salida. Extiende órdenes, clientes, usuarios, movimientos de caja y moldes.

Las tablas del negocio tienen RLS activado y se retiran privilegios de `anon` y `authenticated` cuando esos roles existen. La API usa el usuario dueño de las tablas. No se habilitan políticas de acceso directo desde el navegador. No se utiliza `FORCE ROW LEVEL SECURITY` sobre el propietario, porque la API es el límite de autorización.

## Dinero

- Importe en ARS, decimal con dos posiciones. Cantidades de inventario también usan dos decimales, de acuerdo con el esquema existente.
- Los totales del presupuesto se calculan del lado del servidor: redondeo por renglón, descuento y porcentaje de impuestos.
- Los consumos toman una copia del costo del material al momento de usarlo. Las entradas recalculan el costo promedio ponderado.
- Caja = cobros − gastos pagados + aportes − retiros. La fecha corresponde al movimiento real.
- Margen de una orden = precio acordado − materiales consumidos − horas × costo por hora − otros costos registrados − gastos directos no vinculados a compras.
- Margen operativo estimado = margen de órdenes terminadas/entregadas − gastos generales. No incluye los aportes/retiros ni vuelve a restar las compras de materiales ya consumidos.
- Los otros costos manuales no deben duplicar un gasto directo. El panel recuerda esa regla.
- El límite de crédito del cliente es una referencia, no un bloqueo crediticio automático.
- Presupuestos PDF y CSV son documentos de gestión. No se emiten comprobantes fiscales ni se integra ARCA.

## Concurrencia y trazabilidad

Se usan transacciones y bloqueos de fila para stock, aceptación de presupuestos, recepción de compras, cobros vinculados y cambios de estado. Aceptar dos veces el mismo presupuesto devuelve la misma orden. Recibir de nuevo una compra no duplica existencias. Los sobrecobros, sobrepagos de compras y stocks negativos se rechazan.

Las anulaciones conservan el movimiento original y el motivo. El historial de estados y la auditoría permiten identificar al responsable. Los botones de guardado se deshabilitan mientras se procesa la solicitud. Los endpoints genéricos de altas/caja no ofrecen una clave de idempotencia global: ante una conexión interrumpida, revisá si el registro se creó antes de repetir un alta manual.

## Moldes

Cada archivo tiene autor, fecha, tipo, versión y hash del original. La versión PDF actual solo se marca imprimible después de registrar la prueba física de una referencia de 100 mm, admitiendo 99,5–100,5 mm. Subir un PDF nuevo invalida la marca de verificación actual. La API de impresión devuelve el PDF original sin modificarlo; el usuario elige 100% o mosaico en su lector de PDF.

No se generan moldes exactos a partir de fotografías. La referencia, las medidas y los márgenes deben existir en el original que sube el taller. Los archivos editables se descargan como adjuntos y no se ejecutan dentro del navegador.

## Respaldo

Respaldar PostgreSQL **y** los objetos de Storage. Un backup de la base no incluye los PDFs ni las fotos. En local, respaldar el volumen de PostgreSQL y `backend/uploads`; en producción, definir retención, exportaciones y restauraciones de prueba antes del lanzamiento. La implementación no contrata ni activa un plan de backups externos.
