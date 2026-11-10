// Shell: language, routing, title block. Hash routes (#/1 ... #/7, #/creditos) because
// GitHub Pages serves static files only: no server rewrites needed, and every sheet
// (including a judged gilda) is a link you can share.
import { t, L, setLang, lang, detectLang, LANGS } from './i18n.js';
import { sheet1, sheet2, sheet3, sheet5, sheet6, sheet7, credits, esc } from './sheets.js';
import * as assembly from './assembly.js';
import { northArrow } from './pieces.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
let unmount = null;

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, query] = h.split('?');
  const params = new URLSearchParams(query || '');
  if (path === 'creditos') return { id: 'creditos', params };
  const n = parseInt(path, 10);
  return { id: n >= 1 && n <= 7 ? n : 1, params };
}

function renderChrome() {
  document.title = `Gilda · ${t('subtitle')}`;
  document.querySelector('.brand-sub').textContent = t('subtitle');
  document.querySelector('.skip').textContent = t('skip');
  const r = parse();
  nav.innerHTML = t('sheets').map((name, i) => {
    const cur = r.id === i + 1;
    return `<a href="#/${i + 1}" class="tab${cur ? ' is-current' : ''}"${cur ? ' aria-current="page"' : ''}><span class="mono">${String(i + 1).padStart(2, '0')}</span><span>${esc(name)}</span></a>`;
  }).join('') + `<a href="#/creditos" class="tab tab-credits${r.id === 'creditos' ? ' is-current' : ''}"${r.id === 'creditos' ? ' aria-current="page"' : ''}><span>${esc(t('credits'))}</span></a>`;
  const ls = document.getElementById('langs');
  ls.setAttribute('aria-label', t('langLabel'));
  ls.innerHTML = LANGS.map((l) => `<button type="button" class="lang${l === lang() ? ' is-on' : ''}" data-lang="${l}" aria-pressed="${l === lang()}">${l.toUpperCase()}</button>`).join('');
  document.getElementById('eubeta').hidden = lang() !== 'eu';
  document.getElementById('eubeta').textContent = t('euBeta');
  const kofi = document.getElementById('kofi');
  kofi.querySelector('span').textContent = t('kofi');
  document.getElementById('credits-link').textContent = t('credits');
  document.getElementById('privacy').textContent = t('privacy');
}

function titleBlock(id) {
  const n = id === 'creditos' ? '--' : String(id).padStart(2, '0');
  return `<div class="titleblock" aria-hidden="true">` +
    `<div class="tb-project"><b>${esc(t('project').toUpperCase())}</b></div>` +
    `<div>${esc(t('scale').toUpperCase())}</div><div>${esc(t('sheetOf')(n, '07').toUpperCase())}</div>` +
    `<div>${esc(t('units').toUpperCase())}</div>` +
    `<div class="tb-north"><svg viewBox="-12 -12 24 32" class="tb-arrow">${northArrow(0, 0, 9, '')}</svg><span>${esc(t('north').toUpperCase())}<br><small>${esc(t('northNote'))}</small></span></div></div>`;
}

function render(focus) {
  if (unmount) { unmount(); unmount = null; }
  const r = parse();
  let html;
  switch (r.id) {
    case 1: html = sheet1(); break;
    case 2: html = sheet2(); break;
    case 3: html = sheet3(); break;
    case 4: html = assembly.render(assembly.decode(r.params.get('g'))); break;
    case 5: html = sheet5(); break;
    case 6: html = sheet6(); break;
    case 7: html = sheet7(); break;
    default: html = credits();
  }
  app.innerHTML = `<article class="sheet sheet-${r.id}">${html}${titleBlock(r.id)}</article>`;
  if (r.id === 4) unmount = assembly.mount(app);
  renderChrome();
  if (focus) { document.getElementById('sheet-title')?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  const cur = nav.querySelector('.is-current');
  if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

document.getElementById('langs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lang]'); if (!b) return;
  setLang(b.dataset.lang);
  const u = new URL(location.href); u.searchParams.set('lang', lang());
  history.replaceState(null, '', u);
  render(false);
});

window.addEventListener('hashchange', () => render(true));
setLang(detectLang());
render(false);
