/* VINILAZO — galleria edizioni: per ogni squadra una scena "sul frigo" e una scheda "set completo".
   Immagini illustrative generate dallo stesso disegno dei dischi del sito (assets/gallery/<id>-frigo|set.webp). */
(function () {
  'use strict';
  var node = document.getElementById('data');
  if (!node || document.getElementById('vz-lifestyle-gallery')) return;
  var data;
  try { data = JSON.parse(node.textContent); } catch (e) { return; }
  var lang = data.lang || 'it';
  var tr = {
    it: {eyebrow:'VINILAZO A CASA',title:'Quei gol, proprio lì sul tuo frigo.',intro:'Tutte le edizioni, da vicino: sul frigo e nel set completo.',illustrative:'Immagini illustrative: grafiche e colori dei dischi possono variare leggermente.',detailTitle:'Ecco come sta a casa tua.',detailIntro:'Il tuo VINILAZO con i colori e i gol della squadra che hai scelto.',detailLink:'Scegli questa edizione',open:'Apri la foto a grandezza naturale',prev:'Foto precedenti',next:'Foto successive',view:'Scopri l’edizione',frigo:'Sul frigo',set:'Il set completo',casa:'A casa',tavolo:'Sul tavolo'},
    es: {eyebrow:'VINILAZO EN CASA',title:'Ese gol, ahí mismo en tu nevera.',intro:'Todas las ediciones, de cerca: en la nevera y en el set completo.',illustrative:'Imágenes ilustrativas: los diseños y colores de los discos pueden variar ligeramente.',detailTitle:'Así queda en tu casa.',detailIntro:'Tu VINILAZO con los colores y goles de tu equipo.',detailLink:'Elegí esta edición',open:'Abrir imagen a tamaño completo',prev:'Fotos anteriores',next:'Fotos siguientes',view:'Descubrí la edición',frigo:'En la nevera',set:'El set completo',casa:'En casa',tavolo:'En la mesa'},
    fr: {eyebrow:'VINILAZO CHEZ VOUS',title:'Ces buts, juste là sur votre frigo.',intro:'Toutes les éditions, de près : sur le frigo et en coffret complet.',illustrative:'Images d’illustration : les visuels et couleurs des disques peuvent légèrement varier.',detailTitle:'Imaginez-le chez vous.',detailIntro:'Votre VINILAZO aux couleurs et aux buts de votre équipe.',detailLink:'Choisir cette édition',open:'Ouvrir la photo en plein format',prev:'Photos précédentes',next:'Photos suivantes',view:'Découvrir l’édition',frigo:'Sur le frigo',set:'Le coffret complet',casa:'Chez vous',tavolo:'Sur la table'},
    en: {eyebrow:'VINILAZO AT HOME',title:'That goal, right there on your fridge.',intro:'Every edition, up close: on the fridge and as a complete set.',illustrative:'Illustrative images: disc artwork and colours may vary slightly.',detailTitle:'Picture it at home.',detailIntro:'Your VINILAZO in your team’s colours, with its unforgettable goals.',detailLink:'Choose this edition',open:'Open full-size photo',prev:'Previous photos',next:'Next photos',view:'Explore this edition',frigo:'On the fridge',set:'The complete set',casa:'At home',tavolo:'On the table'},
    de: {eyebrow:'VINILAZO ZU HAUSE',title:'Dieses Tor, direkt an deinem Kühlschrank.',intro:'Alle Editionen aus der Nähe: am Kühlschrank und als komplettes Set.',illustrative:'Illustrationen: Motive und Farben der Scheiben können leicht abweichen.',detailTitle:'So sieht es bei dir aus.',detailIntro:'Dein VINILAZO mit den Farben und Toren deiner Mannschaft.',detailLink:'Diese Edition wählen',open:'Foto in voller Größe öffnen',prev:'Vorherige Fotos',next:'Nächste Fotos',view:'Edition ansehen',frigo:'Am Kühlschrank',set:'Das komplette Set',casa:'Zu Hause',tavolo:'Auf dem Tisch'}
  }[lang] || null;
  if (!tr) return;

  // Ordine del carosello; gli ID sono quelli delle squadre del sito.
  var order = ['inter', 'milan', 'juventus', 'napoli', 'real-madrid', 'barcelona', 'argentina', 'psg', 'bayern', 'liverpool', 'manchester-city',
    'manchester-united', 'italia', 'brasile', 'francia', 'spagna', 'portogallo', 'germania', 'inghilterra', 'olanda', 'messico'];
  var kinds = ['tavolo', 'frigo', 'set'];
  // Foto vere in casa (prima immagine) per le edizioni che le hanno.
  var homes = { italia: 1, argentina: 1, spagna: 1 };
  function kindsFor(id) { return homes[id] ? ['casa'].concat(kinds) : kinds; }
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
  function imageSrc(id, kind) { return assetBase + id + '-' + kind + '.webp'; }
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
    var section = el('section', 'vz-lifestyle-gallery vz-lifestyle-catalog');
    section.id = 'vz-lifestyle-gallery';
    section.setAttribute('aria-labelledby', 'vz-lifestyle-title');
    var head = titleBlock(); head.querySelector('h2').id = 'vz-lifestyle-title';
    var viewport = el('div', 'vz-lifestyle-rail');
    viewport.setAttribute('aria-label', tr.title);
    var cards = el('div', 'vz-lifestyle-cards');
    order.forEach(function (id) {
      var team = byId[id];
      if (!team) return;
      var card = el('a', 'vz-lifestyle-card');
      card.href = '?team=' + encodeURIComponent(id);
      card.setAttribute('aria-label', tr.view + ': ' + team.name);
      card.style.setProperty('--vz-photo-accent', team.th && team.th.acc || team.cols && team.cols[0] || '#74acdf');
      card.append(productImage(team, 'frigo', 'vz-lifestyle-photo'));
      var label = el('span', 'vz-lifestyle-card-footer');
      label.append(el('strong', '', team.name), el('span', '', '↗'));
      card.append(label);
      cards.append(card);
    });
    viewport.append(cards);
    var controls = el('div', 'vz-lifestyle-controls');
    var prev = el('button', 'vz-lifestyle-arrow', '←');
    var next = el('button', 'vz-lifestyle-arrow', '→');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', tr.prev); next.setAttribute('aria-label', tr.next);
    function advance(dir) { viewport.scrollBy({ left: dir * Math.max(220, viewport.clientWidth * .75), behavior: 'smooth' }); }
    prev.addEventListener('click', function () { advance(-1); });
    next.addEventListener('click', function () { advance(1); });
    controls.append(prev, next);
    var disclaimer = el('p', 'vz-lifestyle-disclaimer', tr.illustrative);
    section.append(head, viewport, controls, disclaimer);
    var anchor = document.getElementById('vz-fans') || document.getElementById('vz-gift-home') || document.querySelector('.vz-catalog-end');
    if (anchor) anchor.before(section); else main.append(section);
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
    section.setAttribute('aria-labelledby', 'vz-lifestyle-title');
    var copy = el('div', 'vz-lifestyle-detail-copy');
    copy.append(el('p', 'vz-lifestyle-eyebrow', tr.eyebrow), el('h2', 'vz-lifestyle-title', tr.detailTitle), el('p', 'vz-lifestyle-intro', tr.detailIntro));
    copy.querySelector('h2').id = 'vz-lifestyle-title';
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
    var current = null;
    function show(kind) {
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
        button.addEventListener('click', function () { show(kind); });
        thumbs.append(button);
      });
      return list[0];
    }
    photoGroup.append(photoLink, thumbs);
    section.append(photoGroup, copy);
    anchor.before(section);
    function refresh() {
      var team = activeTeam();
      section.hidden = !(team && has(team.id));
      if (section.hidden) return;
      if (!current || current.id !== team.id) {
        current = team;
        show(buildThumbs(team));
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
