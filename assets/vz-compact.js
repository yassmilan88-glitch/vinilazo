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
  function start() { run(); setTimeout(run, 1500); }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();
