// Portadas SVG originales generadas a partir de los datos del curso (sin dependencias).
const G = {
  network: '<circle cx="50" cy="22" r="9"/><circle cx="20" cy="74" r="9"/><circle cx="80" cy="74" r="9"/><path d="M50 31 22 66M50 31l28 35M29 74h42" fill="none"/>',
  shield: '<path d="M50 10 82 22v28c0 20-16 33-32 40C34 83 18 70 18 50V22z" fill="none"/><path d="m36 50 10 10 18-20" fill="none"/>',
  spark: '<path d="M50 10c3 24 10 31 34 34-24 3-31 10-34 34-3-24-10-31-34-34 24-3 31-10 34-34z" fill="none"/>',
  doc: '<path d="M26 10h32l16 16v64H26z" fill="none"/><path d="M58 10v16h16M36 46h28M36 60h28M36 74h18" fill="none"/>',
  lock: '<rect x="24" y="44" width="52" height="42" rx="8" fill="none"/><path d="M36 44V32a14 14 0 0 1 28 0v12M50 60v12" fill="none"/>',
  code: '<path d="m34 30-22 20 22 20M66 30l22 20-22 20M56 22 44 78" fill="none"/>',
  person: '<circle cx="50" cy="32" r="16" fill="none"/><path d="M18 88c2-22 15-30 32-30s30 8 32 30" fill="none"/>'
};
function ondas(cx, cy, r, n = 12) {
  let d = '';
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * 2 * Math.PI, R = r + r * 0.07 * Math.sin(n * t);
    d += (i ? 'L' : 'M') + (cx + R * Math.cos(t)).toFixed(1) + ' ' + (cy + R * Math.sin(t)).toFixed(1);
  }
  return d + 'Z';
}
export function cover(c) {
  const [a, b] = c.palette, id = 'g' + c.slug.length + c.hours;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300" role="img" aria-label="${c.title}">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="480" height="300" fill="url(#${id})"/>` +
    `<path d="${ondas(400, 60, 150)}" fill="#fff" fill-opacity=".10"/>` +
    `<path d="${ondas(70, 290, 110)}" fill="#fff" fill-opacity=".08"/>` +
    `<path d="${ondas(240, 150, 92)}" fill="#fff" fill-opacity=".16"/>` +
    `<g transform="translate(190 100) scale(1)" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="#fff" transform-origin="50 50"><g transform="translate(0 0) scale(1)">${G[c.glyph]}</g></g></svg>`;
}
