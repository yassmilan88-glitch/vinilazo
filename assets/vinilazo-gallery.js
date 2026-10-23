/* VINILAZO — lifestyle mockup gallery for featured teams. All five storefront languages. */
(function () {
  'use strict';
  var node = document.getElementById('data');
  if (!node || document.getElementById('vz-lifestyle-gallery')) return;
  var data;
  try { data = JSON.parse(node.textContent); } catch (e) { return; }
  var lang = data.lang || 'it';
  var tr = {
    it: {eyebrow:'VINILAZO A CASA',title:'Quei gol, proprio lì sul tuo frigo.',intro:'Dieci edizioni da vedere da vicino: sul frigorifero, sul tavolo e nel set completo.',illustrative:'Immagini illustrative delle personalizzazioni.',detailTitle:'Ecco come sta a casa tua.',detailIntro:'Il tuo VINILAZO con i colori e i gol della squadra che hai scelto.',detailLink:'Scegli questa edizione',open:'Apri la foto a grandezza naturale',prev:'Foto precedenti',next:'Foto successive',view:'Scopri l’edizione'},
    es: {eyebrow:'VINILAZO EN CASA',title:'Ese gol, ahí mismo en tu nevera.',intro:'Diez ediciones para ver de cerca: en la nevera, sobre la mesa y en el set completo.',illustrative:'Imágenes ilustrativas de las personalizaciones.',detailTitle:'Así queda en tu casa.',detailIntro:'Tu VINILAZO con los colores y goles de tu equipo.',detailLink:'Elegí esta edición',open:'Abrir imagen a tamaño completo',prev:'Fotos anteriores',next:'Fotos siguientes',view:'Descubrí la edición'},
    fr: {eyebrow:'VINILAZO CHEZ VOUS',title:'Ces buts, juste là sur votre frigo.',intro:'Dix éditions à découvrir : sur le réfrigérateur, sur une table et en coffret complet.',illustrative:'Visuels illustratifs des personnalisations.',detailTitle:'Imaginez-le chez vous.',detailIntro:'Votre VINILAZO aux couleurs et aux buts de votre équipe.',detailLink:'Choisir cette édition',open:'Ouvrir la photo en plein format',prev:'Photos précédentes',next:'Photos suivantes',view:'Découvrir l’édition'},
    en: {eyebrow:'VINILAZO AT HOME',title:'That goal, right there on your fridge.',intro:'Ten team editions, seen up close: on the fridge, on a tabletop and as a complete set.',illustrative:'Illustrative images of the custom designs.',detailTitle:'Picture it at home.',detailIntro:'Your VINILAZO in your team’s colours, with its unforgettable goals.',detailLink:'Choose this edition',open:'Open full-size photo',prev:'Previous photos',next:'Next photos',view:'Explore this edition'},
    de: {eyebrow:'VINILAZO ZU HAUSE',title:'Dieses Tor, direkt an deinem Kühlschrank.',intro:'Zehn Editionen zum Entdecken: am Kühlschrank, auf dem Tisch und als komplettes Set.',illustrative:'Beispielbilder der individuellen Gestaltungen.',detailTitle:'So sieht es bei dir aus.',detailIntro:'Dein VINILAZO mit den Farben und Toren deiner Mannschaft.',detailLink:'Diese Edition wählen',open:'Foto in voller Größe öffnen',prev:'Vorherige Fotos',next:'Nächste Fotos',view:'Edition ansehen'}
  }[lang] || null;
  if (!tr) return;

  // Keys match the site's real team IDs. Images use actual player / goal labels from the catalogue.
  var visuals = [
    ['real-madrid', 'real_madrid', 'tavolo'],
    ['psg', 'psg', 'frigo-4'],
    ['manchester-city', 'manchester_city', 'frigo-8'],
    ['barcelona', 'barcelona', 'frigo-2'],
    ['bayern', 'bayern', 'kit'],
    ['liverpool', 'liverpool', 'tavolo'],
    ['inter', 'inter', 'frigo-8'],
    ['argentina', 'argentina', 'frigo-4'],
    ['spagna', 'spagna', 'frigo-2'],
    ['portogallo', 'portogallo', 'kit']
  ];
  var assetBase = (data.assets || '../assets/') + 'lifestyle/';
  var byId = {};
  (data.teams || []).forEach(function (team) { byId[team.id] = team; });
  var galleryById = {};
  visuals.forEach(function (item) { galleryById[item[0]] = item; });
  function el(tag, className, txt) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (txt !== undefined) n.textContent = txt;
    return n;
  }
  function imageSrc(item) { return assetBase + 'vinilazo_' + item[1] + '.webp'; }
  function productImage(item, team, className) {
    var img = el('img', className);
    img.src = imageSrc(item);
    img.alt = 'VINILAZO – ' + (team ? team.name : item[0]) + ' – ' + item[2];
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 850;
    img.height = (item[2] === 'tavolo' ? 1135 : item[2] === 'frigo-8' ? 887 : 851);
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
    visuals.forEach(function (item) {
      var team = byId[item[0]];
      if (!team) return;
      var card = el('a', 'vz-lifestyle-card');
      card.href = '?team=' + encodeURIComponent(item[0]);
      card.setAttribute('aria-label', tr.view + ': ' + team.name);
      card.style.setProperty('--vz-photo-accent', team.cols && team.cols[0] || '#74acdf');
      card.append(productImage(item, team, 'vz-lifestyle-photo'));
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
    copy.append(teamName, cta, el('p', 'vz-lifestyle-disclaimer', tr.illustrative));
    var photoLink = el('a', 'vz-lifestyle-detail-photo');
    photoLink.target = '_blank'; photoLink.rel = 'noopener';
    photoLink.setAttribute('aria-label', tr.open);
    var img = el('img', 'vz-lifestyle-feature');
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 850; img.height = 900;
    photoLink.append(img, el('span', 'vz-lifestyle-zoom', '↗'));
    section.append(photoLink, copy);
    anchor.before(section);
    function refresh() {
      var team = activeTeam();
      var item = team && galleryById[team.id];
      section.hidden = !item;
      if (!item) return;
      var src = imageSrc(item);
      if (img.getAttribute('src') !== src) img.src = src;
      img.alt = 'VINILAZO – ' + team.name + ' – ' + item[2];
      photoLink.href = src;
      teamName.textContent = team.name;
      section.style.setProperty('--vz-photo-accent', team.cols && team.cols[0] || '#74acdf');
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