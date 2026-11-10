// The block library: every piece drawn once, in millimetres, reused by every sheet.
// Like CAD blocks: the elevation, the exploded view, the assembly and the variants
// all insert the same geometry, so a fix here fixes every drawing.
// Origin of each block = where the stick pierces it. y grows downwards.

import { PIECES } from './data.js';

const R = (n) => Math.round(n * 100) / 100;

// Ribbon trick: a thick coloured stroke with a thinner board-coloured stroke on top
// reads as an outlined band, which is how a draughtsman draws a folded fillet.
function ribbon(d, cat, light) {
  return `<path d="${d}" class="ink-${cat} rib" style="stroke-width:4.6px"/>` +
    `<path d="${d}" class="${light ? `tint-${cat}` : 'board-stroke'} rib" style="stroke-width:3.3px"/>` +
    `<path d="${d}" class="ink-${cat} rib" style="stroke-width:0.25px" stroke-dasharray="0.8 1.2"/>`;
}

const FRONT = {
  aceituna: () => `<ellipse cx="0" cy="0" rx="10" ry="9.6" class="ink-olive solid"/>` +
    `<path d="M-5.5 -5.2 A7 7 0 0 1 -1 -7.4" class="ink-olive thin"/>` +
    `<circle cx="6.2" cy="-6" r="0.9" class="ink-olive thin"/>`,
  aceitunaNegra: () => `<ellipse cx="0" cy="0" rx="10" ry="9.6" class="ink-olive solid"/>` +
    `<ellipse cx="0" cy="0" rx="8.4" ry="8" class="ink-olive thin"/>` +
    `<path d="M-5 -4.6 A6 6 0 0 1 -1 -6.4" class="ink-olive thin"/>`,
  // Whole piparras cross the stick horizontally, pierced through the middle, stacked one on another.
  // Long, thin, slightly curved: stem on one side, pointed tip on the other. About 50 mm (5 to 12 cm edible).
  piparra: (flip) => `<g transform="scale(${flip ? -1 : 1},1)"><g transform="rotate(-90) translate(0 -1)">` +
    `<path d="M-2.6 -21 C-3.6 -10 -3 2 -1.2 12 C-0.4 17 0.6 21.4 1.6 24.6 C2 20 2.6 12 2.8 4 C3.1 -6 3.2 -14 2.6 -21 C1.4 -22.8 -1.4 -22.8 -2.6 -21 Z" class="ink-pickle solid"/>` +
    `<path d="M0 -22.2 C0.2 -24.6 1.2 -26.4 3.4 -27.6" class="ink-pickle"/>` +
    `<path d="M0 -18.5 C0 -6 0.5 6 1.2 18" class="ink-pickle thin" stroke-dasharray="1 1.3"/></g>` +
    `<circle cx="0" cy="0" r="0.6" class="ink-structure fillink"/></g>`,
  anchoa: () => ribbon('M-14 -9.5 C-4 -13.5 10 -12 12 -6 C14 0 -14 0 -12 6 C-10 12 4 13.5 14 9.5', 'fish', false),
  boqueron: () => ribbon('M-14 -9.5 C-4 -13.5 10 -12 12 -6 C14 0 -14 0 -12 6 C-10 12 4 13.5 14 9.5', 'fish', true),
  bonito: () => `<rect x="-11" y="-6" width="22" height="12" rx="2.4" class="ink-fish solid"/>` +
    `<path d="M-7 -6 L-3 6 M-1 -6 L3 6 M5 -6 L8.6 4.6" class="ink-fish thin"/>`,
  pepinillo: () => `<ellipse cx="0" cy="0" rx="15" ry="4.6" class="ink-pickle solid"/>` +
    [-10, -5, 0, 5, 10].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 1.6 : -1.6}" r="0.55" class="ink-pickle thin"/>`).join(''),
  queso: () => `<path d="M-12 6.4 L12 6.4 L-12 -6.6 Z" class="ink-other solid"/>` +
    `<path d="M-12 4.4 L8.4 4.4" class="ink-other thin"/>`,
  tomate: () => `<circle cx="0" cy="0" r="8.6" class="ink-other solid"/>` +
    `<path d="M0 -8.6 L0 -11 M0 -8.6 L-3 -10.4 M0 -8.6 L3 -10.4 M0 -8.6 L-3.4 -8 M0 -8.6 L3.4 -8" class="ink-other thin"/>`,
  pulpo: () => `<circle cx="0" cy="0" r="8" class="ink-fish solid"/><circle cx="0" cy="0" r="5.4" class="ink-fish thin"/>` +
    [0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${R(6.7 * Math.cos(a * Math.PI / 180))}" cy="${R(6.7 * Math.sin(a * Math.PI / 180))}" r="0.75" class="ink-fish thin"/>`).join('') +
    `<path d="M-2 -1.4 L-1.4 -1.6 M1.6 0.8 L2.2 0.6 M-0.6 2 L0 1.8" class="ink-dimtone thin"/>`,
  mejillon: () => `<path d="M-13 1 C-10 -6 6 -7.5 13 -2 C10 4 -2 7 -13 1 Z" class="ink-fish solid"/>` +
    `<path d="M-9 1.2 C-4 -3 4 -4 9 -1.6 M-5 1.6 C-1 -0.6 3 -1.2 6 -0.4" class="ink-fish thin"/>`,
  salmon: () => `<circle cx="0" cy="0" r="8" class="ink-fish solid"/><path d="M0 0 C2 -1 2.4 2 0 2.6 C-3 3 -4 -1 -2 -3 C1 -5.6 5.4 -3 5.6 0.6 C5.8 4.6 1.6 6.8 -1.6 6.2" class="ink-fish thin"/>`,
  atun: () => `<rect x="-11" y="-6" width="22" height="12" rx="1" class="ink-fish solid"/>` +
    `<path d="M-11 -2 L11 -2 M-11 2 L11 2" class="ink-fish thin" stroke-dasharray="1.4 1"/>`,
  huevo: () => `<ellipse cx="0" cy="0" rx="7" ry="8.8" class="ink-other solid"/>` +
    `<path d="M-3 -4 L-2.4 -4.2 M2 -2 L2.6 -2.4 M-1 2.4 L-0.4 2 M3 4 L3.4 3.6 M-4 1 L-3.6 0.6" class="ink-other thin"/>`,
  pina: () => `<path d="M-10 -7 L10 -7 L8 8 L-8 8 Z" class="ink-banned solid"/>` +
    `<path d="M-8 -3 L6 8 M-9 2 L-2 8 M-4 -7 L9 4 M2 -7 L9.6 -1 M-8 8 L8 -7 M-2 8 L9 -1 M-9 2 L1 -7" class="ink-banned thin"/>`,
  vermut: () => `<path d="M-11 -18 L11 -18 L9 18 L-9 18 Z" class="ink-structure solid"/>` +
    `<path d="M-10.4 -11 L10.4 -11" class="ink-fish thin"/><path d="M-10 -8 L10 -8" class="ink-fish thin" stroke-dasharray="1 1.4"/>` +
    `<circle cx="7" cy="-18.5" r="6" class="ink-dimtone thin"/><path d="M7 -24.5 L7 -12.5 M1 -18.5 L13 -18.5 M2.8 -22.7 L11.2 -14.3 M2.8 -14.3 L11.2 -22.7" class="ink-dimtone thin"/>` +
    `<path d="M-5 -26 L-1 6" class="ink-structure thin"/><ellipse cx="-1.6" cy="2" rx="3.4" ry="3" class="ink-olive solid"/>`,
  patatas: () => `<path d="M-24 6 L24 6 L20 10 L-20 10 Z" class="ink-structure solid"/>` +
    [[-15, 2, -8], [-6, -2, 6], [4, 1, -4], [13, 3, 10], [-2, -7, 14], [-11, -4, -14], [8, -5, 2]].map(([x, y, a]) =>
      `<path d="M${x - 6} ${y} C${x - 3} ${y - 3} ${x + 3} ${y + 3} ${x + 6} ${y}" transform="rotate(${a} ${x} ${y})" class="ink-other"/>`).join(''),
  aceite: () => `<path d="M0 -8 C3.6 -2.4 5.4 0.6 5.4 3 C5.4 6 3 8 0 8 C-3 8 -5.4 6 -5.4 3 C-5.4 0.6 -3.6 -2.4 0 -8 Z" class="ink-olive solid"/>` +
    `<path d="M-2.4 3 A2.6 2.6 0 0 0 0 5.6" class="ink-olive thin"/>`,
};

