/* Shared behaviour: menu, product cards, order list, smart catalogue search, model pages. */
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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/><path d="m7.5 10.5 2-2M10.5 13.5l2-2M13.5 16.5l2-2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.4L3 21l2.1-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1 14H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="flip"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
  };
  const onPriceList = !!$('#catalog-grid');
  const product = id => VT.products.find(p => p.id === id);
  const nameOf = p => p.title + (p.code ? ' ' + p.code : '');
  const priceLabel = n => `<span class="num">₪${VT.fmt(n)}</span>`;

  /* ---------- menu ---------- */
  const mb = $('.menu-btn'), nav = $('#nav');
  if (mb && nav) {
    mb.addEventListener('click', () => { const o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- toast: the live region exists before anything is announced ---------- */
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastEl);
  let toastT;
  function toast(msg) {
    const host = document.querySelector('dialog[open]') || document.body; // a modal dialog sits in the top layer
    if (toastEl.parentNode !== host) host.appendChild(toastEl);
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 5000);
  }

  /* ---------- order list ---------- */
  // keys: "<productId>|<dim>", "<productId>|set", "tc|<terracottaId>"
  function itemFromKey(key) {
    const [a, b] = key.split('|');
    if (a === 'tc') {
      const t = VT.terracotta.find(x => x.id === b); if (!t) return null;
      return { key, title: `סט ${t.count} כדי טרקוטה ${t.code}`, dim: t.dims.join(' + '), price: t.price, finish: VT.finishes[t.finish].name };
    }
    const p = product(a); if (!p) return null;
    const fin = p.finishes.length === 1 ? VT.finishes[p.finishes[0]].name : '';
    if (b === 'set') return p.set ? { key, title: `${nameOf(p)} (${p.set.label})`, dim: p.set.dims.join(' + '), price: p.set.price, finish: fin } : null;
    const s = (p.sizes || []).find(x => x.dim === b); if (!s) return null;
    return { key, title: nameOf(p), dim: b, price: s.price, finish: fin };
  }
  let cart = store.get('vt-cart', []).filter(c => c && c.key && itemFromKey(c.key));
  function cartSave() { store.set('vt-cart', cart); cartRender(); }
  function cartAdd(key) {
    const item = itemFromKey(key); if (!item) return;
    const ex = cart.find(c => c.key === key);
    if (ex) ex.qty++; else cart.push(Object.assign({ qty: 1 }, item));
    cartSave(); toast(`${item.title} נוסף לרשימת ההזמנה`);
  }
  window.VTcartAdd = cartAdd;

  const dlg = document.createElement('dialog');
  dlg.className = 'drawer'; dlg.id = 'cart'; dlg.setAttribute('aria-labelledby', 'cart-title');
  dlg.innerHTML = `<div class="drawer-panel">
      <div class="drawer-head"><h2 id="cart-title" tabindex="-1">רשימת ההזמנה</h2><button class="vz-x" type="button" data-close aria-label="סגירת רשימת ההזמנה">×</button></div>
      <ul class="drawer-list"></ul>
      <div class="drawer-foot">
        <div class="total"><span>סה״כ משוער</span><b class="price" id="cart-total"></b></div>
        <small>המחירים לפני מע״מ, באיסוף עצמי מהמחסן. נציג יאשר מלאי וזמינות, המלאי משתנה מדי יום.</small>
        <a class="btn btn-wa" id="cart-send" target="_blank" rel="noopener">${ICON.chat} שליחת ההזמנה לוילה טוסקנה</a>
        <div class="btn-row">
          <button class="btn btn-ghost btn-sm" type="button" id="cart-share">${ICON.share} שיתוף הרשימה</button>
          <button class="btn btn-ghost btn-sm" type="button" id="cart-clear">ניקוי הרשימה</button>
        </div>
      </div>
    </div>`;
  const cartBtn = document.createElement('button');
  cartBtn.className = 'cart-btn'; cartBtn.type = 'button';
  cartBtn.setAttribute('aria-haspopup', 'dialog'); cartBtn.setAttribute('aria-controls', 'cart');
  cartBtn.innerHTML = `${ICON.bag}<span>רשימת הזמנה</span><span class="n">0</span>`;
  document.body.append(dlg, cartBtn);
  let opener = null;
  function openCart(from) { opener = from || cartBtn; if (!dlg.open) dlg.showModal(); $('#cart-title', dlg).focus(); }
  cartBtn.addEventListener('click', () => openCart(cartBtn));
  dlg.addEventListener('close', () => { (opener && opener.isConnected ? opener : cartBtn).focus(); });
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); return; }
    const q = e.target.closest('[data-q]');
    if (q) {
      const it = cart[+q.dataset.i]; it.qty += +q.dataset.q;
      if (it.qty <= 0) cart.splice(+q.dataset.i, 1);
      cartSave();
    }
  });
  $('#cart-clear', dlg).addEventListener('click', () => { cart = []; cartSave(); toast('הרשימה נוקתה'); });

  function shareUrl() {
    const u = new URL(VT.BASE + 'price-list.html', location.href);
    u.search = new URLSearchParams({ list: cart.map(c => c.key + '*' + c.qty).join(',') }).toString();
    return u.toString();
  }
  $('#cart-share', dlg).addEventListener('click', async () => {
    const url = shareUrl();
    const data = { title: 'רשימת הזמנה, וילה טוסקנה', text: 'הרשימה שהכנתי מהמחירון של וילה טוסקנה', url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('הקישור לרשימה הועתק'); }
    catch (e) { window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(data.text + '\n' + url), '_blank', 'noopener'); }
  });

  // a list someone shared with you: ?list=p9|80/23/40*2,p5|set*1
  (function loadSharedList() {
    const raw = new URLSearchParams(location.search).get('list');
    if (!raw) return;
    const items = raw.split(',').map(x => { const [key, q] = x.split('*'); const it = itemFromKey(key); return it ? Object.assign(it, { qty: Math.max(1, Math.min(99, parseInt(q, 10) || 1)) }) : null; }).filter(Boolean);
    if (!items.length) return;
    cart = items; store.set('vt-cart', cart);
    history.replaceState(null, '', location.pathname + location.hash);
    setTimeout(() => { openCart(cartBtn); toast('נטענה רשימה ששותפה איתכם'); }, 300);
  })();

  function cartRender() {
    const n = cart.reduce((a, c) => a + c.qty, 0);
    const total = cart.reduce((a, c) => a + (c.price || 0) * c.qty, 0);
    $('.n', cartBtn).textContent = n;
    cartBtn.setAttribute('aria-label', `רשימת הזמנה: ${n} פריטים, ₪${VT.fmt(total)}`);
    cartBtn.hidden = n === 0;
    $('.drawer-list', dlg).innerHTML = cart.length ? cart.map((c, i) => `<li>
        <div><div class="nm">${c.title}</div><div class="sub"><span class="num">${c.dim}</span> ס״מ${c.finish ? ' · ' + c.finish : ''}</div></div>
        <div class="price">${c.price != null ? priceLabel(c.price * c.qty) : 'בבירור'}</div>
        <div class="qty" role="group" aria-label="כמות של ${c.title}"><button type="button" data-q="-1" data-i="${i}" aria-label="פחות">−</button><span class="num">${c.qty}</span><button type="button" data-q="1" data-i="${i}" aria-label="עוד אחד">+</button></div>
      </li>`).join('') : '<li class="sub" style="display:block">הרשימה ריקה. לחצו על + ליד כל מידה במחירון.</li>';
    $('#cart-total', dlg).innerHTML = `${priceLabel(total)} <small>+ מע״מ</small>`;
    const text = 'שלום וילה טוסקנה, אשמח להזמין:\n' + cart.map(c => `• ${c.qty} × ${c.title}, ${c.dim} ס״מ${c.finish ? ', ' + c.finish : ''}${c.price != null ? ` – ₪${VT.fmt(c.price * c.qty)}` : ''}`).join('\n') + `\nסה״כ משוער: ₪${VT.fmt(total)} + מע״מ.\nאשמח לאישור מלאי ותיאום איסוף.`;
    $('#cart-send', dlg).href = VT.waLink(text);
    $('#cart-share', dlg).disabled = !cart.length;
    $$('[data-add]').forEach(b => {
      const on = cart.some(c => c.key === b.dataset.add);
      b.classList.toggle('added', on);
      if (!b.classList.contains('btn')) b.innerHTML = on ? ICON.check : ICON.plus;
    });
  }

  /* ---------- product card ---------- */
  function maxHeight(p) {
    const dims = (p.sizes || []).map(s => s.dim).concat(p.set ? p.set.dims : []);
    return Math.max(...dims.map(d => VT.parseDim(d).h));
  }
  function isPhoto(img) { return !/^p/.test(img) || img === 'p15.webp' || img === 'p03.webp'; }

  // small catalogue photos: enlarge gently instead of stretching them across the card
  window.VTfit = function (im) {
    const nw = im.naturalWidth, nh = im.naturalHeight;
    if (!nw || nw >= 260 || im.classList.contains('cover')) { im.classList.remove('tiny'); im.style.width = im.style.height = ''; return; }
    const box = im.parentElement.clientWidth || 300;
    const k = Math.min(+im.dataset.maxk || 1.9, (+im.dataset.maxh || 180) / nh, (box - 24) / nw);
    im.classList.add('tiny'); im.style.width = Math.round(nw * k) + 'px'; im.style.height = Math.round(nh * k) + 'px';
  };
  // images that finished loading before this script ran
  $$('img[onload*="VTfit"]').forEach(im => { if (im.complete) window.VTfit(im); });

  function sizeRows(p) {
    return (p.sizes || []).map(s => {
      const priceHTML = s.price == null ? '<span class="price"><small>מחיר בטלפון</small></span>'
        : `<span class="price ${s.sale ? 'hot' : ''}">${priceLabel(s.price)}${s.vat ? ' <small>כולל מע״מ</small>' : ''}${s.sale ? ' <small>מבצע</small>' : ''}</span>`;
      return `<li>
        ${VTViz.miniIcon(p.shape, s.dim)}
        <span class="dim"><span aria-hidden="true" class="dimv">${VT.dimShort(s.dim)}</span><span class="sr">${VT.dimLong(s.dim, p.shape)}</span>${s.label ? ` <small>${s.label}</small>` : ''}</span>
        ${priceHTML}
        <span class="row-acts">
          ${p.noViz ? '' : `<button class="ibtn" type="button" data-viz="${p.id}|${s.dim}" aria-label="להציב ${VT.dimShort(s.dim)} על המרפסת" title="לראות על המרפסת">${ICON.ruler}</button>`}
          <button class="ibtn" type="button" data-add="${p.id}|${s.dim}" aria-label="הוספת ${VT.dimShort(s.dim)} לרשימת ההזמנה" title="הוספה לרשימה">${ICON.plus}</button>
        </span></li>`;
    }).join('');
  }
  function setBox(p) {
    if (!p.set) return '';
    const sv = VT.setSavings(p);
    return `<div class="set-row">
        <div><span class="lbl">${p.set.label}</span><span class="dims dimv">${p.set.dims.map(VT.dimShort).join(' + ')}</span>
        ${sv ? `<span class="save">חוסכים ₪${VT.fmt(sv.amount)} (${sv.pct}%) לעומת קנייה בנפרד</span>` : ''}</div>
        <div class="row-acts"><span class="price">${priceLabel(p.set.price)}</span>
        <button class="ibtn" type="button" data-add="${p.id}|set" aria-label="הוספת ה${p.set.label} לרשימת ההזמנה">${ICON.plus}</button></div>
      </div>`;
  }
  function fins(p) {
    return p.finishes.map(c => `<span class="fin"><i style="background:${VT.finishes[c].color}"></i>${VT.finishes[c].name}</span>`).join('') || '<span class="fin">גוון לפי המלאי</span>';
  }

  function card(p) {
    const imgs = [p.img].concat(p.thumbs || []);
    const sale = (p.sizes || []).some(s => s.sale);
    const url = VT.modelUrl(p), from = VT.minPrice(p);
    const legendDim = (p.sizes && p.sizes[0] && p.sizes[0].dim) || (p.set && p.set.dims[0]);
    return `<article class="tag-card" data-id="${p.id}">
      <div class="ph">
        <a href="${url}" tabindex="-1" aria-hidden="true" class="ph-link"><img src="${VT.IMG}${p.img}" alt="" loading="lazy" class="${isPhoto(p.img) ? 'cover' : ''}" style="view-transition-name:m-${p.id}" onload="VTfit(this)"></a>
        ${sale ? '<span class="flag">מבצע</span>' : p.set ? '<span class="flag set">סט משתלם</span>' : ''}
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, i) => `<button type="button" data-img="${im}" aria-pressed="${i === 0}" aria-label="תמונה ${i + 1} מתוך ${imgs.length}"><img src="${VT.IMG}${im}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>
      <div class="tc-body">
        <div class="tc-top"><h3><a href="${url}">${p.title}</a></h3>${p.code ? `<bdi class="tc-code" lang="en">${p.code}</bdi>` : ''}</div>
        ${from != null ? `<p class="from">החל מ־${priceLabel(from)} <small>לפני מע״מ</small></p>` : ''}
        <div class="fins">${fins(p)}</div>
        ${setBox(p)}
        ${p.sizes && p.sizes.length ? `<p class="legend">${VT.dimLegend(legendDim, p.shape)}</p><ul class="sizes">${sizeRows(p)}</ul>` : ''}
      </div>
      <div class="tc-foot">
        <a class="btn btn-ghost btn-sm" href="${url}">כל הפרטים ${ICON.arrow}</a>
        <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${VT.waLink(`שלום, אשמח לפרטים על ${nameOf(p)} מהמחירון.`)}">${ICON.chat} שאלה</a>
      </div>
    </article>`;
  }
  window.VTcard = card;

  function goBalcony(pid, dim, fin) {
    if (onPriceList) { VTViz.addItem(pid, dim, fin); toast(`${VT.dimShort(dim)} ס״מ הוצב על המרפסת`); }
    else { store.sset('vt-pending', { pid, dim, fin }); location.href = VT.BASE + 'price-list.html#balcony'; }
  }

  // delegated actions (all pages)
  document.addEventListener('click', e => {
    const th = e.target.closest('[data-img]');
    if (th) {
      const box = th.closest('.tag-card, .gallery'), im = $('.ph img, .g-main img', box);
      im.src = VT.IMG + th.dataset.img;
      if (box.classList.contains('tag-card')) im.classList.toggle('cover', isPhoto(th.dataset.img));
      $$('[data-img]', box).forEach(b => b.setAttribute('aria-pressed', b === th));
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) { cartAdd(add.dataset.add); return; }
    const viz = e.target.closest('[data-viz]');
    if (viz) {
      const [pid, dim] = viz.dataset.viz.split('|');
      goBalcony(pid, dim, viz.dataset.fin || product(pid).finishes[0]);
    }
  });

  /* ---------- home page: full-screen chapters ---------- */
  if (document.body.classList.contains('home')) initHome();

  /* a lighter showcase card for the home page: photo, name, price from, saving */
  function showCard(p) {
    const from = VT.minPrice(p), sv = VT.setSavings(p);
    const hs = (p.sizes || []).map(s => VT.parseDim(s.dim).h).concat(p.set ? p.set.dims.map(d => VT.parseDim(d).h) : []);
    const n = new Set((p.sizes || []).map(s => s.dim).concat(p.set ? p.set.dims : [])).size;
    return `<a class="show-card reveal" href="${VT.modelUrl(p)}">
        <span class="sc-ph${isPhoto(p.img) ? ' cover' : ''}"><img src="${VT.IMG + p.img}" alt="" loading="lazy" style="view-transition-name:m-${p.id}"></span>
        <span class="sc-b">
          ${sv ? `<span class="sc-flag">סט משתלם · חוסכים <span class="num">${sv.pct}%</span></span>` : p.set ? '<span class="sc-flag">סט משתלם</span>' : ''}
          <h3>${p.title}${p.code ? ` <bdi lang="en" class="tc-code">${p.code}</bdi>` : ''}</h3>
          <span class="sc-meta">${n} מידות, עד גובה <span class="num">${Math.max(...hs)}</span> ס״מ</span>
          ${from != null ? `<span class="sc-p">החל מ־<b>${priceLabel(from)}</b> <small>לפני מע״מ</small></span>` : ''}
        </span></a>`;
  }

  function initHome() {
    const hdr = $('.site-header'), hero = $('#top');
    // the header floats over the hero film, then turns solid (solid without JS)
    if (hdr && hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => hdr.classList.toggle('over', e.isIntersecting), { rootMargin: '-72px 0px 0px 0px', threshold: 0 })
        .observe(hero);
    }

    // chapter dots follow the screen in view
    const dots = $$('.dots a');
    if (dots.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        dots.forEach(d => { if (d.getAttribute('href') === '#' + e.target.id) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      }), { rootMargin: '-48% 0px -48% 0px' });
      dots.forEach(d => { const s = $(d.getAttribute('href')); if (s) io.observe(s); });
    }

    // films: play only in view, never with reduced motion or data saver, always pausable
    const saveData = navigator.connection && navigator.connection.saveData;
    $$('[data-video]').forEach(btn => {
      const v = document.getElementById(btn.dataset.video); if (!v) return;
      let userPaused = reduceMotion || saveData, inView = false;
      const label = () => { $('span', btn).textContent = v.paused ? 'הפעלת הווידאו' : 'השהיית הווידאו'; btn.classList.toggle('paused', v.paused); };
      const sync = () => {
        if (inView && !userPaused) { const p = v.play(); if (p && p.catch) p.catch(() => { userPaused = true; label(); }); }
        else v.pause();
      };
      v.addEventListener('play', label); v.addEventListener('pause', label);
      btn.addEventListener('click', () => { userPaused = !v.paused; if (!userPaused) inView = true; sync(); label(); });
      if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(v);
      label();
    });

    const featured = $('#featured');
    if (featured) featured.innerHTML = VT.products.filter(p => p.featured).map(showCard).join('');

    // collections rail
    const rail = $('#rail');
    if (rail) {
      rail.innerHTML = VT.collections.map((c, i) => {
        const ext = /^https?:/.test(c.href);
        return `<li class="rcard"><a href="${ext ? c.href : VT.BASE + c.href}" ${ext ? 'target="_blank" rel="noopener"' : ''}>
          <img src="${VT.IMG + c.img}" alt="${c.alt}" loading="lazy" decoding="async">
          <span class="rc-b"><span class="rc-n"><span class="num">${String(i + 1).padStart(2, '0')}</span></span>
            <h3>${c.title}</h3>
            <span class="rc-m">${c.count ? `<span class="num">${c.count}</span> פריטים בחנות האונליין` : c.note}<span aria-hidden="true"> ←</span></span>
            ${ext ? '<span class="sr">(נפתח בחלון חדש)</span>' : ''}</span></a></li>`;
      }).join('');
      $$('[data-rail]').forEach(b => b.addEventListener('click', () => {
        const step = ($('.rcard', rail) || rail).getBoundingClientRect().width + 16;
        // RTL: "next" reveals the cards to the left
        rail.scrollBy({ left: b.dataset.rail === 'next' ? -step : step, behavior: reduceMotion ? 'auto' : 'smooth' });
      }));
    }

    // fountains: cheapest, a classic, and the monumental one, straight from the price list
    const ft = $('#fn-tags');
    if (ft) {
      const f = VT.fountains.slice().sort((a, b) => a.price - b.price);
      ft.innerHTML = [f[0], f[Math.floor(f.length / 2)], f[f.length - 1]].map(x => `<li><span>${x.title}</span><b>${priceLabel(x.price)}</b></li>`).join('');
    }
  }

  /* ---------- price list ---------- */
  if (onPriceList) initPriceList();

  function initPriceList() {
    const grid = $('#catalog-grid');
    const st = { cats: new Set(), fins: new Set(), q: '', max: 6000, sort: 'rec' };
    const catChips = $('#cat-chips'), finChips = $('#fin-chips');
    catChips.innerHTML = Object.entries(VT.cats).map(([k, v]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="false">${v}</button>`).join('');
    finChips.innerHTML = ['C', 'G', 'DG', 'B', 'W'].map(c => `<button class="chip" type="button" data-fin="${c}" aria-pressed="false"><span class="sw" style="background:${VT.finishes[c].color}"></span>${VT.finishes[c].name}</button>`).join('');
    catChips.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      toggle(st.cats, b.dataset.cat); draw();
    });
    finChips.addEventListener('click', e => {
      const b = e.target.closest('[data-fin]'); if (!b) return;
      toggle(st.fins, b.dataset.fin); draw();
    });
    function toggle(set, v) { set.has(v) ? set.delete(v) : set.add(v); }

    const qEl = $('#q'), maxEl = $('#max'), maxOut = $('#max-out'), sortEl = $('#sort'), hint = $('#q-hint'), applied = $('#applied');
    let qT;
    qEl.addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(() => { st.q = qEl.value.trim(); draw(); }, 120); });
    function setMax(v) {
      st.max = v; maxEl.value = v;
      const t = v >= 6000 ? 'ללא הגבלה' : 'עד ₪' + VT.fmt(v);
      maxOut.textContent = t; maxEl.setAttribute('aria-valuetext', t);
    }
    maxEl.addEventListener('input', () => { setMax(+maxEl.value); draw(); });
    sortEl.addEventListener('change', () => { st.sort = sortEl.value; draw(); });
    applied.addEventListener('click', e => {
      const b = e.target.closest('[data-unset]'); if (!b) return;
      const [k, v] = b.dataset.unset.split(':');
      if (k === 'cat') st.cats.delete(v);
      if (k === 'fin') st.fins.delete(v);
      if (k === 'max') setMax(6000);
      if (k === 'q') { st.q = ''; qEl.value = ''; }
      if (k === 'all') { st.cats.clear(); st.fins.clear(); setMax(6000); st.q = ''; qEl.value = ''; }
      draw(); qEl.focus();
    });

    function draw() {
      const parsed = parseQuery(st.q);
      const maxP = Math.min(st.max < 6000 ? st.max : Infinity, parsed.max || Infinity);
      let list = VT.products.filter(p => {
        if (st.cats.size && !p.cats.some(c => st.cats.has(c))) return false;
        if (st.fins.size && !p.finishes.some(f => st.fins.has(f))) return false;
        if (parsed.cats.size && !p.cats.some(c => parsed.cats.has(c))) return false;
        if (parsed.fins.size && !p.finishes.some(f => parsed.fins.has(f))) return false;
        if (maxP < Infinity && !(VT.minPrice(p) <= maxP)) return false;
        const dims = (p.sizes || []).map(s => s.dim).concat(p.set ? p.set.dims : []).map(VT.parseDim);
        if (parsed.size && !dims.some(d => [d.w, d.d, d.h].some(x => Math.abs(x - parsed.size) <= 3))) return false;
        if (parsed.height && !dims.some(d => Math.abs(d.h - parsed.height) <= 10)) return false;
        if (parsed.words.length) {
          const hay = norm([p.title, p.code || '', VT.cats[p.cats[0]] || '', ...p.finishes.map(f => VT.finishes[f].name)].join(' '));
          if (!parsed.words.every(w => hay.includes(w))) return false;
        }
        return true;
      });
      if (st.sort === 'low') list.sort((a, b) => VT.minPrice(a) - VT.minPrice(b));
      if (st.sort === 'high') list.sort((a, b) => VT.minPrice(b) - VT.minPrice(a));
      if (st.sort === 'tall') list.sort((a, b) => maxHeight(b) - maxHeight(a));
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">לא נמצאו דגמים שמתאימים לחיפוש. נסו להרחיב את התקציב או לנקות חלק מהסינון.</p>';

      $$('[data-cat]', catChips).forEach(b => b.setAttribute('aria-pressed', st.cats.has(b.dataset.cat)));
      $$('[data-fin]', finChips).forEach(b => b.setAttribute('aria-pressed', st.fins.has(b.dataset.fin)));
      hint.innerHTML = parsed.understood.length ? `הבנו: ${parsed.understood.map(x => `<b>${x}</b>`).join(' · ')}` : '';

      const tags = [...[...st.cats].map(c => [`cat:${c}`, VT.cats[c]]), ...[...st.fins].map(f => [`fin:${f}`, VT.finishes[f].name])];
      if (st.max < 6000) tags.push(['max', 'עד ₪' + VT.fmt(st.max)]);
      if (st.q) tags.push(['q', `״${st.q}״`]);
      applied.innerHTML = `<span class="count"><b class="num">${list.length}</b> דגמים</span>` +
        tags.map(([k, l]) => `<button type="button" class="tag" data-unset="${k}" aria-label="הסרת הסינון ${l}">${l} <span aria-hidden="true">×</span></button>`).join('') +
        (tags.length > 1 ? '<button type="button" class="tag clear" data-unset="all">ניקוי הכל</button>' : '');
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
      ${c.price ? `<span class="price">${priceLabel(c.price)} <small>+ מע״מ</small></span>` : c.perUnit ? '<p class="note">מחיר ליחידה + מע״מ</p>' : '<p class="note">למי שלא פוחד</p>'}
      ${c.alt ? `<p>${c.alt}</p>` : ''}</div></article>`).join('');

    // terracotta
    $('#tc-grid').innerHTML = VT.terracotta.map(t => {
      const f = VT.finishes[t.finish];
      const title = `סט ${t.count} כדי ${f.name}`;
      return `<article class="tag-card">
        <div class="ph"><img class="cover" src="${VT.IMG}${t.img}" alt="${title}" loading="lazy">${t.was ? '<span class="flag">מבצע</span>' : ''}</div>
        <div class="tc-body">
          <div class="tc-top"><h3>${title}</h3><bdi class="tc-code" lang="en">${t.code}</bdi></div>
          <div class="fins"><span class="fin"><i style="background:${f.color}"></i>${f.name}</span></div>
          <p class="legend">קוטר × גובה (ס״מ)</p>
          <ul class="sizes">${t.dims.map(d => `<li class="no-acts">${VTViz.miniIcon('egg', d)}<span class="dim"><span aria-hidden="true" class="dimv">${VT.dimShort(d)}</span><span class="sr">${VT.dimLong(d, 'egg')}</span></span></li>`).join('')}</ul>
          <div class="set-row"><span class="lbl">מחיר הסט</span>
            <div class="row-acts"><span class="price ${t.was ? 'hot' : ''}">${priceLabel(t.price)}${t.was ? ` <s class="num">₪${VT.fmt(t.was)}</s>` : ''}</span>
            <button class="ibtn" type="button" data-add="tc|${t.id}" aria-label="הוספת ${title} לרשימת ההזמנה">${ICON.plus}</button></div></div>
        </div></article>`;
    }).join('');

    // fountains
    $('#fn-grid').innerHTML = VT.fountains.map(f => `<article class="fcard">
      <div class="ph"><img src="${VT.IMG}${f.img}" alt="${f.title}" loading="lazy">${f.was || f.sale ? '<span class="flag">מבצע</span>' : ''}</div>
      <div class="tc-body">
        <div class="tc-top"><h3>${f.title}</h3>${f.code ? `<bdi class="tc-code" lang="en">${f.code}</bdi>` : ''}</div>
        <p class="meta">${f.dims}</p>
        <span class="price ${f.was || f.sale ? 'hot' : ''}">${priceLabel(f.price)}${f.was ? ` <s class="num">₪${VT.fmt(f.was)}</s>` : ''}</span>
        ${f.note ? `<p class="note">${f.note}</p>` : ''}
      </div>
      <div class="tc-foot"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${VT.waLink(`שלום, אשמח לפרטים על ${f.title}${f.code ? ' ' + f.code : ''} (${f.dims}).`)}">${ICON.chat} לפרטים בוואטסאפ</a></div>
    </article>`).join('');
  }

  /* ---------- smart Hebrew search: "אדנית שחורה עד 500", "עגול 60", "גובה 80" ---------- */
  function norm(s) { return String(s).toLowerCase().replace(/[״"׳']/g, '').replace(/\s+/g, ' '); }
  const FIN_WORDS = [['אפור כהה', 'DG'], ['אפור בטון', 'G'], ['שחור', 'B'], ['שחורה', 'B'], ['שחורים', 'B'], ['שחורות', 'B'], ['לבן', 'W'], ['לבנה', 'W'], ['לבנים', 'W'], ['לבנות', 'W'], ['בטון', 'C'], ['אפור', 'G'], ['אפורה', 'G'], ['אפורים', 'G']];
  const CAT_WORDS = {
    round: ['עגול', 'עגולה', 'עגולים', 'עגולות'], tall: ['מרובע', 'מרובעת', 'מרובעים', 'גבוה', 'גבוהה', 'גבוהים', 'קובייה', 'קוביה', 'קוביות'],
    trough: ['אדנית', 'אדניות', 'מלבני', 'מלבנית', 'ארוך', 'ארוכה'], low: ['קערה', 'קערות', 'נמוך', 'נמוכה', 'נמוכים'],
    sets: ['סט', 'סטים'], access: ['מעמד', 'מעמדים', 'פדסטל']
  };
  const STOP = new Set(['עציץ', 'עציצים', 'של', 'עם', 'או', 'גם', 'רוצה', 'מחפש', 'מחפשת', 'משהו', 'בבקשה', 'צבע', 'בצבע', 'סמ', 'ס״מ', 'שח', 'ש״ח', '₪']);
  const PREFIX = /^[והבלמשכ]/;
  function lookup(word) {
    for (const [k, list] of Object.entries(CAT_WORDS)) if (list.includes(word)) return { cat: k };
    const f = FIN_WORDS.find(([w]) => w === word); if (f) return { fin: f[1] };
    return null;
  }
  function parseQuery(q) {
    const out = { cats: new Set(), fins: new Set(), words: [], understood: [], max: null, size: null, height: null };
    if (!q) return out;
    let s = ' ' + norm(q) + ' ';
    s = s.replace(/(?:עד|מתחת ל-?|פחות מ-?)\s*₪?\s*(\d[\d,]*)\s*(?:₪|שח|שקל|שקלים)?/g, (_, n) => { out.max = +n.replace(/,/g, ''); out.understood.push('עד ₪' + VT.fmt(out.max)); return ' '; });
    s = s.replace(/גובה\s*(\d{2,3})/g, (_, n) => { out.height = +n; out.understood.push(`גובה כ־${n} ס״מ`); return ' '; });
    s = s.replace(/(\d{2,3})\s*[\/x×*]\s*\d{2,3}(?:\s*[\/x×*]\s*\d{2,3})?/g, m => { out.size = +m.match(/\d+/)[0]; out.understood.push(`מידה ${m.replace(/\s/g, '')}`); return ' '; });
    s = s.replace(/אפור (כהה|בטון)/g, m => { const f = FIN_WORDS.find(([w]) => w === m)[1]; out.fins.add(f); out.understood.push(VT.finishes[f].name); return ' '; });
    s.split(' ').filter(Boolean).forEach(w => {
      if (/^\d{2,3}$/.test(w)) { out.size = +w; out.understood.push(`מידה כ־${w} ס״מ`); return; }
      if (STOP.has(w)) return;
      let hit = lookup(w);
      if (!hit && PREFIX.test(w) && w.length > 3) hit = lookup(w.slice(1));
      if (hit && hit.cat) { out.cats.add(hit.cat); out.understood.push(VT.cats[hit.cat]); return; }
      if (hit && hit.fin) { out.fins.add(hit.fin); out.understood.push(VT.finishes[hit.fin].name); return; }
      out.words.push(PREFIX.test(w) && w.length > 4 ? w.slice(1) : w);
    });
    out.understood = [...new Set(out.understood)];
    return out;
  }

  /* ---------- model page ---------- */
  const modelEl = $('#model');
  if (modelEl) initModel(product(modelEl.dataset.id));

  function initModel(p) {
    if (!p) return;
    const group = $('#size-pick'), out = $('#size-out');
    const sizes = p.sizes || [];
    function select(dim, push) {
      const s = sizes.find(x => x.dim === dim) || sizes[0]; if (!s) return;
      $$('[data-size]', group).forEach(b => b.setAttribute('aria-pressed', b.dataset.size === s.dim));
      out.innerHTML = `<dl class="spec-dl">${VT.dimLabels(s.dim, p.shape).map((l, i) => `<div><dt>${l}</dt><dd><span class="num">${s.dim.split('/')[i]}</span> ס״מ</dd></div>`).join('')}</dl>
        <p class="big-price ${s.sale ? 'hot' : ''}">${s.price == null ? 'מחיר בטלפון' : priceLabel(s.price)} <small>${s.vat ? 'כולל מע״מ' : 'לפני מע״מ'}${s.sale ? ' · מבצע' : ''}</small></p>
        <div class="btn-row">
          <button class="btn btn-solid" type="button" data-add="${p.id}|${s.dim}">${ICON.plus} הוספה לרשימת ההזמנה</button>
          ${p.noViz ? '' : `<button class="btn btn-ghost" type="button" data-viz="${p.id}|${s.dim}">${ICON.ruler} לראות על המרפסת</button>`}
        </div>`;
      if (push) { const u = new URL(location.href); u.searchParams.set('size', s.dim); history.replaceState(null, '', u); }
      cartRender();
    }
    if (group) {
      group.addEventListener('click', e => { const b = e.target.closest('[data-size]'); if (b) select(b.dataset.size, true); });
      select(new URLSearchParams(location.search).get('size'), false);
    }
    const share = $('#model-share');
    if (share) share.addEventListener('click', async () => {
      const data = { title: `${nameOf(p)} | וילה טוסקנה`, text: `${nameOf(p)} מוילה טוסקנה`, url: location.href };
      try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(location.href); toast('הקישור לדגם הועתק'); }
      catch (e) { window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(data.text + '\n' + location.href), '_blank', 'noopener'); }
    });
    const rel = $('#related');
    if (rel) rel.innerHTML = VT.products.filter(x => x.id !== p.id && x.cats.some(c => p.cats.includes(c))).slice(0, 3).map(card).join('');
  }

  cartRender();
})();
