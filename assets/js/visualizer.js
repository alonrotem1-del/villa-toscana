/* Balcony size simulator.
   The whole scene is drawn in real centimetres (1 SVG unit = 1 cm), so every planter,
   the 105 cm glass railing, the hanging chair and the 170 cm figure share one true scale. */
(function () {
  const VT = window.VT;
  const FY = 245;           // floor line (cm from the ceiling)
  const SH = 282;           // scene height
  const SCREEN_W = 185;     // width of the wooden slat screen on the left
  const NS = 'http://www.w3.org/2000/svg';

  const DEFAULT_ITEMS = [
    { pid: 'p9', dim: '80/23/40', finish: 'B' },
    { pid: 'p9', dim: '80/23/40', finish: 'B' }
  ];

  function product(pid) { return VT.products.find(p => p.id === pid); }
  function finishOf(code) { return VT.finishes[code] || VT.finishes.C; }

  // deterministic pseudo random so plants don't jump on every redraw
  function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  function gradDefs() {
    let g = '';
    for (const [k, f] of Object.entries(VT.finishes)) {
      g += `<linearGradient id="vz-${k}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="${f.dark}"/><stop offset=".35" stop-color="${f.color}"/>
        <stop offset=".7" stop-color="${f.color}"/><stop offset="1" stop-color="${f.dark}"/></linearGradient>`;
    }
    return `<defs>${g}
      <linearGradient id="vz-sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" class="vz-sky1"/><stop offset=".65" class="vz-sky2"/><stop offset="1" class="vz-sky3"/></linearGradient>
      <linearGradient id="vz-glass" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".28"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>
      <radialGradient id="vz-bulb"><stop offset="0" stop-color="#fff6d8"/><stop offset=".45" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    </defs>`;
  }

  /* ---------- planter geometry ---------- */
  function planterSVG(it, x, idx, opts) {
    const p = product(it.pid); const { w, d, h } = VT.parseDim(it.dim);
    const f = finishOf(it.finish); const fill = `url(#vz-${VT.finishes[it.finish] ? it.finish : 'C'})`;
    const top = FY - h; const shape = p.shape;
    let s = '';
    const ox = Math.min(d, 80) * 0.28, oy = Math.min(d, 80) * 0.2;   // cabinet-style depth
    let plantBase = { x0: x + w * 0.1, x1: x + w * 0.9, y: top };

    if (shape === 'box' || shape === 'stand') {
      let bx = x, bw = w, btop = top;
      if (shape === 'stand') {
        // plinth and cap
        s += `<rect x="${x - 2}" y="${FY - 5}" width="${w + 4}" height="5" fill="${f.dark}"/>`;
        bx = x + 2; bw = w - 4;
      }
      s += `<polygon points="${bx + bw},${btop} ${bx + bw + ox},${btop - oy} ${bx + bw + ox},${FY - oy} ${bx + bw},${FY}" fill="${f.dark}"/>`;
      s += `<rect x="${bx}" y="${btop}" width="${bw}" height="${h}" fill="${fill}"/>`;
      s += `<polygon points="${bx},${btop} ${bx + bw},${btop} ${bx + bw + ox},${btop - oy} ${bx + ox},${btop - oy}" fill="${f.color}"/>`;
      if (shape === 'stand') {
        s += `<rect x="${x - 2}" y="${top - 3}" width="${w + 4}" height="5" fill="${f.dark}"/>`;
      } else {
        const t = Math.max(2, Math.min(4, w * 0.05));
        s += `<polygon points="${bx + t},${btop - 0.6} ${bx + bw - t},${btop - 0.6} ${bx + bw + ox - t},${btop - oy + 0.6} ${bx + ox + t},${btop - oy + 0.6}" class="vz-soil"/>`;
      }
      plantBase = { x0: x + w * 0.08 + ox * 0.4, x1: x + w * 0.92 + ox * 0.4, y: top - oy * 0.5 };
    } else if (shape === 'taper') {
      const b = w * 0.72, bi = (w - b) / 2;
      s += `<polygon points="${x + w},${top} ${x + w + ox},${top - oy} ${x + w - bi + ox * 0.7},${FY - oy * 0.7} ${x + w - bi},${FY}" fill="${f.dark}"/>`;
      s += `<polygon points="${x},${top} ${x + w},${top} ${x + w - bi},${FY} ${x + bi},${FY}" fill="${fill}"/>`;
      s += `<polygon points="${x},${top} ${x + w},${top} ${x + w + ox},${top - oy} ${x + ox},${top - oy}" fill="${f.color}"/>`;
      s += `<polygon points="${x + 3},${top - 0.6} ${x + w - 3},${top - 0.6} ${x + w + ox - 3},${top - oy + 0.6} ${x + ox + 3},${top - oy + 0.6}" class="vz-soil"/>`;
      plantBase = { x0: x + w * 0.1 + ox * 0.4, x1: x + w * 0.9 + ox * 0.4, y: top - oy * 0.5 };
    } else {
      const ry = Math.max(2, w * 0.1);
      let body;
      if (shape === 'cyl') {
        body = `M${x},${top} L${x + w},${top} L${x + w},${FY} L${x},${FY} Z`;
      } else if (shape === 'taperRound') {
        body = `M${x},${top} C${x + w * 0.02},${top + h * 0.5} ${x + w * 0.12},${FY - h * 0.1} ${x + w * 0.19},${FY} L${x + w * 0.81},${FY} C${x + w * 0.88},${FY - h * 0.1} ${x + w * 0.98},${top + h * 0.5} ${x + w},${top} Z`;
      } else if (shape === 'egg') {
        body = `M${x + w * 0.07},${top} C${x - w * 0.03},${top + h * 0.38} ${x + w * 0.04},${top + h * 0.86} ${x + w * 0.24},${FY} L${x + w * 0.76},${FY} C${x + w * 0.96},${top + h * 0.86} ${x + w * 1.03},${top + h * 0.38} ${x + w * 0.93},${top} Z`;
      } else if (shape === 'sphere') {
        body = `M${x + w * 0.16},${top} C${x - w * 0.06},${top + h * 0.3} ${x - w * 0.02},${FY - h * 0.08} ${x + w * 0.3},${FY} L${x + w * 0.7},${FY} C${x + w * 1.02},${FY - h * 0.08} ${x + w * 1.06},${top + h * 0.3} ${x + w * 0.84},${top} Z`;
      } else { // bowl
        body = `M${x},${top} C${x},${top + h * 0.78} ${x + w * 0.2},${FY} ${x + w * 0.34},${FY} L${x + w * 0.66},${FY} C${x + w * 0.8},${FY} ${x + w},${top + h * 0.78} ${x + w},${top} Z`;
      }
      const inset = shape === 'egg' ? w * 0.07 : shape === 'sphere' ? w * 0.16 : 0;
      s += `<path d="${body}" fill="${fill}"/>`;
      s += `<ellipse cx="${x + w / 2}" cy="${top}" rx="${w / 2 - inset}" ry="${ry * (1 - inset / w)}" fill="${f.color}"/>`;
      s += `<ellipse cx="${x + w / 2}" cy="${top + 0.4}" rx="${w / 2 - inset - Math.max(1.5, w * 0.04)}" ry="${ry * (1 - inset / w) * 0.75}" class="vz-soil"/>`;
      plantBase = { x0: x + inset + w * 0.1, x1: x + w - inset - w * 0.1, y: top };
    }
    if (opts.plants && !p.noViz && p.cats.indexOf('access') === -1) s += plantSVG(plantBase, w, h, idx);
    return s;
  }

  function plantSVG(b, w, h, idx) {
    const r = rng(idx + 3 + Math.round(w));
    const span = b.x1 - b.x0;
    const kind = idx % 3;
    const ph = Math.max(22, Math.min(95, h * 0.55 + w * 0.22));
    let s = '';
    if (kind === 0) { // ornamental grass
      const n = Math.max(7, Math.min(34, Math.round(span / 3)));
      for (let i = 0; i < n; i++) {
        const bx = b.x0 + r() * span, hh = ph * (0.55 + r() * 0.5), lean = (r() - 0.5) * hh * 0.7;
        s += `<path d="M${bx},${b.y} Q${bx + lean * 0.3},${b.y - hh * 0.6} ${bx + lean},${b.y - hh}" class="vz-blade${i % 2}" stroke-width="${1.1 + r() * 0.8}" fill="none" stroke-linecap="round"/>`;
      }
    } else { // shrub, flowering on every third pot
      const n = Math.max(4, Math.min(16, Math.round(span / 7)));
      const rr = Math.max(5, Math.min(16, span / 4.2));
      for (let i = 0; i < n; i++) {
        const cx = b.x0 + rr * 0.5 + r() * Math.max(1, span - rr), cy = b.y - rr * 0.5 - r() * ph * 0.55;
        s += `<circle cx="${cx}" cy="${cy}" r="${rr * (0.6 + r() * 0.5)}" class="vz-leaf${i % 3}"/>`;
      }
      if (kind === 2) {
        for (let i = 0; i < n * 2; i++) {
          s += `<circle cx="${b.x0 + r() * span}" cy="${b.y - rr * 0.4 - r() * ph * 0.7}" r="${1.4 + r() * 1.4}" class="vz-flower${i % 2}"/>`;
        }
      }
    }
    return `<g class="vz-plant">${s}</g>`;
  }

  /* ---------- background ---------- */
  function backgroundSVG(SW, opts) {
    let s = '';
    s += `<rect x="0" y="0" width="${SW}" height="${FY}" class="vz-wall"/>`;
    // open side: sky + skyline
    s += `<rect x="${SCREEN_W}" y="10" width="${SW - SCREEN_W}" height="${FY - 10}" fill="url(#vz-sky)"/>`;
    const r = rng(7); let bx = SCREEN_W + 6;
    while (bx < SW) {
      const bw = 22 + r() * 40, bh = 40 + r() * 95;
      s += `<rect x="${bx}" y="${FY - 60 - bh}" width="${bw}" height="${bh + 60}" class="vz-city${Math.floor(r() * 2)}"/>`;
      for (let wy = FY - 52 - bh; wy < FY - 70; wy += 11) for (let wx = bx + 4; wx < bx + bw - 6; wx += 9)
        if (r() > 0.55) s += `<rect x="${wx}" y="${wy}" width="4" height="5" class="vz-win"/>`;
      bx += bw + 4 + r() * 10;
    }
    // slatted wooden privacy screen
    s += `<rect x="0" y="10" width="${SCREEN_W}" height="${FY - 10}" class="vz-screen"/>`;
    for (let y = 16; y < FY - 4; y += 9) s += `<rect x="0" y="${y}" width="${SCREEN_W}" height="6" class="vz-slat"/>`;
    s += `<rect x="${SCREEN_W - 4}" y="10" width="5" height="${FY - 10}" class="vz-post"/>`;
    // glass railing, 105 cm
    const rt = FY - 105;
    s += `<rect x="${SCREEN_W}" y="${rt}" width="${SW - SCREEN_W}" height="105" fill="url(#vz-glass)" class="vz-glass"/>`;
    for (let px = SCREEN_W + 100; px < SW; px += 120) s += `<rect x="${px}" y="${rt}" width="2.5" height="105" class="vz-rail"/>`;
    s += `<rect x="${SCREEN_W}" y="${rt - 2}" width="${SW - SCREEN_W}" height="3.5" class="vz-rail"/>`;
    // ceiling + string lights
    s += `<rect x="0" y="0" width="${SW}" height="10" class="vz-ceiling"/>`;
    const P0 = { x: 0, y: 14 }, P1 = { x: SW / 2, y: 44 }, P2 = { x: SW, y: 12 };
    s += `<path d="M${P0.x},${P0.y} Q${P1.x},${P1.y} ${P2.x},${P2.y}" class="vz-wire" fill="none"/>`;
    const n = Math.round(SW / 26);
    for (let i = 1; i < n; i++) {
      const t = i / n, x = (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x, y = (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;
      s += `<circle cx="${x}" cy="${y + 4}" r="7" fill="url(#vz-bulb)"/><circle cx="${x}" cy="${y + 4}" r="1.6" fill="#fff4d6"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 2.5}" class="vz-wire"/>`;
    }
    // floor deck
    s += `<rect x="0" y="${FY}" width="${SW}" height="${SH - FY}" class="vz-floor"/>`;
    for (let y = FY + 7; y < SH; y += 8) s += `<line x1="0" y1="${y}" x2="${SW}" y2="${y}" class="vz-plank"/>`;
    return s;
  }

  function chairSVG(cx) {
    const w = 92, hh = 122, bottom = FY - 42, top = bottom - hh;
    return `<g class="vz-ref">
      <line x1="${cx}" y1="10" x2="${cx}" y2="${top + 6}" class="vz-chain"/>
      <path d="M${cx},${top} C${cx + w * 0.62},${top} ${cx + w * 0.55},${bottom} ${cx},${bottom} C${cx - w * 0.55},${bottom} ${cx - w * 0.62},${top} ${cx},${top} Z" class="vz-rattan"/>
      <path d="M${cx - w * 0.36},${top + hh * 0.45} C${cx - w * 0.36},${bottom - 6} ${cx + w * 0.36},${bottom - 6} ${cx + w * 0.36},${top + hh * 0.45} C${cx + w * 0.2},${top + hh * 0.32} ${cx - w * 0.2},${top + hh * 0.32} ${cx - w * 0.36},${top + hh * 0.45} Z" class="vz-cushion"/>
      <rect x="${cx - 13}" y="${top + hh * 0.52}" width="26" height="16" rx="4" class="vz-pillow"/>
    </g>`;
  }

  function personSVG(x) {
    const H = 170, top = FY - H;
    return `<g class="vz-person">
      <circle cx="${x}" cy="${top + 11}" r="10.5"/>
      <path d="M${x - 19},${top + 30} Q${x},${top + 23} ${x + 19},${top + 30} L${x + 17},${top + 92} L${x - 17},${top + 92} Z"/>
      <rect x="${x - 26}" y="${top + 30}" width="8" height="58" rx="4"/>
      <rect x="${x + 18}" y="${top + 30}" width="8" height="58" rx="4"/>
      <rect x="${x - 15}" y="${top + 88}" width="13" height="${H - 88}" rx="4"/>
      <rect x="${x + 2}" y="${top + 88}" width="13" height="${H - 88}" rx="4"/>
      <line x1="${x + 34}" y1="${top}" x2="${x + 34}" y2="${FY}" class="vz-dimline"/>
      <line x1="${x + 30}" y1="${top}" x2="${x + 38}" y2="${top}" class="vz-dimline"/>
      <text x="${x + 38}" y="${top + 4}" class="vz-dimtext" text-anchor="start" style="direction:ltr">170</text>
    </g>`;
  }

  function rulerSVG() {
    let s = `<g class="vz-ruler"><rect x="0" y="${FY - 200}" width="11" height="200" class="vz-rulerbg"/>`;
    for (let c = 0; c <= 200; c += 10) {
      const y = FY - c, big = c % 50 === 0;
      s += `<line x1="${11 - (big ? 7 : 4)}" y1="${y}" x2="11" y2="${y}" class="vz-tick"/>`;
      if (big && c > 0) s += `<text x="1" y="${y + 3.4}" class="vz-ticktext" style="direction:ltr">${c}</text>`;
    }
    return s + '</g>';
  }

  function dimsSVG(x, w, h, d, label) {
    const y = FY + 11;
    let s = `<g class="vz-dims">`;
    s += `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" class="vz-dimline"/>`;
    s += `<line x1="${x}" y1="${y - 4}" x2="${x}" y2="${y + 4}" class="vz-dimline"/><line x1="${x + w}" y1="${y - 4}" x2="${x + w}" y2="${y + 4}" class="vz-dimline"/>`;
    s += `<text x="${x + w / 2}" y="${y + 13}" text-anchor="middle" class="vz-dimtext">${label}</text>`;
    const hx = x - 4.5;
    s += `<line x1="${hx}" y1="${FY - h}" x2="${hx}" y2="${FY}" class="vz-dimline vz-dimh"/>`;
    s += `<line x1="${hx - 3}" y1="${FY - h}" x2="${hx + 3}" y2="${FY - h}" class="vz-dimline vz-dimh"/>`;
    return s + '</g>';
  }

  /* ---------- scene ---------- */
  function layout(items) {
    let x = 30; const out = [];
    items.forEach(it => {
      const { w, d, h } = VT.parseDim(it.dim);
      const p = product(it.pid);
      const ox = (p.shape === 'box' || p.shape === 'taper' || p.shape === 'stand') ? Math.min(d, 80) * 0.28 : 0;
      out.push({ it, x, w, d, h });
      x += w + ox + 18;
    });
    return { placed: out, end: x };
  }

  function sceneSVG(items, opts) {
    const L = layout(items);
    const chairX = Math.max(L.end + 62, 292);
    const personX = chairX + 90;
    const SW = Math.max(430, (opts.person ? personX + 66 : chairX + 66));
    const uid = 'vzs' + (++sceneCount);
    const what = items.length ? items.map(it => itemName(it) + ', ' + VT.dimLong(it.dim, product(it.pid).shape) + ', ' + finishOf(it.finish).name).join('; ') : 'המרפסת ריקה';
    let s = `<svg xmlns="${NS}" viewBox="0 0 ${SW} ${SH}" role="img" aria-labelledby="${uid}-t ${uid}-d" class="vz-svg" style="aspect-ratio:${SW}/${SH}">`;
    s += `<title id="${uid}-t">${opts.title || 'הדמיית מרפסת בקנה מידה אמיתי'}</title><desc id="${uid}-d">מעקה זכוכית בגובה 105 ס״מ${opts.person ? ', דמות בגובה 170 ס״מ' : ''}. על המרפסת: ${what}.</desc>`;
    s += gradDefs() + backgroundSVG(SW, opts) + chairSVG(chairX);
    if (opts.person) s += personSVG(personX);
    L.placed.forEach((pl, i) => { s += planterSVG(pl.it, pl.x, i, opts); });
    if (opts.dims) L.placed.forEach(pl => {
      const lab = pl.it.dim.split('/').length === 3 ? `${pl.w} × ${pl.d} × ${pl.h}` : `⌀${pl.w} × ${pl.h}`;
      s += dimsSVG(pl.x, pl.w, pl.h, pl.d, lab);
    });
    s += rulerSVG();
    s += `<text x="${SCREEN_W + 6}" y="${FY - 109}" class="vz-note">מעקה 105</text>`;
    return s + '</svg>';
  }

  /* ---------- interactive widget ---------- */
  const instances = [];
  let sceneCount = 0;

  function optionList() {
    let o = '';
    VT.products.filter(p => !p.noViz).forEach(p => {
      const dims = [...new Set([...(p.sizes || []).map(s => s.dim), ...((p.set && p.set.dims) || [])])];
      o += `<optgroup label="${p.title}${p.code ? ' · ' + p.code : ''}">`;
      dims.forEach(d => { o += `<option value="${p.id}|${d}">${VT.dimLong(d, p.shape)}</option>`; });
      o += '</optgroup>';
    });
    return o;
  }

  function itemName(it) {
    const p = product(it.pid);
    return p.title + (p.code ? ' ' + p.code : '');
  }

  function mount(root, cfg) {
    cfg = Object.assign({ interactive: true, items: DEFAULT_ITEMS }, cfg || {});
    const st = { items: cfg.items.map(x => Object.assign({}, x)), plants: true, dims: true, person: !!cfg.person };
    const uid = 'vz' + instances.length;
    root.classList.add('vz');
    root.innerHTML = `
      <div class="vz-stage" tabindex="0" aria-label="הדמיה, ניתן לגלול לצדדים"><div class="vz-canvas"></div></div>
      ${cfg.interactive ? `
      <div class="vz-panel">
        <div class="vz-row vz-toggles" role="group" aria-label="תצוגה">
          <label class="vz-check"><input type="checkbox" id="${uid}-plants" checked> צמחים</label>
          <label class="vz-check"><input type="checkbox" id="${uid}-dims" checked> מידות</label>
          <label class="vz-check"><input type="checkbox" id="${uid}-person" ${st.person ? 'checked' : ''}> דמות בגובה 1.70 מ׳</label>
        </div>
        <ul class="vz-items" aria-label="מה על המרפסת"></ul>
        <p class="sr" role="status" id="${uid}-status"></p>
        <form class="vz-add">
          <label for="${uid}-sel" class="vz-lbl">הוסיפו עציץ למרפסת</label>
          <div class="vz-addrow">
            <select id="${uid}-sel">${optionList()}</select>
            <select id="${uid}-fin" aria-label="גוון"></select>
            <button type="submit" class="btn btn-solid btn-sm">הוספה</button>
          </div>
        </form>
        <div class="vz-row vz-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="reset">חזרה לדוגמה (2 × 80/23/40)</button>
          <button type="button" class="btn btn-ghost btn-sm" data-act="clear">ניקוי המרפסת</button>
          <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" data-act="wa">שליחת ההרכב בוואטסאפ</a>
        </div>
      </div>` : ''}`;

    const canvas = root.querySelector('.vz-canvas');
    const inst = { root, st, render };

    function fillFinishes() {
      const sel = root.querySelector(`#${uid}-sel`), fin = root.querySelector(`#${uid}-fin`);
      if (!sel) return;
      const p = product(sel.value.split('|')[0]);
      const list = p.finishes.length ? p.finishes : ['C'];
      fin.innerHTML = list.map(c => `<option value="${c}">${VT.finishes[c].name}</option>`).join('');
    }

    function render() {
      canvas.innerHTML = sceneSVG(st.items, st);
      if (!cfg.interactive) return;
      const ul = root.querySelector('.vz-items');
      ul.innerHTML = st.items.length ? st.items.map((it, i) => {
        const p = product(it.pid); const list = p.finishes.length ? p.finishes : ['C'];
        return `<li>
          <span class="vz-dot" style="background:${finishOf(it.finish).color}"></span>
          <span class="vz-iname">${itemName(it)} <b class="dimv">${VT.dimShort(it.dim)}</b> <small>ס״מ</small></span>
          <select aria-label="גוון" data-i="${i}" class="vz-ifin">${list.map(c => `<option value="${c}" ${c === it.finish ? 'selected' : ''}>${VT.finishes[c].name}</option>`).join('')}</select>
          <button type="button" class="vz-x" data-rm="${i}" aria-label="הסרת ${itemName(it)} ${VT.dimShort(it.dim)} מהמרפסת">×</button></li>`;
      }).join('') : '<li class="vz-empty">המרפסת ריקה. בחרו עציץ מהרשימה למטה או לחצו "במרפסת" ליד כל מידה במחירון.</li>';
      const wa = root.querySelector('[data-act="wa"]');
      const text = 'שלום וילה טוסקנה, בניתי הרכב למרפסת:\n' + st.items.map(it => `• ${itemName(it)} ${it.dim} ס״מ, ${finishOf(it.finish).name}`).join('\n') + '\nאשמח לפרטים על מלאי וזמינות.';
      wa.href = VT.waLink(text);
    }

    if (cfg.interactive) {
      const g = id => root.querySelector(`#${uid}-${id}`);
      g('plants').addEventListener('change', e => { st.plants = e.target.checked; render(); });
      g('dims').addEventListener('change', e => { st.dims = e.target.checked; render(); });
      g('person').addEventListener('change', e => { st.person = e.target.checked; render(); });
      g('sel').addEventListener('change', fillFinishes);
      g('sel').value = 'p9|100/31/50'; fillFinishes();
      root.querySelector('.vz-add').addEventListener('submit', e => {
        e.preventDefault();
        const [pid, dim] = g('sel').value.split('|');
        add(inst, pid, dim, g('fin').value);
      });
      root.addEventListener('click', e => {
        const rm = e.target.closest('[data-rm]');
        if (rm) { st.items.splice(+rm.dataset.rm, 1); render(); return; }
        const act = e.target.closest('[data-act]');
        if (!act) return;
        if (act.dataset.act === 'reset') { st.items = DEFAULT_ITEMS.map(x => Object.assign({}, x)); render(); }
        if (act.dataset.act === 'clear') { st.items = []; render(); }
      });
      root.addEventListener('change', e => {
        if (e.target.classList.contains('vz-ifin')) { st.items[+e.target.dataset.i].finish = e.target.value; render(); }
      });
    }
    render();
    instances.push(inst);
    return inst;
  }

  function add(inst, pid, dim, finish) {
    const p = product(pid);
    if (!p) return;
    const fin = finish || (p.finishes[0] || 'C');
    inst.st.items.push({ pid, dim, finish: fin });
    if (inst.st.items.length > 6) inst.st.items.shift();
    inst.render();
    const status = inst.root.querySelector('[role="status"]');
    if (status) status.textContent = `${itemName({ pid })} ${VT.dimShort(dim)} ס״מ נוסף למרפסת`;
  }

  /* used by the catalogue's "במרפסת" buttons */
  function addItem(pid, dim, finish) {
    const inst = instances.find(i => i.root.id === 'balcony-viz') || instances[0];
    if (!inst) return;
    add(inst, pid, dim, finish);
    const target = document.getElementById('balcony') || inst.root;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  /* tiny to-scale silhouette for a size row. Every icon shares one scale (120 cm = 46 px),
     so a glance down the price list compares real sizes. Anything over 120 cm is clipped at the top. */
  function miniIcon(shape, dim) {
    const { w, h } = VT.parseDim(dim);
    const k = 46 / 120, W = Math.min(58, Math.max(3, w * k)), H = Math.min(46, Math.max(3, h * k));
    const x = (60 - W) / 2, y = 46 - H, B = 46;
    let path;
    if (shape === 'taper') path = `M${x},${y} L${x + W},${y} L${x + W * 0.86},${B} L${x + W * 0.14},${B} Z`;
    else if (shape === 'taperRound') path = `M${x},${y} L${x + W},${y} Q${x + W * 0.9},${B} ${x + W * 0.8},${B} L${x + W * 0.2},${B} Q${x + W * 0.1},${B} ${x},${y} Z`;
    else if (shape === 'egg' || shape === 'sphere') path = `M${x + W * 0.08},${y} C${x - W * 0.04},${y + H * 0.5} ${x + W * 0.1},${B} ${x + W * 0.3},${B} L${x + W * 0.7},${B} C${x + W * 0.9},${B} ${x + W * 1.04},${y + H * 0.5} ${x + W * 0.92},${y} Z`;
    else if (shape === 'bowl') path = `M${x},${y} C${x},${y + H * 0.8} ${x + W * 0.25},${B} ${x + W * 0.35},${B} L${x + W * 0.65},${B} C${x + W * 0.75},${B} ${x + W},${y + H * 0.8} ${x + W},${y} Z`;
    else path = `M${x},${y} H${x + W} V${B} H${x} Z`;
    return `<svg class="mini" viewBox="0 0 60 48" aria-hidden="true"><line x1="0" y1="46.5" x2="60" y2="46.5" class="mini-floor"/><path d="${path}" class="mini-shape"/></svg>`;
  }

  window.VTViz = { mount, addItem, miniIcon, sceneSVG };
})();
