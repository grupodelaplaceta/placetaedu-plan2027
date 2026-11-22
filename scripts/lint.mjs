// Lint de seguridad y calidad sin dependencias (DEVAI Art. 12, 17, 21, 42).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGLAS = [
  [/\.innerHTML\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(/, 'Art. 12: API peligrosa (XSS)'],
  [/\son[a-z]+\s*=\s*["']/i, 'Art. 17: manejador inline (rompe la CSP)'],
  [/\sstyle\s*=\s*["']/i, 'Art. 17: estilo inline (rompe la CSP)'],
  [/target\s*=\s*["']_blank["'](?![^>]*noopener)/i, 'Art. 17: target=_blank sin rel=noopener'],
  [/(src|href)\s*=\s*["']http:\/\//i, 'Art. 17: recurso http (contenido mixto)'],
  [/(src|href)\s*=\s*["']https?:\/\/(fonts\.(googleapis|gstatic)|[^"']*google-analytics|[^"']*googletagmanager)/i, 'Art. 26: recurso de tercero no autorizado (RGPD)'],
  [/gradient\(|box-shadow|text-shadow|backdrop-filter|color-mix\(|filter:\s*blur/i, 'Marca: solo colores planos (sin degradados, sombras ni difuminados)'],
  [/(service_role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*["'][^"']{8,}/, 'Art. 21: posible secreto']
];
const EXT = new Set(['.html', '.css', '.mjs', '.js', '.json', '.svg']);
function* walk(d) {
  for (const f of readdirSync(d)) {
    if (['node_modules', 'dist', '.git'].includes(f)) continue;
    const p = join(d, f); statSync(p).isDirectory() ? yield* walk(p) : yield p;
  }
}
let fallos = 0;
for (const f of walk(join(ROOT, 'src'))) {
  if (!EXT.has(extname(f))) continue;
  readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    for (const [re, msg] of REGLAS) if (re.test(l)) { console.log(`FALLA ${f.replace(ROOT + '/', '')}:${i + 1} ${msg}`); fallos++; }
  });
}
console.log(fallos ? `${fallos} hallazgo(s)` : 'Lint OK: sin hallazgos');
process.exit(fallos ? 1 : 0);
