/* VINILAZO — modalità compatta: scorciatoie sotto il prodotto e sezioni lunghe richiudibili */
(function () {
  'use strict';
  var lang = (document.documentElement.lang || 'it').slice(0, 2);
  var TX = {
    it: { more: 'Mostra tutto', less: 'Mostra meno', nav: 'Scorciatoie', chips: ['Come funziona', 'Cosa ricevi', 'Idea regalo', 'Domande', 'Come si usa'] },
    es: { more: 'Ver todo', less: 'Ver menos', nav: 'Atajos', chips: ['Cómo funciona', 'Qué recibes', 'Para regalar', 'Preguntas', 'Cómo se usa'] },
    fr: { more: 'Tout afficher', less: 'Réduire', nav: 'Raccourcis', chips: ['Comment ça marche', 'Ce que vous recevez', 'Idée cadeau', 'Questions', 'Mode d’emploi'] },
    en: { more: 'Show all', less: 'Show less', nav: 'Shortcuts', chips: ['How it works', 'What you get', 'Gift idea', 'FAQ', 'How to use'] },
    de: { more: 'Alles anzeigen', less: 'Weniger anzeigen', nav: 'Schnellzugriff', chips: ['So funktioniert’s', 'Lieferumfang', 'Geschenkidee', 'FAQ', 'Anleitung'] }
  };
  var t = TX[lang] || TX.it;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setOpen(sec, open) {
    var btn = sec._vzBtn; if (!btn) return;
    sec.classList.toggle('vz-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? t.less + ' ▴' : t.more + ' ▾';
  }
  function fold(sec) {
    if (!sec || sec._vzBtn || sec.hidden) return;
    if (sec.scrollHeight < 520) return;
    if (!sec.id) sec.id = 'vz-sez-' + Math.random().toString(36).slice(2, 7);
    sec.classList.add('vz-fold');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'vz-fold-btn';
    btn.setAttribute('aria-controls', sec.id);
    sec._vzBtn = btn;
    btn.addEventListener('click', function () {
      var open = !sec.classList.contains('vz-open');
      setOpen(sec, open);
      if (!open && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({ block: 'start', behavior: reduce ? 'instant' : 'smooth' });
    });
    sec.parentNode.insertBefore(btn, sec.nextSibling);
    setOpen(sec, false);
  }
  // Apre la sezione richiusa quando un link porta lì dentro
  function reveal(id) {
    var el = id && document.getElementById(id); if (!el) return;
    var sec = el.closest('.vz-fold'); if (sec && !sec.classList.contains('vz-open')) setOpen(sec, true);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) reveal(decodeURIComponent(a.getAttribute('href').slice(1)));
  }, true);
  window.addEventListener('hashchange', function () { reveal(decodeURIComponent(location.hash.slice(1))); });

  function chips() {
    var copy = document.querySelector('.hero .hero-copy');
    if (!copy || copy.querySelector('.vz-chips')) return;
    var how = document.querySelector('section.how'); if (how && !how.id) how.id = 'come-funziona';
    var faq = document.querySelector('section.faq'); if (faq && !faq.id) faq.id = 'faq';
    var ids = ['come-funziona', 'cosa', 'idea-regalo', 'faq', 'come-si-usa'];
    var nav = document.createElement('nav'); nav.className = 'vz-chips'; nav.setAttribute('aria-label', t.nav);
    ids.forEach(function (id, i) {
      var target = document.getElementById(id); if (!target || target.hidden) return;
      var a = document.createElement('a'); a.href = '#' + id; a.textContent = t.chips[i];
      a.addEventListener('click', function (e) {
        e.preventDefault(); reveal(id);
        var hdr = document.querySelector('header.top'), off = (hdr ? hdr.getBoundingClientRect().height : 0) + 10;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'instant' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      });
      nav.appendChild(a);
    });
    if (nav.children.length < 2) return;
    var fine = copy.querySelector('.fine'), buy = copy.querySelector('.buy');
    var after = fine || buy; if (after) after.parentNode.insertBefore(nav, after.nextSibling); else copy.appendChild(nav);
  }

  function run() {
    chips();
    ['chi-siamo', 'come-si-usa'].forEach(function (id) { fold(document.getElementById(id)); });
    fold(document.querySelector('section.faq'));
    if (location.hash) reveal(decodeURIComponent(location.hash.slice(1)));
  }
  // Telefono: intestazione che si nasconde scorrendo in giù
  function headroom() {
    var head = document.querySelector('header.top'); if (!head || head._vzHead) return; head._vzHead = true;
    var lastY = window.scrollY, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, mobile = window.innerWidth <= 700;
        if (!mobile || y < 260 || y < lastY - 4) head.classList.remove('vz-head-hidden');
        else if (y > lastY + 4 && !head.contains(document.activeElement)) head.classList.add('vz-head-hidden');
        lastY = y; ticking = false;
      });
    }, { passive: true });
  }
  // Computer: "Compra subito · prezzo" nell'intestazione quando il pulsante principale esce dallo schermo
  var CTA = { it: 'Compra subito', es: 'Comprar ahora', fr: 'Acheter', en: 'Buy now', de: 'Jetzt kaufen' };
  function headCta() {
    var head = document.querySelector('header.top'), main = document.querySelector('.hero .buy a[data-cta]');
    if (!head || !main || head.querySelector('.vz-head-cta') || !main.offsetParent || !('IntersectionObserver' in window)) return;
    var priceEl = document.querySelector('[data-price]');
    var price = priceEl ? priceEl.textContent.trim() : '';
    var a = document.createElement('a'); a.className = 'vz-head-cta'; a.href = '#ordina';
    a.textContent = (CTA[lang] || CTA.it) + (price ? ' · ' + price : '');
    var slot = head.querySelector('.top-r') || head; slot.insertBefore(a, slot.firstChild);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { document.documentElement.classList.toggle('vz-show-head-cta', !e.isIntersecting && e.boundingClientRect.top < 0); });
    }).observe(main);
  }
  // Pulsante Home ben visibile nelle pagine prodotto (in home non serve)
  var HOME = { it: 'Home', es: 'Inicio', fr: 'Accueil', en: 'Home', de: 'Start' };
  function homeBtn() {
    var head = document.querySelector('header.top');
    if (!head || head.querySelector('.vz-home-btn') || document.body.classList.contains('vz-catalog-mode')) return;
    var a = document.createElement('a'); a.className = 'vz-home-btn';
    a.href = /\/argentina\/?$/.test(location.pathname) ? '../' : './';
    a.setAttribute('aria-label', HOME[lang] || HOME.it);
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9.5h4.5V15h3v4.5H18V10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>';
    var txt = document.createElement('span'); txt.textContent = HOME[lang] || HOME.it; a.appendChild(txt);
    var brand = head.querySelector('.wordmark');
    if (brand && brand.nextSibling) head.insertBefore(a, brand.nextSibling); else head.insertBefore(a, head.firstChild);
  }
  function start() { homeBtn(); run(); headroom(); headCta(); setTimeout(function () { homeBtn(); run(); headCta(); }, 1500); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();

/* Recognisable Home / product context; no changes to purchase or tracking. */
(function(){
 function boot(){
  var source=document.getElementById('data');if(!source)return;
  var data;try{data=JSON.parse(source.textContent)}catch(e){return;}
  var lang=data.lang||'it';
  var labels={it:['Home','Collezione','Edizione','Hai un gol nel cuore?','Non deve essere per forza uno di quelli che abbiamo scelto. Scrivici quale: possiamo metterlo sul tuo VINILAZO.'],es:['Inicio','Colección','Edición'],fr:['Accueil','Collection','Édition'],en:['Home','Collection','Edition'],de:['Start','Kollektion','Edition']}[lang]||['Home','Collection','Edition'];
  var home=document.body.classList.contains('vz-catalog-mode');
  var base=/\/argentina\/?$/.test(location.pathname)?'../':'./';
  var head=document.querySelector('header.top');if(!head)return;
  var brand=head.querySelector('.wordmark');if(brand){brand.href=base;brand.setAttribute('aria-label','VINILAZO · '+labels[0]);}
  var nav=document.createElement('nav');nav.className='vz-page-context';nav.setAttribute('aria-label',labels[1]);
  var link=document.createElement('a');link.href=base;link.textContent=labels[0];nav.append(link);
  if(home){link.setAttribute('aria-current','page');var collection=document.createElement('strong');collection.textContent=' · '+labels[1]+' VINILAZO';nav.append(collection);}
  else{
   var sep=document.createElement('span');sep.textContent='›';sep.setAttribute('aria-hidden','true');nav.append(sep);
   var title=document.createElement('strong');title.setAttribute('aria-current','page');nav.append(title);
   function update(){var name=document.querySelector('#team-pick [data-team-name]')?.textContent.trim()||data.team?.name||'';title.textContent=labels[2]+' '+name;document.title='VINILAZO · '+labels[2]+' '+name;}
   update();var nameNode=document.querySelector('#team-pick [data-team-name]');if(nameNode)new MutationObserver(update).observe(nameNode,{childList:true,subtree:true,characterData:true});
  }
  head.after(nav);
  if(lang==='it'){
   document.querySelectorAll('.vz-request-other').forEach(function(box){var title=box.querySelector('h3'),text=box.querySelector('h3 + p');if(title)title.textContent=labels[3];if(text)text.textContent=labels[4];});
   var faq=document.querySelectorAll('.faq details');faq.forEach(function(detail){if(/personalizz/i.test(detail.querySelector('summary')?.textContent||'')){var p=detail.querySelector('p');if(p)p.textContent=labels[3]+' '+labels[4];}});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* The visitor's own goal and shared memory, in Home and each edition. */
(function(){
 'use strict';
 var copy={"it":["Hai un gol nel cuore?","Non deve essere per forza uno di quelli che abbiamo scelto. Scrivici quale: possiamo metterlo sul tuo VINILAZO.","Raccontaci il tuo gol"],"es":["¿Hay un gol que llevás en el corazón?","No tiene que ser uno de los que elegimos. Contanos cuál: podemos ponerlo en tu VINILAZO.","Contanos tu gol"],"fr":["Tu as un but dans le cœur ?","Ce n’est pas forcément l’un de ceux que nous avons choisis. Dis-nous lequel : nous pouvons le mettre sur ton VINILAZO.","Raconte-nous ton but"],"en":["Is there a goal close to your heart?","It doesn’t have to be one of the goals we’ve chosen. Tell us which one: we can put it on your VINILAZO.","Tell us your goal"],"de":["Gibt es ein Tor, das dir am Herzen liegt?","Es muss keines der Tore sein, die wir ausgewählt haben. Schreib uns, welches du möchtest: Wir können es auf deinen VINILAZO bringen.","Erzähl uns von deinem Tor"]};
 function boot(){
  var lang=(document.documentElement.lang||'it').slice(0,2),t=copy[lang]||copy.en;
  var home=document.body.classList.contains('vz-catalog-mode');
  var section=document.createElement('section');section.className='vz-personal-memory';section.id='il-tuo-gol';
  section.setAttribute('aria-labelledby','vz-personal-memory-title');
  var h=document.createElement('h2');h.id='vz-personal-memory-title';h.textContent=t[0];
  var p=document.createElement('p');p.textContent=t[1];
  var a=document.createElement('a');a.className='vz-personal-memory-cta';a.textContent=t[2]+' →';
  var prompts={it:'Ciao VINILAZO! Ho un gol nel cuore e vorrei farlo rivivere sul mio disco. Il gol e il ricordo sono: ',es:'¡Hola VINILAZO! Quiero personalizar un disco con un gol especial. El gol y mi recuerdo son: ',fr:'Bonjour VINILAZO ! Je voudrais un disque avec un but qui compte pour moi. Mon but et mon souvenir : ',en:'Hi VINILAZO! I’d love a custom disc with a goal that means something to me. The goal and my memory: ',de:'Hallo VINILAZO! Ich möchte eine Platte mit einem besonderen Tor. Mein Tor und meine Erinnerung: '};
  a.href='https://wa.me/393295865883?text='+encodeURIComponent(prompts[lang]||prompts.en);a.target='_blank';a.rel='noopener noreferrer';
  section.append(h,p,a);
  var anchor=home?document.getElementById('vz-press'):document.getElementById('momento');
  if(anchor)anchor.before(section);
  // The team picker keeps the same invitation if the visitor opens it later.
  function updateRequests(){
   document.querySelectorAll('.vz-request-other,.vz-picker-request').forEach(function(box){
    var title=box.querySelector('h3,strong'),text=box.querySelector('h3 + p,strong + p');
    if(title&&title.textContent!==t[0])title.textContent=t[0];
    if(text&&text.textContent!==t[1])text.textContent=t[1];
   });
  }
  updateRequests();
  var stage=document.getElementById('vz-teams-stage');
  if(stage)new MutationObserver(updateRequests).observe(stage,{childList:true,subtree:true});
  // One subtle entrance per phrase, with reduced-motion support.
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('vz-emotion-visible');observer.unobserve(entry.target);}});},{threshold:.15,rootMargin:'0px 0px -20px 0px'});
  var selectors='.vz-personal-memory h2,.vz-personal-memory > p,.moment h2,.moment .poem p.hit,.moment-after,.vz-press-intro h2,.vz-press-statement,.vz-gift-home h2,#gift-heading,.vz-about-sign';
  document.querySelectorAll(selectors).forEach(function(el){el.classList.add('vz-emotion-phrase');observer.observe(el);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
