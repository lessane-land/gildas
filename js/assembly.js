// Plano 04: build your own gilda, then the site inspector judges it.
// Pointer Events give one code path for mouse, pen and touch. Tapping a piece also adds it,
// so the game works with a keyboard and without dragging at all.
import { t, L } from './i18n.js';
import { PIECES, CODES } from './data.js';
import { block } from './pieces.js';
import { esc } from './sheets.js';

const TRAY = ['anchoa', 'piparra', 'aceituna', 'boqueron', 'pulpo', 'mejillon', 'salmon', 'bonito', 'atun', 'pepinillo', 'aceitunaNegra', 'huevo', 'queso', 'tomate', 'pina'];
const CODE = CODES;
const DECODE = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));
const MAX = 8;
const W = { pina: 40, piparra: 58, pepinillo: 34, mejillon: 30 };

let list = [];
let history = [];
let shared = false;

export function decode(s) { return (s || '').split(',').map((c) => DECODE[c]).filter(Boolean).slice(0, MAX); }
const encode = (l) => l.map((id) => CODE[id]).join(',');

function pieceSVG(id, flip = false) {
  const h = PIECES[id].h + 2;
  const w = W[id] || 32;
  return `<svg class="psvg" viewBox="${-w / 2} ${-h / 2} ${w} ${h}" style="--w:${w};--h:${h}" aria-hidden="true">${block(id, { flip })}</svg>`;
}

const M = {
  pina: { es: 'Piña en obra: expediente abierto.', en: 'Pineapple on site: file opened.', eu: 'Anana obran: espedientea irekita.' },
  oliveOnly: { es: 'Esto es una aceituna con ambiciones.', en: 'This is an olive with ambitions.', eu: 'Hau asmo handiko oliba bat da.' },
  salad: { es: 'Esto es una ensalada en un palillo.', en: 'This is a salad on a toothpick.', eu: 'Hau makilatxo bateko entsalada da.' },
  noFacade: { es: 'Obra sin fachada: falta la piparra.', en: 'No facade: the piparra is missing.', eu: 'Fatxadarik gabeko obra: piparra falta da.' },
  noFound: { es: 'Sin cimentación: falta la aceituna.', en: 'No foundation: the olive is missing.', eu: 'Zimendurik gabe: oliba falta da.' },
  garden: { es: 'Más huerta que obra.', en: 'More vegetable patch than building.', eu: 'Obra baino baratze gehiago.' },
  plan: { es: 'Conforme a plano.', en: 'Built to drawing.', eu: 'Planoaren araberakoa.' },
  variant: { es: 'Variante homologada: ver plano 05.', en: 'Approved variant: see sheet 05.', eu: 'Aldaera homologatua: ikus 05 planoa.' },
  roof: { es: 'Exceso de cubierta. Muy salada, pero legal.', en: 'Too much roof. Very salty, but legal.', eu: 'Estalki gehiegi. Oso gazia, baina legezkoa.' },
  vent: { es: 'Fachada ventilada: tres piparras o más.', en: 'Ventilated facade: three piparras or more.', eu: 'Fatxada aireztatua: hiru piparra edo gehiago.' },
  basement: { es: 'La cubierta está en el sótano.', en: 'The roof is in the basement.', eu: 'Estalkia sotoan dago.' },
  topFish: { es: 'Anchoa en la punta: impermeabilización expuesta.', en: 'Anchovy on the tip: exposed waterproofing.', eu: 'Antxoa puntan: iragazgaizte agerian.' },
  topOlive: { es: 'Remate en aceituna, como en el plano 01.', en: 'Capped with an olive, as on sheet 01.', eu: 'Olibaz errematatua, 01 planoan bezala.' },
  veggie: { es: 'Gilda vegetal: existe y tiene fuente (plano 05). Ensalada homologada.', en: 'Vegetarian gilda: it exists and has a source (sheet 05). A certified salad.', eu: 'Gilda begetala: badago eta iturria du (05 planoa). Entsalada homologatua.' },
  full: { es: 'Al límite de carga.', en: 'At full load.', eu: 'Karga mugan.' },
};

