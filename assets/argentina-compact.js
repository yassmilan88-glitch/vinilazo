/* VINILAZO • progressive disclosure for Argentina's nine historic goals.
   The original articles, references, photo captions and audio controls remain in the DOM. */
(function () {
  'use strict';
  var dataNode = document.getElementById('data');
  if (!document.body.classList.contains('pp') || !dataNode) return;
  var data;
  try { data = JSON.parse(dataNode.textContent); } catch (_) { return; }
  if (!data.team || data.team.id !== 'argentina') return;
  var labels = {
    it: {open:'Scopri i 9 gol, le storie e i giornali',lead:'Apri l’archivio e scegli quale ricordo rivivere.',one:'Leggi la storia, guarda le foto e ascolta la telecronaca',disc:'Gol'},
    es: {open:'Descubrí los 9 goles, las historias y los diarios',lead:'Abrí la colección y elegí el recuerdo que querés revivir.',one:'Leé la historia, mirá las fotos y escuchá el relato',disc:'Gol'},
    fr: {open:'Découvrez les 9 buts, récits et journaux',lead:'Ouvrez la collection et choisissez votre souvenir.',one:'Découvrez l’histoire, les images et le commentaire',disc:'But'},
    en: {open:'Explore all 9 goals, stories and newspapers',lead:'Open the collection and choose the moment you want to relive.',one:'Read the story, see the photos and hear the commentary',disc:'Goal'},
    de: {open:'Entdecke alle 9 Tore, Geschichten und Zeitungen',lead:'Öffne die Sammlung und wähle deine Erinnerung.',one:'Lies die Geschichte, sieh die Bilder und höre den Kommentar',disc:'Tor'}
  }[data.lang] || null;
  if (!labels) return;
  function el(name, className, value) {
    var node=document.createElement(name);
    if (className) node.className=className;
    if (value !== undefined) node.textContent=value;
    return node;
  }
  function boot() {
    var index=document.getElementById('dischi');
    var sections=Array.prototype.slice.call(document.querySelectorAll('main > .pp-disc'));
    if (!index || sections.length !== 9 || document.getElementById('vz-goal-archive')) return;
    var archive=el('section','vz-goal-archive'); archive.id='vz-goal-archive';
    var collection=el('details','vz-archive-disclosure'); collection.id='vz-archive-disclosure';
    var sum=el('summary','vz-archive-summary');
    var summaryCopy=el('span','vz-archive-summary-copy');
    summaryCopy.append(el('strong','',labels.open),el('small','',labels.lead));
    sum.append(el('span','vz-archive-icon','▤'),summaryCopy,el('span','vz-archive-chevron','⌄'));
    collection.append(sum);
    var list=el('div','vz-archive-list');
    var entries=[];
    sections.forEach(function (section,i) {
      var entry=el('details','vz-goal-entry'); entry.dataset.number=String(i+1);
      var headline=section.querySelector('.pp-text h2');
      var subtitle=section.querySelector('.pp-text .pp-sub');
      var meta=section.querySelector('.pp-text .pp-meta li');
      var chip=el('summary','vz-goal-entry-title');
      var main=el('span','vz-goal-entry-name');
      var name=headline ? headline.cloneNode(true) : null;
      if (name) { var minute=name.querySelector('.pp-min'); if (minute) minute.remove(); }
      main.append(el('strong','',(name && name.textContent.trim()) || (data.discs[i] && data.discs[i].g[0]) || labels.disc),el('small','',subtitle ? subtitle.textContent.trim() : ''));
      chip.append(el('span','vz-goal-number',String(i+1).padStart(2,'0')),main,el('span','vz-goal-entry-meta',meta ? meta.textContent.trim() : ''),el('span','vz-goal-chevron','+'));
      entry.append(chip);
      var body=el('div','vz-goal-entry-body');
      body.append(section);entry.append(body);list.append(entry);entries.push(entry);
      entry.addEventListener('toggle',function(){
        if (!entry.open) return;
        entries.forEach(function(other){if (other!==entry) other.open=false;});
      });
    });
    collection.append(list); archive.append(collection);index.insertAdjacentElement('afterend',archive);
    function openGoal(number,scroll) {
      var entry=entries[number-1];if(!entry)return;
      collection.open=true;entry.open=true;
      entries.forEach(function(other){if(other!==entry)other.open=false;});
      if(scroll)requestAnimationFrame(function(){entry.scrollIntoView({block:'start',behavior:'smooth'});});
    }
    document.addEventListener('click',function(event){
      var target=event.target.closest('a[href^="#disco-"]');
      if(!target)return;
      var n=Number(target.getAttribute('href').slice(7));
      if(!(n>=1&&n<=9))return;
      event.preventDefault();
      openGoal(n,true);
      if(history.pushState)history.pushState(null,'','#disco-'+n);
    });
    var hash=location.hash.match(/^#disco-(\d)$/);
    if(hash)openGoal(Number(hash[1]),false);
    window.addEventListener('hashchange',function(){
      var m=location.hash.match(/^#disco-(\d)$/);if(m)openGoal(Number(m[1]),true);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();