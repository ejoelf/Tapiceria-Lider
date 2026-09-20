import test from 'node:test';
import assert from 'node:assert/strict';
process.env.DATABASE_URL ||= 'postgresql://local:local@127.0.0.1:5432/unused_test';
process.env.SESSION_SECRET ||= 'local-domain-tests-only-not-a-real-secret';
const { quoteTotals, dateOnly } = await import('../src/v2/common.js');
test('Los presupuestos redondean por ítem antes de aplicar descuento e impuestos', () => {
  const result = quoteTotals(
    [
      { description: 'Tela', quantity: 3, unit_price: 0.1 },
      { description: 'Trabajo', quantity: 1, unit_price: 99.99 },
    ],
    0.29,
    21,
  );
  assert.deepEqual(result, {
    subtotal: '100.29',
    discount: '0.29',
    tax_rate: '21.00',
    total: '121.00',
  });
});
test('Un descuento no puede superar el subtotal', () =>
  assert.throws(() => quoteTotals([{ quantity: 1, unit_price: 100 }], 101, 0), /descuento/));
test('Las fechas imposibles son errores de validación, no errores internos', () => {
  assert.equal(dateOnly.safeParse('2026-02-30').success, false);
  assert.equal(dateOnly.safeParse('2026-99-99').success, false);
  assert.equal(dateOnly.safeParse('2028-02-29').success, true);
});
