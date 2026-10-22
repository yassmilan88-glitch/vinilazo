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
 var orb=make('span','vz-choice-orb');
 orb.setAttribute('aria-hidden','true');
 orb.dataset.group=group;
 orb.append(make('span','vz-choice-orb-mark'));
 return orb;
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
// Each selector is a luminous sphere showcasing actual federation and club crests.
// One badge at a time means the animation stays legible on small screens.
function startBadgeCarousel(button,group,delay){
 var pool=(D.teams||[]).filter(function(team){return team.g===group});
 if(!pool.length)return;
 var mark=button.querySelector('.vz-choice-orb-mark');
 var index=0;
 function changeBadge(){
  var team=pool[index%pool.length];index++;
  var palette=team.cols||['#74ACDF','#FFFFFF','#C9A227'];
  button.style.setProperty('--orb-a',palette[0]);
  button.style.setProperty('--orb-b',palette[1]);
  button.style.setProperty('--orb-c',palette[2]||palette[0]);
  mark.replaceChildren(teamMark(team,'vz-orb-crest'));
   mark.setAttribute('aria-label',team.name);
  mark.classList.remove('vz-orb-enter');
  void mark.offsetWidth;
  mark.classList.add('vz-orb-enter');
 }
 changeBadge();
 if(pool.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  window.setInterval(function(){if(!document.hidden)changeBadge()},delay);
 }
}
startBadgeCarousel(natButton,'nat',3200);
startBadgeCarousel(clubButton,'club',3700);
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
 labelName.textContent='';
 tag.textContent=team.name+' · 9';
 product.setAttribute('aria-label','VINILAZO: '+team.name+', nove dischi intercambiabili');
}
displayEdition(featured[0]);
if(featured.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 var editionIndex=0;
 window.setInterval(function(){
  if(document.hidden)return;
  editionIndex=(editionIndex+1)%featured.length;
  displayEdition(featured[editionIndex]);
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

// Editorial newspaper carousel: the press memory becomes a VINILAZO record.
var pressTx={
 it:['IL GOL FA STORIA','Certi gol non si dimenticano mai.','Sfoglia i ricordi, ritrova la voce, rivivi quel momento.','Scopri questa squadra','Articolo precedente','Articolo successivo','Giornali d’epoca e ricordi calcistici','Prima era una prima pagina. Ora è un disco.'],
 es:['EL GOL HACE HISTORIA','Hay goles que no se olvidan jamás.','Volvé a esas portadas, escuchá aquella voz, reviví ese momento.','Descubrí este equipo','Anterior portada','Siguiente portada','Portadas históricas y recuerdos del fútbol','Antes era una portada. Hoy es un disco.'],
 fr:['LE BUT ENTRE DANS L’HISTOIRE','Certains buts ne s’oublient jamais.','Retrouvez les unes, la voix du match et cette émotion intacte.','Découvrir cette équipe','Une précédente','Une suivante','Archives de presse et souvenirs de football','Hier en une. Aujourd’hui sur un disque.'],
 en:['WHEN GOALS MAKE HISTORY','Some goals are never forgotten.','See the headlines, hear the voice and relive that instant.','Explore this team','Previous newspaper','Next newspaper','Historic newspaper covers and football memories','Once a front page. Now a record.'],
 de:['TORE SCHREIBEN GESCHICHTE','Manche Tore vergisst man nie.','Erlebe die Schlagzeilen, die Stimme und den Moment noch einmal.','Dieses Team entdecken','Vorherige Zeitung','Nächste Zeitung','Historische Zeitungsseiten und Fußballerinnerungen','Damals Titelseite. Heute Schallplatte.']
}[locale]||[];
var pressStories=[
 {id:'argentina',goal:5,paper:'eg-3481-1986.webp',place:'México · 1986'},
 {id:'argentina',goal:7,paper:'la-nacion-2022.webp',place:'Qatar · 2022'},
 {id:'barcelona',goal:1,paper:'mundo-deportivo-2007.webp',place:'Barcelona · 2007'},
 {id:'argentina',goal:6,paper:'eg-3065-1978.webp',place:'Buenos Aires · 1978'}
];
var press=make('section','vz-press-section');press.id='vz-press';
var pressIntro=make('div','vz-press-intro');
var pressTitle=make('h2','vz-section-title vz-cine-title');
var emphasisByLocale={it:'non si dimenticano mai.',es:'no se olvidan jamás.',fr:'ne s’oublient jamais.',en:'never forgotten.',de:'vergisst man nie.'};
var emphasis=emphasisByLocale[locale]||emphasisByLocale.it;
var emphasisAt=pressTx[1].lastIndexOf(emphasis);
if(emphasisAt>=0){
 pressTitle.append(document.createTextNode(pressTx[1].slice(0,emphasisAt)),make('span','vz-cine-highlight',emphasis));
}else pressTitle.textContent=pressTx[1];
pressIntro.append(make('p','vz-section-eyebrow',pressTx[0]),pressTitle,make('p','vz-press-statement',pressTx[7]),make('p','vz-section-sub',pressTx[2]));
var pressStage=make('div','vz-press-stage');
var pressPaper=make('div','vz-press-paper');
var pressCover=make('img','vz-press-cover');pressCover.alt='';pressCover.loading='lazy';pressCover.decoding='async';pressCover.width=640;pressCover.height=850;
pressPaper.append(pressCover);
var pressArtwork=make('div','vz-press-artwork');
var pressDisc=make('div','vz-press-vinyl');
var pressCenter=make('span','vz-press-vinyl-center');
pressDisc.append(pressCenter);
var pressMeta=make('div','vz-press-meta');
var pressTeam=make('span','vz-press-team');
var pressGoal=make('strong','vz-press-goal');
var pressPlace=make('small','vz-press-place');
var pressLink=make('a','vz-press-link',pressTx[3]+' ↗');
pressMeta.append(pressTeam,pressGoal,pressPlace,pressLink);
pressArtwork.append(pressDisc,pressMeta);
pressStage.append(pressPaper,pressArtwork);
var pressControls=make('div','vz-press-controls');
var pressPrev=make('button','vz-press-arrow','←');pressPrev.type='button';pressPrev.setAttribute('aria-label',pressTx[4]);
var pressCount=make('span','vz-press-count');
var pressNext=make('button','vz-press-arrow','→');pressNext.type='button';pressNext.setAttribute('aria-label',pressTx[5]);
pressControls.append(pressPrev,pressCount,pressNext);
var pressStrip=make('div','vz-press-strip');pressStrip.setAttribute('aria-label',pressTx[6]);
var pressButtons=[];
pressStories.forEach(function(st,i){
 var thumb=make('button','vz-press-thumb');thumb.type='button';thumb.setAttribute('aria-label',(D.teams||[]).find(function(t){return t.id===st.id})?.name+' · '+st.place);
 var im=make('img','');im.src='../assets/img/press/'+st.paper;im.alt='';im.loading='lazy';
 thumb.append(im,make('span','',st.place));thumb.addEventListener('click',function(){renderPress(i)});
 pressStrip.append(thumb);pressButtons.push(thumb);
});
var pressIndex=0;
function renderPress(i){
 pressIndex=(i+pressStories.length)%pressStories.length;
 var st=pressStories[pressIndex];var team=(D.teams||[]).find(function(x){return x.id===st.id});
 var colors=team?.cols||['#74ACDF','#FFFFFF','#F6B40E'];
 pressStage.style.setProperty('--press-a',colors[0]);
 pressStage.style.setProperty('--press-b',colors[1]);
 pressStage.style.setProperty('--press-c',colors[2]);
 pressCover.src='../assets/img/press/'+st.paper;pressCover.alt=st.place+' — '+team.name;
 pressCenter.replaceChildren(teamMark(team,'vz-press-crest'));
 pressTeam.textContent=team.name;
 var goal=team.goals?.[st.goal]||[];
 pressGoal.textContent=goal[0]||team.name;
 pressPlace.textContent=st.place+' · '+(goal[1]||'');
 pressLink.href='?team='+encodeURIComponent(st.id);
 pressCount.textContent=String(pressIndex+1).padStart(2,'0')+' / '+String(pressStories.length).padStart(2,'0');
 pressButtons.forEach(function(el,n){el.classList.toggle('vz-selected',n===pressIndex);el.setAttribute('aria-pressed',String(n===pressIndex))});
 pressPaper.classList.remove('vz-press-enter');pressArtwork.classList.remove('vz-press-enter');
 pressDisc.style.animation='none';
 void pressDisc.offsetWidth;
 pressDisc.style.animation='';
 void pressStage.offsetWidth;
 pressPaper.classList.add('vz-press-enter');pressArtwork.classList.add('vz-press-enter');
 var active=pressButtons[pressIndex];if(active&&active.scrollIntoView&&pressIndex>1){pressStrip.scrollTo({left:active.offsetLeft-pressStrip.offsetLeft-80,behavior:'smooth'})}
}
pressPrev.addEventListener('click',function(){renderPress(pressIndex-1)});
pressNext.addEventListener('click',function(){renderPress(pressIndex+1)});
press.append(pressIntro,pressStage,pressControls,pressStrip);main.append(press);
renderPress(0);
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 window.setInterval(function(){if(!document.hidden&&!press.contains(document.activeElement))renderPress(pressIndex+1)},5800);
}


 // Real supporters at verified celebrations; photo links lead to original Creative Commons files.
 var crowdsText={
 it:['E LA CITTÀ ESPLODE','Non era solo un gol. Era una piazza intera.','I giornali raccontano il risultato. Le strade raccontano quello che abbiamo provato.','Buenos Aires · Mondiali 2022','Roma · Mondiali 2006','Madrid · Mondiali 2010','Foto originale e licenza'],
 es:['Y LA CIUDAD ESTALLA','No fue solo un gol. Fue toda una ciudad.','Los diarios cuentan el resultado. Las calles cuentan lo que sentimos.','Buenos Aires · Mundial 2022','Roma · Mundial 2006','Madrid · Mundial 2010','Foto original y licencia'],
 fr:['ET LA VILLE EXULTE',"Ce n’était pas seulement un but. C’était toute une ville.",'Les unes racontent le score. La rue raconte nos émotions.','Buenos Aires · Coupe du monde 2022','Rome · Coupe du monde 2006','Madrid · Coupe du monde 2010','Photo originale et licence'],
 en:['WHEN A CITY ERUPTS','Not just a goal. An entire city celebrating.','The newspapers record the result. The streets remember how it felt.','Buenos Aires · World Cup 2022','Rome · World Cup 2006','Madrid · World Cup 2010','Original image and licence'],
 de:['WENN EINE STADT JUBELT','Nicht nur ein Tor. Eine ganze Stadt feiert.','Die Zeitungen zeigen das Ergebnis. Die Straßen zeigen das Gefühl.','Buenos Aires · WM 2022','Rom · WM 2006','Madrid · WM 2010','Originalfoto und Lizenz']
 }[locale]||[];
 var crowdPhotos=[
 {file:'Festejos en el Obelisco de Buenos Aires por la obtención de la Copa del Mundo de Fútbol 2022.jpg',image:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Festejos_en_el_Obelisco_de_Buenos_Aires_por_la_obtenci%C3%B3n_de_la_Copa_del_Mundo_de_F%C3%BAtbol_2022.jpg/800px-Festejos_en_el_Obelisco_de_Buenos_Aires_por_la_obtenci%C3%B3n_de_la_Copa_del_Mundo_de_F%C3%BAtbol_2022.jpg',credit:'Gobierno de Buenos Aires · CC BY 2.5 AR',label:3},
 {file:'FIFA world cup 2006 - Rome street party piazza venezia.jpg',image:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/FIFA_world_cup_2006_-_Rome_street_party_piazza_venezia.jpg/960px-FIFA_world_cup_2006_-_Rome_street_party_piazza_venezia.jpg',credit:'Alessio Damato · CC BY-SA 3.0',label:4},
 {file:'2010 0711 Sol Madrid.jpg',image:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/2010_0711_Sol_Madrid.jpg/960px-2010_0711_Sol_Madrid.jpg',credit:'Takeaway · CC BY-SA 3.0',label:5}];
 var fans=make('section','vz-fans');fans.id='vz-fans';
 fans.append(make('p','vz-section-eyebrow',crowdsText[0]),make('h2','vz-section-title vz-fans-title',crowdsText[1]),make('p','vz-section-sub vz-fans-intro',crowdsText[2]));
 var fansGrid=make('div','vz-fans-grid');
 crowdPhotos.forEach(function(scene){
  var figure=make('figure','vz-fans-card'),photo=make('img','vz-fans-photo');
  photo.src=scene.image;
  photo.loading='lazy';photo.decoding='async';photo.alt=crowdsText[scene.label];photo.width=900;photo.height=660;
  var shade=make('div','vz-fans-shade');shade.setAttribute('aria-hidden','true');
  var figcaption=make('figcaption','vz-fans-caption');figcaption.append(make('strong','',crowdsText[scene.label]));
  var source=make('a','vz-fans-credit',crowdsText[6]+' ↗');source.href='https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(scene.file).replace(/%20/g,'_');source.target='_blank';source.rel='noopener noreferrer';source.title=scene.credit;
  source.textContent=scene.credit+' ↗';figcaption.append(source);figure.append(photo,shade,figcaption);fansGrid.append(figure);
 });
 fans.append(fansGrid);main.append(fans);

 // Populate the moving supporters gallery from Wikimedia Commons' openly licensed photo catalogue.
 // Search is scoped to historical celebrations; filter by file licence and image dimensions.
 var gallerySearches=[
  'Argentina 2022 World Cup fans Buenos Aires celebration',
  'Argentina 2022 World Cup celebration Obelisco',
  'France 2018 World Cup fans celebration Paris',
  'Spain 2010 World Cup fans celebration Madrid',
  'Italy 2006 World Cup fans celebration Rome',
  'Brazil World Cup football fans celebration',
  'Morocco 2022 World Cup supporters celebration',
  'football supporters trophy celebrations'
 ];
 var gallerySeen=new Set(crowdPhotos.map(function(scene){return scene.file.toLowerCase()}));
 var galleryCandidates=[];
 function addCommonsImage(page){
  if(!page||!page.title||!/^File:/i.test(page.title)||!page.imageinfo?.[0])return;
  var info=page.imageinfo[0],meta=info.extmetadata||{},license=(meta.LicenseShortName?.value||'').toLowerCase();
  var filename=page.title.slice(5),key=filename.toLowerCase();
  if(gallerySeen.has(key)||!/cc by|public domain|cc0/.test(license)||!info.thumburl||info.width<650||info.height<400)return;
  if(!/\.(jpg|jpeg|png|webp)$/i.test(filename))return;
  gallerySeen.add(key);
  galleryCandidates.push({filename:filename,url:info.thumburl,licence:meta.LicenseShortName?.value||'Creative Commons',description:filename.replace(/\.(jpg|jpeg|png|webp)$/i,'').replace(/[_-]/g,' ')});
 }
 function appendGalleryImages(){
  galleryCandidates.slice(0,27).forEach(function(scene){
   var figure=make('figure','vz-fans-card vz-fans-visible');
   var photo=make('img','vz-fans-photo');photo.src=scene.url;photo.loading='lazy';photo.decoding='async';photo.alt=scene.description;
   var shade=make('div','vz-fans-shade');shade.setAttribute('aria-hidden','true');
   var caption=make('figcaption','vz-fans-caption');
   var title=make('strong','',scene.description.length>58?scene.description.slice(0,55)+'…':scene.description);
   var source=make('a','vz-fans-credit',scene.licence+' · Wikimedia Commons ↗');
   source.href='https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(scene.filename).replace(/%20/g,'_');source.target='_blank';source.rel='noopener noreferrer';
   caption.append(title,source);figure.append(photo,shade,caption);fansGrid.append(figure);
  });
  fansGrid.classList.add('vz-fans-ready');
 }
 // Fetch only while the gallery is on screen, and preserve the existing photos if the service is unavailable.
 async function expandFanGallery(){
  try{
   var tasks=gallerySearches.map(async function(q){
    var url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch='+encodeURIComponent(q)+'&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=900&format=json&origin=*';
    var response=await fetch(url);if(!response.ok)return;
    var payload=await response.json();Object.values(payload.query?.pages||{}).forEach(addCommonsImage);
   });
   await Promise.all(tasks);appendGalleryImages();
  }catch(e){/* Existing editorial photos remain visible offline. */}
 }
 if('IntersectionObserver' in window){
  var galleryLoader=new IntersectionObserver(function(entries){if(entries.some(function(entry){return entry.isIntersecting})){galleryLoader.disconnect();expandFanGallery()}},{rootMargin:'600px'});
  galleryLoader.observe(fans);
 }else expandFanGallery();

 if('IntersectionObserver' in window){
  var fanObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('vz-fans-visible');fanObserver.unobserve(entry.target)}})},{threshold:.17});
  fansGrid.querySelectorAll('.vz-fans-card').forEach(function(card){fanObserver.observe(card)});
 }else fansGrid.querySelectorAll('.vz-fans-card').forEach(function(card){card.classList.add('vz-fans-visible')});

// A concise emotional gift message, without crowding the product selector.
var giftTx={
 it:['UN REGALO CHE FA CENTRO','Per chi dice che non vuole niente. Ma vive per quei colori.','Per tuo padre, il tuo compagno o quell’amico che conosce ancora ogni telecronaca a memoria. Non un oggetto qualsiasi: il suo gol, la sua voce, la sua squadra.','Scegli la squadra del regalo'],
 es:['UN REGALO QUE EMOCIONA','Para quien dice que no necesita nada. Salvo volver a sentir ese gol.','Para tu papá, tu pareja o ese amigo que todavía recita cada relato. Su gol. Su voz. Sus colores.','Elegí el equipo del regalo'],
 fr:['UN CADEAU QUI TOUCHE','Pour celui qui dit ne vouloir rien. Sauf revivre ce but.','Pour un père, un compagnon ou cet ami qui connaît chaque commentaire par cœur. Son but, sa voix, ses couleurs.','Choisir son équipe'],
 en:['THE GIFT THEY REMEMBER','For the man who says he wants nothing. Except that goal again.','For dad, your partner or the friend who still knows every word of the commentary. His team, his voice, his moment.','Choose his team'],
 de:['EIN GESCHENK MIT GEFÜHL','Für den Mann, der sagt, er braucht nichts. Außer dieses Tor noch einmal.','Für Papa, deinen Partner oder den Freund, der jeden Kommentar auswendig kennt. Sein Verein. Seine Stimme. Sein Moment.','Seine Mannschaft wählen']
}[locale]||[];
var gift=make('section','vz-gift-home');gift.id='vz-gift-home';
gift.append(make('p','vz-section-eyebrow',giftTx[0]),make('h2','vz-section-title',giftTx[1]),make('p','vz-section-sub',giftTx[2]));
var giftButton=make('button','vz-gift-button',giftTx[3]+' →');giftButton.type='button';giftButton.addEventListener('click',function(){openGroup('club')});
gift.append(giftButton);main.append(gift);
function openGroup(group){
 natButton.setAttribute('aria-expanded',group==='nat'?'true':'false');
 clubButton.setAttribute('aria-expanded',group==='club'?'true':'false');
 natButton.classList.toggle('vz-active',group==='nat');
 clubButton.classList.toggle('vz-active',group==='club');
 stageTitle.textContent=group==='nat'?t.selectNat:t.selectClub;
 stageSubtitle.textContent=group==='nat'?t.tap:t.tapClub;
 grid.replaceChildren();
 var priority=group==='nat'?['argentina','francia','spagna','brasile','inghilterra']:['inter','real-madrid','barcelona','bayern','psg'];
 (D.teams||[]).filter(function(x){return x.g===group}).sort(function(a,b){
  var ai=priority.indexOf(a.id),bi=priority.indexOf(b.id);
  return (ai<0?999:ai)-(bi<0?999:bi);
 }).forEach(function(team){
   var a=make('a','vz-flag-card');a.href='?team='+encodeURIComponent(team.id);
   a.setAttribute('aria-label',t.discover+': '+team.name);
   var colours=team.cols||['#74acdf','#fff','#f3c134'];
   a.style.setProperty('--team-one',colours[0]);a.style.setProperty('--team-two',colours[1]);a.style.setProperty('--team-three',colours[2]);
   var mark=teamMark(team,'vz-team-logo');
   a.append(mark,make('strong','vz-flag-name',team.name),make('small','vz-flag-action','→'));
   if(team.id==='argentina')a.append(make('span','vz-flag-ready',t.ready));
   if(priority.indexOf(team.id)>=0)a.classList.add('vz-featured-team');
   grid.append(a);
 });
 var customWords={
  it:['Su richiesta','Non trovi la tua squadra?','Realizziamo anche edizioni personalizzate. Raccontaci cosa vorresti.','Richiedi su WhatsApp'],
  es:['A pedido','¿No encontrás tu equipo?','Consultanos por equipos y discos personalizados.','Pedilo por WhatsApp'],
  fr:['Sur demande','Votre équipe manque ?','Demandez une édition personnalisée.','Nous écrire sur WhatsApp'],
  en:['By request','Can’t find your team?','Ask us about customised teams and discs.','Request on WhatsApp'],
  de:['Auf Anfrage','Dein Team fehlt?','Frage nach individuell gestalteten Teams und Platten.','Per WhatsApp anfragen']
 }[locale]||[];
 var customName=group==='nat'?'Marocco':'Arsenal';
 var customIcon=group==='nat'?'🇲🇦':'ARS';
 var customPrompt=encodeURIComponent('Ciao VINILAZO! Vorrei sapere se è possibile personalizzare un’edizione '+customName+' con 9 dischi e audio.');
 var customCard=make('a','vz-flag-card vz-custom-card');
 customCard.href='https://wa.me/393295865883?text='+customPrompt;customCard.target='_blank';customCard.rel='noopener noreferrer';
 customCard.append(make('span','vz-custom-symbol',customIcon),make('strong','vz-flag-name',customName),make('small','vz-custom-hint',customWords[0]+' ↗'));
 grid.append(customCard);
 var req=document.getElementById('vz-request-other');
 if(!req){req=make('div','vz-request-other');req.id='vz-request-other';stage.append(req);}
 req.replaceChildren(make('h3','',customWords[1]),make('p','',customWords[2]));
 var wa=make('a','vz-request-button',customWords[3]+' →');
 wa.href='https://wa.me/393295865883?text='+encodeURIComponent('Ciao VINILAZO! Vorrei una squadra non presente sul sito oppure dischi personalizzati. Mi date informazioni?');
 wa.target='_blank';wa.rel='noopener noreferrer';req.append(wa);
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
  it:[['Inizio','#vz-catalog-main'],['Giornali','#vz-press'],['Nazionali','#vz-nazionali'],['Club','#vz-club'],['Chi siamo','#chi-siamo']],
  es:[['Inicio','#vz-catalog-main'],['Periódicos','#vz-press'],['Selecciones','#vz-nazionali'],['Clubes','#vz-club'],['Quiénes somos','#chi-siamo']],
  fr:[['Accueil','#vz-catalog-main'],['Journaux','#vz-press'],['Sélections','#vz-nazionali'],['Clubs','#vz-club'],['Qui sommes-nous ?','#chi-siamo']],
  en:[['Home','#vz-catalog-main'],['Press','#vz-press'],['National teams','#vz-nazionali'],['Clubs','#vz-club'],['About us','#chi-siamo']],
  de:[['Start','#vz-catalog-main'],['Zeitungen','#vz-press'],['Nationalteams','#vz-nazionali'],['Vereine','#vz-club'],['Über uns','#chi-siamo']]
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