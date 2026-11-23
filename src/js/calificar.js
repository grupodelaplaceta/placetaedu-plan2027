// Calculo de notas (puro y sin DOM). Misma regla que course_grade() en supabase/migrations/0002_campus.sql.
(function (root) {
  'use strict';
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  // Nota de 0 a 100 a partir de aciertos
  function nota(aciertos, total) {
    if (!(total > 0) || aciertos < 0 || aciertos > total) throw new RangeError('aciertos/total no validos');
    return r2((aciertos * 100) / total);
  }
  // items: [{peso, nota}] con nota null si aun no esta calificada
  function media(items) {
    var pesoCal = 0, suma = 0, completa = items.length > 0;
    items.forEach(function (i) {
      if (i.peso < 0 || i.peso > 100) throw new RangeError('peso fuera de rango');
      if (i.nota == null) { completa = false; return; }
      pesoCal += i.peso; suma += i.nota * i.peso;
    });
    return { media: pesoCal > 0 ? r2(suma / pesoCal) : 0, pesoCalificado: r2(pesoCal), completa: completa };
  }
  // Aprobado solo si todo esta calificado y la media alcanza la nota minima del curso
  function aprobado(m, minimo) { return !!m.completa && m.media >= minimo; }
  function estado(m, minimo) {
    if (m.pesoCalificado === 0) return 'sin_notas';
    if (!m.completa) return m.media >= minimo ? 'va_aprobando' : 'va_suspendiendo';
    return m.media >= minimo ? 'aprobado' : 'suspendido';
  }
  var api = { nota: nota, media: media, aprobado: aprobado, estado: estado };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Calificar = api;
})(typeof window !== 'undefined' ? window : globalThis);