export function judge(l) {
  const n = (id) => l.filter((x) => x === id).length;
  const cat = (c) => l.filter((x) => PIECES[x].cat === c).length;
  const fish = cat('fish'), olives = cat('olive'), greens = cat('pickle') + cat('other');
  const notes = [];
  let code;
  if (n('pina')) { code = 'heresy'; notes.push(M.pina); }
  else if (!fish) { code = 'salad'; notes.push(l.length === 1 && olives === 1 ? M.oliveOnly : M.salad); if (n('piparra') && olives) notes.push(M.veggie); }
  else if (!n('piparra')) { code = 'heresy'; notes.push(M.noFacade); }
  else if (!olives) { code = 'heresy'; notes.push(M.noFound); }
  else if (greens + olives >= 3 * fish + 4) { code = 'salad'; notes.push(M.garden); }
  else {
    code = 'ok';
    const canon = l.every((x) => ['anchoa', 'piparra', 'aceituna'].includes(x));
    notes.push(canon ? M.plan : M.variant);
    if (fish >= 3) notes.push(M.roof);
    if (n('piparra') >= 3) notes.push(M.vent);
  }
  if (PIECES[l[0]]?.cat === 'fish') notes.push(M.basement);
  const top = l[l.length - 1];
  if (PIECES[top]?.cat === 'fish') notes.push(M.topFish);
  else if (code === 'ok' && PIECES[top]?.cat === 'olive') notes.push(M.topOlive);
  if (l.length >= MAX) notes.push(M.full);
  return { code, notes: notes.slice(0, 3) };
}

export function render(initial) {
  shared = !!(initial && initial.length);
  list = shared ? initial.slice() : list;
  history = [];
  const tray = TRAY.map((id) => `<li><button type="button" class="piece-btn cat-${PIECES[id].cat}" data-id="${id}" aria-label="${esc(t('add')(L(PIECES[id].name)))}">` +
    `${pieceSVG(id)}<span class="pname">${esc(L(PIECES[id].name))}</span><span class="prole">${esc(L(PIECES[id].role))}</span></button></li>`).join('');
  return `<header class="sheet-head"><p class="sheet-num">${t('sheetOf')('04', '07')}</p><h1 id="sheet-title" tabindex="-1">${esc(t('sheets')[3])}</h1><p class="lead">${esc(t('s4Lead'))}</p></header>` +
    `<div class="sheet-body assembly">` +
    `<section class="tray" aria-labelledby="tray-h"><h2 id="tray-h">${esc(t('tray'))}</h2><ul class="tray-list">${tray}</ul></section>` +
    `<section class="site" aria-labelledby="site-h"><h2 id="site-h"><span id="site-title">${esc(shared ? t('sharedBuild') : t('onStick'))}</span> <span class="count mono" id="count"></span></h2>` +
    `<div class="dropzone" id="dz"><div class="stick-col" id="col" aria-live="polite"></div><p class="empty-lot" id="emptylot">${esc(t('empty'))}</p><div class="verdict" id="verdict" hidden></div></div>` +
    `<p class="hint">${esc(t('tapToRemove'))}</p><p class="toast" id="toast" role="status" aria-live="polite"></p>` +
    `<div class="controls"><button type="button" class="btn" id="undo">${icon('undo')}<span>${esc(t('undo'))}</span></button>` +
    `<button type="button" class="btn" id="clear">${icon('clear')}<span>${esc(t('clear'))}</span></button>` +
    `<button type="button" class="btn primary" id="inspect">${icon('inspect')}<span>${esc(t('inspect'))}</span></button></div>` +
    `<div class="controls after" id="after" hidden><button type="button" class="btn primary" id="share">${icon('share')}<span>${esc(t('share'))}</span></button>` +
    `<button type="button" class="btn" id="again">${icon('clear')}<span>${esc(t('buildAgain'))}</span></button></div>` +
    `</section></div>`;
}

function icon(name) {
  const p = {
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)"/>',
    clear: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    inspect: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8.5 11l2 2 3.5-4"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
  }[name];
  return `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">${p}</svg>`;
}

function stamp(v) {
  const word = t('verdict')[v.code];
  const now = new Date(); const d = [now.getDate(), now.getMonth() + 1].map((n) => String(n).padStart(2, '0')).join('.') + '.' + now.getFullYear();
  return `<svg class="stamp" viewBox="0 0 120 52" role="img" aria-label="${esc(word)}"><g filter="url(#wobble)">` +
    `<rect x="4" y="4" width="112" height="44" rx="3" class="pen" stroke-width="2.2"/><rect x="7.5" y="7.5" width="105" height="37" rx="2" class="pen" stroke-width="0.8"/>` +
    `<text x="60" y="31" text-anchor="middle" class="stamp-word">${esc(word)}</text>` +
    `<text x="60" y="41" text-anchor="middle" class="stamp-sub">${esc(t('inspector'))} · ${esc(d)}</text></g></svg>`;
}

