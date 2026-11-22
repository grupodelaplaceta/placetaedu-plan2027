// Generador de certificados PDF sin dependencias (A4 apaisado, colores planos).
// Usa Helvetica estandar (WinAnsi) e incrusta los PNG RGB de assets/pdf/ sin recompresion.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 842, H = 595;
const INK = [0.149, 0.059, 0.373], PERI = [0.424, 0.459, 1], GRIS = [0.29, 0.267, 0.439];

// Anchos Helvetica (AFM estandar, unidades de 1/1000 em)
const rg = { ' ': 278, '.': 278, ',': 278, ':': 278, ';': 278, '-': 333, '(': 333, ')': 333, '/': 278, '·': 278, '¿': 611, '?': 556, '¡': 333, '!': 278, '%': 889, '€': 556, '«': 556, '»': 556, "'": 191, '’': 222, '–': 556,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833, n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611 };
const bd = { ...rg, '-': 333, '?': 611, '!': 333, a: 556, b: 611, c: 556, d: 611, e: 556, f: 333, g: 611, h: 611, i: 278, j: 278, k: 556, l: 278, m: 889, n: 611, o: 611, p: 611, q: 611, r: 389, s: 556, t: 333, u: 611, v: 556, w: 778, x: 556, y: 556, z: 500,
  A: 722, B: 722, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 556, K: 722, L: 611, M: 833, N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611 };
