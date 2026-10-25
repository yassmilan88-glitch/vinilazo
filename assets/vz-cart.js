/* VINILAZO — carrello: "Aggiungi al carrello" + "Compra subito", icona nell'intestazione e pannello laterale.
   Il carrello resta nel browser del cliente (localStorage); il pagamento passa dal modulo ordine esistente (app.js → Stripe). */
(function () {
  'use strict';
  var lang = (document.documentElement.lang || 'it').slice(0, 2);
  var W = {
    it: { add: 'Aggiungi al carrello', buy: 'Compra subito', cart: 'Carrello', title: 'Il tuo carrello', empty: 'Il carrello è vuoto.', choose: 'Scegli una squadra', checkout: 'Vai alla cassa', keep: 'Continua a scegliere', another: '+ Aggiungi un’altra squadra', remove: 'Rimuovi', less: 'Uno in meno', more: 'Uno in più', discount: 'Sconto coppie', total: 'Totale', shipping: 'Spedizione inclusa in tutto il mondo', pairHint: 'Aggiungine un altro: 39 € ciascuno acquistandone 2.', pairOn: 'Sconto del 10% su ogni coppia applicato.', max: 'Massimo 6 pezzi per ordine. Per quantità maggiori scrivici su Instagram.', added: '{team} aggiunto al carrello', one: '1 articolo', many: '{n} articoli', edit: 'Modifica carrello', unit: '9 dischi · confezione regalo', close: 'Chiudi' },
    es: { add: 'Agregar al carrito', buy: 'Comprar ahora', cart: 'Carrito', title: 'Tu carrito', empty: 'Tu carrito está vacío.', choose: 'Elegí un equipo', checkout: 'Ir a pagar', keep: 'Seguir eligiendo', another: '+ Agregar otro equipo', remove: 'Quitar', less: 'Uno menos', more: 'Uno más', discount: 'Descuento por pares', total: 'Total', shipping: 'Envío incluido a todo el mundo', pairHint: 'Agregá otro: −39 € cada uno al comprar 2.', pairOn: 'Descuento del 39 € cada uno al comprar 2 aplicado.', max: 'Máximo 6 unidades por pedido. Para más, escribinos por Instagram.', added: '{team} agregado al carrito', one: '1 artículo', many: '{n} artículos', edit: 'Editar carrito', unit: '9 discos · caja de regalo', close: 'Cerrar' },
    fr: { add: 'Ajouter au panier', buy: 'Acheter maintenant', cart: 'Panier', title: 'Votre panier', empty: 'Votre panier est vide.', choose: 'Choisir une équipe', checkout: 'Passer commande', keep: 'Continuer mes achats', another: '+ Ajouter une autre équipe', remove: 'Retirer', less: 'Un de moins', more: 'Un de plus', discount: 'Remise par paire', total: 'Total', shipping: 'Livraison incluse dans le monde entier', pairHint: 'Ajoutez-en un autre : −39 € pièce pour 2.', pairOn: 'Remise de 39 € pièce pour 2 appliquée.', max: '6 articles maximum par commande. Au-delà, écrivez-nous sur Instagram.', added: '{team} ajouté au panier', one: '1 article', many: '{n} articles', edit: 'Modifier le panier', unit: '9 disques · coffret cadeau', close: 'Fermer' },
    en: { add: 'Add to cart', buy: 'Buy now', cart: 'Cart', title: 'Your cart', empty: 'Your cart is empty.', choose: 'Choose a team', checkout: 'Checkout', keep: 'Keep shopping', another: '+ Add another team', remove: 'Remove', less: 'One less', more: 'One more', discount: 'Pair discount', total: 'Total', shipping: 'Free worldwide shipping', pairHint: 'Add one more: €39 each when buying 2.', pairOn: '€39 each when buying 2 applied.', max: 'Maximum 6 items per order. For more, message us on Instagram.', added: '{team} added to cart', one: '1 item', many: '{n} items', edit: 'Edit cart', unit: '9 discs · gift box', close: 'Close' },
    de: { add: 'In den Warenkorb', buy: 'Jetzt kaufen', cart: 'Warenkorb', title: 'Dein Warenkorb', empty: 'Dein Warenkorb ist leer.', choose: 'Team wählen', checkout: 'Zur Kasse', keep: 'Weiter auswählen', another: '+ Weiteres Team hinzufügen', remove: 'Entfernen', less: 'Eins weniger', more: 'Eins mehr', discount: 'Paarrabatt', total: 'Gesamt', shipping: 'Versand weltweit inklusive', pairHint: 'Noch eins dazu: 39 € pro Stück bei 2.', pairOn: '39 € pro Stück bei 2 abgezogen.', max: 'Maximal 6 Stück pro Bestellung. Für mehr schreib uns auf Instagram.', added: '{team} im Warenkorb', one: '1 Artikel', many: '{n} Artikel', edit: 'Warenkorb ändern', unit: '9 Platten · Geschenkbox', close: 'Schließen' }
  };
  var t = W[lang] || W.it;
  var KEY = 'vinilazo-cart', MAX = 6;
  var CFG = window.VINILAZO_CONFIG || {};
  var PRICE = CFG.PRICE || 69, PAIR = Number(CFG.PAIR_PRICE) || PRICE * 2;
  var memory = [];
  var argentinaPage = /\/argentina\/?$/.test(location.pathname);
  var base = argentinaPage ? '../' : './';

  function teamsData() {
    var node = document.getElementById('data');
    try { return JSON.parse(node.textContent).teams || []; } catch (e) { return []; }
  }
  var TEAMS = {};
  teamsData().forEach(function (x) { TEAMS[x.id] = x; });
  if (argentinaPage && !TEAMS.argentina) TEAMS.argentina = { id: 'argentina', name: 'Argentina', cols: ['#74ACDF', '#FFFFFF', '#F6B40E'], ready: true };
  // Le pagine Argentina non hanno l'elenco completo delle squadre: lì il carrello viene solo contato, non modificato.
  var fullList = Object.keys(TEAMS).length > 5;
  function known(id) { return !!TEAMS[id] || (!fullList && typeof id === 'string' && /^[a-z-]{2,40}$/.test(id)); }

  function load() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    var list = Array.isArray(raw) ? raw : memory, out = [], n = 0;
    list.forEach(function (i) {
      if (!i || !known(i.id) || out.some(function (o) { return o.id === i.id; })) return;
      var q = Math.max(1, Math.min(MAX - n, Math.floor(Number(i.qty) || 0)));
      if (q > 0 && n < MAX) { out.push({ id: i.id, qty: q }); n += q; }
    });
    return out;
  }
  function save(list) {
    memory = list;
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function count(list) { return list.reduce(function (a, i) { return a + i.qty; }, 0); }
  function totalOf(n) { return window.VZCommerce.goods(n); }
  function fmt(n) {
    if (window.vzShop) return window.vzShop.fmt(n);
    try { return new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n); } catch (e) { return n + ' €'; }
  }
  function fill(s, m) { return s.replace(/\{(\w+)\}/g, function (_, k) { return m[k] != null ? m[k] : ''; }); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function track(ev, p) { if (window.vzTrack) window.vzTrack(ev, p); }
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 10.6a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.6-1.2L20 8H6.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="19.6" r="1.5" fill="currentColor"/><circle cx="17" cy="19.6" r="1.5" fill="currentColor"/></svg>';
  var ICON_ADD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 10.6a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.6-1.2l1-4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 3.5v6M12 6.5h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="9.5" cy="19.6" r="1.5" fill="currentColor"/><circle cx="17" cy="19.6" r="1.5" fill="currentColor"/></svg>';

  var shopMode = function () { return !!window.vzShop && !document.body.classList.contains('vz-catalog-mode') && !argentinaPage && !!document.getElementById('order-form'); };

  /* ---------- intestazione ---------- */
  var headBtn = null;
  function header() {
    var head = document.querySelector('header.top'); if (!head || head.querySelector('.vz-cart-btn')) return;
    headBtn = el('button', 'vz-cart-btn'); headBtn.type = 'button'; headBtn.innerHTML = ICON;
    headBtn.appendChild(el('span', 'vz-cart-badge', '0'));
    headBtn.addEventListener('click', function () {
      var list = load();
      if (shopMode()) openDrawer();
      else if (list.length) location.href = base + '?team=' + encodeURIComponent(list[0].id) + '&cart=open';
    });
    var slot = head.querySelector('.top-r') || head; slot.appendChild(headBtn);
  }
  function refreshBadge(bump) {
    if (!headBtn) return;
    var n = count(load());
    headBtn.hidden = n === 0;
    headBtn.querySelector('.vz-cart-badge').textContent = String(n);
    headBtn.setAttribute('aria-label', t.cart + ': ' + (n === 1 ? t.one : fill(t.many, { n: n })));
    if (bump) { headBtn.classList.remove('vz-bump'); void headBtn.offsetWidth; headBtn.classList.add('vz-bump'); }
  }

  /* ---------- pulsanti prodotto ---------- */
  function buttons() {
    if (argentinaPage) {
      document.querySelectorAll('.buy a.btn-acc[href*="#ordina"]').forEach(function (main) {
        if (main.parentNode.querySelector('.vz-add-cart')) return;
        main.textContent = t.buy + ' · ' + fmt(window.VZCommerce.goods(1));
        var add = el('a', 'btn vz-add-cart'); add.href = base + '?team=argentina&add=1';
        add.innerHTML = ICON_ADD; add.appendChild(el('span', '', t.add));
        main.after(add);
      });
      return;
    }
    if (!shopMode()) return;
    var main = document.querySelector('.hero .buy a[data-cta]');
    if (main && !main.parentNode.querySelector('.vz-add-cart')) {
      main.textContent = t.buy + ' · ' + fmt(window.VZCommerce.goods(1));
      var add = el('button', 'btn vz-add-cart'); add.type = 'button';
      add.innerHTML = ICON_ADD; add.appendChild(el('span', '', t.add));
      add.addEventListener('click', function () { addCurrent(); });
      main.after(add);
    }
    var sticky = document.querySelector('#sticky a[data-cta]');
    if (sticky && !document.querySelector('.vz-sticky-add')) {
      sticky.textContent = t.buy;
      var s = el('button', 'vz-sticky-add'); s.type = 'button'; s.innerHTML = ICON_ADD;
      s.setAttribute('aria-label', t.add);
      s.addEventListener('click', function () { addCurrent(); });
      sticky.before(s);
    }
  }
  function addCurrent() {
    var id = window.vzShop && window.vzShop.current(); if (!id) return;
    add(id);
  }
  var note = '';
  function add(id) {
    var list = load(), n = count(list);
    if (n >= MAX) { note = t.max; openDrawer(); return; }
    var item = list.find(function (i) { return i.id === id; });
    if (item) item.qty++; else list.push({ id: id, qty: 1 });
    save(list); refreshBadge(true);
    note = fill(t.added, { team: TEAMS[id].name });
    track('AddToCart', { value: PRICE, currency: 'EUR', content_ids: [id], content_type: 'product', num_items: 1 });
    openDrawer();
  }

  /* ---------- pannello carrello ---------- */
  var drawer = null, backdrop = null, former = null;
  function build() {
    if (drawer) return;
    backdrop = el('div', 'vz-cart-backdrop'); backdrop.hidden = true;
    backdrop.addEventListener('click', closeDrawer);
    drawer = el('aside', 'vz-cart'); drawer.id = 'vz-cart'; drawer.hidden = true;
    drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-labelledby', 'vz-cart-title');
    document.body.append(backdrop, drawer);
    drawer.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.from(drawer.querySelectorAll('button:not([disabled]),a[href]'));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }
  function swatch(team) {
    var s = el('span', 'vz-cart-swatch'), c = team.cols || ['#74acdf', '#fff', '#f3c134'];
    s.style.background = 'conic-gradient(' + c[0] + ' 0 33%,' + (c[1] || c[0]) + ' 0 66%,' + (c[2] || c[0]) + ' 0)';
    s.setAttribute('aria-hidden', 'true');
    return s;
  }
  function render() {
    var list = load(), n = count(list), sum = totalOf(n), saving = Math.round((n * PRICE - sum) * 100) / 100;
    drawer.replaceChildren();
    var head = el('div', 'vz-cart-head');
    var h = el('h2', '', t.title); h.id = 'vz-cart-title';
    if (n) h.appendChild(el('small', '', ' · ' + (n === 1 ? t.one : fill(t.many, { n: n }))));
    var x = el('button', 'vz-cart-x', '×'); x.type = 'button'; x.setAttribute('aria-label', t.close); x.addEventListener('click', closeDrawer);
    head.append(h, x); drawer.appendChild(head);
    var live = el('p', 'vz-cart-note', note); live.setAttribute('role', 'status'); note = '';
    drawer.appendChild(live); if (!live.textContent) live.hidden = true;
    if (!n) {
      var empty = el('div', 'vz-cart-empty');
      empty.appendChild(el('p', '', t.empty));
      var go = el('a', 'vz-cart-checkout', t.choose); go.href = base;
      empty.appendChild(go); drawer.appendChild(empty); return;
    }
    var ul = el('ul', 'vz-cart-items');
    list.forEach(function (i) {
      var team = TEAMS[i.id], li = el('li', 'vz-cart-item');
      var info = el('div', 'vz-cart-info');
      info.append(el('strong', '', 'VINILAZO · ' + team.name), el('small', '', t.unit + ' · ' + fmt(PRICE)));
      var step = el('div', 'vz-cart-step');
      var minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', t.less + ' · ' + team.name);
      var q = el('output', '', String(i.qty));
      var plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', t.more + ' · ' + team.name);
      plus.disabled = n >= MAX;
      minus.addEventListener('click', function () { change(i.id, -1, minus); });
      plus.addEventListener('click', function () { change(i.id, 1, plus); });
      step.append(minus, q, plus);
      var rm = el('button', 'vz-cart-rm', t.remove); rm.type = 'button';
      rm.addEventListener('click', function () { change(i.id, -i.qty, null); });
      li.append(swatch(team), info, step, rm); ul.appendChild(li);
    });
    drawer.appendChild(ul);
    if (shopMode() && n < MAX) {
      var more = el('button', 'vz-cart-another', t.another); more.type = 'button';
      // Apertura dopo il click: altrimenti il "clic fuori" del selettore lo richiude subito.
      more.addEventListener('click', function () { closeDrawer(); setTimeout(function () { var p = document.getElementById('team-pick'); if (p) p.click(); }, 0); });
      drawer.appendChild(more);
    }
    var foot = el('div', 'vz-cart-foot');
    foot.appendChild(el('p', 'vz-cart-hint' + (n % 2 ? '' : ' on'), window.VZCommerce.launch() ? '−20% · '+window.VZCommerce.copy[2] : n % 2 ? (n < MAX ? t.pairHint : '') : t.pairOn));
    var dl = el('dl', 'vz-cart-lines');
    if (saving > 0) { var d = el('div'); d.append(el('dt', '', window.VZCommerce.copy[11]), el('dd', '', '−' + fmt(saving))); dl.appendChild(d); }
    var tt = el('div', 'vz-cart-total'); tt.append(el('dt', '', t.total), el('dd', '', fmt(sum))); dl.appendChild(tt);
    foot.appendChild(dl);
    foot.appendChild(el('p', 'vz-cart-ship', '✓ ' + t.shipping));
    var pay = el('button', 'vz-cart-checkout', t.checkout + ' · ' + fmt(sum)); pay.type = 'button';
    pay.addEventListener('click', checkout);
    var keep = el('button', 'vz-cart-keep', t.keep); keep.type = 'button'; keep.addEventListener('click', closeDrawer);
    foot.append(pay, keep);
    drawer.appendChild(foot);
  }
  function change(id, delta, focusAfter) {
    var list = load(), item = list.find(function (i) { return i.id === id; }); if (!item) return;
    item.qty += delta;
    if (count(list) > MAX) { item.qty -= delta; note = t.max; }
    list = list.filter(function (i) { return i.qty > 0; });
    save(list); refreshBadge(false); render();
    var label = focusAfter && focusAfter.getAttribute('aria-label');
    var again = label && drawer.querySelector('button[aria-label="' + label.replace(/"/g, '\\"') + '"]');
    (again && !again.disabled ? again : drawer.querySelector('.vz-cart-x')).focus({ preventScroll: true });
  }
  function openDrawer() {
    if (!shopMode()) return;
    build(); render();
    if (drawer.hidden) former = document.activeElement;
    drawer.hidden = false; backdrop.hidden = false;
    document.documentElement.classList.add('vz-cart-open');
    requestAnimationFrame(function () { drawer.classList.add('in'); backdrop.classList.add('in'); });
    var x = drawer.querySelector('.vz-cart-x'); if (x) x.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('in'); backdrop.classList.remove('in');
    document.documentElement.classList.remove('vz-cart-open');
    drawer.hidden = true; backdrop.hidden = true;
    if (former && former.isConnected && typeof former.focus === 'function') former.focus({ preventScroll: true });
  }
  function checkout() {
    var list = load(); if (!list.length || !window.vzShop) return;
    if (window.vzShop.busy && window.vzShop.busy()) return;
    window.vzShop.orderCart(list, { legend: t.title, edit: t.edit });
    closeDrawer();
    var a = document.createElement('a'); a.href = '#ordina'; a.dataset.vzCart = '1'; a.hidden = true;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function wire() {
    // Ogni altro "Compra subito"/"Ordina" torna all'acquisto della sola squadra mostrata.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#ordina"]');
      if (a && !a.dataset.vzCart && window.vzShop && !(window.vzShop.busy && window.vzShop.busy())) window.vzShop.orderCart(null);
      var edit = e.target.closest && e.target.closest('[data-vz-cart-edit]');
      if (edit) { e.preventDefault(); var x = document.querySelector('#ordina .vz-modal-close'); if (x) x.click(); openDrawer(); }
    }, true);
    window.addEventListener('storage', function (e) { if (e.key === KEY) { refreshBadge(false); if (drawer && !drawer.hidden) render(); } });
  }
  function fromUrl() {
    var params = new URLSearchParams(location.search), want = params.get('add') === '1', open = params.get('cart') === 'open';
    if (!want && !open) return;
    params.delete('add'); params.delete('cart');
    var clean = location.pathname + (params.toString() ? '?' + params.toString() : '') + location.hash;
    try { history.replaceState(null, '', clean); } catch (e) {}
    var tries = 0;
    (function wait() {
      var id = window.vzShop && window.vzShop.current();
      if (!id && tries++ < 30) { setTimeout(wait, 100); return; }
      if (want && id) add(id); else if (open) openDrawer();
    })();
  }
  function start() {
    window.addEventListener('vz-commerce-change',function(){if(drawer && !drawer.hidden)render(); var buy=document.querySelector('.hero .buy a[data-cta]');if(buy)buy.textContent=t.buy+' · '+fmt(window.VZCommerce.goods(1));});
    header(); refreshBadge(false); buttons(); wire(); fromUrl();
    setTimeout(buttons, 1600);
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();
