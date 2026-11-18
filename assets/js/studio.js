/* Balcony Studio: the shop's real product photos (background removed, never redrawn) placed on a
   calibrated balcony photo at true scale, with perspective.
   Drives studio.html (#studio) and the home-page teaser ([data-teaser]).
   Scene maths and calibration data: VT.studio in data.js. All positions are in scene pixels:
   x = centre of the item, y = the floor line it stands on. */
window.VTStudio = (function () {
  const VT = window.VT;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PERSON = { id: 'person', cm: 170, w: 60 };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  let uidN = 0;

  /* ---------- catalogue lookups ---------- */
  const entry = id => VT.studio.items.find(i => i.id === id);
  const prodOf = it => it.pid ? VT.products.find(p => p.id === it.pid) : null;
  function info(it) {
    const p = prodOf(it);
    const sizes = it.set ? [{ dim: p.set.dims.join(' + '), price: p.set.price, label: p.set.label }] : (p ? p.sizes : it.sizes);
    return {
      title: p ? p.title : it.title, code: p ? p.code : it.code, shape: p ? p.shape : it.shape, sizes,
      finish: it.finishName || (it.finish ? VT.finishes[it.finish].name : ''),
      url: p ? VT.modelUrl(p) : it.shop, external: !p,
      key: dim => p ? `${p.id}|${it.set ? 'set' : dim}` : null
    };
  }
  const nameOf = it => { const i = info(it); return i.title + (i.code ? ' ' + i.code : ''); };
  function cutFor(it, dim) {
    if (!it.cuts) return it.cut;
    if (it.cuts[dim]) return Object.assign({ at: dim }, it.cuts[dim]);
    const h = VT.parseDim(dim).h; // nearest photographed size by height
    const k = Object.keys(it.cuts).sort((a, b) => Math.abs(VT.parseDim(a).h - h) - Math.abs(VT.parseDim(b).h - h))[0];
    return Object.assign({ at: k }, it.cuts[k]);
  }
  const heights = (it, dim) => it.set ? prodOf(it).set.dims.map(d => VT.parseDim(d).h) : [VT.parseDim(dim).h];
  /* the whole cut-out image, in cm, at this size */
  function cutCm(it, dim) {
    const c = cutFor(it, dim);
    const k = (it.set ? VT.parseDim(c.at).h : VT.parseDim(dim).h) / c.px; // cm per image pixel
    return { c, w: c.w * k, h: c.h * k };
  }
  const priceOf = (it, dim) => { const s = info(it).sizes.find(x => x.dim === dim) || info(it).sizes[0]; return s; };

  /* ---------- perspective ---------- */
  const s0 = sc => (sc.base - sc.railTop) / sc.refCm;
  function scaleAt(sc, y) {
    if (sc.horizon == null) return s0(sc);
    return s0(sc) * Math.max(0.05, (y - sc.horizon) / (sc.base - sc.horizon));
  }
  const floorMin = sc => sc.floorMin != null ? sc.floorMin : sc.base;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* box of an item in scene pixels */
  function box(sc, it) {
    const k = scaleAt(sc, it.y);
    if (it.id === PERSON.id) { const h = PERSON.cm * k; return { x: it.x - h * PERSON.w / 340, y: it.y - h, w: h * PERSON.w / 170, h }; }
    const cm = cutCm(entry(it.id), it.dim);
    return { x: it.x - cm.w * k / 2, y: it.y - cm.h * k, w: cm.w * k, h: cm.h * k, src: VT.IMG + cm.c.img };
  }

  /* an architectural scale figure, 170 cm tall, drawn in a 60 x 170 box (1 unit = 1 cm) */
  const PERSON_PATH = 'M30,0C35.2,0 39,4.6 39,10.6C39,16.6 35.2,21 30,21C24.8,21 21,16.6 21,10.6C21,4.6 24.8,0 30,0Z'
    + 'M26.5,19H33.5V28H26.5Z'
    + 'M14,30Q30,24 46,30L44.5,62Q43.5,80 42.5,98L17.5,98Q16.5,80 15.5,62Z'
    + 'M14,30Q9,32 8.5,44L7.5,92Q7.5,98 10.5,98Q13,98 13,93L14.8,50Z'
    + 'M46,30Q51,32 51.5,44L52.5,92Q52.5,98 49.5,98Q47,98 47,93L45.2,50Z'
    + 'M18,96L29.5,96L28.6,164Q28.6,170 24.2,170L19.6,170Q17.6,170 18.3,166Z'
    + 'M30.5,96L42,96L41.7,166Q42.4,170 40.4,170L35.8,170Q31.4,170 31.4,164Z';
  const PERSON_SVG = `<svg viewBox="0 0 60 170" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="st-person-fill" d="${PERSON_PATH}"/></svg>`;

  function tagText(it) {
    if (it.id === PERSON.id) return { short: '170', long: 'דמות בגובה 170 ס״מ' };
    const hs = heights(entry(it.id), it.dim);
    return { short: hs.join(' / '), long: 'גובה ' + hs.join(' ו־') + ' ס״מ' };
  }

  /* ================= the stage ================= */
  function create(host, opts) {
    const st = { scene: opts.scene, items: [], dims: opts.dims !== false, person: null, sel: null, calib: null };
    const interactive = !!opts.interactive;
    host.innerHTML = `<div class="st-stage" data-scene="${opts.scene.id}">
        <img class="st-bg" alt="" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        <div class="st-ruler" aria-hidden="true"><span class="st-ruler-t"></span></div>
        <div class="st-layer"></div>
        <div class="st-calib" hidden aria-hidden="true"><span class="st-cpt a"></span><span class="st-cpt b"></span><span class="st-cline"></span></div>
      </div>`;
    const stage = $('.st-stage', host), bg = $('.st-bg', host), layer = $('.st-layer', host), ruler = $('.st-ruler', host);
    const nodes = new Map();

    function pct(v, of) { return (v / of * 100).toFixed(3) + '%'; }
    function setScene(sc) {
      const prev = st.scene;
      // keep every item at the same relative spot on the new scene's floor
      if (prev && prev !== sc) st.items.forEach(it => {
        const ty = clamp((it.y - floorMin(prev)) / (prev.h - floorMin(prev)), 0, 1);
        it.x = it.x / prev.w * sc.w; it.y = floorMin(sc) + ty * (sc.h - floorMin(sc));
      });
      st.scene = sc;
      stage.dataset.scene = sc.id;
      stage.style.aspectRatio = sc.w + ' / ' + sc.h;
      host.style.setProperty('--ar', (sc.w / sc.h).toFixed(4));
      host.classList.toggle('portrait', sc.w / sc.h < 1.3);
      bg.src = sc.img.startsWith('blob:') || sc.img.startsWith('data:') ? sc.img : VT.IMG + sc.img;
      bg.alt = opts.bgAlt ? opts.bgAlt(sc) : '';
      renderAll();
    }
    function place(el, it) {
      const sc = st.scene, b = box(sc, it);
      el.style.left = pct(b.x, sc.w); el.style.top = pct(b.y, sc.h);
      el.style.width = pct(b.w, sc.w); el.style.height = pct(b.h, sc.h);
      el.style.zIndex = 10 + Math.round(it.y);
    }
    function label(it) {
      if (it.id === PERSON.id) return 'דמות בגובה 170 ס״מ, להשוואה';
      return `${nameOf(entry(it.id))}, ${VT.dimLong(it.dim.split(' + ')[0], info(entry(it.id)).shape)}${entry(it.id).set ? ' ועוד יחידה' : ''}`;
    }
    function nodeFor(it) {
      let el = nodes.get(it.uid);
      if (!el) {
        el = document.createElement(interactive ? 'button' : 'div');
        if (interactive) { el.type = 'button'; el.setAttribute('aria-describedby', host.id + '-help'); }
        el.className = 'st-item' + (it.id === PERSON.id ? ' st-person' : '');
        el.dataset.uid = it.uid;
        layer.appendChild(el);
        nodes.set(it.uid, el);
      }
      const k = it.id + '|' + it.dim;
      if (el.dataset.k !== k) {
        el.dataset.k = k;
        const t = tagText(it);
        el.innerHTML = (it.id === PERSON.id ? PERSON_SVG : `<img src="${box(st.scene, it).src}" alt="" draggable="false" decoding="async">`)
          + `<span class="st-meas" aria-hidden="true"><span class="st-tag"><span class="num">${t.short}</span> ס״מ</span></span>`;
        if (interactive) el.setAttribute('aria-label', label(it));
      }
      if (interactive) el.setAttribute('aria-pressed', String(st.sel === it.uid));
      place(el, it);
      return el;
    }
    function renderAll() {
      const live = new Set(st.items.map(i => i.uid));
      nodes.forEach((el, uid) => { if (!live.has(uid)) { el.remove(); nodes.delete(uid); } });
      st.items.forEach(nodeFor);
      stage.classList.toggle('show-dims', st.dims);
      const sc = st.scene;
      ruler.hidden = !(st.dims && sc.rulerX != null);
      if (!ruler.hidden) {
        ruler.style.left = pct(sc.rulerX, sc.w); ruler.style.top = pct(sc.railTop, sc.h);
        ruler.style.height = pct(sc.base - sc.railTop, sc.h);
        ruler.classList.toggle('flip', sc.rulerX > sc.w / 2);
        $('.st-ruler-t', ruler).innerHTML = `<span class="num">${sc.refCm}</span> ס״מ`;
      }
    }
    function changed() { renderAll(); if (opts.onChange) opts.onChange(api); }

    /* ---------- items ---------- */
    function add(id, dim, x, y, silent) {
      const sc = st.scene, n = st.items.filter(i => i.id !== PERSON.id).length;
      const it = {
        uid: ++uidN, id, dim,
        // a new item lands in front of the others, so it is never hidden behind them
        x: x != null ? x : sc.w * (0.42 + ((n % 4) - 1.5) * 0.08),
        y: y != null ? y : floorMin(sc) + (sc.h - floorMin(sc)) * Math.min(0.9, 0.5 + (n % 4) * 0.12)
      };
      st.items.push(it);
      if (!silent) { st.sel = interactive ? it.uid : null; changed(); }
      return it;
    }
    function remove(uid) {
      st.items = st.items.filter(i => i.uid !== uid);
      if (st.person && st.person.uid === uid) st.person = null;
      if (st.sel === uid) st.sel = null;
      changed();
    }
    function setPerson(on) {
      if (on && !st.person) {
        const sc = st.scene;
        st.person = { uid: ++uidN, id: PERSON.id, x: sc.w * (opts.personX || 0.18), y: floorMin(sc) + (sc.h - floorMin(sc)) * (opts.personY != null ? opts.personY : 0.18) };
        st.items.push(st.person);
      } else if (!on && st.person) { st.items = st.items.filter(i => i !== st.person); st.person = null; }
      changed();
    }
    const find = uid => st.items.find(i => i.uid === +uid);

    /* ---------- pointer: drag, tap to select, tap the floor to move the selected item ---------- */
    function toScene(e) {
      const r = stage.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * st.scene.w, y: (e.clientY - r.top) / r.height * st.scene.h };
    }
    if (interactive) {
      let drag = null;
      stage.addEventListener('pointerdown', e => {
        if (e.button !== 0 || st.calib) return;
        const el = e.target.closest('.st-item'); if (!el) return;
        const it = find(el.dataset.uid), p = toScene(e);
        drag = { it, el, dx: it.x - p.x, dy: it.y - p.y, sx: e.clientX, sy: e.clientY, moved: false };
        el.setPointerCapture(e.pointerId);
        el.classList.add('dragging');
      });
      stage.addEventListener('pointermove', e => {
        if (!drag) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
        drag.moved = true;
        const p = toScene(e), sc = st.scene;
        drag.it.x = clamp(p.x + drag.dx, 0, sc.w);
        drag.it.y = clamp(p.y + drag.dy, floorMin(sc), sc.h);
        place(drag.el, drag.it);
      });
      const end = () => {
        if (!drag) return;
        const d = drag; drag = null;
        d.el.classList.remove('dragging');
        st.sel = d.moved ? d.it.uid : (st.sel === d.it.uid ? null : d.it.uid);
        changed();
        const el = nodes.get(d.it.uid); if (el) el.focus({ preventScroll: true });
      };
      stage.addEventListener('pointerup', end);
      stage.addEventListener('pointercancel', end);
      stage.addEventListener('click', e => {
        if (e.target.closest('.st-item')) return;
        const p = toScene(e);
        if (st.calib) { calibClick(p); return; }
        const it = st.sel && find(st.sel); if (!it) return;
        it.x = clamp(p.x, 0, st.scene.w); it.y = clamp(p.y, floorMin(st.scene), st.scene.h);
        changed();
        if (opts.announce) opts.announce('הפריט הוזז');
      });
      stage.addEventListener('keydown', e => {
        const el = e.target.closest('.st-item'); if (!el) return;
        const it = find(el.dataset.uid), sc = st.scene;
        const fx = sc.w * (e.shiftKey ? 0.005 : 0.025), fy = (sc.h - floorMin(sc)) * (e.shiftKey ? 0.01 : 0.05);
        const k = e.key;
        if (k === 'ArrowLeft') it.x = clamp(it.x - fx, 0, sc.w);
        else if (k === 'ArrowRight') it.x = clamp(it.x + fx, 0, sc.w);
        else if (k === 'ArrowUp') it.y = clamp(it.y - fy, floorMin(sc), sc.h);
        else if (k === 'ArrowDown') it.y = clamp(it.y + fy, floorMin(sc), sc.h);
        else if (k === 'Delete' || k === 'Backspace') {
          e.preventDefault();
          if (it.id === PERSON.id) { if (opts.onPersonOff) opts.onPersonOff(); setPerson(false); } else remove(it.uid);
          if (opts.announce) opts.announce('הפריט הוסר');
          return;
        } else if (k === 'Escape') { st.sel = null; changed(); return; }
        else return;
        e.preventDefault();
        st.sel = it.uid;
        place(el, it); el.setAttribute('aria-pressed', 'true');
        if (opts.onChange) opts.onChange(api);
      });
    }

    /* ---------- calibration of an uploaded photo: two points on something of known height ---------- */
    const cal = $('.st-calib', host);
    function calibStart(onUpdate) {
      const sc = st.scene;
      st.calib = { a: { x: sc.w * 0.8, y: sc.h * 0.72 }, b: { x: sc.w * 0.8, y: sc.h * 0.42 }, next: 'a', onUpdate };
      cal.hidden = false; stage.classList.add('calibrating'); calibDraw();
    }
    function calibClick(p) {
      const c = st.calib;
      c[c.next] = { x: p.x, y: p.y };
      if (c.next === 'a') c.b.x = p.x; else c.a.x = p.x;
      c.next = c.next === 'a' ? 'b' : 'a';
      calibDraw();
    }
    function calibSet(which, yPct) { const c = st.calib; if (!c) return; c[which].y = st.scene.h * yPct / 100; calibDraw(); }
    function calibDraw() {
      const c = st.calib, sc = st.scene; if (!c) return;
      const pa = $('.st-cpt.a', cal), pb = $('.st-cpt.b', cal), ln = $('.st-cline', cal);
      pa.style.left = pct(c.a.x, sc.w); pa.style.top = pct(c.a.y, sc.h);
      pb.style.left = pct(c.b.x, sc.w); pb.style.top = pct(c.b.y, sc.h);
      ln.style.left = pct(c.a.x, sc.w);
      ln.style.top = pct(Math.min(c.a.y, c.b.y), sc.h); ln.style.height = pct(Math.abs(c.a.y - c.b.y), sc.h);
      if (c.onUpdate) c.onUpdate({ a: c.a.y / sc.h * 100, b: c.b.y / sc.h * 100, next: c.next });
    }
    function calibDone(cm) {
      const c = st.calib, sc = st.scene; if (!c) return;
      const lo = Math.max(c.a.y, c.b.y), hi = Math.min(c.a.y, c.b.y);
      if (lo - hi < sc.h * 0.02) return false;
      Object.assign(sc, { base: lo, railTop: hi, refCm: cm, horizon: null, floorMin: Math.min(lo, sc.h * 0.35), rulerX: c.a.x });
      st.calib = null; cal.hidden = true; stage.classList.remove('calibrating');
      st.items.forEach(it => { it.y = clamp(it.y, floorMin(sc), sc.h); });
      changed();
      return true;
    }

    /* ---------- export: the scene as a JPEG, labelled ---------- */
    const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
    async function exportBlob() {
      const sc = st.scene, f = Math.min(1, 1600 / sc.w), W = Math.round(sc.w * f), H = Math.round(sc.h * f), band = Math.round(56 * Math.max(1, W / 1344));
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H + band;
      const g = cv.getContext('2d');
      g.drawImage(await loadImg(bg.currentSrc || bg.src), 0, 0, W, H);
      g.scale(f, f);
      const css = getComputedStyle(stage);
      const tone = css.getPropertyValue('--st-tone').trim();
      for (const it of st.items.slice().sort((a, b) => a.y - b.y)) {
        const b = box(sc, it);
        // soft contact shadow: a radial gradient squashed into an ellipse
        const rx = b.w * 0.5, ry = Math.max(3, b.w * 0.07);
        g.save(); g.translate(it.x, it.y); g.scale(1, ry / rx);
        const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        grd.addColorStop(0, 'rgba(0,0,0,.42)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
        if (it.id === PERSON.id) {
          g.save(); g.translate(b.x, b.y); g.scale(b.w / 60, b.h / 170);
          g.globalAlpha = parseFloat(css.getPropertyValue('--st-person-a')) || 0.5;
          g.fillStyle = css.getPropertyValue('--st-person').trim() || '#0f110c'; g.fill(new Path2D(PERSON_PATH)); g.restore();
        } else {
          g.save(); if (tone && tone !== 'none') g.filter = tone;
          g.drawImage(await loadImg(b.src), b.x, b.y, b.w, b.h); g.restore();
        }
        if (st.dims) {
          const t = tagText(it).short + ' ס״מ', fs = Math.max(13, sc.w / 70);
          g.font = `700 ${fs}px Assistant, Arial, sans-serif`; g.direction = 'rtl';
          const tw = g.measureText(t).width + fs, tx = it.x, ty = b.y - fs * 0.9;
          g.fillStyle = 'rgba(248,247,243,.92)'; g.beginPath();
          if (g.roundRect) g.roundRect(tx - tw / 2, ty - fs * 0.85, tw, fs * 1.6, fs * 0.8); else g.rect(tx - tw / 2, ty - fs * 0.85, tw, fs * 1.6);
          g.fill(); g.fillStyle = '#1d2119'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, tx, ty);
        }
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#1b1f17'; g.fillRect(0, H, W, band);
      g.direction = 'rtl'; g.textBaseline = 'middle';
      g.fillStyle = '#eceade'; g.font = `700 ${band * 0.36}px "Frank Ruhl Libre", Georgia, serif`; g.textAlign = 'right';
      g.fillText('וילה טוסקנה · סטודיו מרפסת', W - band * 0.4, H + band / 2);
      g.fillStyle = '#b9bba9'; g.font = `500 ${band * 0.27}px Assistant, Arial, sans-serif`; g.textAlign = 'left';
      g.fillText(sc.user ? 'הדמיה בקנה מידה אמיתי · המוצרים והמידות אמיתיים' : 'רקע להמחשה שנוצר ב־AI · המוצרים והמידות אמיתיים', band * 0.4, H + band / 2);
      return new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9));
    }

    const api = {
      el: host, stage, get scene() { return st.scene; }, get dims() { return st.dims; },
      items: () => st.items.filter(i => i.id !== PERSON.id),
      add, remove, setScene, setPerson, exportBlob, calibStart, calibSet, calibDone,
      get calibrating() { return !!st.calib; },
      setDim(uid, dim) { const it = find(uid); if (it) { it.dim = dim; changed(); } },
      setDims(on) { st.dims = on; changed(); },
      clear() { st.items = st.person ? [st.person] : []; st.sel = null; changed(); },
      load(list) { st.items = st.person ? [st.person] : []; list.forEach(x => add(x.id, x.dim, x.x, x.y, true)); st.sel = null; changed(); }
    };
    setScene(opts.scene);
    (opts.items || []).forEach(x => add(x.id, x.dim, x.x, x.y, true));
    if (opts.person) setPerson(true); else changed();
    return api;
  }

  /* ================= studio.html ================= */
  function initPage(root) {
    const scenes = VT.studio.scenes.map(s => Object.assign({}, s));
    const q = new URLSearchParams(location.search);
    const store = {
      get() { try { return JSON.parse(localStorage.getItem('vt-studio') || 'null'); } catch (e) { return null; } },
      set(v) { try { localStorage.setItem('vt-studio', JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
    };
    // a shared layout (?scene=telaviv&items=ga2630~53/72~620~600;...) wins over the saved one
    function decode(s) {
      return (s || '').split(';').map(t => { const [id, dim, x, y] = t.split('~'); const e = entry(id); if (!e) return null;
        const ok = e.set || info(e).sizes.some(z => z.dim === dim); return ok ? { id, dim: e.set ? info(e).sizes[0].dim : dim, x: +x, y: +y } : null; }).filter(Boolean);
    }
    const shared = q.get('items') ? { scene: q.get('scene'), items: decode(q.get('items')) } : null;
    const saved = shared || store.get();
    let scene = scenes.find(s => s.id === (saved && saved.scene)) || scenes[0];
    const status = $('#st-status');
    const announce = msg => { status.textContent = ''; setTimeout(() => { status.textContent = msg; }, 30); };

    const stageHost = $('#st-stage');
    let ready = false;
    const defaults = [{ id: 'ga2630', dim: '53/72', x: 560, y: 600 }, { id: 'ga2630', dim: '31/42', x: 700, y: 640 }];
    const S = create(stageHost, {
      scene, interactive: true, eager: true, announce,
      items: saved && saved.items && saved.items.length ? saved.items.filter(x => entry(x.id)) : defaults,
      bgAlt: sc => sc.user ? 'התמונה שהעליתם' : 'רקע להמחשה: ' + sc.name,
      onChange: () => { if (ready) { renderList(); persist(); } },
      onPersonOff: () => { $('#st-person').checked = false; }
    });

    /* scene picker */
    const picker = $('#st-scenes');
    picker.insertAdjacentHTML('afterbegin', scenes.map(s => `<button type="button" class="st-scene" data-scene="${s.id}" aria-pressed="${s === scene}">
        <img src="${VT.IMG + s.img}" alt="" loading="lazy" width="160" height="90"><span>${s.name}</span></button>`).join(''));
    picker.addEventListener('click', e => {
      const b = e.target.closest('[data-scene]'); if (!b) return;
      const sc = scenes.find(s => s.id === b.dataset.scene) || (userScene && userScene.id === b.dataset.scene ? userScene : null);
      if (!sc) return;
      if (S.calibrating) calibCancel();
      S.setScene(sc); markScene(sc); announce('הרקע הוחלף: ' + sc.name);
    });
    function markScene(sc) { $$('[data-scene]', picker).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === sc.id))); const cap = $('#st-cap'); cap.textContent = sc.user ? 'התמונה שלכם נשארת במכשיר ולא נשלחת לשום מקום · המוצרים והמידות אמיתיים' : 'רקע להמחשה שנוצר ב־AI · המוצרים והמידות אמיתיים'; cap.classList.toggle('no-ai', !!sc.user); }

    /* the customer's own photo */
    let userScene = null;
    const file = $('#st-file'), calibBox = $('#st-calib');
    file.addEventListener('change', () => {
      const f = file.files && file.files[0]; if (!f) return;
      const url = URL.createObjectURL(f), im = new Image();
      im.onload = () => {
        userScene = { id: 'mine', name: 'המרפסת שלכם', img: url, w: im.naturalWidth, h: im.naturalHeight, railTop: im.naturalHeight * 0.42, base: im.naturalHeight * 0.72, refCm: 105, horizon: null, floorMin: im.naturalHeight * 0.35, user: true };
        let b = $('[data-scene="mine"]', picker);
        if (!b) { picker.insertAdjacentHTML('beforeend', `<button type="button" class="st-scene" data-scene="mine" aria-pressed="false"><img alt="" width="160" height="90"><span>המרפסת שלכם</span></button>`); b = $('[data-scene="mine"]', picker); }
        $('img', b).src = url;
        S.setScene(userScene); markScene(userScene);
        calibBox.hidden = false;
        S.calibStart(v => {
          $('#st-ca').value = Math.round(v.a); $('#st-cb').value = Math.round(v.b);
          $('#st-cnext').textContent = v.next === 'a' ? 'הלחיצה הבאה: התחתית' : 'הלחיצה הבאה: הראש';
        });
        $('#st-ca').focus();
        announce('התמונה נטענה. סמנו קו על משהו שאתם יודעים את גובהו');
      };
      im.onerror = () => announce('לא הצלחנו לפתוח את התמונה. נסו קובץ JPG או PNG');
      im.src = url;
      file.value = '';
    });
    $('#st-ca').addEventListener('input', e => S.calibSet('a', +e.target.value));
    $('#st-cb').addEventListener('input', e => S.calibSet('b', +e.target.value));
    $('#st-cok').addEventListener('click', () => {
      const cm = parseFloat($('#st-ccm').value);
      if (!(cm > 5 && cm < 1000)) { announce('כתבו גובה בס״מ, למשל 105'); $('#st-ccm').focus(); return; }
      if (S.calibDone(cm) === false) { announce('הקו קצר מדי. סמנו נקודה בתחתית ונקודה בראש'); return; }
      calibBox.hidden = true; announce('הכיול נשמר. עכשיו המוצרים בקנה מידה אמיתי ליד הקו שסימנתם');
    });
    function calibCancel() { calibBox.hidden = true; S.calibDone(105); }
    $('#st-ccancel').addEventListener('click', () => { calibCancel(); announce('הכיול בוטל, הונח קו ברירת מחדל'); });

    /* product dock */
    const dock = $('#st-dock');
    dock.innerHTML = VT.studio.items.map(it => {
      const i = info(it), c = it.cuts ? Object.values(it.cuts)[0] : it.cut;
      return `<li class="st-prod">
          <div class="st-prod-ph"><img src="${VT.IMG + c.img}" alt="" loading="lazy" width="${c.w}" height="${c.h}"></div>
          <div class="st-prod-b">
            <h3>${i.title}${i.code ? ` <bdi lang="en" class="tc-code">${i.code}</bdi>` : ''}</h3>
            <p class="st-prod-f">${i.finish}${i.external ? ' · בחנות האונליין' : ''}</p>
            <div class="st-sizes" role="group" aria-label="הוספת ${esc(i.title)} במידה">
              ${i.sizes.map(s => `<button type="button" class="chip" data-add-item="${it.id}" data-dim="${s.dim}" aria-label="הוספה למרפסת: ${esc(i.title)}, ${it.set ? s.label + ', ' : ''}${VT.dimLong(s.dim.split(' + ')[0], i.shape)}">
                <span class="dimv">${it.set ? s.dim.split(' + ').map(d => VT.parseDim(d).h).join(' · ') : VT.dimShort(s.dim)}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>`).join('')}
            </div>
          </div></li>`;
    }).join('');
    dock.addEventListener('click', e => {
      const b = e.target.closest('[data-add-item]'); if (!b) return;
      const it = S.add(b.dataset.addItem, b.dataset.dim);
      announce(`${nameOf(entry(it.id))} הוצב על המרפסת. גררו אותו, או בחרו בו והשתמשו בחיצים`);
      if (window.matchMedia('(max-width: 899px)').matches) stageHost.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    /* list of what is on the balcony */
    const list = $('#st-list');
    function renderList() {
      const items = S.items();
      let total = 0, any = false;
      list.innerHTML = items.length ? items.map(it => {
        const e = entry(it.id), i = info(e), s = priceOf(e, it.dim);
        if (s.price != null && !s.vat) { total += s.price; any = true; }
        return `<li>
          <span class="st-li-n"><a href="${i.url}" ${i.external ? 'target="_blank" rel="noopener"' : ''}>${i.title}</a>${i.code ? ` <bdi lang="en" class="tc-code">${i.code}</bdi>` : ''}</span>
          ${i.sizes.length > 1 ? `<label class="sr" for="st-sz-${it.uid}">מידה</label><select id="st-sz-${it.uid}" data-size="${it.uid}">${i.sizes.map(z => `<option value="${z.dim}" ${z.dim === it.dim ? 'selected' : ''}>${VT.dimShort(z.dim)}</option>`).join('')}</select>`
            : `<span class="st-li-d dimv">${e.set ? i.sizes[0].dim.split(' + ').map(VT.dimShort).join(' + ') : VT.dimShort(it.dim)}</span>`}
          <span class="price">${s.price != null ? `<span class="num">₪${VT.fmt(s.price)}</span> <small>${s.vat ? 'כולל מע״מ' : '+ מע״מ'}</small>` : ''}</span>
          <button type="button" class="vz-x" data-del="${it.uid}" aria-label="הסרת ${esc(i.title)} מהמרפסת">×</button>
        </li>`;
      }).join('') : '<li class="st-empty">המרפסת ריקה. בחרו מידה מהרשימה כדי להציב עציץ.</li>';
      const vatItems = items.filter(it => priceOf(entry(it.id), it.dim).vat);
      $('#st-total').innerHTML = any || vatItems.length ? `<span>סה״כ</span><b class="price">${any ? `<span class="num">₪${VT.fmt(total)}</span> <small>+ מע״מ</small>` : ''}${vatItems.length ? `${any ? ' ו־' : ''}<span class="num">₪${VT.fmt(vatItems.reduce((a, it) => a + priceOf(entry(it.id), it.dim).price, 0))}</span> <small>כולל מע״מ</small>` : ''}</b>` : '';
      const wa = $('#st-wa');
      wa.href = VT.waLink(waText(items));
      $('#st-cart').disabled = !items.some(it => info(entry(it.id)).key(it.dim));
    }
    list.addEventListener('change', e => { const s = e.target.closest('[data-size]'); if (s) { S.setDim(+s.dataset.size, s.value); announce('המידה עודכנה ל־' + VT.dimShort(s.value)); } });
    list.addEventListener('click', e => { const d = e.target.closest('[data-del]'); if (d) { S.remove(+d.dataset.del); announce('הפריט הוסר מהמרפסת'); } });

    function shareLink() {
      const u = new URL(location.href.split('#')[0]);
      u.search = new URLSearchParams({ scene: S.scene.user ? 'telaviv' : S.scene.id, items: S.items().map(i => [i.id, i.dim.split(' + ')[0], Math.round(i.x), Math.round(i.y)].join('~')).join(';') }).toString();
      return u.toString();
    }
    function waText(items) {
      const lines = items.map(it => { const e = entry(it.id), i = info(e), s = priceOf(e, it.dim);
        return `• ${i.title}${i.code ? ' ' + i.code : ''}, ${e.set ? i.sizes[0].dim : it.dim} ס״מ${i.finish ? ', ' + i.finish : ''}${s.price != null ? ` – ₪${VT.fmt(s.price)}${s.vat ? ' כולל מע״מ' : ''}` : ''}`; });
      return 'שלום וילה טוסקנה, הרכבתי מרפסת בסטודיו באתר:\n' + (lines.join('\n') || '(עוד לא בחרתי)') + '\n\nההדמיה שלי: ' + shareLink() + '\nאשמח לייעוץ ולאישור מלאי.';
    }
    function persist() { if (!S.scene.user) store.set({ scene: S.scene.id, items: S.items().map(i => ({ id: i.id, dim: i.dim, x: Math.round(i.x), y: Math.round(i.y) })) }); }

    /* toggles and actions */
    $('#st-dims').addEventListener('change', e => S.setDims(e.target.checked));
    $('#st-person').addEventListener('change', e => { S.setPerson(e.target.checked); announce(e.target.checked ? 'נוספה דמות בגובה 170 ס״מ' : 'הדמות הוסרה'); });
    $('#st-clear').addEventListener('click', () => { S.clear(); announce('המרפסת נוקתה'); });
    $('#st-cart').addEventListener('click', () => {
      const keys = S.items().map(it => info(entry(it.id)).key(it.dim)).filter(Boolean);
      if (window.VTcartAdd) keys.forEach(k => window.VTcartAdd(k));
    });
    $('#st-save').addEventListener('click', async e => {
      const btn = e.currentTarget; btn.disabled = true;
      try {
        const blob = await S.exportBlob();
        const f = new File([blob], 'villa-toscana-balcony.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          try { await navigator.share({ files: [f], title: 'ההדמיה שלי, וילה טוסקנה' }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
        }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        announce('התמונה נשמרה');
      } catch (err) { announce('לא הצלחנו לשמור את התמונה'); }
      finally { btn.disabled = false; }
    });
    $('#st-link').addEventListener('click', async () => {
      const url = shareLink();
      try { if (navigator.share) { await navigator.share({ title: 'ההדמיה שלי, וילה טוסקנה', url }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(url); announce('הקישור להדמיה הועתק'); } catch (err) { prompt('העתיקו את הקישור:', url); }
    });

    ready = true;
    const scroller = $('.st-scroll', root);
    if (scroller) scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
    markScene(scene);
    renderList();
    if (shared) history.replaceState(null, '', location.pathname);
    return S;
  }

  /* ================= home-page teaser ================= */
  function initTeaser(root) {
    const scene = VT.studio.scenes[0];
    const host = $('.st-host', root);
    const sets = {
      geo: [{ id: 'ga2630', dim: '53/72', x: 600, y: 640 }, { id: 'ga2630', dim: '31/42', x: 735, y: 668 }],
      urn: [{ id: 'urn314', dim: '57/67', x: 585, y: 655 }, { id: 'urn262', dim: '46/76', x: 745, y: 625 }],
      trough: [{ id: 'p7', dim: info(entry('p7')).sizes[0].dim, x: 660, y: 650 }]
    };
    const S = create(host, { scene, interactive: false, items: sets.geo, person: true, personX: 0.335, personY: 0.08 });
    const chips = $$('[data-set]', root);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-set]'); if (!b) return;
      S.load(sets[b.dataset.set]);
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === b)));
      const st = $('.st-teaser-status', root); if (st) st.textContent = 'על המרפסת עכשיו: ' + b.textContent.trim();
    });
    return S;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = $('#studio'); if (page) initPage(page);
    $$('[data-teaser]').forEach(initTeaser);
  });
  return { create, scaleAt, box, info };
})();
