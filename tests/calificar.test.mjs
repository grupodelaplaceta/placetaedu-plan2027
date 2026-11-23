import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const sandbox = { module: { exports: {} } };
vm.runInNewContext(readFileSync(new URL('../src/js/calificar.js', import.meta.url), 'utf8'), sandbox);
const C = sandbox.module.exports;
const RangeErr = { name: 'RangeError' };

test('nota: porcentaje de aciertos con dos decimales', () => {
  assert.equal(C.nota(4, 5), 80);
  assert.equal(C.nota(1, 3), 33.33);
  assert.equal(C.nota(0, 5), 0);
  assert.equal(C.nota(5, 5), 100);
});
test('nota: rechaza datos imposibles', () => {
  assert.throws(() => C.nota(1, 0), RangeErr);
  assert.throws(() => C.nota(6, 5), RangeErr);
  assert.throws(() => C.nota(-1, 5), RangeErr);
});
test('media ponderada provisional (ejemplo del campus: 80 y 70 con pesos 10 y 10)', () => {
  const m = C.media([{ peso: 10, nota: 80 }, { peso: 10, nota: 70 }, { peso: 20, nota: null }, { peso: 60, nota: null }]);
  assert.equal(m.media, 75);
  assert.equal(m.pesoCalificado, 20);
  assert.equal(m.completa, false);
  assert.equal(C.estado(m, 60), 'va_aprobando');
});
test('no se aprueba con notas pendientes aunque la media supere el minimo', () => {
  const m = C.media([{ peso: 50, nota: 100 }, { peso: 50, nota: null }]);
  assert.equal(C.aprobado(m, 50), false);
});
test('media final: el examen pesa segun su peso y el minimo es el de cada curso', () => {
  const items = [{ peso: 10, nota: 80 }, { peso: 10, nota: 70 }, { peso: 20, nota: 90 }, { peso: 60, nota: 55 }];
  const m = C.media(items);
  assert.equal(m.media, 66);                 // (800+700+1800+3300)/100
  assert.equal(C.aprobado(m, 60), true);     // minimo 60
  assert.equal(C.aprobado(m, 70), false);    // otro curso con minimo 70
  assert.equal(C.estado(m, 70), 'suspendido');
});
test('el limite exacto aprueba (media igual al minimo)', () => {
  const m = C.media([{ peso: 100, nota: 60 }]);
  assert.equal(C.aprobado(m, 60), true);
});
test('sin actividades o con peso fuera de rango', () => {
  assert.equal(C.media([]).completa, false);
  assert.equal(C.estado(C.media([]), 50), 'sin_notas');
  assert.throws(() => C.media([{ peso: 120, nota: 10 }]), RangeErr);
});
test('un grupo: aprobados segun la nota minima del curso', () => {
  const notas = [82, 49, 50, 71, 30, 64];
  const aprobados = notas.filter((n) => C.aprobado(C.media([{ peso: 100, nota: n }]), 50)).length;
  assert.equal(aprobados, 4);
});
