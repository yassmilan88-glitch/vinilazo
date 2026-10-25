/* VINILAZO — foto sul frigo e galleria edizioni.
   Home: una foto vera (edizione Italia su un frigo) che cambia squadra da sola ogni pochi secondi;
   per le altre squadre colori ed etichette sono rifatti sulla stessa foto (assets/gallery/frigo/<id>.webp).
   Pagina prodotto: foto in casa / sul tavolo / sul frigo / set completo. */
(function () {
  'use strict';
  var node = document.getElementById('data');
  if (!node || document.getElementById('vz-lifestyle-gallery')) return;
  var data;
  try { data = JSON.parse(node.textContent); } catch (e) { return; }
  var lang = data.lang || 'it';
  var tr = {
    it: {eyebrow:'VINILAZO A CASA',title:'Quei gol, proprio lì sul tuo frigo.',intro:'Tutte le edizioni, da vicino: sul frigo e nel set completo.',illustrative:'Immagini illustrative: grafiche e colori dei dischi possono variare leggermente.',detailTitle:'VINILAZO, da ogni angolazione.',detailIntro:'Il tuo VINILAZO con i colori e i gol della squadra che hai scelto.',detailLink:'Scegli questa edizione',open:'Apri la foto a grandezza naturale',prev:'Foto precedenti',next:'Foto successive',view:'Scopri l’edizione',frigo:'Sul frigo',set:'Il set completo',casa:'A casa',tavolo:'Sul tavolo',showTitle:'Così sta sul frigo di casa.',showIntro:'Ogni tre secondi cambia squadra: colori e gol diversi, stesso giradischi magnetico.',showNote:'Foto vera con l’edizione Italia; per le altre squadre abbiamo cambiato colori ed etichette sulla stessa foto. I dettagli possono variare leggermente.',pause:'Ferma',play:'Riprendi',pick:'Scegli la squadra',showing:'In foto'},
    es: {eyebrow:'VINILAZO EN CASA',title:'Ese gol, ahí mismo en tu nevera.',intro:'Todas las ediciones, de cerca: en la nevera y en el set completo.',illustrative:'Imágenes ilustrativas: los diseños y colores de los discos pueden variar ligeramente.',detailTitle:'VINILAZO, desde todos los ángulos.',detailIntro:'Tu VINILAZO con los colores y goles de tu equipo.',detailLink:'Elegí esta edición',open:'Abrir imagen a tamaño completo',prev:'Fotos anteriores',next:'Fotos siguientes',view:'Descubrí la edición',frigo:'En la nevera',set:'El set completo',casa:'En casa',tavolo:'En la mesa',showTitle:'Así queda en la nevera de casa.',showIntro:'Cada tres segundos cambia de equipo: otros colores y otros goles, el mismo tocadiscos magnético.',showNote:'Foto real con la edición Italia; para los demás equipos cambiamos colores y etiquetas sobre la misma foto. Los detalles pueden variar ligeramente.',pause:'Pausa',play:'Seguir',pick:'Elegí el equipo',showing:'En la foto'},
    fr: {eyebrow:'VINILAZO CHEZ VOUS',title:'Ces buts, juste là sur votre frigo.',intro:'Toutes les éditions, de près : sur le frigo et en coffret complet.',illustrative:'Images d’illustration : les visuels et couleurs des disques peuvent légèrement varier.',detailTitle:'VINILAZO sous tous les angles.',detailIntro:'Votre VINILAZO aux couleurs et aux buts de votre équipe.',detailLink:'Choisir cette édition',open:'Ouvrir la photo en plein format',prev:'Photos précédentes',next:'Photos suivantes',view:'Découvrir l’édition',frigo:'Sur le frigo',set:'Le coffret complet',casa:'Chez vous',tavolo:'Sur la table',showTitle:'Voilà ce que ça donne sur le frigo.',showIntro:'Toutes les trois secondes, une autre équipe : d’autres couleurs, d’autres buts, la même platine magnétique.',showNote:'Photo réelle avec l’édition Italie ; pour les autres équipes, nous avons changé les couleurs et les étiquettes sur la même photo. Les détails peuvent légèrement varier.',pause:'Pause',play:'Reprendre',pick:'Choisir l’équipe',showing:'Sur la photo'},
    en: {eyebrow:'VINILAZO AT HOME',title:'That goal, right there on your fridge.',intro:'Every edition, up close: on the fridge and as a complete set.',illustrative:'Illustrative images: disc artwork and colours may vary slightly.',detailTitle:'VINILAZO, from every angle.',detailIntro:'Your VINILAZO in your team’s colours, with its unforgettable goals.',detailLink:'Choose this edition',open:'Open full-size photo',prev:'Previous photos',next:'Next photos',view:'Explore this edition',frigo:'On the fridge',set:'The complete set',casa:'At home',tavolo:'On the table',showTitle:'This is how it looks on a fridge.',showIntro:'Every three seconds it switches team: different colours and goals, the same magnetic turntable.',showNote:'Real photo of the Italy edition; for the other teams we changed the colours and labels on the same photo. Details may vary slightly.',pause:'Pause',play:'Play',pick:'Choose the team',showing:'In the photo'},
    de: {eyebrow:'VINILAZO ZU HAUSE',title:'Dieses Tor, direkt an deinem Kühlschrank.',intro:'Alle Editionen aus der Nähe: am Kühlschrank und als komplettes Set.',illustrative:'Illustrationen: Motive und Farben der Scheiben können leicht abweichen.',detailTitle:'VINILAZO aus jedem Blickwinkel.',detailIntro:'Dein VINILAZO mit den Farben und Toren deiner Mannschaft.',detailLink:'Diese Edition wählen',open:'Foto in voller Größe öffnen',prev:'Vorherige Fotos',next:'Nächste Fotos',view:'Edition ansehen',frigo:'Am Kühlschrank',set:'Das komplette Set',casa:'Zu Hause',tavolo:'Auf dem Tisch',showTitle:'So sieht es am Kühlschrank aus.',showIntro:'Alle drei Sekunden eine andere Mannschaft: andere Farben, andere Tore, derselbe magnetische Plattenspieler.',showNote:'Echtes Foto der Italien-Edition; für die anderen Mannschaften haben wir Farben und Etiketten auf demselben Foto geändert. Details können leicht abweichen.',pause:'Pause',play:'Weiter',pick:'Mannschaft wählen',showing:'Im Foto'}
  }[lang] || null;
  if (!tr) return;

  // Ordine del carosello; gli ID sono quelli delle squadre del sito.
  var order = ['inter', 'milan', 'juventus', 'napoli', 'real-madrid', 'barcelona', 'argentina', 'psg', 'bayern', 'liverpool', 'manchester-city',
    'manchester-united', 'italia', 'brasile', 'francia', 'spagna', 'portogallo', 'germania', 'inghilterra', 'olanda', 'messico'];
  var kinds = ['tavolo', 'frigo', 'set'];
  // Foto vere in casa (prima immagine) per le edizioni che le hanno: lì basta casa + tavolo + set.
  var homes = { italia: 1, argentina: 1, spagna: 1 };
  function kindsFor(id) { return homes[id] ? ['casa', 'tavolo', 'set'] : kinds; }
  // Ordine della foto che cambia squadra in home: si parte dalla foto vera (Italia).
  var showOrder = ['italia', 'napoli', 'inter', 'milan', 'juventus', 'argentina', 'real-madrid', 'barcelona', 'psg', 'bayern', 'liverpool',
    'manchester-city', 'manchester-united', 'brasile', 'francia', 'spagna', 'portogallo', 'germania', 'inghilterra', 'olanda', 'messico'];
  var STEP = 3000;
  var assetBase = (data.assets || '../assets/') + 'gallery/';
  var byId = {};
  (data.teams || []).forEach(function (team) { byId[team.id] = team; });
  function has(id) { return order.indexOf(id) > -1; }
  function el(tag, className, txt) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (txt !== undefined) n.textContent = txt;
    return n;
  }
  function imageSrc(id, kind) { return kind === 'frigo' ? fridgeSrc(id) : assetBase + id + '-' + kind + '.webp'; }
  function fridgeSrc(id) { return assetBase + 'frigo/' + id + '.webp'; }
  function setImage(img, team, kind) {
    img.src = imageSrc(team.id, kind);
    img.alt = 'VINILAZO – ' + team.name + ' – ' + tr[kind];
  }
  function productImage(team, kind, className) {
    var img = el('img', className);
    setImage(img, team, kind);
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1000;
    img.height = 1080;
    return img;
  }
  function titleBlock() {
    var top = el('div', 'vz-lifestyle-heading');
    top.append(el('p', 'vz-lifestyle-eyebrow', tr.eyebrow), el('h2', 'vz-lifestyle-title', tr.title), el('p', 'vz-lifestyle-intro', tr.intro));
    return top;
  }
  function insertCatalogGallery() {
    var main = document.getElementById('vz-catalog-main');
    if (!main) return;
    var list = showOrder.filter(function (id) { return byId[id]; });
    if (!list.length) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var section = el('section', 'vz-lifestyle-gallery vz-lifestyle-catalog vz-fridge-show');
    section.id = 'vz-lifestyle-gallery';
    section.setAttribute('aria-labelledby', 'vz-lifestyle-title');
    var head = el('div', 'vz-lifestyle-heading');
    head.append(el('p', 'vz-lifestyle-eyebrow', tr.eyebrow), el('h2', 'vz-lifestyle-title', tr.showTitle), el('p', 'vz-lifestyle-intro', tr.showIntro));
    head.querySelector('h2').id = 'vz-lifestyle-title';

    var wrap = el('div', 'vz-fridge-wrap');
    var stage = el('div', 'vz-fridge-stage');
    var frame = el('a', 'vz-fridge-frame');
    var layers = [el('img', 'vz-fridge-img is-on'), el('img', 'vz-fridge-img')];
    layers.forEach(function (img) { img.width = 1000; img.height = 1080; img.decoding = 'async'; img.alt = ''; });
    layers[0].loading = 'lazy';
    var badge = el('span', 'vz-fridge-badge');
    var badgeSmall = el('small', '', tr.showing), badgeName = el('strong');
    badge.append(badgeSmall, badgeName);
    frame.append(layers[0], layers[1], badge);
    var bar = el('div', 'vz-fridge-progress'); bar.append(el('i'));
    stage.append(frame, bar);

    var side = el('div', 'vz-fridge-side');
    var name = el('strong', 'vz-fridge-team');
    var goal = el('p', 'vz-fridge-goal');
    var cta = el('a', 'vz-lifestyle-cta', tr.detailLink + ' →');
    var controls = el('div', 'vz-lifestyle-controls vz-fridge-controls');
    var prev = el('button', 'vz-lifestyle-arrow', '←'), toggle = el('button', 'vz-lifestyle-arrow vz-fridge-toggle'), next = el('button', 'vz-lifestyle-arrow', '→');
    prev.type = next.type = toggle.type = 'button';
    prev.setAttribute('aria-label', tr.prev); next.setAttribute('aria-label', tr.next);
    controls.append(prev, toggle, next);
    var chips = el('div', 'vz-fridge-chips');
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', tr.pick);
    list.forEach(function (id, i) {
      var team = byId[id], chip = el('button', 'vz-fridge-chip');
      chip.type = 'button';
      chip.style.setProperty('--vz-chip-a', team.cols && team.cols[0] || '#74acdf');
      chip.style.setProperty('--vz-chip-b', team.cols && (team.cols[1] || team.cols[0]) || '#ffffff');
      chip.append(el('i'), el('span', '', team.name));
      chip.addEventListener('click', function () { userPaused = true; go(i); });
      chips.append(chip);
    });
    side.append(name, goal, cta, controls, chips);
    wrap.append(stage, side);
    var disclaimer = el('p', 'vz-lifestyle-disclaimer', tr.showNote);
    section.append(head, wrap, disclaimer);
    var anchor = document.getElementById('vz-fans') || document.getElementById('vz-gift-home') || document.querySelector('.vz-catalog-end');
    if (anchor) anchor.before(section); else main.append(section);

    var index = -1, front = 0, timer = 0, visible = false, hover = false, userPaused = reduce, token = 0;
    function teamAt(i) { return byId[list[(i + list.length) % list.length]]; }
    function paint(i) {
      var team = teamAt(i), acc = team.th && team.th.acc || team.cols && team.cols[0] || '#74acdf';
      section.style.setProperty('--vz-photo-accent', acc);
      frame.href = cta.href = '?team=' + encodeURIComponent(team.id);
      frame.setAttribute('aria-label', tr.view + ': ' + team.name);
      badgeName.textContent = name.textContent = team.name;
      var g = team.goals && team.goals[0];
      goal.textContent = g ? g[0] + ' · ' + g[1] : '';
      chips.querySelectorAll('button').forEach(function (b, k) {
        var on = k === (i + list.length) % list.length;
        b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on && chips.scrollWidth > chips.clientWidth) chips.scrollTo({ left: b.offsetLeft - (chips.clientWidth - b.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
    function swap(img, i, tk) {
      if (tk !== token) return;
      var old = layers[front];
      front = 1 - front;
      img.classList.add('is-on'); old.classList.remove('is-on');
      paint(i); restartBar(); schedule();
      var pre = new Image(); pre.decoding = 'async'; pre.src = fridgeSrc(teamAt(i + 1).id);
    }
    function go(i) {
      i = (i + list.length) % list.length;
      if (i === index) { schedule(); return; }
      index = i;
      var team = teamAt(i), img = layers[1 - front], tk = ++token;
      clearTimeout(timer);
      img.alt = 'VINILAZO ' + team.name + ' – ' + tr.frigo;
      img.src = fridgeSrc(team.id);
      if (img.decode) img.decode().then(function () { swap(img, i, tk); }, function () { swap(img, i, tk); });
      else if (img.complete) swap(img, i, tk);
      else img.onload = img.onerror = function () { swap(img, i, tk); };
    }
    function playing() { return visible && !hover && !userPaused && !document.hidden; }
    function restartBar() {
      section.classList.remove('is-playing');
      void bar.offsetWidth;
      section.classList.toggle('is-playing', playing());
    }
    function schedule() {
      clearTimeout(timer);
      var on = playing();
      section.classList.toggle('is-playing', on);
      toggle.textContent = userPaused ? '▶' : '❚❚';
      toggle.setAttribute('aria-label', userPaused ? tr.play : tr.pause);
      toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      if (on) timer = setTimeout(function () { go(index + 1); }, STEP);
    }
    prev.addEventListener('click', function () { userPaused = true; go(index - 1); });
    next.addEventListener('click', function () { userPaused = true; go(index + 1); });
    toggle.addEventListener('click', function () { userPaused = !userPaused; restartBar(); schedule(); });
    if (window.matchMedia && matchMedia('(hover: hover)').matches) {
      stage.addEventListener('mouseenter', function () { hover = true; schedule(); });
      stage.addEventListener('mouseleave', function () { hover = false; restartBar(); schedule(); });
    }
    var startX = null;
    frame.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX; startX = null;
      if (Math.abs(dx) > 40) { userPaused = true; go(index + (dx < 0 ? 1 : -1)); }
    });
    document.addEventListener('visibilitychange', function () { restartBar(); schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        restartBar(); schedule();
      }, { threshold: 0.35 }).observe(stage);
    } else { visible = true; }
    // primo fotogramma subito (senza aspettare lo scroll), così la sezione non resta vuota
    layers[0].src = fridgeSrc(list[0]); layers[0].alt = 'VINILAZO ' + teamAt(0).name + ' – ' + tr.frigo;
    index = 0; paint(0); schedule();
  }
  function activeTeam() {
    var nameNode = document.querySelector('#team-pick [data-team-name]');
    var name = nameNode && nameNode.textContent.trim().toLocaleLowerCase();
    var shown = (data.teams || []).find(function (team) { return team.name.toLocaleLowerCase() === name; });
    if (shown) return shown;
    var query = new URLSearchParams(location.search).get('team');
    return byId[query] || byId[data.def_team];
  }
  function insertDetailGallery() {
    var anchor = document.getElementById('idea-regalo') || document.getElementById('ordina');
    if (!anchor) return;
    var section = el('section', 'vz-lifestyle-gallery vz-lifestyle-detail');
    section.id = 'vz-lifestyle-gallery';
    section.setAttribute('aria-label', tr.photos || tr.detailTitle);
    var copy = el('div', 'vz-lifestyle-detail-copy');
    // No promotional heading or subtitle: the product photography leads.
    var teamName = el('strong', 'vz-lifestyle-team-name');
    var cta = el('a', 'vz-lifestyle-cta', tr.detailLink + ' →');
    cta.href = '#ordina';
    var note = el('p', 'vz-lifestyle-disclaimer', tr.illustrative);
    copy.append(teamName, cta, note);
    var photoLink = el('a', 'vz-lifestyle-detail-photo');
    photoLink.target = '_blank'; photoLink.rel = 'noopener';
    photoLink.setAttribute('aria-label', tr.open);
    var img = el('img', 'vz-lifestyle-feature');
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 1000; img.height = 1080;
    photoLink.append(img, el('span', 'vz-lifestyle-zoom', '↗'));
    var photoGroup = el('div', 'vz-lifestyle-photo-group');
    var thumbs = el('div', 'vz-lifestyle-thumbs');
    var current = null, autoTimer = null, activeKind = null;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(kind) {
      activeKind = kind;
      if (!current) return;
      setImage(img, current, kind);
      photoLink.href = imageSrc(current.id, kind);
      thumbs.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-active', b.dataset.kind === kind); b.setAttribute('aria-pressed', b.dataset.kind === kind ? 'true' : 'false'); });
    }
    function buildThumbs(team) {
      thumbs.replaceChildren();
      var list = kindsFor(team.id);
      thumbs.classList.toggle('is-three', list.length > 2);
      list.forEach(function (kind) {
        var button = el('button', 'vz-lifestyle-thumb');
        button.type = 'button';
        button.dataset.kind = kind;
        button.setAttribute('aria-label', tr[kind]);
        var thumb = el('img');
        thumb.loading = 'lazy'; thumb.decoding = 'async'; thumb.width = 80; thumb.height = 86;
        setImage(thumb, team, kind);
        button.append(thumb, el('span', '', tr[kind]));
        button.addEventListener('click', function () { show(kind); restartAuto(); });
        thumbs.append(button);
      });
      return list[0];
    }
    function restartAuto(){
      clearInterval(autoTimer);
      if(reducedMotion)return;
      autoTimer=setInterval(function(){
        if(document.hidden || !current || section.hidden)return;
        var list=kindsFor(current.id), idx=list.indexOf(activeKind);
        show(list[(idx+1)%list.length]);
      },4000);
    }
    document.addEventListener('visibilitychange',function(){if(!document.hidden)restartAuto();});
    photoGroup.append(photoLink, thumbs);
    section.append(photoGroup);
    anchor.before(section);
    function refresh() {
      var team = activeTeam();
      section.hidden = !(team && has(team.id));
      if (section.hidden) return;
      if (!current || current.id !== team.id) {
        current = team;
        show(buildThumbs(team));
        restartAuto();
      }
      teamName.textContent = team.name;
      section.style.setProperty('--vz-photo-accent', team.th && team.th.acc || team.cols && team.cols[0] || '#74acdf');
    }
    refresh();
    var headerName = document.querySelector('#team-pick [data-team-name]');
    if (headerName && window.MutationObserver) {
      new MutationObserver(refresh).observe(headerName, { childList:true, characterData:true, subtree:true });
    }
    window.addEventListener('popstate', refresh);
  }
  function init() {
    if (document.getElementById('vz-lifestyle-gallery')) return;
    if (document.body.classList.contains('vz-catalog-mode')) insertCatalogGallery();
    else insertDetailGallery();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
