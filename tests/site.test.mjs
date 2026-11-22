import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const pages = build();
const html = (f) => readFileSync(join(DIST, f), 'utf8');

test('todas las paginas tienen lang, title, un h1 y sin marcadores sin resolver', () => {
  for (const f of pages) {
    const h = html(f);
    assert.match(h, /<html lang="es">/, f);
    assert.match(h, /<title>[^<]{5,}<\/title>/, f);
    assert.equal((h.match(/<h1[ >]/g) || []).length, 1, `${f}: debe tener un unico h1`);
    assert.ok(!/\{\{|\}\}/.test(h), `${f}: marcador sin resolver`);
  }
});

test('las imagenes tienen atributo alt y dimensiones (accesibilidad, CLS)', () => {
  for (const f of pages) for (const tag of html(f).match(/<img [^>]*>/g) || []) {
    assert.match(tag, /\salt="/, `${f}: ${tag.slice(0, 60)}`);
    assert.match(tag, /\swidth="\d+"/, f);
  }
});

test('los enlaces internos apuntan a archivos que existen', () => {
  for (const f of pages) {
    const base = dirname(join(DIST, f));
    for (const m of html(f).matchAll(/(?:href|src)="([^"#:]+)(?:#[^"]*)?"/g)) {
      const target = join(base, m[1]);
      assert.ok(existsSync(target), `${f} -> ${m[1]}`);
    }
  }
});

test('hay portada por curso y los cursos aparecen en el catalogo', () => {
  const courses = JSON.parse(readFileSync(join(ROOT, 'src/data/courses.json'), 'utf8'));
  const cat = html('cursos.html');
  for (const c of courses) {
    assert.ok(existsSync(join(DIST, 'img/covers', c.slug + '.svg')), c.slug);
    assert.ok(cat.includes(`id="${c.slug}"`), c.slug);
  }
  assert.ok(courses.filter((c) => c.featured).length >= 3);
});

test('existen los cinco textos legales y el pie los enlaza', () => {
  for (const f of ['aviso-legal', 'privacidad', 'cookies', 'condiciones', 'accesibilidad']) {
    assert.ok(pages.includes(`legal/${f}.html`), f);
    assert.ok(html('index.html').includes(`legal/${f}.html`), `pie sin enlace a ${f}`);
  }
});

test('los textos legales citan la normativa clave', () => {
  assert.match(html('legal/aviso-legal.html'), /LSSI-CE/);
  assert.match(html('legal/privacidad.html'), /RGPD/);
  assert.match(html('legal/privacidad.html'), /LOPDGDD/);
  assert.match(html('legal/privacidad.html'), /aepd\.es/);
  assert.match(html('legal/cookies.html'), /22\.2/);
  assert.match(html('legal/condiciones.html'), /14 días/);
  assert.match(html('legal/accesibilidad.html'), /WCAG 2\.2/);
});

test('el aviso legal no enlaza la plataforma ODR cerrada en 2025', () => {
  assert.ok(!/ec\.europa\.eu\/consumers\/odr/.test(html('legal/aviso-legal.html')));
});

test('el sitio no carga recursos de terceros', () => {
  for (const f of pages) {
    const ext = (html(f).match(/(?:src|href)="https?:\/\/[^"]+/g) || []).filter((u) => !u.includes('aepd.es'));
    assert.deepEqual(ext, [], f);
  }
});

test('cabeceras de seguridad definidas sin unsafe-inline', () => {
  const h = readFileSync(join(ROOT, 'src/_headers'), 'utf8');
  for (const k of ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) assert.ok(h.includes(k), k);
  assert.ok(!/unsafe-(inline|eval)/.test(h));
  assert.match(h, /frame-ancestors 'none'/);
});

test('migraciones: toda tabla de public tiene RLS activado y hay reversion', () => {
  const sql = readFileSync(join(ROOT, 'supabase/migrations/0001_init.sql'), 'utf8');
  const tablas = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
  assert.ok(tablas.length >= 9);
  for (const t of tablas) assert.match(sql, new RegExp(`alter table public\\.${t} enable row level security`), t);
  const funciones = sql.split(/\bcreate function\b/).slice(1);
  assert.ok(funciones.length >= 6);
  for (const f of funciones.filter((x) => /security definer/.test(x.split('$$')[0]))) assert.match(f.split('$$')[0], /search_path = ''/, f.slice(0, 40));
  assert.ok(existsSync(join(ROOT, 'supabase/migrations/0001_init.down.sql')));
  assert.ok(!/to anon[^;]*\binsert\b/i.test(sql));
});

test('no hay secretos versionados en .env.example', () => {
  const e = readFileSync(join(ROOT, '.env.example'), 'utf8');
  for (const l of e.split('\n').filter((x) => x && !x.startsWith('#'))) {
    const v = l.split('=')[1] || '';
    assert.ok(v.length < 60 && !/^eyJ/.test(v), l);
  }
});