// Side elevation: the same block seen at 90 degrees. Only pieces whose shape changes need one.
const SIDE = {
  piparra: () => `<circle cx="0" cy="0" r="3.2" class="ink-pickle solid"/><circle cx="0" cy="0" r="1.4" class="ink-pickle thin"/>`,
  pepinillo: () => `<circle cx="0" cy="0" r="4.6" class="ink-pickle solid"/>`,
  anchoa: () => ribbon('M-2.6 -11 L2.6 -6 L-2.6 0 L2.6 6 L-2.6 11', 'fish', false),
  boqueron: () => ribbon('M-2.6 -11 L2.6 -6 L-2.6 0 L2.6 6 L-2.6 11', 'fish', true),
  queso: () => `<rect x="-6" y="-6.6" width="12" height="13" class="ink-other solid"/>`,
  bonito: () => `<rect x="-6" y="-6" width="12" height="12" rx="2" class="ink-fish solid"/>`,
};

export function block(id, opts = {}) {
  const f = (opts.view === 'side' && SIDE[id]) || FRONT[id];
  return f ? f(opts.flip) : '';
}

// The stick: a 2.4 mm shaft with a sharpened tip. y1 = handle end, y2 = tip.
export function stick(x, yHandle, yTip) {
  return `<path d="M${R(x - 1.2)} ${R(yHandle)} L${R(x - 1.2)} ${R(yTip + 5)} L${x} ${R(yTip)} L${R(x + 1.2)} ${R(yTip + 5)} L${R(x + 1.2)} ${R(yHandle)} Z" class="ink-structure solid"/>` +
    `<path d="M${x} ${R(yHandle - 2)} L${x} ${R(yTip + 7)}" class="ink-structure axis"/>`;
}

