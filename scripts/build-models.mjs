// Generates one static page per catalogue model: models/<slug>.html
// Source of truth: assets/js/data.js (prices, sizes, images) + the header/footer of index.html.
// Run after every catalogue change:  node scripts/build-models.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://alonrotem1-del.github.io/villa-toscana/';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// load the browser data + scene renderer in a sandbox
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(read('assets/js/data.js'), ctx);
vm.runInContext(read('assets/js/visualizer.js'), ctx);
const { VT, VTViz } = ctx;

// header and footer come from index.html so every page stays identical
const index = read('index.html');
const cut = (from, to) => index.slice(index.indexOf(from), index.indexOf(to) + to.length);
const fixLinks = html => html
  .replace(/(href|src)="(?!https?:|tel:|mailto:|#|\.\.\/)([^"]+)"/g, '$1="../$2"')
  .replace(/href="#([^"]+)"/g, 'href="../index.html#$1"');
const header = fixLinks(cut('<div class="topbar">', '</header>'));
const footer = fixLinks(cut('<footer class="site-footer">', '</footer>'));
const floaters = fixLinks(cut('<a class="fab"', '</nav>\n\n<script'))
  .replace(/\n\n<script$/, '');
const headStatic = cut('<meta name="robots"', '<link rel="stylesheet" href="assets/css/site.css">')
  .replace(/<meta property="og:[^>]*>\n/g, '').replace(/<meta name="twitter:card"[^>]*>\n/g, '')
  .replace(/<link rel="preload" as="image"[^>]*>\n/g, '');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const money = n => `<span class="num">₪${VT.fmt(n)}</span>`;
const nameOf = p => p.title + (p.code ? ' ' + p.code : '');
const isPhoto = img => !/^p/.test(img) || img === 'p15.webp' || img === 'p03.webp';

function sizeOut(p, s) {
  return `<dl class="spec-dl">${VT.dimLabels(s.dim, p.shape).map((l, i) => `<div><dt>${l}</dt><dd><span class="num">${s.dim.split('/')[i]}</span> ס״מ</dd></div>`).join('')}</dl>
        <p class="big-price ${s.sale ? 'hot' : ''}">${s.price == null ? 'מחיר בטלפון' : money(s.price)} <small>${s.vat ? 'כולל מע״מ' : 'לפני מע״מ'}${s.sale ? ' · מבצע' : ''}</small></p>
        <div class="btn-row">
          <button class="btn btn-solid" type="button" data-add="${p.id}|${s.dim}">הוספה לרשימת ההזמנה</button>
          ${p.noViz ? '' : `<button class="btn btn-ghost" type="button" data-viz="${p.id}|${s.dim}">לראות על המרפסת</button>`}
        </div>`;
}

function setBox(p) {
  if (!p.set) return '';
  const sv = VT.setSavings(p);
  return `<div class="set-row">
          <div><span class="lbl">${p.set.label}</span><span class="dims dimv">${p.set.dims.map(VT.dimShort).join(' + ')}</span>
          ${sv ? `<span class="save">חוסכים ₪${VT.fmt(sv.amount)} (${sv.pct}%) לעומת קנייה בנפרד</span>` : ''}</div>
          <div class="row-acts"><span class="price">${money(p.set.price)}</span>
          <button class="ibtn" type="button" data-add="${p.id}|set" aria-label="הוספת ה${p.set.label} לרשימת ההזמנה"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>
        </div>`;
}

function page(p) {
  const slug = VT.slug(p), url = `${SITE}models/${slug}.html`;
  const sizes = p.sizes || [];
  const imgs = [p.img].concat(p.thumbs || []);
  const from = VT.minPrice(p);
  const prices = sizes.map(s => s.price).concat(p.set ? [p.set.price] : []).filter(x => x != null);
  const catNames = p.cats.map(c => VT.cats[c]);
  const sizeWords = sizes.map(s => VT.dimShort(s.dim)).join(', ');
  const desc = `${nameOf(p)}${sizeWords ? ` במידות ${sizeWords} ס״מ` : ''}${p.finishes.length ? `, בגוון ${p.finishes.map(f => VT.finishes[f].name).join(' או ')}` : ''}. ${from != null ? `החל מ־₪${VT.fmt(from)} לפני מע״מ. ` : ''}וילה טוסקנה, אבן יהודה.`;
  const ogImg = fs.existsSync(path.join(ROOT, `assets/og/models/${slug}.jpg`)) ? `${SITE}assets/og/models/${slug}.jpg` : `${SITE}assets/og/og-price-list.jpg`;

  const sceneItems = (sizes.length ? sizes.map(s => s.dim) : (p.set ? p.set.dims : []))
    .map(dim => ({ pid: p.id, dim, finish: p.finishes[0] || 'C' }));
  const scene = p.noViz || !sceneItems.length ? '' : VTViz.sceneSVG(sceneItems, {
    plants: true, dims: true, person: true,
    title: `${p.title} בקנה מידה אמיתי, ליד מעקה 105 ס״מ ודמות בגובה 170 ס״מ`
  });

  const ld = [{
    '@context': 'https://schema.org', '@type': 'Product', name: nameOf(p), description: desc,
    image: imgs.map(i => SITE + 'assets/img/' + i), url, category: catNames[0],
    brand: { '@type': 'Brand', name: 'Villa Toscana' }, ...(p.code ? { sku: p.code, mpn: p.code } : {}),
    ...(prices.length ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'ILS', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, availability: 'https://schema.org/InStoreOnly', seller: { '@id': SITE + '#store' } } } : {})
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'וילה טוסקנה', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'מחירון', item: SITE + 'price-list.html' },
      { '@type': 'ListItem', position: 3, name: nameOf(p), item: url }]
  }];

  const first = sizes[0];
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(nameOf(p))} | וילה טוסקנה</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(desc)}">
${fixLinks(headStatic)}
<meta property="og:type" content="product">
<meta property="og:locale" content="he_IL">
<meta property="og:site_name" content="וילה טוסקנה">
<meta property="og:title" content="${esc(nameOf(p))} | וילה טוסקנה">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
${JSON.stringify(ld)}
</script>
</head>
<body dir="rtl">
<a class="skip" href="#main">דלגו לתוכן</a>
${header}

