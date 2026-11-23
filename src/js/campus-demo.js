// Prototipo interactivo del campus (datos ficticios). Construye el DOM con textContent (DEVAI Art. 12).
// AVISO: en la plataforma real las respuestas correctas NUNCA llegan al navegador; aqui estan solo para demostrar el flujo.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var tt;
  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 3200); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-toast]'); if (b) toast(b.getAttribute('data-toast'));
    var r = e.target.closest('[data-role]'); if (r) {
      $$('[data-role]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === r)); });
      var est = $('#r-est'), ins = $('#r-ins'); if (est) est.hidden = r.getAttribute('data-role') !== 'est'; if (ins) ins.hidden = r.getAttribute('data-role') !== 'ins';
    }
  });

  /* Notificaciones */
  function sinLeer() { var n = $$('.notif.nueva').length; var c = $('#badge-notif'); if (c) { c.textContent = String(n); c.hidden = n === 0; } }
  var marcar = $('#leer-todas'); if (marcar) marcar.addEventListener('click', function () { $$('.notif.nueva').forEach(function (n) { n.classList.remove('nueva'); }); sinLeer(); toast('Notificaciones marcadas como leídas'); });
  sinLeer();
  function notificar(tipo, estado, titulo, texto) {
    var lista = $('#lista-notif'); if (!lista) return;
    var li = el('li', 'notif nueva ' + tipo); li.appendChild(el('span', 'chip ' + tipo, estado));
    var d = el('div'); d.appendChild(el('b', null, titulo)); d.appendChild(el('p', 'mut', texto)); li.appendChild(d); lista.insertBefore(li, lista.firstChild); sinLeer();
  }

  /* Anadir curso con codigo de inscripcion */
  var CODIGOS = { 'IES-4K7Q2': { titulo: 'Introducción a la programación', sub: 'Con tu centro · IES Can Rull', total: 12, glyph: 'k-b', centro: 'IES Can Rull' } };
  var join = $('#join');
  if (join) join.addEventListener('click', function () {
    var msg = $('#join-msg'), v = ($('#cod').value || '').trim().toUpperCase(), c = CODIGOS[v];
    if (!c) { msg.textContent = v.length < 6 ? 'El código tiene al menos 6 caracteres.' : 'Código no válido o caducado. Revísalo con tu centro.'; return; }
    if ($('[data-curso="prog"]')) { msg.textContent = 'Ya estás inscrita en este curso.'; return; }
    var card = el('article', 'tarjeta'); card.setAttribute('data-curso', 'prog');
    var cv = el('div', 'cover chico ' + c.glyph); cv.appendChild(el('span', 'rosette')); card.appendChild(cv);
    var body = el('div', 'tb'); body.appendChild(el('span', 'tag conv', 'Con tu centro')); body.appendChild(el('h3', null, c.titulo)); body.appendChild(el('p', 'mut', c.sub));
    var pg = el('progress', 'pg'); pg.value = 0; pg.max = c.total; pg.setAttribute('aria-label', 'Progreso 0 de ' + c.total + ' unidades'); body.appendChild(pg);
    body.appendChild(el('p', 'mut', '0 de ' + c.total + ' unidades'));
    var a = el('a', 'btn sm', 'Entrar'); a.href = 'curso.html'; body.appendChild(a); card.appendChild(body);
    var mas = $('.mas-card'); mas.parentNode.insertBefore(card, mas); mas.removeAttribute('open'); card.scrollIntoView({ inline: 'center', block: 'nearest' });
    msg.textContent = ''; $('#cod').value = '';
    notificar('info', 'Matrícula', 'Te han dado de alta en «' + c.titulo + '»', c.centro + ' ha abonado tu matrícula por convenio. No tienes que pagar nada.');
    toast('Te has unido a «' + c.titulo + '»');
  });

  /* Curso: marcar unidad como hecha y recalcular progreso */
  function recalcula() {
    var items = $$('.indice li[data-u]'), hechos = items.filter(function (i) { return i.classList.contains('hecho'); }).length;
    var pg = $('#pg-curso'); if (pg) { pg.max = items.length; pg.value = hechos; }
    var t = $('#txt-curso'); if (t) t.textContent = hechos + ' de ' + items.length + ' unidades (' + Math.round(hechos * 100 / items.length) + ' %)';
    $$('.indice details.modulo').forEach(function (m) { var li = $$('li[data-u]', m), h = li.filter(function (i) { return i.classList.contains('hecho'); }).length; var c = $('.cuenta', m); if (c) c.textContent = h + '/' + li.length; });
  }
  $$('[data-hecho]').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = $('.indice li[data-u="' + b.getAttribute('data-hecho') + '"]'); if (!li) return;
      var ya = li.classList.toggle('hecho'); b.textContent = ya ? 'Marcada como hecha ✓' : 'Marcar como hecha'; recalcula();
    });
  });
  recalcula();

  /* Cuestionarios: corrigen todo a la vez, explican cada respuesta y se pueden repetir */
  function marcaHecha(id) {
    var li = $('.indice li[data-u="' + id + '"]'); if (li) li.classList.add('hecho');
    var b = $('[data-hecho="' + id + '"]'); if (b) b.textContent = 'Marcada como hecha ✓';
    recalcula();
  }
  $$('form[data-quiz]').forEach(function (f) {
    var res = $('.res', f), enviar = $('button[type=submit]', f), otra = $('.again', f), min = Number(f.getAttribute('data-min')), mejor = null;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var fs = $$('fieldset', f), sin = fs.filter(function (s) { return !$('input:checked', s); });
      if (sin.length) { res.className = 'res falta'; res.textContent = 'Responde todas las preguntas antes de comprobar. Te faltan ' + sin.length + '.'; sin[0].scrollIntoView({ block: 'center' }); return; }
      var ok = 0;
      fs.forEach(function (s) {
        var bien = $('input:checked', s).value === s.getAttribute('data-ok'); if (bien) ok++;
        s.classList.toggle('bien', bien); s.classList.toggle('mal', !bien); s.inert = true;
        var fb = $('.fb', s); fb.hidden = false; fb.className = 'fb ' + (bien ? 'bien' : 'mal'); fb.textContent = (bien ? '✓ Correcta. ' : '✗ Incorrecta. ') + s.getAttribute('data-expl');
      });
      var n = Calificar.nota(ok, fs.length); mejor = mejor == null ? n : Math.max(mejor, n);
      var pasa = n >= min;
      res.className = 'res ' + (pasa ? 'ok' : 'falta');
      res.textContent = 'Tu nota: ' + String(n).replace('.', ',') + ' / 100 (' + ok + ' de ' + fs.length + '). Mínimo para aprobar: ' + min + '. ' + (pasa ? 'Aprobado. La unidad queda completada.' : 'No llegas al mínimo: repasa las explicaciones y repite el cuestionario.') + (mejor !== n ? ' Mejor nota: ' + String(mejor).replace('.', ',') + '.' : '');
      enviar.hidden = true; otra.hidden = false;
      if (pasa) marcaHecha(f.getAttribute('data-unit'));
    });
    otra.addEventListener('click', function () {
      $$('fieldset', f).forEach(function (s) { s.inert = false; s.classList.remove('bien', 'mal'); $$('input', s).forEach(function (i) { i.checked = false; }); var fb = $('.fb', s); fb.hidden = true; fb.textContent = ''; });
      res.textContent = ''; res.className = 'res'; enviar.hidden = false; otra.hidden = true; $('fieldset', f).scrollIntoView({ block: 'center' });
    });
  });

  /* Examen final protegido (demostracion) */
  var BANCO = [
    { q: '¿Qué dispositivo conecta redes distintas y reenvía paquetes entre ellas?', o: ['Router', 'Hub', 'Cable coaxial', 'Repetidor'], ok: 0 },
    { q: '¿Cuántos bits tiene una dirección IPv4?', o: ['16', '32', '64', '128'], ok: 1 },
    { q: '¿Qué topología conecta todos los equipos a un nodo central?', o: ['Anillo', 'Bus', 'Estrella', 'Malla parcial'], ok: 2 },
    { q: '¿Qué protocolo traduce nombres de dominio en direcciones IP?', o: ['DHCP', 'DNS', 'FTP', 'SMTP'], ok: 1 },
    { q: '¿Qué capa del modelo OSI se encarga del enrutamiento?', o: ['Enlace de datos', 'Transporte', 'Red', 'Sesión'], ok: 2 },
    { q: '¿Qué hace el protocolo DHCP?', o: ['Cifra el tráfico', 'Asigna direcciones IP automáticamente', 'Filtra paquetes', 'Mide la latencia'], ok: 1 },
    { q: '¿Qué indica la máscara de subred 255.255.255.0?', o: ['Que hay 24 bits de red', 'Que hay 8 bits de red', 'Que la red es inalámbrica', 'Que el equipo es un servidor'], ok: 0 },
    { q: '¿Qué comando comprueba si otro equipo responde en la red?', o: ['ping', 'format', 'copy', 'print'], ok: 0 },
    { q: '¿Qué medio transmite la señal como pulsos de luz?', o: ['Cable de cobre', 'Fibra óptica', 'Wi-Fi', 'Bluetooth'], ok: 1 },
    { q: '¿Cuál es una dirección IPv4 válida?', o: ['256.10.1.1', '192.168.0.300', '10.0.0.15', '172.16.1'], ok: 2 },
    { q: 'En una red local, ¿qué dispositivo suele conectar varios equipos entre sí?', o: ['Conmutador (switch)', 'Altavoz', 'Teclado', 'Monitor'], ok: 0 },
    { q: '¿Qué hace un servidor DNS?', o: ['Reparte direcciones IP', 'Traduce nombres en direcciones IP', 'Cifra los correos', 'Acelera el Wi-Fi'], ok: 1 }
  ];
  function mezcla(a) { var x = a.slice(), i, j, t; for (i = x.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = x[i]; x[i] = x[j]; x[j] = t; } return x; }
  var ini = $('#examen-iniciar');
  if (ini) {
    var NUM = 8, MIN_APROBADO = 60, DURACION = 180, st = null, tmr = null;
    var intro = $('#examen-intro'), run = $('#examen-run'), fin = $('#examen-fin');
    var evt = function (t) { if (!st || st.done) return; st.log.push(t); var l = $('#examen-log'); if (l) l.textContent = String(st.log.length); };
    document.addEventListener('visibilitychange', function () { if (document.hidden) evt('Cambio de pestaña o ventana'); });
    window.addEventListener('blur', function () { evt('La ventana perdió el foco'); });
    ['copy', 'paste', 'cut'].forEach(function (n) { document.addEventListener(n, function (e) { if (st && !st.done) { e.preventDefault(); evt('Intento de ' + (n === 'copy' ? 'copiar' : n === 'paste' ? 'pegar' : 'cortar')); } }); });
    document.addEventListener('contextmenu', function (e) { if (st && !st.done) { e.preventDefault(); evt('Menú contextual bloqueado'); } });
    window.addEventListener('hashchange', function () { if (st && !st.done && location.hash !== '#examen') evt('Salió de la pantalla del examen'); });
    window.addEventListener('beforeunload', function (e) { if (st && !st.done) { e.preventDefault(); e.returnValue = ''; } });
    var pinta = function () {
      var p = st.preg[st.i], box = $('#examen-preg'); while (box.firstChild) box.removeChild(box.firstChild);
      box.appendChild(el('p', 'mut', 'Pregunta ' + (st.i + 1) + ' de ' + st.preg.length)); box.appendChild(el('h3', null, p.q));
      p.o.forEach(function (o, k) { var l = el('label', 'op'), r = el('input'); r.type = 'radio'; r.name = 'resp'; r.value = String(k); if (st.resp[st.i] === k) r.checked = true; r.addEventListener('change', function () { st.resp[st.i] = k; }); l.appendChild(r); l.appendChild(el('span', null, o.t)); box.appendChild(l); });
      var pg = $('#examen-pg'); if (pg) { pg.max = st.preg.length; pg.value = st.i; }
      $('#examen-sig').textContent = st.i === st.preg.length - 1 ? 'Entregar examen' : 'Siguiente';
    };
    var cierra = function (motivo) {
      st.done = true; clearInterval(tmr); var ok = 0; st.preg.forEach(function (p, i) { if (st.resp[i] != null && p.o[st.resp[i]].ok) ok++; });
      var nota = Calificar.nota(ok, st.preg.length), aprob = nota >= MIN_APROBADO;
      run.hidden = true; fin.hidden = false;
      $('#examen-nota').textContent = String(nota).replace('.', ',') + ' / 100';
      $('#examen-estado').textContent = aprob ? 'Aprobado (mínimo ' + MIN_APROBADO + ')' : 'No superado (mínimo ' + MIN_APROBADO + ')';
      $('#examen-estado').className = 'estado ' + (aprob ? 'ok' : 'mal');
      $('#examen-motivo').textContent = motivo === 'tiempo' ? 'Se agotó el tiempo y el examen se entregó automáticamente.' : 'Examen entregado.';
      var ul = $('#examen-incid'); while (ul.firstChild) ul.removeChild(ul.firstChild);
      if (!st.log.length) ul.appendChild(el('li', null, 'Sin incidencias registradas.')); st.log.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      $('#examen-aviso-incid').hidden = st.log.length === 0;
    };
    ini.addEventListener('click', function () {
      if (!$('#examen-acepto').checked) { toast('Marca la declaración de honestidad para empezar.'); return; }
      st = { i: 0, resp: [], log: [], done: false, t: DURACION, preg: mezcla(BANCO).slice(0, NUM).map(function (p) { return { q: p.q, o: mezcla(p.o.map(function (t, k) { return { t: t, ok: k === p.ok }; })) }; }) };
      intro.hidden = true; run.hidden = false; pinta();
      var tm = $('#examen-tiempo'), f = function () { tm.textContent = String(Math.floor(st.t / 60)).padStart(2, '0') + ':' + String(st.t % 60).padStart(2, '0'); };
      f(); tmr = setInterval(function () { st.t--; f(); tm.classList.toggle('poco', st.t <= 30); if (st.t <= 0) cierra('tiempo'); }, 1000);
    });
    var rep = $('#examen-reintentar'); if (rep) rep.addEventListener('click', function () { st = null; fin.hidden = true; intro.hidden = false; $('#examen-acepto').checked = false; $('#examen-log').textContent = '0'; $('#examen-tiempo').classList.remove('poco'); });
    $('#examen-sig').addEventListener('click', function () { if (st.resp[st.i] == null) { toast('Elige una respuesta para continuar.'); return; } if (st.i < st.preg.length - 1) { st.i++; pinta(); } else cierra('entrega'); });
  }
})();
