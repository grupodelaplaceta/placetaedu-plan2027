// Generador estatico sin dependencias. Uso: node scripts/build.mjs  ->  dist/
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glyph } from './covers.mjs';
import { certificadoPdf } from './pdf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MOD = {
  open: { tag: 'Gratis', cls: '', precio: 'Gratis · empieza cuando quieras' },
  convenio: { tag: 'Con tu centro', cls: 'conv', precio: 'Matrícula simbólica de 1 € a 5 € por estudiante, según convenio' },
  cisco: { tag: 'Cisco NetAcademy', cls: 'cisco', precio: 'Matrícula Cisco: depende del tipo de curso' }
};

export const coverHtml = (c) => `<div class="cover k-${c.tone}" aria-hidden="true">${glyph(c.glyph)}<span class="rosette"></span></div>`;

export function card(c, root, withId, decor = false) {
  const m = MOD[c.modality];
  return `<article class="course"${withId ? ` id="${esc(c.slug)}"` : ''}>` +
    coverHtml(c) +
    `<div class="body"><span class="tag ${m.cls}">${m.tag}</span><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p>` +
    `<ul class="meta"><li>${c.hours} h orientativas</li><li>Certificado en PDF</li></ul>` +
    `<p class="precio">${m.precio}</p>${decor ? '' : `<a class="btn sm" href="${root}acceder.html">Empezar</a>`}</div></article>`;
}

const TIPO = { entrega: 'Entrega', cierre: 'Cierra', examen: 'Examen' };
export function calendario(cal) {
  const [y, m] = cal.mes.split('-').map(Number);
  const dias = new Date(y, m, 0).getDate(), ini = (new Date(y, m - 1, 1).getDay() + 6) % 7; // lunes = 0
  const ev = (f) => cal.eventos.filter((e) => e.fecha === f);
  let celdas = '<td class="vacio"></td>'.repeat(ini), n = ini;
  for (let d = 1; d <= dias; d++) {
    const f = `${cal.mes}-${String(d).padStart(2, '0')}`, es = ev(f);
    const cls = [f === cal.hoy ? 'hoy' : '', es.length ? 'con' : ''].join(' ').trim();
    celdas += `<td${cls ? ` class="${cls}"` : ''}><b>${d}</b>${es.map((e) => `<span class="ev ${e.tipo}">${TIPO[e.tipo]}</span>`).join('')}${f === cal.hoy ? '<span class="vh"> (hoy)</span>' : ''}</td>`;
    if (++n % 7 === 0 && d < dias) celdas += '</tr><tr>';
  }
  celdas += '<td class="vacio"></td>'.repeat((7 - (n % 7)) % 7);
  const mes = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m - 1];
  const dif = (f) => Math.round((new Date(f) - new Date(cal.hoy)) / 864e5);
  const lista = [...cal.eventos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((e) => {
    const d = dif(e.fecha), cuando = d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;
    const [yy, mm, dd] = e.fecha.split('-').map(Number);
    return `<li class="pl ${e.tipo}${d <= 7 ? ' urge' : ''}"><span class="fe"><b>${dd}</b>${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][mm - 1]}</span><span><b>${esc(e.titulo)}</b><br><span class="mut">${esc(e.curso)} · ${TIPO[e.tipo]} · ${cuando}</span></span></li>`;
  }).join('');
  return `<table class="cal"><caption>${mes[0].toUpperCase() + mes.slice(1)} de ${y}</caption><thead><tr>${['L','M','X','J','V','S','D'].map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody><tr>${celdas}</tr></tbody></table><ul class="plazos">${lista}</ul>`;
}

function parse(raw) {
  const m = raw.match(/^<!--title:\s*(.*?)\s*\|\s*desc:\s*(.*?)(?:\s*\|\s*robots:\s*(.*?))?\s*-->\s*/s);
  if (!m) throw new Error('Falta el comentario title/desc en la pagina');
  return { title: m[1], description: m[2], robots: m[3] || 'index,follow', body: raw.slice(m[0].length) };
}

export function build() {
  const courses = JSON.parse(readFileSync(join(SRC, 'data/courses.json'), 'utf8'));
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(join(DIST, 'ejemplo'), { recursive: true });
  for (const f of ['css', 'img', 'fonts', 'js']) if (existsSync(join(SRC, f))) cpSync(join(SRC, f), join(DIST, f), { recursive: true });
  writeFileSync(join(DIST, 'ejemplo/certificado-ejemplo.pdf'), certificadoPdf({ nombre: 'Marta Puig Serra', curso: 'Fundamentos de redes', horas: 40, fecha: '2026-11-22', codigo: 'PEDU-2026-0A7F3C', cisco: true, muestra: true }));
  for (const f of ['_headers', 'robots.txt']) if (existsSync(join(SRC, f))) cpSync(join(SRC, f), join(DIST, f));

  const layout = readFileSync(join(SRC, 'partials/layout.html'), 'utf8');
  const header = readFileSync(join(SRC, 'partials/header.html'), 'utf8');
  const footer = readFileSync(join(SRC, 'partials/footer.html'), 'utf8');
  const pages = [
    ...readdirSync(SRC).filter((f) => f.endsWith('.html')).map((f) => [f, '']),
    ...['legal', 'ayuda', 'demo'].flatMap((d) => readdirSync(join(SRC, d)).filter((f) => f.endsWith('.html')).map((f) => [d + '/' + f, '../']))
  ];
  for (const d of ['legal', 'ayuda', 'demo']) mkdirSync(join(DIST, d), { recursive: true });
  const cert = readFileSync(join(SRC, 'partials/cert.html'), 'utf8');
  for (const [file, root] of pages) {
    const p = parse(readFileSync(join(SRC, file), 'utf8'));
    const heroCards = courses.filter((c) => c.featured).slice(0, 3).map((c) => card(c, root, false, true)).join('');
    const vars = {
      content: p.body, header, footer, title: esc(p.title), description: esc(p.description), robots: esc(p.robots),
      featured: courses.filter((c) => c.featured).map((c) => card(c, root, false)).join(''),
      hero_cards: heroCards, cert, calendar: calendario(JSON.parse(readFileSync(join(SRC, 'data/calendario.json'), 'utf8'))), catalog: courses.map((c) => card(c, root, true)).join('')
    };
    let html = layout;
    // Orden: primero los bloques grandes, despues {{root}} en todo el resultado.
    for (const k of ['header', 'footer', 'content']) html = html.replace(`{{${k}}}`, () => vars[k]);
    for (const k of Object.keys(vars)) html = html.split(`{{${k}}}`).join(vars[k]);
    html = html.replace(/\{\{cover:([a-z0-9-]+)\}\}/g, (_, s) => { const c = courses.find((x) => x.slug === s); if (!c) throw new Error('Curso sin miniatura: ' + s); return coverHtml(c); });
    html = html.split('{{root}}').join(root);
    writeFileSync(join(DIST, file), html);
  }
  return pages.map(([f]) => f);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log('Generadas', build().length, 'paginas en dist/');
