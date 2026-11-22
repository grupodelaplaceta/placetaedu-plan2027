// Generador estatico sin dependencias. Uso: node scripts/build.mjs  ->  dist/
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cover } from './covers.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MOD = {
  open: { tag: 'Gratis', cls: '', precio: 'Gratis · empieza cuando quieras' },
  convenio: { tag: 'Con tu centro', cls: 'conv', precio: 'Matrícula simbólica · con código de tu centro' },
  cisco: { tag: 'Cisco NetAcademy', cls: 'cisco', precio: 'Matrícula Cisco incluida según convenio' }
};

export function card(c, root, withId) {
  const m = MOD[c.modality];
  return `<article class="course"${withId ? ` id="${esc(c.slug)}"` : ''}>` +
    `<img src="${root}img/covers/${esc(c.slug)}.svg" alt="" width="480" height="300" loading="lazy">` +
    `<div class="body"><span class="tag ${m.cls}">${m.tag}</span><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p>` +
    `<ul class="meta"><li>${c.hours} h orientativas</li><li>Certificado en PDF</li></ul>` +
    `<p class="precio">${m.precio}</p><a class="btn sm" href="${root}acceder.html">Empezar</a></div></article>`;
}

function parse(raw) {
  const m = raw.match(/^<!--title:\s*(.*?)\s*\|\s*desc:\s*(.*?)(?:\s*\|\s*robots:\s*(.*?))?\s*-->\s*/s);
  if (!m) throw new Error('Falta el comentario title/desc en la pagina');
  return { title: m[1], description: m[2], robots: m[3] || 'index,follow', body: raw.slice(m[0].length) };
}

export function build() {
  const courses = JSON.parse(readFileSync(join(SRC, 'data/courses.json'), 'utf8'));
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(join(DIST, 'img/covers'), { recursive: true });
  for (const f of ['css', 'img', 'fonts']) if (existsSync(join(SRC, f))) cpSync(join(SRC, f), join(DIST, f), { recursive: true });
  for (const c of courses) writeFileSync(join(DIST, 'img/covers', c.slug + '.svg'), cover(c));
  for (const f of ['_headers', 'robots.txt']) if (existsSync(join(SRC, f))) cpSync(join(SRC, f), join(DIST, f));

  const layout = readFileSync(join(SRC, 'partials/layout.html'), 'utf8');
  const header = readFileSync(join(SRC, 'partials/header.html'), 'utf8');
  const footer = readFileSync(join(SRC, 'partials/footer.html'), 'utf8');
  const pages = [
    ...readdirSync(SRC).filter((f) => f.endsWith('.html')).map((f) => [f, '']),
    ...readdirSync(join(SRC, 'legal')).filter((f) => f.endsWith('.html')).map((f) => ['legal/' + f, '../'])
  ];
  mkdirSync(join(DIST, 'legal'), { recursive: true });
  for (const [file, root] of pages) {
    const p = parse(readFileSync(join(SRC, file), 'utf8'));
    const heroCards = courses.filter((c) => c.featured).slice(0, 3).map((c) => card(c, root, false)).join('');
    const vars = {
      content: p.body, header, footer, title: esc(p.title), description: esc(p.description), robots: esc(p.robots),
      featured: courses.filter((c) => c.featured).map((c) => card(c, root, false)).join(''),
      hero_cards: heroCards, catalog: courses.map((c) => card(c, root, true)).join('')
    };
    let html = layout;
    // Orden: primero los bloques grandes, despues {{root}} en todo el resultado.
    for (const k of ['header', 'footer', 'content']) html = html.replace(`{{${k}}}`, () => vars[k]);
    for (const k of Object.keys(vars)) html = html.split(`{{${k}}}`).join(vars[k]);
    html = html.split('{{root}}').join(root);
    writeFileSync(join(DIST, file), html);
  }
  return pages.map(([f]) => f);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log('Generadas', build().length, 'paginas en dist/');