<main id="main">
  <div class="wrap">
    <nav class="crumbs" aria-label="פירורי לחם"><a href="../index.html">בית</a><span aria-hidden="true">‹</span><a href="../price-list.html">מחירון</a><span aria-hidden="true">‹</span><span aria-current="page">${esc(p.title)}</span></nav>

    <article class="model-grid" id="model" data-id="${p.id}">
      <div class="gallery">
        <div class="g-main"><img src="../assets/img/${p.img}" alt="${esc(p.title)}" class="${isPhoto(p.img) ? 'cover' : ''}" data-maxh="420" data-maxk="2.6" onload="window.VTfit&&VTfit(this)" style="view-transition-name:m-${p.id}" fetchpriority="high"></div>
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, i) => `<button type="button" data-img="${im}" aria-pressed="${i === 0}" aria-label="תמונה ${i + 1} מתוך ${imgs.length}"><img src="../assets/img/${im}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>

      <div class="model-info">
        <span class="eyebrow">${catNames.join(' · ')}</span>
        <div class="tc-top"><h1>${esc(p.title)}</h1>${p.code ? `<bdi class="tc-code" lang="en">${p.code}</bdi>` : ''}</div>
        ${from != null ? `<p class="from">החל מ־${money(from)} <small>לפני מע״מ</small></p>` : ''}
        <div class="fins">${p.finishes.map(c => `<span class="fin"><i style="background:${VT.finishes[c].color}"></i>${VT.finishes[c].name}</span>`).join('') || '<span class="fin">גוון לפי המלאי</span>'}</div>
        ${sizes.length ? `<div>
          <p class="legend" id="size-label">בחרו מידה · ${VT.dimLegend(first.dim, p.shape)}</p>
          <div class="size-pick" id="size-pick" role="group" aria-labelledby="size-label" style="margin-top:.7rem">
            ${sizes.map((s, i) => `<button type="button" data-size="${s.dim}" aria-pressed="${i === 0}"><span class="dimv">${VT.dimShort(s.dim)}</span><span class="sr">${VT.dimLong(s.dim, p.shape)}</span><small>${s.price == null ? 'מחיר בטלפון' : '₪' + VT.fmt(s.price)}${s.label ? ' · ' + s.label : ''}</small></button>`).join('\n            ')}
          </div>
        </div>
        <div id="size-out" aria-live="polite">${sizeOut(p, first)}</div>` : ''}
        ${setBox(p)}
        <ul class="facts-list">
          <li>שלם וקח: המחיר במחסן באבן יהודה, באיסוף עצמי</li>
          <li>לפני שתילה יש לבצע איטום לעציץ</li>
          <li>המלאי משתנה מדי יום, ונאשר לכם זמינות בוואטסאפ</li>
          <li>אפשר לראות ולגעת בתצוגה, בתיאום מראש</li>
        </ul>
        <div class="btn-row">
          <a class="btn btn-wa" target="_blank" rel="noopener" href="${esc(VT.waLink(`שלום, אשמח לפרטים על ${nameOf(p)}: ${url}`))}">שאלה על הדגם בוואטסאפ</a>
          <button class="btn btn-ghost" type="button" id="model-share">שיתוף הדגם</button>
        </div>
      </div>
    </article>

    ${scene ? `<section class="scale-scene" aria-labelledby="scale-h">
      <h2 id="scale-h" style="font-size:var(--s-3)">כל המידות, בקנה מידה אמיתי</h2>
      <p class="note">ליד מעקה זכוכית בגובה 105 ס״מ ודמות בגובה 170 ס״מ. הסרגל משמאל בסנטימטרים.</p>
      <div class="vz-stage" tabindex="0" aria-label="הדמיה, אפשר לגלול לצדדים"><div class="vz-canvas">${scene}</div></div>
      <div class="btn-row"><a class="btn btn-ghost btn-sm" href="../price-list.html#balcony">לבנות מרפסת משלכם</a></div>
    </section>` : ''}

    ${sizes.length ? `<section class="section" aria-labelledby="spec-h" style="padding-block:2.5rem 0">
      <h2 id="spec-h" class="sr">מפרט ומחירים</h2>
      <div class="spec-wrap"><table class="spec-table">
        <caption>כל המידות והמחירים</caption>
        <thead><tr><th scope="col">מידה</th><th scope="col">מידות מלאות</th><th scope="col">מחיר</th></tr></thead>
        <tbody>${sizes.map(s => `<tr><td><span class="dimv">${VT.dimShort(s.dim)}</span></td><td>${VT.dimLong(s.dim, p.shape)}</td><td>${s.price == null ? 'בטלפון' : money(s.price) + (s.vat ? ' <small>כולל מע״מ</small>' : '')}</td></tr>`).join('')}
        ${p.set ? `<tr><td><b>${p.set.label}</b></td><td><span class="dimv">${p.set.dims.map(VT.dimShort).join(' + ')}</span></td><td>${money(p.set.price)}</td></tr>` : ''}</tbody>
      </table></div>
      <p class="note" style="margin-top:.6rem">המחירים לפני מע״מ, אלא אם צוין אחרת.</p>
    </section>` : ''}

    <section class="section" aria-labelledby="rel-h" style="padding-block:3rem 4rem">
      <h2 id="rel-h" style="font-size:var(--s-3);margin-bottom:1.2rem">עוד דגמים שיתאימו</h2>
      <div class="grid" id="related"></div>
    </section>
  </div>
</main>

${footer}

${floaters}

<script>window.VT_BASE = '../';</script>
<script src="../assets/js/data.js"></script>
<script src="../assets/js/visualizer.js"></script>
<script src="../assets/js/site.js"></script>
</body>
</html>
`;
}

const outDir = path.join(ROOT, 'models');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const seen = new Set();
for (const p of VT.products) {
  const slug = VT.slug(p);
  if (seen.has(slug)) throw new Error('duplicate slug ' + slug);
  seen.add(slug);
  fs.writeFileSync(path.join(outDir, slug + '.html'), page(p));
}
console.log(`built ${seen.size} model pages in models/`);