const GRIP = 8; // bare stick under the first piece, to hold it
const TIP = 8;  // bare stick above the last piece

// Lay a list of pieces (bottom to top) along a vertical stick at x, handle at yBottom.
// Returns the markup plus where each piece landed, so sheets can dimension them.
export function stack(list, x, yBottom, opts = {}) {
  let y = yBottom - GRIP;
  const placed = [];
  let body = '';
  let pip = 0;
  for (const id of list) {
    const h = PIECES[id]?.h ?? 10;
    const cy = y - h / 2;
    let flip = false, tilt = 0;
    if (id === 'piparra') { flip = pip % 2 === 1; tilt = opts.view === 'side' ? 0 : [-3, 2, -1, 4][pip % 4]; pip++; }
    body += `<g transform="translate(${R(x)} ${R(cy)}) rotate(${tilt})">${block(id, { view: opts.view, flip })}</g>`;
    placed.push({ id, top: y - h, bottom: y, cy });
    y -= h;
  }
  const yTip = y - TIP;
  return { svg: stick(x, yBottom, yTip) + body, yTip, yBottom, placed, length: yBottom - yTip };
}

// Architectural dimension lines: extension lines, 45 degree ticks, text in mm.
export function dimV(x, y1, y2, label, side = -1) {
  const t = 1.6;
  const tx = x + side * 2.2;
  return `<g class="dim">` +
    `<path d="M${R(x)} ${R(y1)} L${R(x)} ${R(y2)} M${R(x - t)} ${R(y1 + t)} L${R(x + t)} ${R(y1 - t)} M${R(x - t)} ${R(y2 + t)} L${R(x + t)} ${R(y2 - t)}"/>` +
    `<text x="${R(tx)}" y="${R((y1 + y2) / 2)}" transform="rotate(-90 ${R(tx)} ${R((y1 + y2) / 2)})" text-anchor="middle">${label}</text></g>`;
}

export function dimH(y, x1, x2, label, side = -1) {
  const t = 1.6;
  return `<g class="dim">` +
    `<path d="M${R(x1)} ${R(y)} L${R(x2)} ${R(y)} M${R(x1 - t)} ${R(y + t)} L${R(x1 + t)} ${R(y - t)} M${R(x2 - t)} ${R(y + t)} L${R(x2 + t)} ${R(y - t)}"/>` +
    `<text x="${R((x1 + x2) / 2)}" y="${R(y + side * 1.8 + (side > 0 ? 1.6 : 0))}" text-anchor="middle">${label}</text></g>`;
}

export function ext(x1, y1, x2, y2) {
  return `<path d="M${R(x1)} ${R(y1)} L${R(x2)} ${R(y2)}" class="dim-ext"/>`;
}

// Leader line with a dot on the piece and a label block at the end.
export function leader(x1, y1, x2, y2, lines, anchor = 'start') {
  const dx = anchor === 'start' ? 1.6 : -1.6;
  return `<g class="leader"><circle cx="${R(x1)}" cy="${R(y1)}" r="0.7"/>` +
    `<path d="M${R(x1)} ${R(y1)} L${R(x2)} ${R(y2)} L${R(x2 + dx * 3)} ${R(y2)}"/>` +
    lines.map((l, i) => `<text x="${R(x2 + dx * 4)}" y="${R(y2 + 1.1 + i * 4.2)}" text-anchor="${anchor}" class="${l.cls || ''}">${l.text}</text>`).join('') +
    `</g>`;
}

// The north arrow points to Donostia: from Madrid the bearing is about 24 degrees.
export function northArrow(cx, cy, r, label) {
  return `<g class="north" transform="translate(${cx} ${cy})">` +
    `<circle r="${r}" class="ink-structure thin"/>` +
    `<g transform="rotate(24)"><path d="M0 ${-r + 1} L${r * 0.32} ${r * 0.55} L0 ${r * 0.3} L${-r * 0.32} ${r * 0.55} Z" class="ink-structure fillink"/></g>` +
    `<text y="${r + 5}" text-anchor="middle" class="t-small">${label}</text></g>`;
}

export function svgOpen(w, h, label, extra = '') {
  return `<svg class="dwg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" ${extra}>` +
    `<rect width="${w}" height="${h}" class="paper"/>`;
}
