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
  piparra: (flip) => `<g transform="scale(${flip ? -1 : 1},1)">` +
    `<path d="M-32 0.6 C-20 -1.4 0 -3.6 19 -3.6 C24.5 -3.6 27 -2 27 0 C27 2 24.5 3.4 19 3.4 C0 3.4 -20 2.2 -32 0.6 Z" class="ink-pickle solid"/>` +
    `<path d="M27 0 C31 0 33.5 -2 36 -5.5" class="ink-pickle"/>` +
    `<path d="M-24 0.3 C-10 -0.6 6 -1 18 -1" class="ink-pickle thin" stroke-dasharray="1.2 1.4"/></g>`,
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
  pina: () => `<path d="M-10 -7 L10 -7 L8 8 L-8 8 Z" class="ink-banned solid"/>` +
    `<path d="M-8 -3 L6 8 M-9 2 L-2 8 M-4 -7 L9 4 M2 -7 L9.6 -1 M-8 8 L8 -7 M-2 8 L9 -1 M-9 2 L1 -7" class="ink-banned thin"/>`,
  aceite: () => `<path d="M0 -8 C3.6 -2.4 5.4 0.6 5.4 3 C5.4 6 3 8 0 8 C-3 8 -5.4 6 -5.4 3 C-5.4 0.6 -3.6 -2.4 0 -8 Z" class="ink-olive solid"/>` +
    `<path d="M-2.4 3 A2.6 2.6 0 0 0 0 5.6" class="ink-olive thin"/>`,
};

// Side elevation: the same block seen at 90 degrees. Only pieces whose shape changes need one.
const SIDE = {
  piparra: () => `<circle cx="0" cy="0" r="3.5" class="ink-pickle solid"/><circle cx="0" cy="0" r="1.6" class="ink-pickle thin"/>`,
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
  let pip = 0;
  let body = '';
  for (const id of list) {
    const h = PIECES[id]?.h ?? 10;
    const cy = y - h / 2;
    const flip = id === 'piparra' ? (pip++ % 2 === 1) : false;
    const tilt = id === 'piparra' && opts.view !== 'side' ? [-4, 3, -1, 5][pip % 4] : 0;
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
