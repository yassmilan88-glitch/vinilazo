/* VINILAZO: category-first storefront and team detail navigation. */
(function () {
  'use strict';
  var root=document.getElementById('data');
  if(!root)return;
  var D;try{D=JSON.parse(root.textContent)}catch(e){return}
  var lang=D.lang||'it';
  var words={
    it:{eyebrow:'IL TUO CALCIO. I TUOI RICORDI.',title:'Ogni squadra ha un gol che non si dimentica.',intro:'Scegli i tuoi colori. Scopri il quadro-giradischi VINILAZO con 9 dischi intercambiabili e rivivi le telecronache che ti hanno fatto urlare.',national:'Nazionali',clubs:'Club',pick:'Scegli la tua squadra',explore:'Scopri i 9 dischi',ready:'Pronta consegna',info:'Un quadro luminoso. Nove dischi. Nove emozioni.',how:'Scegli una squadra per vedere i gol, ascoltare le anteprime disponibili e ordinare il tuo VINILAZO.',about:'Non vendiamo soltanto dischi. Custodiamo emozioni.',back:'Tutte le squadre'},
    es:{eyebrow:'TU FÚTBOL. TUS RECUERDOS.',title:'Cada equipo tiene un gol imposible de olvidar.',intro:'Elige tus colores. Descubre el cuadro-tocadiscos VINILAZO con 9 discos intercambiables y revive las narraciones que te hicieron gritar.',national:'Selecciones',clubs:'Clubes',pick:'Elige tu equipo',explore:'Descubre los 9 discos',ready:'Entrega inmediata',info:'Un cuadro luminoso. Nueve discos. Nueve emociones.',how:'Elige un equipo para ver los goles, escuchar las muestras disponibles y pedir tu VINILAZO.',about:'No son solo discos. Son recuerdos que siguen vivos.',back:'Todos los equipos'},
    fr:{eyebrow:'VOTRE FOOT. VOS SOUVENIRS.',title:'Chaque équipe a un but inoubliable.',intro:'Choisissez vos couleurs. Découvrez le cadre-platine VINILAZO avec 9 disques interchangeables et revivez les commentaires qui vous ont fait vibrer.',national:'Équipes nationales',clubs:'Clubs',pick:'Choisissez votre équipe',explore:'Découvrir les 9 disques',ready:'Expédition immédiate',info:'Un cadre lumineux. Neuf disques. Neuf émotions.',how:'Choisissez une équipe pour découvrir ses buts, écouter les extraits disponibles et commander VINILAZO.',about:'Bien plus que des disques : des émotions à transmettre.',back:'Toutes les équipes'},
    en:{eyebrow:'YOUR FOOTBALL. YOUR MEMORIES.',title:'Every team has a goal you never forget.',intro:'Choose your colours. Discover the VINILAZO light-up record-player frame with 9 interchangeable discs and relive the commentaries that made you roar.',national:'National teams',clubs:'Clubs',pick:'Choose your team',explore:'Explore the 9 discs',ready:'Ready to ship',info:'One glowing frame. Nine discs. Nine emotions.',how:'Pick a team to discover its goals, hear available previews and order your VINILAZO.',about:'More than records. Memories worth keeping.',back:'All teams'},
    de:{eyebrow:'DEIN FUSSBALL. DEINE ERINNERUNGEN.',title:'Jedes Team hat ein unvergessliches Tor.',intro:'Wähle deine Farben. Entdecke den leuchtenden VINILAZO-Plattenspieler-Rahmen mit 9 austauschbaren Platten und erlebe legendäre Kommentare neu.',national:'Nationalmannschaften',clubs:'Vereine',pick:'Wähle dein Team',explore:'Alle 9 Platten entdecken',ready:'Sofort lieferbar',info:'Ein leuchtender Rahmen. Neun Platten. Neun Emotionen.',how:'Wähle ein Team, entdecke seine Tore, höre verfügbare Hörproben und bestelle VINILAZO.',about:'Mehr als Schallplatten. Erinnerungen fürs Leben.',back:'Alle Teams'}
  };
  var t=words[lang]||words.it;
  var brand=document.querySelector('.top .wordmark');
  if(brand)brand.href='./';
  var params=new URLSearchParams(location.search);
  var chosen=params.get('team');
  var valid=Array.isArray(D.teams)&&D.teams.some(function(team){return team.id===chosen});
  var legacy=location.hash&&/^#(ordina|storie|come-funziona|cosa|idea-regalo|il-mio-ordine|chi-siamo|come-si-usa|storia-\d+)$/.test(location.hash);
  if(valid||params.has('demo')||legacy){
    var copy=document.querySelector('.hero-copy');
    if(copy&&!copy.querySelector('.vz-back-teams')){
      var back=document.createElement('a');back.className='vz-back-teams';back.href='./';back.textContent='← '+t.back;
      copy.insertBefore(back,copy.firstChild);
    }
    return;
  }
  document.body.classList.add('vz-catalog-mode');
  if(brand)brand.href='#vz-catalog-main';
  var picker=document.getElementById('team-pick');if(picker)picker.setAttribute('aria-hidden','true');
  var langSelect=document.getElementById('lang-select');
  if(langSelect){
    langSelect.addEventListener('change',function(e){
      e.stopImmediatePropagation();
      var target=langSelect.value;
      if(/^(it|es|fr|en|de)$/.test(target))location.href='../'+target+'/';
    },true);
  }
  function make(tag,cls,txt){
    var el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;
  }
  function anchor(cls,txt,href){var a=make('a',cls,txt);a.href=href;return a}
  var main=make('main','vz-catalog');main.id='vz-catalog-main';
  var hero=make('section','vz-shop-hero');
  var intro=make('div','vz-shop-intro');
  intro.append(make('p','vz-shop-eyebrow',t.eyebrow),make('h1','vz-shop-title',t.title),make('p','vz-shop-lead',t.intro));
  var actions=make('div','vz-shop-actions');
  actions.append(anchor('vz-shop-action',t.national+' ↓','#vz-nazionali'),anchor('vz-shop-action vz-outline',t.clubs+' ↓','#vz-club'));
  intro.append(actions);
  var featured=make('div','vz-shop-featured');
  var pic=make('img','vz-shop-main-photo');pic.src='../assets/img/quadro.webp';pic.alt='VINILAZO';pic.width=576;pic.height=658;
  featured.append(pic,make('div','vz-shop-featured-halo'));
  hero.append(intro,featured);main.append(hero);
  function section(group,id,title){
    var teams=D.teams.filter(function(team){return team.g===group});
    var sec=make('section','vz-team-section');sec.id=id;
    var heading=make('div','vz-team-section-head');
    heading.append(make('p','vz-shop-eyebrow',t.pick),make('h2','vz-team-section-title',title),make('p','vz-team-section-sub',t.how));
    sec.append(heading);
    var grid=make('div','vz-team-grid');
    teams.forEach(function(team){
      var a=anchor('vz-team-card','', '?team='+encodeURIComponent(team.id));
      a.setAttribute('aria-label',t.explore+': '+team.name);
      var colors=team.cols||['#74ACDF','#FFFFFF','#C9A227'];
      a.style.setProperty('--team-one',colors[0]);a.style.setProperty('--team-two',colors[1]);a.style.setProperty('--team-three',colors[2]);
      var visual=make('div','vz-team-visual');
      var frame=make('img','vz-team-frame');frame.src='../assets/img/quadro.webp';frame.alt='';frame.loading='lazy';frame.width=576;frame.height=658;
      var record=make('div','vz-team-record');
      var label=make('div','vz-team-record-label');
      label.append(make('small','', 'VINILAZO'),make('strong','',team.code||team.name));
      record.append(label);visual.append(frame,record);
      var info=make('div','vz-team-info');
      info.append(make('h3','',team.name),make('span','vz-team-cta',t.explore+' →'));
      if(team.id==='argentina')info.append(make('span','vz-team-ready',t.ready));
      a.append(visual,info);grid.append(a);
    });
    sec.append(grid);main.append(sec);
  }
  section('nat','vz-nazionali',t.national);
  section('club','vz-club',t.clubs);
  var ending=make('section','vz-shop-end');
  ending.append(make('h2','',t.info),make('p','',t.about),anchor('vz-shop-action',t.national+' ↑','#vz-nazionali'));
  main.append(ending);
  var header=document.querySelector('header.top');
  if(header)header.insertAdjacentElement('afterend',main);
  else document.body.insertBefore(main,document.body.firstChild);
})();