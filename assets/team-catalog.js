/* VINILAZO — two-step storefront with animated product and vinyl category choices. */
(function(){
'use strict';
var dataNode=document.getElementById('data');if(!dataNode)return;
var D;try{D=JSON.parse(dataNode.textContent)}catch(e){return}
var locale=D.lang||'it';
var words={
it:{eyebrow:'RIVIVI I BRIVIDI DI QUEL GOL',title:'Quel gol. Quella voce. Di nuovo a casa.',intro:'Un quadro-giradischi luminoso, nove dischi intercambiabili e tutte le emozioni della tua squadra.',choose:'Da dove cominciamo?',nat:'Nazionali',club:'Club',natSub:'Le grandi emozioni delle nazionali',clubSub:'La storia dei tuoi colori',selectNat:'Scegli la tua nazionale',selectClub:'Scegli il tuo club',tap:'Tocca una bandiera e rivivi i suoi gol',tapClub:'Scegli i colori del tuo club e scopri i suoi dischi',back:'Torna alla scelta',discover:'Scopri la collezione',ready:'Pronta consegna',tag:'9 dischi. 9 emozioni.',about:'Non vendiamo soltanto dischi. Custodiamo emozioni.',all:'Tutte le squadre'},
es:{eyebrow:'REVIVE LA EMOCIÓN DE AQUEL GOL',title:'Ese gol. Esa voz. De nuevo en casa.',intro:'Un cuadro-tocadiscos luminoso, nueve discos intercambiables y toda la emoción de tu equipo.',choose:'¿Por dónde empezamos?',nat:'Selecciones',club:'Clubes',natSub:'Las grandes emociones de las selecciones',clubSub:'La historia de tus colores',selectNat:'Elige tu selección',selectClub:'Elige tu club',tap:'Toca una bandera y revive sus goles',tapClub:'Elige los colores de tu club y descubre sus discos',back:'Volver a elegir',discover:'Descubre la colección',ready:'Entrega inmediata',tag:'9 discos. 9 emociones.',about:'No son solo discos. Son recuerdos que siguen vivos.',all:'Todos los equipos'},
fr:{eyebrow:'REVIVEZ LE FRISSON DE CE BUT',title:'Ce but. Cette voix. De retour chez vous.',intro:'Un cadre-platine lumineux, neuf disques interchangeables et toute l’émotion de votre équipe.',choose:'Par où commencer ?',nat:'Sélections',club:'Clubs',natSub:'Les grandes émotions des sélections',clubSub:'L’histoire de vos couleurs',selectNat:'Choisissez votre sélection',selectClub:'Choisissez votre club',tap:'Touchez un drapeau pour revivre ses buts',tapClub:'Choisissez les couleurs de votre club',back:'Retour au choix',discover:'Découvrir la collection',ready:'Expédition immédiate',tag:'9 disques. 9 émotions.',about:'Bien plus que des disques : des émotions à transmettre.',all:'Toutes les équipes'},
en:{eyebrow:'RELIVE THE THRILL OF THAT GOAL',title:'That goal. That voice. Back at home.',intro:'One glowing record-player frame, nine interchangeable discs and all the emotion of your team.',choose:'Where shall we start?',nat:'National teams',club:'Clubs',natSub:'The unforgettable national-team moments',clubSub:'The story behind your colours',selectNat:'Choose your national team',selectClub:'Choose your club',tap:'Tap a flag to relive its goals',tapClub:'Pick your club colours and explore its discs',back:'Back to choices',discover:'Explore the collection',ready:'Ready to ship',tag:'9 discs. 9 emotions.',about:'More than records. Memories worth keeping.',all:'All teams'},
de:{eyebrow:'ERLEBE DIESES TOR NOCH EINMAL',title:'Dieses Tor. Diese Stimme. Wieder zu Hause.',intro:'Ein leuchtender Plattenspieler-Rahmen, neun austauschbare Platten und die Emotionen deines Teams.',choose:'Womit fangen wir an?',nat:'Nationalteams',club:'Vereine',natSub:'Die großen Momente der Nationalteams',clubSub:'Die Geschichte deiner Farben',selectNat:'Wähle dein Nationalteam',selectClub:'Wähle deinen Verein',tap:'Tippe auf eine Flagge und erlebe die Tore neu',tapClub:'Wähle deine Vereinsfarben und entdecke die Platten',back:'Zurück zur Auswahl',discover:'Kollektion entdecken',ready:'Sofort lieferbar',tag:'9 Platten. 9 Emotionen.',about:'Mehr als Schallplatten. Erinnerungen fürs Leben.',all:'Alle Teams'}
};
var t=words[locale]||words.it;
var brand=document.querySelector('.top .wordmark');if(brand)brand.href='./';
var params=new URLSearchParams(location.search);
var teamParam=params.get('team');
var teamValid=D.teams&&D.teams.some(function(x){return x.id===teamParam});
var legacy=location.hash&&/^#(ordina|storie|come-funziona|cosa|idea-regalo|il-mio-ordine|chi-siamo|come-si-usa|storia-\d+)$/.test(location.hash);
function make(tag,cls,content){var e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e}
var flags={argentina:'🇦🇷',brasile:'🇧🇷',francia:'🇫🇷',spagna:'🇪🇸',italia:'🇮🇹',germania:'🇩🇪',inghilterra:'🇬🇧',portogallo:'🇵🇹',olanda:'🇳🇱',messico:'🇲🇽'};
var crestSlugs={
 argentina:'argentina-national-team',brasile:'brazil-national-team',francia:'france-national-team',spagna:'spain-national-team',italia:'italy-national-team',germania:'germany-national-team',inghilterra:'england-national-team',portogallo:'portugal-national-team',olanda:'netherlands-national-team-dutch',messico:'mexico-national-team',
 'real-madrid':'real-madrid',barcelona:'fc-barcelona','manchester-united':'manchester-united',liverpool:'liverpool-fc',bayern:'bayern-munich',juventus:'juventus',milan:'ac-milan',inter:'inter-milan',psg:'paris-saint-germain-psg','manchester-city':'manchester-city'
};
function crestUrl(team){var slug=crestSlugs[team.id];return slug?'https://assets.footylogos.com/logos/'+slug+'/'+slug+'-logo-footylogos.svg':''}
function teamMark(team,className){
 var mark=make('span',className);
 var fallback=team.g==='nat'?(flags[team.id]||'🏆'):(team.code||team.name.slice(0,3)).toUpperCase().slice(0,3);
 var src=crestUrl(team);
 if(!src){mark.textContent=fallback;return mark}
 var img=make('img','vz-crest-image');img.src=src;img.alt='';img.loading=(className==='vz-edition-crest'||className==='vz-header-crest')?'eager':'lazy';
 img.decoding='async';img.addEventListener('error',function(){
  if(mark.contains(img)){mark.textContent=fallback;mark.classList.add('vz-crest-fallback')}
 });
 mark.append(img);return mark;
}

if(teamValid||params.has('demo')||legacy){
 var copy=document.querySelector('.hero-copy');
 if(copy&&!copy.querySelector('.vz-back-teams')){var back=make('a','vz-back-teams','← '+t.all);back.href='./';copy.insertBefore(back,copy.firstChild)}
 // Keep the buying decision clear, with the rest of the story available on demand.
 function foldDescription(){
  var sub=document.querySelector('.hero-copy .sub');if(!sub||sub.querySelector('.vz-read-more'))return;
  var all=sub.textContent.trim();var sentence=/[.!?]\s+\S/.exec(all);if(!sentence)return;
  var boundary=sentence.index+1,first=all.slice(0,boundary),rest=all.slice(boundary).trim();
  if(rest.length<20)return;
  var labels={it:['Continua a leggere…','Mostra meno'],es:['Seguir leyendo…','Mostrar menos'],fr:['Lire la suite…','Afficher moins'],en:['Continue reading…','Show less'],de:['Weiterlesen…','Weniger anzeigen']};
  var l=labels[locale]||labels.it;
  sub.textContent=first+' ';
  var hiddenText=make('span','vz-sub-extra',' '+rest);hiddenText.id='vz-sub-extra';hiddenText.hidden=true;
  var toggle=make('button','vz-read-more',l[0]);toggle.type='button';
  toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',hiddenText.id);
  toggle.addEventListener('click',function(){
   var expanded=toggle.getAttribute('aria-expanded')==='true';
   hiddenText.hidden=expanded;toggle.setAttribute('aria-expanded',String(!expanded));
   toggle.textContent=expanded?l[0]:l[1];
  });
  sub.append(hiddenText,document.createTextNode(' '),toggle);
 }
 function detailCrests(){
  (D.teams||[]).forEach(function(team){
   var button=document.querySelector('#squadre .team[data-team="'+team.id+'"]');if(!button)return;
   var original=button.querySelector('svg.tflag');if(original)original.replaceWith(teamMark(team,'vz-detail-crest'));
  });
  var picker=document.getElementById('team-pick');if(!picker)return;
  function refreshHeader(){
   var name=picker.querySelector('[data-team-name]')?.textContent?.trim().toLowerCase();
   var selected=(D.teams||[]).find(function(team){return team.name.toLowerCase()===name})
    ||(D.teams||[]).find(function(team){return team.id===new URLSearchParams(location.search).get('team')});
   if(!selected)return;
   var old=picker.querySelector('svg.pick-flag')||picker.querySelector('.vz-header-crest');
   if(old&&old.classList.contains('vz-header-crest')&&old.dataset.teamId===selected.id)return;
   var mark=teamMark(selected,'vz-header-crest');mark.dataset.teamId=selected.id;
   if(old)old.replaceWith(mark);else picker.prepend(mark);
  }
  refreshHeader();
  var pending=false;
  new MutationObserver(function(){
   if(pending)return;pending=true;
   queueMicrotask(function(){pending=false;refreshHeader()});
  }).observe(picker,{subtree:true,childList:true,characterData:true});
 }
 function detailInit(){foldDescription();detailCrests()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',detailInit,{once:true});else detailInit();
 return;
}
document.body.classList.add('vz-catalog-mode');
var skip=document.querySelector('a[href="#main"]');if(skip)skip.href='#vz-catalog-main';
if(brand)brand.href='#vz-catalog-main';
var langSelect=document.getElementById('lang-select');
if(langSelect)langSelect.addEventListener('change',function(ev){
 ev.stopImmediatePropagation();var v=langSelect.value;
 if(/^(it|es|fr|en|de)$/.test(v))location.href='../'+v+'/';
},true);
var main=make('main','vz-catalog');main.id='vz-catalog-main';
var hero=make('section','vz-catalog-hero');
var left=make('div','vz-hero-left');
left.append(make('p','vz-kicker',t.eyebrow),make('h1','vz-catalog-title',t.title),make('p','vz-catalog-description',t.intro));
var choose=make('div','vz-choose');choose.id='vz-choose';
choose.append(make('h2','vz-choose-heading',t.choose));
var choices=make('div','vz-choices');
function categorySymbol(group){
 var badges=make('span','vz-category-badges vz-category-'+group);
 var ids=group==='nat'?['argentina','brasile','italia']:['milan','inter','real-madrid'];
 ids.forEach(function(id){
  var team=(D.teams||[]).find(function(x){return x.id===id});
  if(!team)return;
  var slot=make('span','vz-category-badge');
  if(group==='nat'){slot.textContent=flags[id];slot.setAttribute('aria-hidden','true')}
  else slot.append(teamMark(team,'vz-category-club-mark'));
  badges.append(slot);
 });
 badges.setAttribute('aria-hidden','true');
 return badges;
}
function vinylChoice(group,label,subtitle){
 var button=make('button','vz-choice');button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','vz-teams-stage');button.dataset.group=group;
 var face=make('span','vz-choice-vinyl');
 var centre=make('span','vz-choice-centre');centre.append(categorySymbol(group),make('strong','',label));
 face.append(centre);
 button.append(face,make('span','vz-choice-caption',subtitle));
 button.addEventListener('click',function(){openGroup(group)});
 return button;
}
var natButton=vinylChoice('nat',t.nat,t.natSub);
var clubButton=vinylChoice('club',t.club,t.clubSub);
choices.append(natButton,clubButton);choose.append(choices);
var product=make('div','vz-hero-product');
var aura=make('div','vz-product-aura');
var backHalo=make('div','vz-product-halo');
var frame=make('img','vz-product-frame');frame.src='../assets/img/quadro.webp';frame.width=576;frame.height=658;frame.alt='VINILAZO — quadro-giradischi luminoso, grafica squadra intercambiabile';
var art=make('div','vz-product-art');art.setAttribute('aria-hidden','true');
var ring=make('div','vz-product-led');
var disc=make('div','vz-product-disc');
var label=make('div','vz-product-label');
var emblem=make('span','vz-product-emblem');
var labelName=make('strong','vz-product-label-name');
label.append(emblem,labelName);disc.append(label);
var gloss=make('div','vz-product-gloss');
var tag=make('p','vz-product-tag','');
product.append(aura,backHalo,frame,art,disc,ring,gloss,tag);
var flagPatterns={
 argentina:['#74ACDF','#FFFFFF','#74ACDF',180],
 brasile:['#009C3B','#FFDF00','#009C3B',90],
 francia:['#002654','#FFFFFF','#ED2939',90],
 spagna:['#AA151B','#F1BF00','#AA151B',180],
 italia:['#009246','#FFFFFF','#CE2B37',90],
 germania:['#111111','#DD0000','#FFCE00',180],
 inghilterra:['#FFFFFF','#CF081F','#FFFFFF',90],
 portogallo:['#046A38','#DA291C','#DA291C',90],
 olanda:['#AE1C28','#FFFFFF','#21468B',180],
 messico:['#006847','#FFFFFF','#CE1126',90]
};
var featuredIds=['argentina','milan','brasile','barcelona','francia','inter','italia','real-madrid','portogallo','liverpool'];
var featured=featuredIds.map(function(id){return D.teams.find(function(x){return x.id===id})}).filter(Boolean);
if(!featured.length)featured=(D.teams||[]).slice(0,8);
function displayEdition(team){
 var col=team.cols||['#74ACDF','#FFFFFF','#F6B40E'];
 var pat=team.g==='nat'?(flagPatterns[team.id]||[col[0],col[1],col[0],90]):[col[0],col[1],col[0],90];
 document.documentElement.style.setProperty('--c0',pat[0]);
 document.documentElement.style.setProperty('--c1',pat[1]);
 document.documentElement.style.setProperty('--c2',pat[2]);
 document.documentElement.style.setProperty('--stripe','linear-gradient(90deg,'+pat[0]+' 0 33.3%,'+pat[1]+' 33.3% 66.6%,'+pat[2]+' 66.6%)');
 document.documentElement.style.setProperty('--acc',col[0]);
 product.style.setProperty('--edition-color',col[0]);
 product.style.setProperty('--art-a',pat[0]);product.style.setProperty('--art-b',pat[1]);product.style.setProperty('--art-c',pat[2]);product.style.setProperty('--art-angle',pat[3]+'deg');
 art.dataset.kind=team.g;
 emblem.className='vz-product-emblem vz-product-has-crest';
 emblem.replaceChildren();
 var currentMark=teamMark(team,'vz-edition-crest');
 if(currentMark.classList.contains('vz-crest-fallback'))emblem.classList.add('vz-crest-fallback');
 emblem.append(currentMark);
 labelName.textContent=team.name;
 tag.textContent=team.name+' · 9';
 product.setAttribute('aria-label','VINILAZO: '+team.name+', nove dischi intercambiabili');
}
displayEdition(featured[0]);
if(featured.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 var editionIndex=0;
 window.setInterval(function(){
  if(document.hidden)return;
  editionIndex=(editionIndex+1)%featured.length;
  displayEdition(featured[editionIndex]);updateNine(featured[editionIndex]);
 },4300);
}
hero.append(left,product,choose);main.append(hero);
var stage=make('section','vz-teams-stage');stage.id='vz-teams-stage';stage.hidden=true;stage.setAttribute('aria-live','polite');
var stageHead=make('div','vz-stage-head');
var stageBack=make('button','vz-stage-back','← '+t.back);stageBack.type='button';
stageBack.addEventListener('click',function(){
 stage.hidden=true;choices.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-expanded','false');b.classList.remove('vz-active')});
 choose.scrollIntoView({behavior:'smooth',block:'center'});
});
var stageTitle=make('h2','vz-stage-title','');stageTitle.tabIndex=-1;
var stageSubtitle=make('p','vz-stage-sub','');
stageHead.append(stageBack,stageTitle,stageSubtitle);stage.append(stageHead);
var grid=make('div','vz-flag-grid');stage.append(grid);main.append(stage);

// Nine individual, interchangeable records: each edition has its own nine goal stories.
var nine=make('section','vz-nine-section');nine.id='vz-nine';
var nineCopy={
 it:['LA COLLEZIONE','Non uno. Nove dischi.','Un quadro. Nove gol leggendari da scegliere, cambiare e ascoltare.','Scopri le nove emozioni'],
 es:['LA COLECCIÓN','No uno. Nueve discos.','Un cuadro. Nueve goles inolvidables para elegir, cambiar y escuchar.','Descubrí las nueve emociones'],
 fr:['LA COLLECTION','Pas un. Neuf disques.','Un cadre. Neuf buts de légende à choisir, échanger et écouter.','Découvrez les neuf émotions'],
 en:['THE COLLECTION','Not one. Nine records.','One frame. Nine legendary goals to choose, swap and listen to.','Explore the nine moments'],
 de:['DIE KOLLEKTION','Nicht eine. Neun Platten.','Ein Rahmen. Neun legendäre Tore zum Auswählen, Wechseln und Anhören.','Neun Momente entdecken']
}[locale]||['LA COLLEZIONE','Non uno. Nove dischi.','Un quadro. Nove gol leggendari da scegliere, cambiare e ascoltare.','Scopri le nove emozioni'];
var nineText=make('div','vz-nine-text');
nineText.append(make('p','vz-section-eyebrow',nineCopy[0]),make('h2','vz-section-title',nineCopy[1]),make('p','vz-section-sub',nineCopy[2]));
var nineGrid=make('div','vz-nine-grid');
var discItems=[];
for(var i=0;i<9;i++){
 var cell=make('div','vz-nine-item');cell.style.setProperty('--i',i);
 var record=make('div','vz-nine-record');
 var core=make('span','vz-nine-core');
 var idx=make('span','vz-nine-number',String(i+1).padStart(2,'0'));
 core.append(idx);record.append(core);
 var name=make('strong','vz-nine-name');
 var moment=make('small','vz-nine-moment');
 cell.append(record,name,moment);nineGrid.append(cell);
 discItems.push({name:name,moment:moment,core:core});
}
var nineAction=make('button','vz-nine-action',nineCopy[3]+' →');nineAction.type='button';
nineAction.addEventListener('click',function(){openGroup('nat')});
nine.append(nineText,nineGrid,nineAction);main.append(nine);
function updateNine(team){
 var goals=team.goals||[];
 nine.style.setProperty('--nine-color',(team.cols||[])[0]||'#74acdf');
 discItems.forEach(function(item,i){
  var goal=goals[i]||[];
  item.name.textContent=goal[0]||('Gol '+(i+1));
  item.moment.textContent=goal[1]||'';
  item.core.style.background='linear-gradient(135deg,'+(team.cols?.[0]||'#74acdf')+','+(team.cols?.[1]||'#ffffff')+','+(team.cols?.[2]||'#74acdf')+')';
 });
}
updateNine(featured[0]);

// Recovered VINILAZO kitchen scenes. Product close-ups above remain the purchase reference.
var lifeCopy={
 it:['NELLA VITA DI TUTTI I GIORNI','Dove vivono i ricordi.','La cucina, il frigorifero, una telecronaca che ti riporta a quel momento.','Un angolo di Buenos Aires','Un ricordo di Parigi','Ambientazioni illustrative del prodotto'],
 es:['EN LA VIDA COTIDIANA','Donde viven los recuerdos.','La cocina, la heladera, un relato que te devuelve a aquel momento.','Un rincón de Buenos Aires','Un recuerdo de París','Escenas ilustrativas del producto'],
 fr:['DANS LA VIE DE TOUS LES JOURS','Là où vivent les souvenirs.','La cuisine, le réfrigérateur, une voix qui vous ramène à cet instant.','Un coin de Buenos Aires','Un souvenir de Paris','Mises en scène illustratives du produit'],
 en:['IN EVERYDAY LIFE','Where memories live.','The kitchen, the fridge, the commentary that takes you right back.','A corner of Buenos Aires','A Parisian memory','Illustrative product lifestyle scenes'],
 de:['MITTEN IM ALLTAG','Wo Erinnerungen leben.','Die Küche, der Kühlschrank, die Stimme, die dich zurückversetzt.','Ein Stück Buenos Aires','Eine Erinnerung an Paris','Illustrative Produktdarstellungen']
}[locale]||[];
var life=make('section','vz-life-section');life.id='vz-life';
var lifeHead=make('div','vz-life-heading');
lifeHead.append(make('p','vz-section-eyebrow',lifeCopy[0]),make('h2','vz-section-title',lifeCopy[1]),make('p','vz-section-sub',lifeCopy[2]));
var lifePhotos=make('div','vz-life-photos');
[['argentina-kitchen.jpg',lifeCopy[3]],['france-kitchen.jpg',lifeCopy[4]]].forEach(function(entry){
 var figure=make('figure','vz-life-card');
 var img=make('img','vz-life-image');img.src='../assets/img/lifestyle/'+entry[0];img.alt=entry[1]+' — VINILAZO sul frigorifero';img.loading='lazy';img.decoding='async';img.width=800;img.height=1067;
 figure.append(img,make('figcaption','vz-life-caption',entry[1]));lifePhotos.append(figure);
});
life.append(lifeHead,lifePhotos,make('p','vz-life-note',lifeCopy[5]));main.append(life);
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('vz-visible');observer.unobserve(entry.target)}})},{threshold:.13});
 nineGrid.querySelectorAll('.vz-nine-item').forEach(function(el){observer.observe(el)});
 lifePhotos.querySelectorAll('.vz-life-card').forEach(function(el){observer.observe(el)});
}else{nineGrid.querySelectorAll('.vz-nine-item').forEach(function(el){el.classList.add('vz-visible')});lifePhotos.querySelectorAll('.vz-life-card').forEach(function(el){el.classList.add('vz-visible')})}
function openGroup(group){
 natButton.setAttribute('aria-expanded',group==='nat'?'true':'false');
 clubButton.setAttribute('aria-expanded',group==='club'?'true':'false');
 natButton.classList.toggle('vz-active',group==='nat');
 clubButton.classList.toggle('vz-active',group==='club');
 stageTitle.textContent=group==='nat'?t.selectNat:t.selectClub;
 stageSubtitle.textContent=group==='nat'?t.tap:t.tapClub;
 grid.replaceChildren();
 (D.teams||[]).filter(function(x){return x.g===group}).forEach(function(team){
   var a=make('a','vz-flag-card');a.href='?team='+encodeURIComponent(team.id);
   a.setAttribute('aria-label',t.discover+': '+team.name);
   var colours=team.cols||['#74acdf','#fff','#f3c134'];
   a.style.setProperty('--team-one',colours[0]);a.style.setProperty('--team-two',colours[1]);a.style.setProperty('--team-three',colours[2]);
   var mark=teamMark(team,'vz-team-logo');
   a.append(mark,make('strong','vz-flag-name',team.name),make('small','vz-flag-action','→'));
   if(team.id==='argentina')a.append(make('span','vz-flag-ready',t.ready));
   grid.append(a);
 });
 stage.hidden=false;
 requestAnimationFrame(function(){stage.scrollIntoView({behavior:'smooth',block:'start'})});
}
var ending=make('div','vz-catalog-end');
var source=make('small','vz-crest-source');
source.append(document.createTextNode('Team crest images: '));
var footy=make('a','','FootyLogos.com');footy.href='https://www.footylogos.com/';footy.target='_blank';footy.rel='noopener noreferrer';source.append(footy);
ending.append(source);main.append(ending);
var header=document.querySelector('header.top');if(header)header.insertAdjacentElement('afterend',main);else document.body.prepend(main);
// Reuse the existing multilingual about section, normally inserted in the hidden product details.
function restoreAbout(){
 var about=document.getElementById('chi-siamo');if(about)ending.before(about);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreAbout,{once:true});else restoreAbout();
