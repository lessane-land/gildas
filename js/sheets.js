// One render function per plan sheet. Each returns HTML; drawings are inline SVG in mm.
import { t, L } from './i18n.js';
import { SOURCES, KIND, PIECES, CLASSIC, MEASURES, JOBS, TAGS, BOM, BAR_PRICE, ORIGINS, SELF_CONTRADICTION, NAME_STORY, VARIANTS, PLACES } from './data.js';
import { block, stack, stick, dimV, dimH, ext, leader, northArrow, svgOpen } from './pieces.js';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function srcLinks(ids, label = true) {
  if (!ids || !ids.length) return '';
  const links = ids.map((id) => {
    const s = SOURCES[id];
    return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.pub)}</a>`;
  }).join(' · ');
  return `<span class="srcs">${label ? `<span class="srcs-k">${t(ids.length > 1 ? 'sources' : 'source')}:</span> ` : ''}${links}</span>`;
}

function head(n, lead) {
  return `<header class="sheet-head"><p class="sheet-num">${t('sheetOf')(String(n).padStart(2, '0'), '07')}</p>` +
    `<h1 id="sheet-title" tabindex="-1">${esc(t('sheets')[n - 1])}</h1><p class="lead">${esc(lead)}</p></header>`;
}

const balloon = (x, y, n) => `<g class="balloon"><circle cx="${x}" cy="${y}" r="3.2"/><text x="${x}" y="${y + 1.15}" text-anchor="middle">${n}</text></g>`;
const viewTitle = (x, y, text) => `<g class="vtitle"><text x="${x}" y="${y}" text-anchor="middle">${esc(text.toUpperCase())}</text><path d="M${x - 18} ${y + 1.6} L${x + 18} ${y + 1.6}"/><text x="${x}" y="${y + 5.6}" text-anchor="middle" class="t-small">1:1</text></g>`;

function legendHTML(cats) {
  const lay = t('layers');
  return `<ul class="legend" aria-label="${esc(t('legend'))}">` + cats.map((c) => `<li><span class="sw sw-${c}"></span>${esc(lay[c])}</li>`).join('') + `</ul>`;
}

// ---------- 01 Planta y alzado ----------
export function sheet1() {
  const W = 250, H = 157;
  const fx = 60, sx = 135, px = 206, base = 125;
  const front = stack(CLASSIC, fx, base);
  const side = stack(CLASSIC, sx, base, { view: 'side' });
  const p = front.placed;
  const olive = p[0], pip1 = p[1], anch = p[4], olive2 = p[5];

  let s = svgOpen(W, H, `${t('front')}, ${t('side')}, ${t('plan')}`);
  s += `<g class="drawin">${front.svg}${side.svg}`;
  // Plan view: seen from the tip, the top olive covers the hole.
  s += `<g transform="translate(${px} 70)">` +
    [-11, 2, 14].map((a, i) => `<g transform="rotate(${a}) translate(0 ${(i - 1) * 2.2})">${block('piparra', { flip: i % 2 === 1 })}</g>`).join('') +
    `<g transform="rotate(68)"><rect x="-14" y="-3.4" width="28" height="6.8" rx="3.4" class="ink-fish solid"/><path d="M-11 0 L11 0" class="ink-fish thin" stroke-dasharray="0.8 1.2"/></g>` +
    `<circle r="10" class="ink-olive solid"/><circle r="1.2" class="ink-structure fillink"/>` +
    `<path d="M-14 0 L14 0 M0 -14 L0 14" class="ink-structure axis"/></g>`;
  s += `</g>`;
  // Dimensions
  s += ext(fx - 3, front.yTip, 12, front.yTip) + ext(fx - 3, base, 12, base);
  s += dimV(15, front.yTip, base, '≈ 100');
  s += ext(fx - 32, pip1.cy + 1, fx - 32, 141) + ext(fx + 27, pip1.cy, fx + 27, 141);
  s += dimH(139, fx - 32, fx + 27, '50 a 120', -1);
  s += ext(fx - 10, olive.cy, fx - 10, 132) + ext(fx + 10, olive.cy, fx + 10, 132);
  s += dimH(130, fx - 10, fx + 10, '≈ 20 *', -1);
  // Balloons: part numbers keyed to the legend
  s += balloon(fx + 9, front.yTip + 2, 1) + `<path d="M${fx + 6} ${front.yTip + 3.4} L${fx + 1.4} ${front.yTip + 6}" class="leader-l"/>`;
  s += balloon(fx + 26, anch.cy - 8, 2) + `<path d="M${fx + 23} ${anch.cy - 6.6} L${fx + 13} ${anch.cy - 3}" class="leader-l"/>`;
  s += balloon(fx + 42, pip1.cy - 12, 3) + `<path d="M${fx + 40} ${pip1.cy - 9.4} L${fx + 33} ${pip1.cy - 4}" class="leader-l"/>`;
  s += balloon(fx + 22, olive2.cy - 6, 4) + `<path d="M${fx + 19} ${olive2.cy - 5} L${fx + 10} ${olive2.cy - 3}" class="leader-l"/>`;
  s += viewTitle(fx, 148, t('front')) + viewTitle(sx, 148, t('side')) + viewTitle(px, 108, t('plan'));
  s += northArrow(236, 22, 7, t('north'));
  s += `</svg>`;

  const parts = [
    ['structure', t('stick'), L({ es: 'Viga', en: 'Beam', eu: 'Habea' })],
    ['fish', L(PIECES.anchoa.name), L(PIECES.anchoa.role)],
    ['pickle', L(PIECES.piparra.name), L(PIECES.piparra.role)],
    ['olive', L(PIECES.aceituna.name), L(PIECES.aceituna.role)],
  ];
  const partList = `<ol class="parts">` + parts.map(([c, n, r]) => `<li><span class="sw sw-${c}"></span><b>${esc(n)}</b> <span class="muted">${esc(r)}</span></li>`).join('') + `</ol>`;
  const meas = `<dl class="measures">` + MEASURES.map((m) => `<div class="m${m.disputed ? ' is-disputed' : ''}${m.estimate ? ' is-estimate' : ''}">` +
    `<dt>${esc(L(m.what))}</dt><dd><span class="mv">${esc(m.value)} <small>${esc(L(m.unit))}</small></span>` +
    (m.disputed ? `<span class="flag">${esc(t('disputed'))}</span>` : '') + (m.estimate ? `<span class="flag">${esc(t('estimate'))}</span>` : '') +
    `<p>${esc(L(m.note))}</p>${srcLinks(m.src)}</dd></div>`).join('') + `</dl>`;

  // Phones get the same drawing cropped into two sheets instead of one tiny one.
  const crop = (vb, label) => s.replace(/^<svg class="dwg" viewBox="[^"]*" role="img" aria-label="[^"]*"/, `<svg class="dwg" viewBox="${vb}" role="img" aria-label="${esc(label)}"`);
  const drawing = `<div class="only-wide">${s}</div><div class="only-narrow">${crop('0 0 160 157', `${t('front')}, ${t('side')}`)}${crop('160 0 90 116', t('plan'))}</div>`;
  return head(1, t('s1Lead')) + `<div class="sheet-body two"><figure class="dwg-wrap">${drawing}<figcaption class="t-note">* ${esc(t('estimate'))}</figcaption></figure>` +
    `<aside class="notes"><h2>${esc(t('legend'))}</h2>${partList}${legendHTML(['structure', 'fish', 'pickle', 'olive', 'dim'])}<h2>${esc(t('measures'))}</h2>${meas}</aside></div>`;
}

// ---------- 02 Despiece ----------
export function sheet2() {
  const W = 230, H = 176, ax = 92;
  const rows = [
    { id: 'aceite', y: 14, job: 'aceite' },
    { id: 'aceituna', y: 36, job: 'aceituna' },
    { id: 'anchoa', y: 66, job: 'anchoa' },
    { id: 'piparra', y: 92, job: 'piparra', flip: false },
    { id: 'piparra', y: 104, flip: true },
    { id: 'piparra', y: 116 },
    { id: 'aceituna', y: 142 },
  ];
  let s = svgOpen(W, H, t('sheets')[1]);
  s += `<path d="M${ax} 6 L${ax} 160" class="ink-structure axis"/>`;
  s += `<g class="drawin">`;
  // the beam, pulled out to the side
  s += stick(30, 160, 60);
  s += `<path d="M${ax} 22 L${ax} 26" class="ink-olive" stroke-dasharray="1 1.4"/>`;
  rows.forEach((r) => { s += `<g transform="translate(${ax} ${r.y})">${block(r.id, { flip: r.flip })}</g>`; });
  s += `</g>`;
  const nameOf = (id) => id === 'aceite' ? t('oil') : id === 'palillo' ? t('stick') : L(PIECES[id].name);
  const jobOf = (id) => JOBS.find((j) => j.piece === id);
  const lab = (id, x1, y1, x2, y2, extra = '') => {
    const j = jobOf(id);
    return leader(x1, y1, x2, y2, [
      { text: esc(nameOf(id) + extra), cls: `t-label ink-txt-${id === 'aceite' || id === 'aceituna' ? 'olive' : id === 'anchoa' ? 'fish' : id === 'piparra' ? 'pickle' : 'structure'}` },
      { text: esc(j.tags.map((g) => L(TAGS[g])).join(' + ')), cls: 't-tag' },
    ]);
  };
  s += lab('aceite', ax + 6, 14, 150, 12);
  s += lab('aceituna', ax + 10, 36, 150, 36, ' ×2');
  s += lab('anchoa', ax + 14, 62, 150, 62);
  s += lab('piparra', ax + 30, 104, 150, 100, ' ×3');
  s += `<g class="leader"><circle cx="${ax + 9}" cy="142" r="0.7"/><path d="M${ax + 9} 142 L150 142 L154 142"/><text x="156" y="143.1" class="t-small">${esc(L({ es: 'ver arriba', en: 'see above', eu: 'ikus goian' }))}</text></g>`;
  s += leader(30, 120, 12, 46, [{ text: esc(t('stick')), cls: 't-label ink-txt-structure' }, { text: esc(L(TAGS.structure)), cls: 't-tag' }], 'start');
  s += `</svg>`;

  const cards = JOBS.map((j) => `<li class="job"><h3 class="ink-txt-${j.piece === 'anchoa' ? 'fish' : j.piece === 'piparra' ? 'pickle' : j.piece === 'palillo' ? 'structure' : 'olive'}">${esc(nameOf(j.piece))}</h3>` +
    `<p class="tags">${j.tags.map((g) => `<span class="tag">${esc(L(TAGS[g]))}</span>`).join('')}</p><p>${esc(L(j.note))}</p>${srcLinks(j.src)}</li>`).join('');
  return head(2, t('s2Lead')) + `<div class="sheet-body two"><figure class="dwg-wrap">${s}</figure><aside class="notes"><ul class="jobs">${cards}</ul></aside></div>`;
}

// ---------- 03 Mediciones y presupuesto ----------
const fmt = (n) => n.toLocaleString(L({ es: 'es-ES', en: 'en-GB', eu: 'eu-ES' }), { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
export function sheet3() {
  const nameOf = (id) => id === 'palillo' ? t('stick') : L(PIECES[id].name);
  const rows = BOM.map((b) => `<tr><td class="mono">${b.code}</td><th scope="row">${esc(nameOf(b.piece))}</th><td class="num">${b.qty} ${esc(L(b.unit))}</td>` +
    `<td class="num">${esc(L(b.price))}${b.derived ? `<span class="flag">${esc(t('derived'))}</span>` : ''}</td><td>${esc(L(b.how))} ${srcLinks(b.src)}</td></tr>`).join('');
  let lo = 0, hi = 0;
  BOM.forEach((b) => { if (b.per) { lo += b.per[0] * b.qty; hi += b.per[1] * b.qty; } });
  // range chart: our sourced materials vs the bar price
  const max = 3.2, X = (v) => 46 + v / max * 150;
  const bar = (y, a, b, cls, label) => `<g><text x="44" y="${y + 3}" text-anchor="end" class="t-small">${esc(label)}</text>` +
    `<path d="M${X(a)} ${y} L${X(b)} ${y}" class="${cls}" stroke-width="5"/><text x="${X(b) + 2}" y="${y + 1.2}" class="t-small">${fmt(a)} · ${fmt(b)}</text></g>`;
  let chart = svgOpen(220, 44, `${t('subtotal')} / ${t('barPrice')}`);
  chart += [0, 1, 2, 3].map((v) => `<path d="M${X(v)} 6 L${X(v)} 34" class="gridl"/><text x="${X(v)}" y="40" text-anchor="middle" class="t-small">${v} €</text>`).join('');
  chart += bar(14, lo, hi, 'bar-fish', t('subtotal').split(' (')[0]);
  chart += bar(26, 1.5, 3.0, 'bar-dim', t('barPrice'));
  chart += `</svg>`;
  return head(3, t('s3Lead')) + `<div class="sheet-body">` +
    `<div class="table-wrap"><table class="bom"><thead><tr><th scope="col">${esc(t('code'))}</th><th scope="col">${esc(t('item'))}</th><th scope="col">${esc(t('qty'))}</th><th scope="col">${esc(t('unitPrice'))}</th><th scope="col">${esc(t('notes'))}</th></tr></thead><tbody>${rows}</tbody>` +
    `<tfoot><tr><td></td><th scope="row">${esc(t('subtotal'))}</th><td></td><td class="num strong">${fmt(lo)} · ${fmt(hi)}</td><td>${esc(t('subtotalNote'))}</td></tr></tfoot></table></div>` +
    `<div class="two even"><section class="card"><h2>${esc(t('barPrice'))}</h2><p class="big">${esc(L(BAR_PRICE.value))}</p><p>${esc(L(BAR_PRICE.note))}</p>${srcLinks(BAR_PRICE.src)}</section>` +
    `<figure class="card dwg-wrap">${chart}</figure></div></div>`;
}

// ---------- 05 Variantes ----------
export function sheet5() {
  const cards = VARIANTS.map((v, i) => {
    const st = stack(v.stack, 35, 122);
    const cats = [...new Set(v.stack.map((id) => PIECES[id].cat))];
    let s = svgOpen(70, 130, L(v.name));
    s += `<g class="drawin">${st.svg}</g>`;
    s += dimV(8, st.yTip, 122, `${Math.round(st.length)}`);
    s += `</svg>`;
    return `<li class="vsheet"><figure class="dwg-wrap">${s}</figure><div class="vinfo"><p class="sheet-num">05.${i + 1}</p><h2>${esc(L(v.name))}</h2>` +
      `<p>${esc(L(v.note))}</p>${legendHTML(cats)}${srcLinks(v.src)}</div></li>`;
  }).join('');
  return head(5, t('s5Lead')) + `<div class="sheet-body"><ul class="variants">${cards}</ul></div>`;
}

// ---------- 06 Memoria histórica ----------
export function sheet6() {
  // Timeline: each source drops a marker on its year. Ranges become brackets.
  const x0 = 20, x1 = 220, y0 = 1940, y1 = 1960;
  const X = (y) => x0 + (y - y0) / (y1 - y0) * (x1 - x0);
  const all = [...ORIGINS.map((o) => ({ t: o.t, src: o.src[0] })), ...SELF_CONTRADICTION.map((o) => ({ t: o.t, src: o.src[0], shop: true }))];
  const AX = 44;
  const stackAt = {};
  let marks = '';
  all.forEach((m) => {
    if (m.t == null) return;
    if (Array.isArray(m.t)) {
      const k = 'r' + m.t[0];
      const lvl = (stackAt[k] = (stackAt[k] || 0) + 1);
      const y = AX + 12 + lvl * 6;
      marks += `<path d="M${X(m.t[0])} ${y - 2} L${X(m.t[0])} ${y} L${X(m.t[1] + 1)} ${y} L${X(m.t[1] + 1)} ${y - 2}" class="${m.shop ? 'ink-fish' : 'ink-structure'} thin"/>` +
        `<text x="${(X(m.t[0]) + X(m.t[1] + 1)) / 2}" y="${y + 4}" text-anchor="middle" class="t-small">${esc(SOURCES[m.src].pub)}</text>`;
    } else {
      const lvl = (stackAt[m.t] = (stackAt[m.t] || 0) + 1);
      marks += `<circle cx="${X(m.t) + 2.5}" cy="${AX - 1 - lvl * 4.2}" r="1.6" class="${m.shop ? 'ink-fish' : 'ink-structure'} ${m.shop ? 'solid' : 'fillink'}"><title>${esc(SOURCES[m.src].pub)}</title></circle>`;
    }
  });
  let tl = svgOpen(240, 76, t('timeline'));
  tl += `<path d="M${x0} ${AX} L${x1} ${AX}" class="ink-structure"/>`;
  for (let y = y0; y <= y1; y++) tl += `<path d="M${X(y)} ${AX} L${X(y)} ${AX + (y % 5 ? 1.4 : 3)}" class="ink-structure thin"/>` + (y % 2 === 0 ? `<text x="${X(y)}" y="${AX + 7}" text-anchor="middle" class="t-small">${y}</text>` : '');
  tl += marks;
  const c1 = X(1946) - 3, c2 = X(1949) + 3;
  tl += `<g class="redpen"><path d="M${c1 + 2} 8 C${c1 + 14} 4 ${c2 - 6} 5 ${c2} 10 C${c2 + 4} 20 ${c2 + 2} 34 ${c2 - 4} 40 C${c2 - 14} 44 ${c1 + 4} 43 ${c1} 37 C${c1 - 3} 28 ${c1 - 2} 14 ${c1 + 2} 8"/>` +
    `<text x="${c2 + 6}" y="18" class="hand">${esc(t('disputed').toUpperCase())}</text></g>`;
  tl += `<g transform="translate(${x1 + 7} ${AX - 5.2})"><circle r="1.6" class="ink-structure fillink"/><text x="2.8" y="1.1" class="t-small">?</text></g>`;
  tl += `<g transform="translate(${x0} 6)" class="t-small"><circle cx="1.6" cy="0" r="1.6" class="ink-structure fillink"/><text x="5" y="1.1" class="t-small">${esc(L({ es: 'una fuente', en: 'one source', eu: 'iturri bat' }))}</text>` +
    `<circle cx="1.6" cy="6" r="1.6" class="ink-fish solid"/><text x="5" y="7.1" class="t-small">${esc(L({ es: 'blog de tienda', en: 'shop blog', eu: 'denda bloga' }))}</text></g>`;
  tl += `</svg>`;

  const cards = ORIGINS.map((o, i) => `<li class="ver"><p class="sheet-num">V${String(i + 1).padStart(2, '0')}</p>` +
    `<dl><div><dt>${esc(t('year'))}</dt><dd class="mono">${esc(L(o.year))}</dd></div><div><dt>${esc(t('bar'))}</dt><dd>${esc(L(o.bar))}</dd></div>` +
    `<div><dt>${esc(t('who'))}</dt><dd>${esc(L(o.who))}</dd></div><div><dt>${esc(t('role'))}</dt><dd>${esc(L(o.role))}</dd></div></dl>${srcLinks(o.src)}</li>`).join('');
  const shop = `<section class="card exhibit"><h2>${esc(t('oneShop'))}</h2><p>${esc(t('oneShopNote'))}</p><ol class="shop">` +
    SELF_CONTRADICTION.map((s) => `<li>${esc(L(s.text))} ${srcLinks(s.src, false)}</li>`).join('') + `</ol></section>`;
  const agree = `<section class="card agree"><h2>${esc(t('agree'))}</h2><p>${esc(L(NAME_STORY.text))}</p>${srcLinks(NAME_STORY.src)}` +
    `<p>${esc(L(NAME_STORY.premiere))}</p>${srcLinks(NAME_STORY.premiereSrc)}<p class="muted">${esc(t('nameNote'))}</p></section>`;
  return head(6, t('s6Lead')) + `<div class="sheet-body"><figure class="dwg-wrap tl"><figcaption class="t-note">${esc(t('timeline'))}</figcaption>${tl}</figure>` +
    `<ul class="versions">${cards}</ul><div class="two even">${agree}${shop}</div><p class="nopick hand-note">${esc(t('noPick'))}</p></div>`;
}

// ---------- 07 Licencia de obra ----------
export function sheet7() {
  const byCity = {};
  PLACES.forEach((p) => (byCity[p.city] = byCity[p.city] || []).push(p));
  const pin = `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>`;
  const html = Object.entries(byCity).map(([city, list]) => `<section class="city"><h2>${esc(city)}</h2><ul class="places">` +
    list.map((p, i) => {
      const q = encodeURIComponent(`${p.name}, ${L(p.addr)}, ${city}`);
      return `<li class="place"><p class="sheet-num">${city === 'Bilbao' ? 'BIO' : 'DON'}-${String(i + 1).padStart(2, '0')}</p><h3>${esc(p.name)}</h3>` +
        `<p class="mono addr">${esc(L(p.addr))}</p><p>${esc(L(p.says))}</p>${srcLinks(p.src)}` +
        `<a class="btn ghost" href="https://www.openstreetmap.org/search?query=${q}" target="_blank" rel="noopener noreferrer">${pin}<span>${esc(t('map'))}</span></a></li>`;
    }).join('') + `</ul></section>`).join('');
  return head(7, t('s7Lead')) + `<div class="sheet-body">${html}</div>`;
}

// ---------- Créditos ----------
export function credits() {
  const groups = [
    [1, MEASURES.flatMap((m) => m.src)],
    [2, JOBS.flatMap((j) => j.src)],
    [3, [...BOM.flatMap((b) => b.src), ...BAR_PRICE.src]],
    [5, VARIANTS.flatMap((v) => v.src)],
    [6, [...ORIGINS.flatMap((o) => o.src), ...SELF_CONTRADICTION.flatMap((s) => s.src), ...NAME_STORY.src, ...NAME_STORY.premiereSrc]],
    [7, PLACES.flatMap((p) => p.src)],
  ];
  const list = groups.map(([n, ids]) => `<section class="cred"><h2><span class="mono">${String(n).padStart(2, '0')}</span> ${esc(t('sheets')[n - 1])}</h2><ul>` +
    [...new Set(ids)].map((id) => { const s = SOURCES[id]; return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.pub)}</a>. ${esc(s.title)} <span class="kind">${esc(L(KIND[s.kind]))}</span></li>`; }).join('') +
    `</ul></section>`).join('');
  return `<header class="sheet-head"><p class="sheet-num">${esc(t('project'))}</p><h1 id="sheet-title" tabindex="-1">${esc(t('credits'))}</h1><p class="lead">${esc(t('cLead'))}</p></header>` +
    `<div class="sheet-body"><div class="creds">${list}</div><section class="card"><h2>${esc(t('fonts'))}</h2><p>${esc(t('fontsNote'))}</p></section>` +
    `<section class="card"><p>${esc(t('madeBy'))}</p><p>${esc(t('privacy'))}</p><p class="muted">${esc(t('lastCheck'))}</p></section></div>`;
}
