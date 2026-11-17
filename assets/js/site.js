/* Shared behaviour: menu, product cards, inquiry list, price-list filters. */
(function () {
  const VT = window.VT, VTViz = window.VTViz;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    sget(k) { try { const v = sessionStorage.getItem(k); sessionStorage.removeItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  const ICON = {
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>'
  };
  const onPriceList = !!$('#catalog-grid');

  /* ---------- menu ---------- */
  const mb = $('.menu-btn'), nav = $('#nav');
  if (mb && nav) {
    mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- inquiry list ---------- */
  let cart = store.get('vt-cart', []);
  function cartSave() { store.set('vt-cart', cart); cartRender(); }
  function cartAdd(item) {
    const ex = cart.find(c => c.key === item.key);
    if (ex) ex.qty++; else cart.push(Object.assign({ qty: 1 }, item));
    cartSave(); toast('נוסף לרשימת ההזמנה');
  }
  const drawer = document.createElement('div');
  drawer.className = 'drawer'; drawer.id = 'cart';
  drawer.innerHTML = `<div class="drawer-bg" data-close></div>
    <aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div class="drawer-head"><h2 id="cart-title">רשימת ההזמנה</h2><button class="vz-x" data-close aria-label="סגירה">×</button></div>
      <ul class="drawer-list"></ul>
      <div class="drawer-foot">
        <div class="total"><span>סה״כ משוער</span><b class="price" id="cart-total"></b></div>
        <small>המחירים לפני מע״מ, באיסוף עצמי מהמחסן. נציג יאשר מלאי וזמינות, המלאי משתנה מדי יום.</small>
        <a class="btn btn-wa" id="cart-send" target="_blank" rel="noopener">${ICON.chat} שליחת הרשימה בוואטסאפ</a>
        <button class="btn btn-ghost btn-sm" type="button" id="cart-clear">ניקוי הרשימה</button>
      </div>
    </aside>`;
  const cartBtn = document.createElement('button');
  cartBtn.className = 'cart-btn'; cartBtn.type = 'button';
  cartBtn.innerHTML = `${ICON.bag}<span>רשימת הזמנה</span><span class="n">0</span>`;
  document.body.append(drawer, cartBtn);
  cartBtn.addEventListener('click', () => { drawer.classList.add('open'); $('.drawer-head button', drawer).focus(); });
  drawer.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { drawer.classList.remove('open'); cartBtn.focus(); return; }
    const q = e.target.closest('[data-q]');
    if (q) {
      const it = cart[+q.dataset.i]; it.qty += +q.dataset.q;
      if (it.qty <= 0) cart.splice(+q.dataset.i, 1);
      cartSave();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) { drawer.classList.remove('open'); cartBtn.focus(); } });
  $('#cart-clear', drawer).addEventListener('click', () => { cart = []; cartSave(); });

  function cartRender() {
    const n = cart.reduce((a, c) => a + c.qty, 0);
    $('.n', cartBtn).textContent = n;
    cartBtn.hidden = n === 0;
    const ul = $('.drawer-list', drawer);
    ul.innerHTML = cart.length ? cart.map((c, i) => `<li>
        <div><div class="nm">${c.title}</div><div class="sub"><span class="num">${c.dim}</span> ס״מ${c.finish ? ' · ' + c.finish : ''}</div></div>
        <div class="price">${c.price != null ? `<span class="num">${VT.fmt(c.price * c.qty)}</span> ₪` : 'בבירור'}</div>
        <div class="qty" aria-label="כמות"><button type="button" data-q="-1" data-i="${i}" aria-label="פחות">−</button><span class="num">${c.qty}</span><button type="button" data-q="1" data-i="${i}" aria-label="עוד">+</button></div>
      </li>`).join('') : '<li class="sub" style="display:block">הרשימה ריקה. לחצו על + ליד כל מידה במחירון.</li>';
    const total = cart.reduce((a, c) => a + (c.price || 0) * c.qty, 0);
    $('#cart-total', drawer).innerHTML = `<span class="num">${VT.fmt(total)}</span> ₪ <small>+ מע״מ</small>`;
    const text = 'שלום וילה טוסקנה, אשמח להזמין:\n' + cart.map(c => `• ${c.qty} × ${c.title}, ${c.dim} ס״מ${c.finish ? ', ' + c.finish : ''}${c.price != null ? ` – ${VT.fmt(c.price * c.qty)} ₪` : ''}`).join('\n') + `\nסה״כ משוער: ${VT.fmt(total)} ₪ + מע״מ.\nאשמח לאישור מלאי ותיאום איסוף.`;
    $('#cart-send', drawer).href = VT.waLink(text);
    $$('[data-add]').forEach(b => {
      const on = cart.some(c => c.key === b.dataset.add);
      b.classList.toggle('added', on); b.innerHTML = on ? ICON.check : ICON.plus;
    });
  }

  /* ---------- product card ---------- */
  function minPrice(p) {
    const all = (p.sizes || []).map(s => s.price).concat(p.set ? [p.set.price] : []).filter(x => x != null);
    return all.length ? Math.min(...all) : Infinity;
  }
  function maxHeight(p) {
    const dims = (p.sizes || []).map(s => s.dim).concat(p.set ? p.set.dims : []);
    return Math.max(...dims.map(d => VT.parseDim(d).h));
  }
  function isPhoto(img) { return !/^p/.test(img) || img === 'p15.jpg' || img === 'p03.jpg'; }

  // small catalogue photos: enlarge gently instead of stretching them across the card
  window.VTfit = function (im) {
    const nw = im.naturalWidth, nh = im.naturalHeight;
    if (!nw || nw >= 260 || im.classList.contains('cover')) { im.classList.remove('tiny'); im.style.width = im.style.height = ''; return; }
    const box = im.parentElement.clientWidth || 300;
    const k = Math.min(1.9, 180 / nh, (box - 24) / nw);
    im.classList.add('tiny'); im.style.width = Math.round(nw * k) + 'px'; im.style.height = Math.round(nh * k) + 'px';
  };
  function card(p) {
    const imgs = [p.img].concat(p.thumbs || []);
    const sale = (p.sizes || []).some(s => s.sale);
    const fins = p.finishes.map(c => `<span class="fin"><i style="background:${VT.finishes[c].color}"></i>${VT.finishes[c].name}</span>`).join('') || '<span class="fin">גוון לפי המלאי</span>';
    const setRow = p.set ? `<div class="set-row">
        <div><span class="lbl">${p.set.label}</span><span class="dims num">${p.set.dims.join(' + ')}</span></div>
        <div class="row-acts"><span class="price"><span class="num">${VT.fmt(p.set.price)}</span> ₪</span>
        <button class="ibtn" type="button" data-add="${p.id}|set" aria-label="הוספת ה${p.set.label} לרשימה">${ICON.plus}</button></div>
      </div>` : '';
    const rows = (p.sizes || []).map(s => {
      const priceHTML = s.price == null ? '<span class="price"><small>מחיר בטלפון</small></span>'
        : `<span class="price ${s.sale ? 'hot' : ''}"><span class="num">${VT.fmt(s.price)}</span> ₪${s.vat ? ' <small>כולל מע״מ</small>' : ''}${s.sale ? ' <small>מבצע</small>' : ''}</span>`;
      return `<li>
        ${VTViz.miniIcon(p.shape, s.dim)}
        <span class="dim">${s.dim} <small>ס״מ</small>${s.label ? ` <small>${s.label}</small>` : ''}</span>
        ${priceHTML}
        <span class="row-acts">
          ${p.noViz ? '' : `<button class="ibtn" type="button" data-viz="${p.id}|${s.dim}" aria-label="להציב ${s.dim} על המרפסת" title="לראות על המרפסת">${ICON.ruler}</button>`}
          <button class="ibtn" type="button" data-add="${p.id}|${s.dim}" aria-label="הוספת ${s.dim} לרשימה" title="הוספה לרשימה">${ICON.plus}</button>
        </span></li>`;
    }).join('');
    const q = `שלום, אשמח לפרטים על ${p.title}${p.code ? ' ' + p.code : ''} מהמחירון.`;
    return `<article class="tag-card" data-id="${p.id}">
      <div class="ph">
        <img src="${VT.IMG}${p.img}" alt="${p.title}" loading="lazy" class="${isPhoto(p.img) ? 'cover' : ''}" onload="VTfit(this)">
        ${sale ? '<span class="flag">מבצע</span>' : p.set ? '<span class="flag set">סט משתלם</span>' : ''}
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, i) => `<button type="button" data-img="${im}" aria-pressed="${i === 0}" aria-label="תמונה ${i + 1}"><img src="${VT.IMG}${im}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>
      <div class="tc-body">
        <div class="tc-top"><h3>${p.title}</h3>${p.code ? `<span class="tc-code">${p.code}</span>` : ''}</div>
        <div class="fins">${fins}</div>
        ${setRow}
        ${rows ? `<ul class="sizes">${rows}</ul>` : ''}
      </div>
      <div class="tc-foot"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${VT.waLink(q)}">${ICON.chat} שאלה על הדגם</a></div>
    </article>`;
  }

  // delegated card actions (both pages)
  document.addEventListener('click', e => {
    const th = e.target.closest('[data-img]');
    if (th) {
      const cardEl = th.closest('.tag-card'), im = $('.ph > img', cardEl);
      im.src = VT.IMG + th.dataset.img; im.classList.toggle('cover', isPhoto(th.dataset.img));
      $$('[data-img]', cardEl).forEach(b => b.setAttribute('aria-pressed', b === th));
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const [pid, dim] = add.dataset.add.split('|');
      const p = VT.products.find(x => x.id === pid);
      const fin = p.finishes.length === 1 ? VT.finishes[p.finishes[0]].name : '';
      if (dim === 'set') cartAdd({ key: add.dataset.add, title: `${p.title}${p.code ? ' ' + p.code : ''} (${p.set.label})`, dim: p.set.dims.join(' + '), price: p.set.price, finish: fin });
      else { const s = p.sizes.find(x => x.dim === dim); cartAdd({ key: add.dataset.add, title: p.title + (p.code ? ' ' + p.code : ''), dim, price: s.price, finish: fin }); }
      return;
    }
    const viz = e.target.closest('[data-viz]');
    if (viz) {
      const [pid, dim] = viz.dataset.viz.split('|');
      const p = VT.products.find(x => x.id === pid);
      if (onPriceList) { VTViz.addItem(pid, dim, p.finishes[0]); toast(`${dim} ס״מ הוצב על המרפסת`); }
      else { store.sset('vt-pending', { pid, dim, fin: p.finishes[0] }); location.href = 'price-list.html#balcony'; }
    }
  });

  /* ---------- home page ---------- */
  const homeViz = $('#home-viz');
  if (homeViz) VTViz.mount(homeViz, { interactive: false, person: true });
  const featured = $('#featured');
  if (featured) featured.innerHTML = VT.products.filter(p => p.featured).slice(0, 6).map(card).join('');

  /* ---------- price list page ---------- */
  if (onPriceList) {
    const grid = $('#catalog-grid');
    const st = { cat: 'all', fins: new Set(), q: '', max: 6000, sort: 'rec' };
    const catChips = $('#cat-chips'), finChips = $('#fin-chips');
    catChips.innerHTML = `<button class="chip" type="button" data-cat="all" aria-pressed="true">הכל</button>` +
      Object.entries(VT.cats).map(([k, v]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="false">${v}</button>`).join('');
    finChips.innerHTML = ['C', 'G', 'DG', 'B', 'W'].map(c => `<button class="chip" type="button" data-fin="${c}" aria-pressed="false"><span class="sw" style="background:${VT.finishes[c].color}"></span>${VT.finishes[c].name}</button>`).join('');
    catChips.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      st.cat = b.dataset.cat; $$('[data-cat]', catChips).forEach(x => x.setAttribute('aria-pressed', x === b)); draw();
    });
    finChips.addEventListener('click', e => {
      const b = e.target.closest('[data-fin]'); if (!b) return;
      const c = b.dataset.fin; st.fins.has(c) ? st.fins.delete(c) : st.fins.add(c);
      b.setAttribute('aria-pressed', st.fins.has(c)); draw();
    });
    const qEl = $('#q'), maxEl = $('#max'), maxOut = $('#max-out'), sortEl = $('#sort');
    qEl.addEventListener('input', () => { st.q = qEl.value.trim(); draw(); });
    maxEl.addEventListener('input', () => { st.max = +maxEl.value; maxOut.textContent = st.max >= 6000 ? 'ללא הגבלה' : 'עד ' + VT.fmt(st.max) + ' ₪'; draw(); });
    sortEl.addEventListener('change', () => { st.sort = sortEl.value; draw(); });

    function draw() {
      let list = VT.products.filter(p => {
        if (st.cat !== 'all' && p.cats.indexOf(st.cat) === -1) return false;
        if (st.fins.size && !p.finishes.some(f => st.fins.has(f))) return false;
        if (st.max < 6000 && minPrice(p) > st.max) return false;
        if (st.q) {
          const hay = [p.title, p.code || '', ...(p.sizes || []).map(s => s.dim), ...(p.set ? p.set.dims : [])].join(' ').toLowerCase();
          if (!st.q.toLowerCase().split(/\s+/).every(t => hay.includes(t))) return false;
        }
        return true;
      });
      if (st.sort === 'low') list.sort((a, b) => minPrice(a) - minPrice(b));
      if (st.sort === 'high') list.sort((a, b) => minPrice(b) - minPrice(a));
      if (st.sort === 'tall') list.sort((a, b) => maxHeight(b) - maxHeight(a));
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">לא נמצאו דגמים שמתאימים לסינון. נסו להרחיב את התקציב או לבחור "הכל".</p>';
      $('#count').textContent = `${list.length} דגמים`;
      cartRender();
    }
    draw();

    // balcony simulator
    VTViz.mount($('#balcony-viz'), { interactive: true });
    const pending = store.sget('vt-pending');
    if (pending) VTViz.addItem(pending.pid, pending.dim, pending.fin);

    // compositions
    $('#compo').innerHTML = VT.compositions.map(c => `<article>
      <img src="${VT.IMG}${c.img}" alt="${c.title}" loading="lazy">
      <div><h3>${c.title}</h3>${c.lines.map(l => `<p>${l}</p>`).join('')}
      ${c.price ? `<span class="price"><span class="num">${VT.fmt(c.price)}</span> ₪ <small>+ מע״מ</small></span>` : c.perUnit ? '<p style="font-family:var(--f-body)">מחיר ליחידה + מע״מ</p>' : '<p style="font-family:var(--f-body)">למי שלא פוחד</p>'}
      ${c.alt ? `<p>${c.alt}</p>` : ''}</div></article>`).join('');

    // terracotta
    $('#tc-grid').innerHTML = VT.terracotta.map(t => {
      const f = VT.finishes[t.finish];
      const title = `סט ${t.count} כדי ${f.name}`;
      return `<article class="tag-card">
        <div class="ph"><img class="cover" src="${VT.IMG}${t.img}" alt="${title}" loading="lazy">${t.was ? '<span class="flag">מבצע</span>' : ''}</div>
        <div class="tc-body">
          <div class="tc-top"><h3>${title}</h3><span class="tc-code">${t.code}</span></div>
          <div class="fins"><span class="fin"><i style="background:${f.color}"></i>${f.name}</span></div>
          <ul class="sizes">${t.dims.map(d => `<li style="grid-template-columns:44px minmax(0,1fr)">${VTViz.miniIcon('egg', d)}<span class="dim">${d} <small>ס״מ</small></span></li>`).join('')}</ul>
          <div class="set-row"><span class="lbl">מחיר הסט</span>
            <div class="row-acts"><span class="price ${t.was ? 'hot' : ''}"><span class="num">${VT.fmt(t.price)}</span> ₪${t.was ? ` <s class="num">${VT.fmt(t.was)}</s>` : ''}</span>
            <button class="ibtn" type="button" data-tc="${t.id}" aria-label="הוספה לרשימה">${ICON.plus}</button></div></div>
        </div></article>`;
    }).join('');
    $('#tc-grid').addEventListener('click', e => {
      const b = e.target.closest('[data-tc]'); if (!b) return;
      const t = VT.terracotta.find(x => x.id === b.dataset.tc);
      cartAdd({ key: 'tc|' + t.id, title: `סט ${t.count} כדי טרקוטה ${t.code}`, dim: t.dims.join(' + '), price: t.price, finish: VT.finishes[t.finish].name });
    });

    // fountains
    $('#fn-grid').innerHTML = VT.fountains.map(f => `<article class="fcard">
      <div class="ph"><img src="${VT.IMG}${f.img}" alt="${f.title}" loading="lazy">${f.was || f.sale ? '<span class="flag">מבצע</span>' : ''}</div>
      <div class="tc-body">
        <div class="tc-top"><h3>${f.title}</h3>${f.code ? `<span class="tc-code">${f.code}</span>` : ''}</div>
        <p class="meta">${f.dims}</p>
        <span class="price ${f.was || f.sale ? 'hot' : ''}"><span class="num">${VT.fmt(f.price)}</span> ₪${f.was ? ` <s class="num">${VT.fmt(f.was)}</s>` : ''}</span>
        ${f.note ? `<p class="meta" style="font-family:var(--f-body)">${f.note}</p>` : ''}
      </div>
      <div class="tc-foot"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${VT.waLink(`שלום, אשמח לפרטים על ${f.title}${f.code ? ' ' + f.code : ''} (${f.dims}).`)}">${ICON.chat} לפרטים בוואטסאפ</a></div>
    </article>`).join('');
  }

  cartRender();
})();
