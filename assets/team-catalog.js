/* VINILAZO — two-step storefront with animated product and vinyl category choices. */
(function(){
'use strict';
var dataNode=document.getElementById('data');if(!dataNode)return;
var D;try{D=JSON.parse(dataNode.textContent)}catch(e){return}
var locale=D.lang||'it';
var words={
it:{eyebrow:'GIRADISCHI MAGNETICO · 9 DISCHI',title:'I gol della tua squadra',intro:'Un quadro-giradischi magnetico e luminoso con 9 dischi intercambiabili: appoggi il disco e parte la telecronaca del gol. Di solito i clienti lo attaccano al frigo, ma c’è chi lo mette su altre superfici in metallo.',choose:'Da dove cominciamo?',nat:'Nazionali',club:'Club',natSub:'Le grandi emozioni delle nazionali',clubSub:'La storia dei tuoi colori',selectNat:'Scegli la tua nazionale',selectClub:'Scegli il tuo club',tap:'Tocca una bandiera e rivivi i suoi gol',tapClub:'Scegli i colori del tuo club e scopri i suoi dischi',back:'Torna alla scelta',discover:'Scopri la collezione',ready:'Pronta consegna',tag:'9 dischi. 9 emozioni.',about:'Non vendiamo soltanto dischi. Custodiamo emozioni.',all:'Tutte le squadre'},
es:{eyebrow:'TOCADISCOS MAGNÉTICO · 9 DISCOS',title:'Los goles de tu equipo',intro:'Un cuadro-tocadiscos magnético y luminoso con 9 discos intercambiables: apoyás el disco y arranca el relato del gol. La mayoría de los clientes lo pega en la nevera, pero hay quien lo pone en otras superficies de metal.',choose:'¿Por dónde empezamos?',nat:'Selecciones',club:'Clubes',natSub:'Las grandes emociones de las selecciones',clubSub:'La historia de tus colores',selectNat:'Elige tu selección',selectClub:'Elige tu club',tap:'Toca una bandera y revive sus goles',tapClub:'Elige los colores de tu club y descubre sus discos',back:'Volver a elegir',discover:'Descubre la colección',ready:'Entrega inmediata',tag:'9 discos. 9 emociones.',about:'No son solo discos. Son recuerdos que siguen vivos.',all:'Todos los equipos'},
fr:{eyebrow:'PLATINE MAGNÉTIQUE · 9 DISQUES',title:'Les buts de votre équipe',intro:'Un cadre-platine magnétique et lumineux avec 9 disques interchangeables : vous posez le disque et le commentaire du but démarre. La plupart des clients le fixent sur le frigo, certains sur d’autres surfaces en métal.',choose:'Par où commencer ?',nat:'Sélections',club:'Clubs',natSub:'Les grandes émotions des sélections',clubSub:'L’histoire de vos couleurs',selectNat:'Choisissez votre sélection',selectClub:'Choisissez votre club',tap:'Touchez un drapeau pour revivre ses buts',tapClub:'Choisissez les couleurs de votre club',back:'Retour au choix',discover:'Découvrir la collection',ready:'Expédition immédiate',tag:'9 disques. 9 émotions.',about:'Bien plus que des disques : des émotions à transmettre.',all:'Toutes les équipes'},
en:{eyebrow:'MAGNETIC RECORD PLAYER · 9 DISCS',title:'Your team’s goals',intro:'A magnetic, light-up record-player frame with 9 interchangeable discs: place a disc and the goal commentary starts. Most customers stick it on the fridge, some on other metal surfaces.',choose:'Where shall we start?',nat:'National teams',club:'Clubs',natSub:'The unforgettable national-team moments',clubSub:'The story behind your colours',selectNat:'Choose your national team',selectClub:'Choose your club',tap:'Tap a flag to relive its goals',tapClub:'Pick your club colours and explore its discs',back:'Back to choices',discover:'Explore the collection',ready:'Ready to ship',tag:'9 discs. 9 emotions.',about:'More than records. Memories worth keeping.',all:'All teams'},
de:{eyebrow:'MAGNETISCHER PLATTENSPIELER · 9 PLATTEN',title:'Die Tore deines Teams',intro:'Ein magnetischer, leuchtender Plattenspieler-Rahmen mit 9 austauschbaren Platten: Platte auflegen und der Torkommentar startet. Die meisten Kunden hängen ihn an den Kühlschrank, manche an andere Metallflächen.',choose:'Womit fangen wir an?',nat:'Nationalteams',club:'Vereine',natSub:'Die großen Momente der Nationalteams',clubSub:'Die Geschichte deiner Farben',selectNat:'Wähle dein Nationalteam',selectClub:'Wähle deinen Verein',tap:'Tippe auf eine Flagge und erlebe die Tore neu',tapClub:'Wähle deine Vereinsfarben und entdecke die Platten',back:'Zurück zur Auswahl',discover:'Kollektion entdecken',ready:'Sofort lieferbar',tag:'9 Platten. 9 Emotionen.',about:'Mehr als Schallplatten. Erinnerungen fürs Leben.',all:'Alle Teams'}
};
var t=words[locale]||words.it;
var brand=document.querySelector('.top .wordmark');if(brand)brand.href='./';
var params=new URLSearchParams(location.search);
var teamParam=params.get('team');
var teamValid=D.teams&&D.teams.some(function(x){return x.id===teamParam});
var legacy=location.hash&&/^#(ordina|storie|come-funziona|cosa|idea-regalo|il-mio-ordine|chi-siamo|come-si-usa|storia-\d+)$/.test(location.hash);
function make(tag,cls,content){var e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e}
// "Qualsiasi squadra": edizioni personalizzate per club e nazionali non presenti in elenco, con assistenza personale sui gol.
var anyTeam={
 it:{hero:'La tua squadra non c’è? Personalizziamo qualsiasi squadra del mondo',eyebrow:'QUALSIASI SQUADRA, QUALSIASI CAMPIONATO',title:'La tua squadra non c’è? La creiamo noi.',text:'Personalizziamo qualsiasi squadra di qualsiasi campionato del mondo. Ti seguiamo uno a uno: scegliamo insieme i 9 gol da mettere sui dischi.',cta:'Crea la tua edizione su WhatsApp',hint:'Qualsiasi squadra',pick:'La tua squadra non c’è?',pickText:'Personalizziamo qualsiasi squadra del mondo e scegliamo insieme i 9 gol.',pickCta:'Scrivici su WhatsApp',care:'Ogni ordine è seguito di persona: su WhatsApp scegli con noi i gol dei tuoi dischi.',wa:'Ciao VINILAZO! Vorrei un’edizione personalizzata della mia squadra: '},
 es:{hero:'¿Tu equipo no está? Personalizamos cualquier equipo del mundo',eyebrow:'CUALQUIER EQUIPO, CUALQUIER LIGA',title:'¿Tu equipo no está? Lo hacemos nosotros.',text:'Personalizamos cualquier equipo de cualquier liga del mundo. Te acompañamos uno a uno: elegimos juntos los 9 goles de los discos.',cta:'Creá tu edición por WhatsApp',hint:'Cualquier equipo',pick:'¿Tu equipo no está?',pickText:'Personalizamos cualquier equipo del mundo y elegimos juntos los 9 goles.',pickCta:'Escribinos por WhatsApp',care:'Cada pedido lo seguimos en persona: por WhatsApp elegís con nosotros los goles de tus discos.',wa:'¡Hola VINILAZO! Quiero una edición personalizada de mi equipo: '},
 fr:{hero:'Votre équipe n’y est pas ? Nous personnalisons n’importe quelle équipe du monde',eyebrow:'TOUTE ÉQUIPE, TOUT CHAMPIONNAT',title:'Votre équipe n’y est pas ? On la crée pour vous.',text:'Nous personnalisons n’importe quelle équipe de n’importe quel championnat du monde. On vous accompagne personnellement : nous choisissons ensemble les 9 buts des disques.',cta:'Créer mon édition sur WhatsApp',hint:'Toute équipe',pick:'Votre équipe n’y est pas ?',pickText:'Nous personnalisons n’importe quelle équipe du monde et choisissons ensemble les 9 buts.',pickCta:'Nous écrire sur WhatsApp',care:'Chaque commande est suivie personnellement : sur WhatsApp, vous choisissez avec nous les buts de vos disques.',wa:'Bonjour VINILAZO ! Je voudrais une édition personnalisée de mon équipe : '},
 en:{hero:'Team not listed? We customise any team in the world',eyebrow:'ANY TEAM, ANY LEAGUE',title:'Team not listed? We’ll make it.',text:'We customise any team from any league in the world. You get one-to-one help: we pick the 9 goals for your discs together.',cta:'Create your edition on WhatsApp',hint:'Any team',pick:'Team not listed?',pickText:'We customise any team in the world and pick the 9 goals with you.',pickCta:'Message us on WhatsApp',care:'Every order gets personal follow-up: on WhatsApp you choose the goals for your discs with us.',wa:'Hi VINILAZO! I’d like a custom edition for my team: '},
 de:{hero:'Dein Team fehlt? Wir gestalten jedes Team der Welt',eyebrow:'JEDES TEAM, JEDE LIGA',title:'Dein Team fehlt? Wir machen es.',text:'Wir gestalten jedes Team aus jeder Liga der Welt. Wir begleiten dich persönlich und wählen gemeinsam die 9 Tore für deine Platten aus.',cta:'Edition per WhatsApp gestalten',hint:'Jedes Team',pick:'Dein Team fehlt?',pickText:'Wir gestalten jedes Team der Welt und wählen mit dir die 9 Tore aus.',pickCta:'Schreib uns auf WhatsApp',care:'Jede Bestellung wird persönlich betreut: Per WhatsApp wählst du mit uns die Tore deiner Platten.',wa:'Hallo VINILAZO! Ich möchte eine individuelle Edition für mein Team: '}
}[locale]||null;
function anyTeamLink(cls,label,text){var a=make('a',cls,label);a.href='https://wa.me/393295865883?text='+encodeURIComponent(text||(anyTeam&&anyTeam.wa)||'');a.target='_blank';a.rel='noopener noreferrer';return a}
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
 // Nel selettore squadre e vicino al prezzo: qualsiasi squadra + assistenza personale.
 function detailAnyTeam(){
  if(!anyTeam)return;
  var picker=document.getElementById('squadre');
  if(picker&&!picker.querySelector('.vz-pk-any')){
   var box=make('div','vz-pk-any');
   box.append(make('strong','',anyTeam.pick),make('p','',anyTeam.pickText),anyTeamLink('vz-request-button',anyTeam.pickCta+' ↗'));
   picker.append(box);
  }
  placeCare();setTimeout(placeCare,0);setTimeout(placeCare,1600);
 }
 // Subito sotto la nota di consegna, anche se altri script inseriscono elementi dopo di essa.
 function placeCare(){
  var fine=document.querySelector('.hero-copy .fine[data-eta]');if(!fine)return;
  var note=document.querySelector('.vz-care-note')||make('p','vz-care-note',anyTeam.care);
  if(fine.nextElementSibling!==note)fine.insertAdjacentElement('afterend',note);
 }
 function detailInit(){foldDescription();detailCrests();detailAnyTeam()}
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
if(anyTeam)choose.append(anyTeamLink('vz-any-team-line',anyTeam.hero+' →'));
// Original, transparent vector trophies drawn specifically for VINILAZO.
// No downloaded crest images, no square backgrounds and no rotating logos.
function setTrophy(button,group){
 var mark=button.querySelector('.vz-choice-orb-mark');if(!mark)return;
 var icon=make('img','vz-trophy-asset');
 icon.src=group==='nat'?'../assets/icons/vz-world-cup.svg':'../assets/icons/vz-champions.svg';
 icon.alt='';icon.setAttribute('aria-hidden','true');
 icon.width=120;icon.height=160;icon.decoding='async';
 mark.replaceChildren(icon);
 button.style.setProperty('--orb-a',group==='nat'?'#bb8e29':'#819cbf');
 button.style.setProperty('--orb-b',group==='nat'?'#efdba2':'#d8e7f8');
 button.style.setProperty('--orb-c',group==='nat'?'#87631d':'#315b8a');
}
setTrophy(natButton,'nat');
setTrophy(clubButton,'club');
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
 product.classList.toggle('vz-silent',team.id!=='argentina');
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
 it:['GIORNALI D’EPOCA','Certi gol non si dimenticano mai.','Sfoglia i giornali e scopri la squadra di ogni gol.','Scopri questa squadra','Articolo precedente','Articolo successivo','Giornali d’epoca e ricordi calcistici','Le prime pagine del giorno dopo.'],
 es:['DIARIOS DE ÉPOCA','Hay goles que no se olvidan jamás.','Mirá las portadas y descubrí el equipo de cada gol.','Descubrí este equipo','Anterior portada','Siguiente portada','Portadas históricas y recuerdos del fútbol','Las portadas del día después.'],
 fr:['JOURNAUX D’ÉPOQUE','Certains buts ne s’oublient jamais.','Feuilletez les journaux et découvrez l’équipe de chaque but.','Découvrir cette équipe','Une précédente','Une suivante','Archives de presse et souvenirs de football','Les unes du lendemain.'],
 en:['VINTAGE NEWSPAPERS','Some goals are never forgotten.','Browse the newspapers and find the team behind each goal.','Explore this team','Previous newspaper','Next newspaper','Historic newspaper covers and football memories','The front pages from the day after.'],
 de:['ALTE ZEITUNGEN','Manche Tore vergisst man nie.','Blättere durch die Zeitungen und entdecke das Team zu jedem Tor.','Dieses Team entdecken','Vorherige Zeitung','Nächste Zeitung','Historische Zeitungsseiten und Fußballerinnerungen','Die Titelseiten vom Tag danach.']
}[locale]||[];
var pressStories=[
 {
  "id": "argentina",
  "goal": 5,
  "paper": "eg-3481-1986.webp",
  "place": "México · 1986"
 },
 {
  "id": "argentina",
  "goal": 7,
  "paper": "la-nacion-2022.webp",
  "place": "Qatar · 2022"
 },
 {
  "id": "barcelona",
  "goal": 1,
  "paper": "mundo-deportivo-2007.webp",
  "place": "Barcelona · 2007"
 },
 {
  "id": "argentina",
  "goal": 6,
  "paper": "eg-3065-1978.webp",
  "place": "Buenos Aires · 1978"
 },
 {
  "id": "real-madrid",
  "goal": 0,
  "cover": true,
  "place": "Glasgow · 2002"
 },
 {
  "id": "inter",
  "goal": 0,
  "cover": true,
  "place": "Madrid · 2010"
 },
 {
  "id": "milan",
  "goal": 3,
  "cover": true,
  "place": "Atene · 2007"
 },
 {
  "id": "bayern",
  "goal": 0,
  "cover": true,
  "place": "Londra · 2013"
 },
 {
  "id": "psg",
  "goal": 2,
  "cover": true,
  "place": "Monaco · 2025"
 },
 {
  "id": "manchester-city",
  "goal": 1,
  "cover": true,
  "place": "Istanbul · 2023"
 },
 {
  "id": "barcelona",
  "goal": 2,
  "cover": true,
  "place": "Roma · 2009"
 },
 {
  "id": "francia",
  "goal": 0,
  "cover": true,
  "place": "Saint-Denis · 1998"
 },
 {
  "id": "spagna",
  "goal": 2,
  "cover": true,
  "place": "Johannesburg · 2010"
 },
 {
  "id": "italia",
  "goal": 2,
  "cover": true,
  "place": "Berlino · 2006"
 },
 {
  "id": "brasile",
  "goal": 1,
  "cover": true,
  "place": "México · 1970"
 },
 {
  "id": "inghilterra",
  "goal": 0,
  "cover": true,
  "place": "Londra · 1966"
 },
 {
  "id": "portogallo",
  "goal": 3,
  "cover": true,
  "place": "Parigi · 2016"
 },
 {
  "id": "olanda",
  "goal": 1,
  "cover": true,
  "place": "Monaco · 1988"
 }
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
function pressImage(st){
 var cover=st.cover&&D.covers&&D.covers[st.id]&&D.covers[st.id][0];
 return cover&&cover.src?cover.src:'../assets/img/press/'+(st.paper||'eg-3481-1986.webp');
}
var pressButtons=[];
pressStories.forEach(function(st,i){
 var thumb=make('button','vz-press-thumb');thumb.type='button';thumb.setAttribute('aria-label',(D.teams||[]).find(function(t){return t.id===st.id})?.name+' · '+st.place);
 var im=make('img','');im.src=pressImage(st);im.alt='';im.loading='lazy';im.decoding='async';
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
 pressCover.src=pressImage(st);pressCover.alt=st.place+' — '+team.name;
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
 window.setInterval(function(){if(!document.hidden)renderPress(pressIndex+1)},6300);
}


 // Real supporters at verified celebrations; photo links lead to original Creative Commons files.
 var crowdsText={
 it:['LE FESTE IN PIAZZA','Quando la squadra vince, festeggia tutta la città','Le feste dei tifosi dopo le grandi vittorie, di nazionali e club.','Buenos Aires · Mondiali 2022','Roma · Mondiali 2006','Madrid · Mondiali 2010','Foto originale e licenza'],
 es:['FESTEJOS EN LA CALLE','Cuando gana el equipo, festeja toda la ciudad','Los festejos de los hinchas después de las grandes victorias, de selecciones y clubes.','Buenos Aires · Mundial 2022','Roma · Mundial 2006','Madrid · Mundial 2010','Foto original y licencia'],
 fr:['LA FÊTE DANS LES RUES','Quand l’équipe gagne, toute la ville fait la fête','La fête des supporters après les grandes victoires, en sélection comme en club.','Buenos Aires · Coupe du monde 2022','Rome · Coupe du monde 2006','Madrid · Coupe du monde 2010','Photo originale et licence'],
 en:['STREET CELEBRATIONS','When the team wins, the whole city celebrates','Fans celebrating after the big wins, for national teams and clubs.','Buenos Aires · World Cup 2022','Rome · World Cup 2006','Madrid · World Cup 2010','Original image and licence'],
 de:['FEIERN AUF DER STRASSE','Wenn das Team gewinnt, feiert die ganze Stadt','Fans feiern nach großen Siegen, von Nationalteams und Vereinen.','Buenos Aires · WM 2022','Rom · WM 2006','Madrid · WM 2010','Originalfoto und Lizenz']
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


 // 30 curated archive photographs: 3 previous national-team celebrations plus 27 club images.
 // Teams, competitions and dates are captioned accurately. Each image links to its Commons file and licence.
 var featuredGallery=[{"file":"AC Milan team celebrate.jpg","label":"Milan · Champions 2007","credit":"Antigoni · CC BY-SA 3.0"},{"file":"Final Milan.jpg","label":"Milan · Tifosi a Milano, 2007","credit":"Kieran Lynam · CC BY 2.0"},{"file":"A.C. Milan lifting the European Cup after winning the 2002–03 UEFA Champions League - 20030528.jpg","label":"Milan · Champions 2003","credit":"Soccer illustrated · licenza"},{"file":"AC Milan fans, scudetto 2021–22.jpg","label":"Milan · Scudetto 2022","credit":"Autore e licenza"},{"file":"Forza Inter!.jpg","label":"Inter · Finale Champions 2010","credit":"Johnny Vulkan · CC"},{"file":"Striscione finale madrid 2010 2.jpg","label":"Inter · Finale Champions 2010","credit":"Pubblico dominio"},{"file":"Festejando el título (4634922863).jpg","label":"Inter · Festeggiamenti 2010","credit":"Autore e licenza"},{"file":"Empieza la celebración (4635522750).jpg","label":"Inter · Madrid 2010","credit":"Autore e licenza"},{"file":"La nord al Bernabeu (4639882760).jpg","label":"Inter · Tifosi a Madrid 2010","credit":"Autore e licenza"},{"file":"Barça Party - Champions League Final 2015 , Barcelona-Juventus, Berlin.JPG","label":"Barcellona · Tifosi a Berlino 2015","credit":"Ferran Cornellà · CC BY-SA 4.0"},{"file":"Barça fans - Champions league 2015 Berlin.JPG","label":"Barcellona · Finale 2015","credit":"Ferran Cornellà · CC BY-SA 4.0"},{"file":"Culés de festa - Champions league 2015 Berlin.JPG","label":"Barcellona · Festa a Berlino 2015","credit":"Ferran Cornellà · CC BY-SA 4.0"},{"file":"Festa culé, Barcelona-Juventus. Champions league 2015, Berlin.JPG","label":"Barcellona · Tifosi 2015","credit":"Ferran Cornellà · CC BY-SA 4.0"},{"file":"Champions League 2010-11 celebration at La Rambla.JPG","label":"Barcellona · Festa sulla Rambla 2011","credit":"Autore e licenza"},{"file":"Real Madrid celebration after winning the 2018 UEFA Champions League Final DSC 0298 (41501694505).jpg","label":"Real Madrid · Champions 2018","credit":"Autore e licenza"},{"file":"Real Madrid celebration after winning the 2018 UEFA Champions League Final DSC 0320 (41501691085).jpg","label":"Real Madrid · Festa Champions 2018","credit":"Autore e licenza"},{"file":"Real Madrid celebration after winning the 2018 UEFA Champions League Final DSC 0354 (28530720898).jpg","label":"Real Madrid · Festa Champions 2018","credit":"Autore e licenza"},{"file":"Real Madrid celebration after winning the 2018 UEFA Champions League Final DSC 0369 (28530717938).jpg","label":"Real Madrid · Tifosi e giocatori 2018","credit":"Autore e licenza"},{"file":"Ofrenda de la Liga y la Champions-45-L.Millán (52109279151).jpg","label":"Real Madrid · Champions 2022","credit":"L. Millán · licenza"},{"file":"Ederson 2023.jpg","label":"Manchester City · Champions 2023","credit":"Monerals · licenza"},{"file":"Mancini, Kompany, Clichy - Premier League 11-12 parade.jpg","label":"Manchester City · Festa Premier 2012","credit":"Stuart Grout · CC BY 2.0"},{"file":"Aguero sending photos - Premier League parade 2011-12.jpg","label":"Manchester City · Parata 2012","credit":"Stuart Grout · CC BY 2.0"},{"file":"Vincent Kompany holds up the Premier League trophy 2012.jpg","label":"Manchester City · Trofeo 2012","credit":"Autore e licenza"},{"file":"Festa PSG - panoramio (1).jpg","label":"PSG · Tifosi in festa","credit":"Autore e licenza"},{"file":"Festa PSG - panoramio (3).jpg","label":"PSG · Festa dei tifosi","credit":"Autore e licenza"},{"file":"Exibição da final da Final da Liga dos Campeões da UEFA de 2024–25 na Praça Pedro Magalhães Junior, Cambuí, Campinas, São Paulo - 31.05.2025.1.jpg","label":"PSG-Inter · Finale 2025 in piazza","credit":"Mtvdanilo · CC BY 4.0"},{"file":"Finale de la LDC 2025 PSG-Inter (5-0).jpg","label":"PSG · Finale Champions 2025","credit":"CC0"}];
 var galleryControls=make('div','vz-fans-controls');
 var galleryStatus=make('span','vz-fans-status','01 / '+String(featuredGallery.length+crowdPhotos.length).padStart(2,'0'));
 galleryStatus.setAttribute('aria-live','off');
 var prevFan=make('button','vz-fans-arrow','←'),nextFan=make('button','vz-fans-arrow','→');
 prevFan.type=nextFan.type='button';
 prevFan.setAttribute('aria-label','Previous photo');nextFan.setAttribute('aria-label','Next photo');
 galleryControls.append(prevFan,galleryStatus,nextFan);
 fans.append(galleryControls);
 function commonsFilePath(file){
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(file).replace(/%2F/g,'/')+'?width=780';
 }
 function commonsInfoPath(file){
  return 'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file).replace(/%20/g,'_');
 }
 featuredGallery.forEach(function(scene){
  var figure=make('figure','vz-fans-card vz-fans-visible');
  figure.dataset.vzTitle=scene.label;
  var image=make('img','vz-fans-photo');
  image.src=commonsFilePath(scene.file);
  image.loading='lazy';image.decoding='async';image.width=780;image.height=600;
  image.alt=scene.label;
  image.addEventListener('error',function(){figure.remove();updateGalleryCount()},{once:true});
  var overlay=make('div','vz-fans-shade');overlay.setAttribute('aria-hidden','true');
  var caption=make('figcaption','vz-fans-caption');
  caption.append(make('strong','',scene.label));
  var source=make('a','vz-fans-credit',scene.credit+' ↗');
  source.href=commonsInfoPath(scene.file);source.target='_blank';source.rel='noopener noreferrer';
  source.setAttribute('aria-label',scene.label+' · '+scene.credit+' · Wikimedia Commons');
  caption.append(source);
  figure.append(image,overlay,caption);fansGrid.append(figure);
 });
 fansGrid.classList.add('vz-fans-ready');
 fansGrid.querySelectorAll('.vz-fans-card').forEach(function(card){card.classList.add('vz-fans-visible')});
 // Automatic slow gallery with touch/swipe and keyboard controls.
 var fanIndex=0,lastManual=0;
 function galleryItems(){return Array.from(fansGrid.querySelectorAll('.vz-fans-card'))}
 function updateGalleryCount(){
  var cards=galleryItems();fanIndex=Math.min(fanIndex,Math.max(0,cards.length-1));
  galleryStatus.textContent=String(fanIndex+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
 }
 function showFan(i,manual){
  var cards=galleryItems();if(!cards.length)return;
  fanIndex=(i+cards.length)%cards.length;
  if(manual)lastManual=Date.now();
  var target=cards[fanIndex];
  fansGrid.scrollTo({left:target.offsetLeft-cards[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  updateGalleryCount();
 }
 prevFan.addEventListener('click',function(){showFan(fanIndex-1,true)});
 nextFan.addEventListener('click',function(){showFan(fanIndex+1,true)});
 fansGrid.addEventListener('touchstart',function(){lastManual=Date.now()},{passive:true});
 fansGrid.addEventListener('pointerdown',function(){lastManual=Date.now()},{passive:true});
 fansGrid.addEventListener('scroll',function(){
  var cards=galleryItems();if(!cards.length)return;
  var left=fansGrid.scrollLeft;var index=0,dist=Infinity;
  cards.forEach(function(card,i){var d=Math.abs(card.offsetLeft-cards[0].offsetLeft-left);if(d<dist){dist=d;index=i}});
  fanIndex=index;updateGalleryCount();
 },{passive:true});
 updateGalleryCount();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  window.setInterval(function(){
   if(document.hidden||Date.now()-lastManual<11000||fans.matches(':hover')||fans.contains(document.activeElement))return;
   showFan(fanIndex+1,false);
  },4700);
 }

// A concise emotional gift message, without crowding the product selector.
var giftTx={
 it:['IDEA REGALO','Un regalo per chi tifa','Arriva già in confezione regalo, con il giradischi e i 9 dischi della squadra che scegli tu. Spedizione inclusa.','Scegli la squadra'],
 es:['IDEA DE REGALO','Un regalo para un hincha','Llega en caja de regalo, con el tocadiscos y los 9 discos del equipo que elijas. Envío incluido.','Elegir el equipo'],
 fr:['IDÉE CADEAU','Un cadeau pour un supporter','Livré en coffret cadeau, avec la platine et les 9 disques de l’équipe de votre choix. Livraison incluse.','Choisir l’équipe'],
 en:['GIFT IDEA','A gift for a football fan','It arrives in a gift box, with the record player and the 9 discs of the team you choose. Shipping included.','Choose the team'],
 de:['GESCHENKIDEE','Ein Geschenk für Fußballfans','Kommt in einer Geschenkbox, mit dem Plattenspieler und den 9 Platten des Teams deiner Wahl. Versand inklusive.','Team wählen']
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
 var customName=group==='nat'?({it:'Marocco',es:'Marruecos',fr:'Maroc',en:'Morocco',de:'Marokko'}[locale]||'Marocco'):'Arsenal';
 var customIcon=group==='nat'?'🇲🇦':'ARS';
 var waText={it:['Ciao VINILAZO! Vorrei sapere se è possibile personalizzare un’edizione '+customName+' con 9 dischi e audio.','Ciao VINILAZO! Vorrei una squadra non presente sul sito oppure dischi personalizzati. Mi date informazioni?'],es:['¡Hola VINILAZO! Quisiera saber si es posible personalizar una edición '+customName+' con 9 discos y audio.','¡Hola VINILAZO! Quiero un equipo que no está en la web o discos personalizados. ¿Me pasan información?'],fr:['Bonjour VINILAZO ! Est-il possible de personnaliser une édition '+customName+' avec 9 disques et l’audio ?','Bonjour VINILAZO ! Je voudrais une équipe absente du site ou des disques personnalisés. Pouvez-vous me renseigner ?'],en:['Hi VINILAZO! Is it possible to customise a '+customName+' edition with 9 discs and audio?','Hi VINILAZO! I’d like a team that isn’t on the site, or custom discs. Can you tell me more?'],de:['Hallo VINILAZO! Ist eine individuelle '+customName+'-Edition mit 9 Platten und Audio möglich?','Hallo VINILAZO! Ich hätte gern ein Team, das nicht auf der Seite ist, oder individuelle Platten. Könnt ihr mir mehr dazu sagen?']}[locale]||[];
 var customPrompt=encodeURIComponent(waText[0]||'');
 var customCard=make('a','vz-flag-card vz-custom-card');
 customCard.href='https://wa.me/393295865883?text='+customPrompt;customCard.target='_blank';customCard.rel='noopener noreferrer';
 customCard.append(make('span','vz-custom-symbol',customIcon),make('strong','vz-flag-name',customName),make('small','vz-custom-hint',(anyTeam?anyTeam.hint:customWords[0])+' ↗'));
 grid.append(customCard);
 var req=document.getElementById('vz-request-other');
 if(!req){req=make('div','vz-request-other');req.id='vz-request-other';stage.append(req);}
 if(anyTeam){
  req.replaceChildren(make('p','vz-request-eyebrow',anyTeam.eyebrow),make('h3','',anyTeam.title),make('p','',anyTeam.text),anyTeamLink('vz-request-button',anyTeam.cta+' →'));
 }else{
  req.replaceChildren(make('h3','',customWords[1]),make('p','',customWords[2]));
  req.append(anyTeamLink('vz-request-button',customWords[3]+' →',waText[1]));
 }
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