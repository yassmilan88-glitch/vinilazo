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
if(teamValid||params.has('demo')||legacy){
 var copy=document.querySelector('.hero-copy');
 if(copy&&!copy.querySelector('.vz-back-teams')){var back=make('a','vz-back-teams','← '+t.all);back.href='./';copy.insertBefore(back,copy.firstChild)}
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
function vinylChoice(group,label,subtitle,icon){
 var button=make('button','vz-choice');button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','vz-teams-stage');button.dataset.group=group;
 var face=make('span','vz-choice-vinyl');
 var centre=make('span','vz-choice-centre');centre.append(make('span','vz-choice-symbol',icon),make('strong','',label));
 face.append(centre);
 button.append(face,make('span','vz-choice-caption',subtitle));
 button.addEventListener('click',function(){openGroup(group)});
 return button;
}
var natButton=vinylChoice('nat',t.nat,t.natSub,'🌍');
var clubButton=vinylChoice('club',t.club,t.clubSub,'★');
choices.append(natButton,clubButton);choose.append(choices);
var product=make('div','vz-hero-product');
var aura=make('div','vz-product-aura');
var backHalo=make('div','vz-product-halo');
var frame=make('img','vz-product-frame');frame.src='../assets/img/quadro.webp';frame.width=576;frame.height=658;frame.alt='VINILAZO — quadro-giradischi luminoso';
var ring=make('div','vz-product-led');
var disc=make('div','vz-product-disc');
var label=make('div','vz-product-label');
label.append(make('span','vz-product-mini','VINILAZO'),make('strong','', '9 GOL'));
disc.append(label);
var gloss=make('div','vz-product-gloss');
product.append(aura,backHalo,frame,ring,disc,gloss,make('p','vz-product-tag',t.tag));
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
   var mark=make('span',group==='nat'?'vz-flag-icon':'vz-club-icon');
   if(group==='nat')mark.textContent=({
     argentina:'🇦🇷',brasile:'🇧🇷',francia:'🇫🇷',spagna:'🇪🇸',italia:'🇮🇹',germania:'🇩🇪',inghilterra:'🇬🇧',portogallo:'🇵🇹',olanda:'🇳🇱',messico:'🇲🇽'
   })[team.id]||'🏳️';
   else mark.textContent=team.code||team.name.slice(0,3).toUpperCase();
   a.append(mark,make('strong','vz-flag-name',team.name),make('small','vz-flag-action','→'));
   if(team.id==='argentina')a.append(make('span','vz-flag-ready',t.ready));
   grid.append(a);
 });
 stage.hidden=false;
 requestAnimationFrame(function(){stage.scrollIntoView({behavior:'smooth',block:'start'})});
}
var ending=make('div','vz-catalog-end');ending.append(make('p','',t.about));main.append(ending);
var header=document.querySelector('header.top');if(header)header.insertAdjacentElement('afterend',main);else document.body.prepend(main);
if(location.hash==='#vz-nazionali')openGroup('nat');
if(location.hash==='#vz-club')openGroup('club');
})();