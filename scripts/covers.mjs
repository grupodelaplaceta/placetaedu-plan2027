// Iconos de curso (trazo plano). La roseta de marca NO se dibuja aqui: se usa el archivo original img/rosette-edu.png.
const G = {
  network: '<circle cx="50" cy="22" r="9"/><circle cx="20" cy="74" r="9"/><circle cx="80" cy="74" r="9"/><path d="M50 31 22 66M50 31l28 35M29 74h42"/>',
  shield: '<path d="M50 10 82 22v28c0 20-16 33-32 40C34 83 18 70 18 50V22z"/><path d="m36 50 10 10 18-20"/>',
  spark: '<path d="M50 10c3 24 10 31 34 34-24 3-31 10-34 34-3-24-10-31-34-34 24-3 31-10 34-34z"/>',
  doc: '<path d="M26 10h32l16 16v64H26z"/><path d="M58 10v16h16M36 46h28M36 60h28M36 74h18"/>',
  lock: '<rect x="24" y="44" width="52" height="42" rx="8"/><path d="M36 44V32a14 14 0 0 1 28 0v12M50 60v12"/>',
  code: '<path d="m34 30-22 20 22 20M66 30l22 20-22 20M56 22 44 78"/>',
  person: '<circle cx="50" cy="32" r="16"/><path d="M18 88c2-22 15-30 32-30s30 8 32 30"/>'
};
export const glyph = (name) => `<svg class="glyph" viewBox="0 0 100 100" width="96" height="96" aria-hidden="true" focusable="false">${G[name]}</svg>`;