export function mount(root, opts = {}) {
  // Every listener hangs off one AbortController, so leaving the sheet removes all of them.
  // Without it, each visit to sheet 04 stacked another click handler on the same root.
  const ac = new AbortController();
  const sig = { signal: ac.signal };
  const col = root.querySelector('#col');
  const dz = root.querySelector('#dz');
  const verdict = root.querySelector('#verdict');
  const toast = root.querySelector('#toast');
  const after = root.querySelector('#after');
  const count = root.querySelector('#count');
  const say = (msg) => { toast.textContent = msg; clearTimeout(say.t); say.t = setTimeout(() => (toast.textContent = ''), 2600); };

  function draw() {
    let pip = 0;
    const html = list.map((id, i) => `<button type="button" class="placed cat-${PIECES[id].cat}" data-i="${i}" aria-label="${esc(t('remove')(L(PIECES[id].name)))}">${pieceSVG(id, id === 'piparra' && pip++ % 2 === 1)}</button>`).join('');
    col.innerHTML = html;
    root.querySelector('#emptylot').hidden = list.length > 0;
    count.textContent = `${list.length}/${MAX}`;
    root.querySelector('#inspect').disabled = list.length === 0;
    root.querySelector('#undo').disabled = history.length === 0;
    root.querySelector('#clear').disabled = list.length === 0;
  }
  function hideVerdict() { verdict.hidden = true; after.hidden = true; dz.classList.remove('judged'); }
  function add(id) {
    if (list.length >= MAX) { say(t('full')); return; }
    history.push(list.slice()); list.push(id); hideVerdict(); draw();
    const last = col.querySelector(`[data-i="${list.length - 1}"]`); if (last) { last.classList.add('drop-in'); }
  }
  function showVerdict() {
    const v = judge(list);
    verdict.innerHTML = `<div class="stamp-wrap v-${v.code}">${stamp(v)}</div><ul class="pen-notes">${v.notes.map((m) => `<li>${esc(L(m))}</li>`).join('')}</ul>`;
    verdict.hidden = false; after.hidden = false; dz.classList.add('judged');
    const u = new URL(location.href); u.hash = `#/4?g=${encode(list)}`;
    window.history.replaceState(null, '', u);
  }

  // Tap or click: add from the tray, remove from the stick.
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('piece-btn')) { if (suppressClick) { suppressClick = false; return; } add(b.dataset.id); }
    else if (b.classList.contains('placed')) { history.push(list.slice()); list.splice(+b.dataset.i, 1); hideVerdict(); draw(); }
    else if (b.id === 'undo' && history.length) { list = history.pop(); hideVerdict(); draw(); }
    else if (b.id === 'clear') { history.push(list.slice()); list = []; hideVerdict(); draw(); }
    else if (b.id === 'inspect') showVerdict();
    else if (b.id === 'again') { list = []; history = []; shared = false; root.querySelector('#site-title').textContent = t('onStick'); hideVerdict(); draw(); const u = new URL(location.href); u.hash = '#/4'; window.history.replaceState(null, '', u); }
    else if (b.id === 'share') doShare(say);
  }, sig);

  // Drag from the tray onto the stick.
  let drag = null, suppressClick = false;
  root.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.piece-btn'); if (!b || e.button > 0) return;
    drag = { id: b.dataset.id, x: e.clientX, y: e.clientY, ghost: null, pid: e.pointerId, src: b };
  }, sig);
  window.addEventListener('pointermove', onMove, { passive: false, signal: ac.signal });
  window.addEventListener('pointerup', onUp, sig);
  window.addEventListener('pointercancel', () => endDrag(), sig);
  function onMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.ghost && Math.hypot(dx, dy) > 6) {
      drag.ghost = document.createElement('div');
      drag.ghost.className = 'drag-ghost';
      drag.ghost.innerHTML = pieceSVG(drag.id);
      document.body.appendChild(drag.ghost);
      drag.src.classList.add('lifted');
    }
    if (drag.ghost) {
      e.preventDefault();
      drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      dz.classList.toggle('over', over(e));
    }
  }
  function over(e) { const r = dz.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    if (drag.ghost) { suppressClick = true; if (over(e)) add(drag.id); setTimeout(() => (suppressClick = false), 0); }
    endDrag();
  }
  function endDrag() { if (drag?.ghost) drag.ghost.remove(); drag?.src.classList.remove('lifted'); dz.classList.remove('over'); drag = null; }

  draw();
  if (shared) showVerdict();
  return () => { endDrag(); ac.abort(); };
}

async function doShare(say) {
  const url = location.href;
  const v = judge(list);
  const text = `${t('project')} · ${t('verdict')[v.code]} · ${L(v.notes[0])}`;
  if (navigator.share) {
    try { await navigator.share({ title: t('project'), text, url }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(`${text} ${url}`); say(t('copied')); }
  catch { say(url); }
}