// Floating navigation follows the visitor without obscuring the product.
var navLinks=document.getElementById('vz-nav-links');
if(navLinks){
 var menus={
  it:[['Inizio','#vz-catalog-main'],['9 dischi','#vz-nine'],['Nazionali','#vz-nazionali'],['Club','#vz-club'],['Chi siamo','#chi-siamo']],
  es:[['Inicio','#vz-catalog-main'],['9 discos','#vz-nine'],['Selecciones','#vz-nazionali'],['Clubes','#vz-club'],['Quiénes somos','#chi-siamo']],
  fr:[['Accueil','#vz-catalog-main'],['9 disques','#vz-nine'],['Sélections','#vz-nazionali'],['Clubs','#vz-club'],['Qui sommes-nous ?','#chi-siamo']],
  en:[['Home','#vz-catalog-main'],['9 records','#vz-nine'],['National teams','#vz-nazionali'],['Clubs','#vz-club'],['About us','#chi-siamo']],
  de:[['Start','#vz-catalog-main'],['9 Platten','#vz-nine'],['Nationalteams','#vz-nazionali'],['Vereine','#vz-club'],['Über uns','#chi-siamo']]
 };
 navLinks.replaceChildren();
 (menus[locale]||menus.it).forEach(function(item){
  var link=make('a','',item[0]);link.href=item[1];navLinks.append(link);
  if(item[1]==='#vz-nazionali'||item[1]==='#vz-club')link.addEventListener('click',function(event){
   event.preventDefault();openGroup(item[1]==='#vz-nazionali'?'nat':'club');
  });
 });
}
if(location.hash==='#vz-nazionali')openGroup('nat');
if(location.hash==='#vz-club')openGroup('club');
})();