const base = (c) => (/[0-9]/.test(c) ? '0' : c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
const ancho = (s, size, bold) => [...s].reduce((a, c) => a + ((bold ? bd : rg)[base(c)] ?? 556) * size / 1000, 0);
const digitW = 556;
const widthOf = (s, size, bold) => [...s].reduce((a, c) => a + (/[0-9]/.test(c) ? digitW : ((bold ? bd : rg)[base(c)] ?? 556)) * size / 1000, 0);

const WIN = { '€': 0x80, '’': 0x92, '“': 0x93, '”': 0x94, '–': 0x96, '—': 0x97 };
const enc = (s) => Buffer.from([...s].map((c) => WIN[c] ?? (c.charCodeAt(0) < 256 ? c.charCodeAt(0) : 0x3f)));
const esc = (s) => enc(s).toString('latin1').replace(/[\\()]/g, '\\$&');
const col = (c) => c.join(' ');

function png(file) {
  const b = readFileSync(join(ROOT, 'assets/pdf', file));
  let p = 8, idat = [], w, h;
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('latin1', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = d.readUInt32BE(0); h = d.readUInt32BE(4);
      if (d[8] !== 8 || d[9] !== 2 || d[12] !== 0) throw new Error(file + ': se requiere PNG RGB de 8 bits sin entrelazar');
    }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  return { w, h, data: Buffer.concat(idat) };
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function fechaLarga(iso) { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${y}`; }

function ajustar(texto, size, max, bold) {
  const lineas = []; let l = '';
  for (const w of texto.split(' ')) {
    const t = l ? l + ' ' + w : w;
    if (widthOf(t, size, bold) > max && l) { lineas.push(l); l = w; } else l = t;
  }
  return [...lineas, l];
}

export function certificadoPdf({ nombre, curso, horas, fecha, codigo, cisco = false, muestra = false }) {
  const imgs = [['Im1', png('logo.png')], ['Im2', png('seal.png')], ...(cisco ? [['Im3', png('cisco.png')]] : [])];
  const o = []; // operaciones del contenido
  const rect = (x, y, w, h, c, mode = 'f', lw = 1) => o.push(`q ${col(c)} ${mode === 'f' ? 'rg' : 'RG'} ${lw} w ${x} ${y} ${w} ${h} re ${mode} Q`);
  const linea = (x1, y1, x2, y2, c, lw) => o.push(`q ${col(c)} RG ${lw} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
  const texto = (s, x, y, size, c, bold = false, centrado = false) => {
    const xx = centrado ? x - widthOf(s, size, bold) / 2 : x;
    o.push(`BT ${col(c)} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${xx.toFixed(2)} ${y} Td (${esc(s)}) Tj ET`);
  };
  const img = (n, w, h, x, y) => o.push(`q ${w} 0 0 ${h} ${x} ${y} cm /${n} Do Q`);

  rect(5, 5, W - 10, H - 10, INK, 'S', 10);          // marco exterior
  rect(22, 22, W - 44, H - 44, PERI, 'S', 1.5);      // marco interior
  img('Im1', 190, 57, 50, H - 50 - 57);               // logo PlacetaEDU
  img('Im2', 78, 80, W - 50 - 78, H - 46 - 80);       // sello Grupo de La Placeta
  texto('CERTIFICADO DE APROVECHAMIENTO', W / 2, 425, 27, INK, true, true);
  texto('PlacetaEDU certifica que', W / 2, 392, 14, GRIS, false, true);
  texto(nombre, W / 2, 346, 32, INK, true, true);
  const nw = Math.min(widthOf(nombre, 32, true) + 60, W - 140);
  linea(W / 2 - nw / 2, 336, W / 2 + nw / 2, 336, PERI, 2);
  texto('ha completado satisfactoriamente el curso', W / 2, 304, 14, GRIS, false, true);
  let y = 270;
  for (const l of ajustar(curso, 22, 620, true)) { texto(l, W / 2, y, 22, INK, true, true); y -= 28; }
  texto(`con una dedicación de ${horas} horas`, W / 2, y - 6, 13, GRIS, false, true);
  if (cisco) {
    img('Im3', 110, 28, 50, 118);
    texto('Curso preparado con Cisco Networking Academy. El certificado de Cisco', 175, 134, 8.5, GRIS);
    texto('lo expide Cisco bajo sus propias condiciones.', 175, 123, 8.5, GRIS);
  }
  linea(W / 2 - 110, 100, W / 2 + 110, 100, INK, 1);
  texto('Departamento de Educación', W / 2, 86, 11, INK, true, true);
  texto('Grupo de La Placeta', W / 2, 73, 10, GRIS, false, true);
  texto('Expedido el', W - 50 - 190, 120, 9, GRIS);
  texto(fechaLarga(fecha), W - 50 - 190, 106, 12, INK, true);
  texto('Código de verificación', W - 50 - 190, 86, 9, GRIS);
  texto(codigo, W - 50 - 190, 72, 12, INK, true);
  texto('Comprueba la autenticidad de este certificado en PlacetaEDU con su código de verificación.', W / 2, 40, 8, GRIS, false, true);
  if (muestra) texto('MUESTRA SIN VALIDEZ · datos ficticios', W / 2, 52, 9, [0.75, 0.1, 0.1], true, true);

  const content = Buffer.from(o.join('\n'), 'latin1');
  const objs = [];
  const add = (b) => { objs.push(Buffer.isBuffer(b) ? b : Buffer.from(b, 'latin1')); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  const xo = imgs.map(([n], i) => `/${n} ${7 + i} 0 R`).join(' ');
  add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << ${xo} >> >> /Contents 4 0 R >>`);
  add(Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`), content, Buffer.from('\nendstream')]));
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  for (const [, im] of imgs) add(Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${im.w} >> /Length ${im.data.length} >>\nstream\n`), im.data, Buffer.from('\nendstream')]));
  const info = add(`<< /Title (${esc('Certificado · ' + curso)}) /Author (PlacetaEDU · Grupo de La Placeta) /Producer (PlacetaEDU) >>`);

  const parts = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')], offs = [];
  let pos = parts[0].length;
  objs.forEach((b, i) => { offs.push(pos); const s = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), b, Buffer.from('\nendobj\n')]); parts.push(s); pos += s.length; });
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((x) => String(x).padStart(10, '0') + ' 00000 n \n').join('');
  xref += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${pos}\n%%EOF\n`;
  parts.push(Buffer.from(xref));
  return Buffer.concat(parts);
}
