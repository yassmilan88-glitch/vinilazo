/* VINILAZO – genuine story + Argentina home audio previews */
(function(){
'use strict';
const root=document.getElementById('data');if(!root)return;
let D;try{D=JSON.parse(root.textContent)}catch(e){return}
const lang=D.lang||'it';
const tx={
 it:{heading:'Chi siamo',eyebrow:'CALCIO, PANE E RICORDI',body:'Siamo cresciuti con i vinili, le cassette e la radio accesa nei giorni di partita. Bastava una voce, un gol, un’esultanza per rendere indimenticabile un pomeriggio. Quel calcio lo abbiamo anche giocato, fino all’Eccellenza, ma soprattutto lo abbiamo amato da tifosi. VINILAZO nasce dall’amore per la propria squadra e dalla voglia di portare quelle emozioni a casa, per riviverle e condividerle con chi ci sta vicino.',sign:'Non vendiamo soltanto dischi. Custodiamo emozioni.',cue:'🎧 Tocca un disco e ascolta il gol',other:'🎧 Anteprime audio delle altre squadre in preparazione',pause:'Metti in pausa',listen:'Ascolta il gol',story:'Leggi la storia completa',err:'Audio non disponibile al momento'},
 es:{heading:'Quiénes somos',eyebrow:'FÚTBOL, PAN Y RECUERDOS',body:'Crecimos entre vinilos, casetes y la radio encendida los días de partido. Alcanzaban una voz y un gol para convertir una tarde en un recuerdo eterno. También jugamos al fútbol hasta la categoría Eccellenza en Italia, pero lo que nunca cambió fue nuestro amor por los colores que llevamos dentro. De ahí nace VINILAZO: para que esas emociones vuelvan a casa y se compartan con quienes más queremos.',sign:'No son solo discos. Son recuerdos que siguen vivos.',cue:'🎧 Tocá un disco y escuchá el gol',other:'🎧 Avances de audio de otros equipos en preparación',pause:'Pausar',listen:'Escuchá el gol',story:'Leer la historia completa',err:'Audio no disponible por ahora'},
 fr:{heading:'Qui sommes-nous ?',eyebrow:'FOOT, PAIN ET SOUVENIRS',body:'Nous avons grandi avec les vinyles, les cassettes et la radio allumée les jours de match. Il suffisait d’une voix et d’un but pour rendre un après-midi inoubliable. Nous avons aussi joué au football jusqu’au niveau Eccellenza en Italie, mais c’est avant tout l’amour de notre équipe qui nous anime. VINILAZO est né de cette passion : faire revenir ces émotions à la maison et les partager avec ceux que nous aimons.',sign:'Bien plus que des disques : des émotions à transmettre.',cue:'🎧 Touchez un disque pour écouter le but',other:'🎧 Extraits audio des autres équipes en préparation',pause:'Pause',listen:'Écouter le but',story:'Découvrir son histoire',err:'Audio momentanément indisponible'},
 en:{heading:'Who we are',eyebrow:'FOOTBALL, FOOD AND MEMORIES',body:'We grew up with vinyl records, cassette tapes and the radio on every matchday. One voice and one goal could turn an ordinary afternoon into a lifelong memory. We played football ourselves up to Eccellenza level in Italy, but our deepest connection was always the love of our team. That passion became VINILAZO: a way to bring those sounds back home and share the feeling with the people we love.',sign:'More than records. Memories worth keeping.',cue:'🎧 Tap a record to hear the goal',other:'🎧 Audio previews for other teams are in preparation',pause:'Pause',listen:'Hear the goal',story:'Read the full story',err:'Audio unavailable right now'},
 de:{heading:'Über uns',eyebrow:'FUSSBALL, BROT UND ERINNERUNGEN',body:'Wir sind mit Schallplatten, Kassetten und dem Radio an Spieltagen aufgewachsen. Eine Stimme, ein Tor – und aus einem Nachmittag wurde eine Erinnerung fürs Leben. Wir haben selbst bis zur Eccellenza in Italien Fußball gespielt, doch vor allem lieben wir unseren Verein und seine Farben. Aus dieser Leidenschaft entstand VINILAZO: damit diese Emotionen zu Hause wieder lebendig werden und wir sie mit unseren Liebsten teilen können.',sign:'Mehr als Schallplatten. Erinnerungen fürs Leben.',cue:'🎧 Tippe auf eine Platte und hör das Tor',other:'🎧 Hörproben der anderen Teams sind in Vorbereitung',pause:'Pause',listen:'Tor anhören',story:'Die ganze Geschichte',err:'Audio derzeit nicht verfügbar'}
}[lang]||null;
if(!tx)return;
function insertAbout(){
 const target=document.querySelector('#idea-regalo')||document.querySelector('section.order');
 if(!target||document.getElementById('chi-siamo'))return;
 const section=document.createElement('section');section.id='chi-siamo';section.className='vz-about';section.setAttribute('aria-labelledby','vz-about-title');
 const kicker=document.createElement('p');kicker.className='vz-about-kicker';kicker.textContent=tx.eyebrow;
 const title=document.createElement('h2');title.id='vz-about-title';title.textContent=tx.heading;
 const body=document.createElement('p');body.className='vz-about-body';body.textContent=tx.body;
 const sign=document.createElement('p');sign.className='vz-about-sign';sign.textContent=tx.sign;
 section.append(kicker,title,body,sign);target.before(section);
 const links=document.querySelector('#vz-nav-links');
 if(links&&!links.querySelector('[href="#chi-siamo"]')){const a=document.createElement('a');a.href='#chi-siamo';a.textContent=tx.heading;const last=links.lastElementChild;links.insertBefore(a,last);}
}
const audioNames=['maradona-mano-de-dios.mp3','burruchaga-1986.mp3','messi-getafe-2007.mp3','montiel-2022.mp3','messi-copa-america-2007.mp3','maradona-gol-del-siglo.mp3','kempes-1978.mp3','di-maria-2022.mp3','messi-brasile-2012.mp3'];
const player=new Audio();player.preload='none';let active=-1;let currentTeam='';
function selectedTeam(){const el=document.querySelector('#team-pick [data-team-name]');const shown=el&&el.textContent.toLowerCase().trim();const from=Array.isArray(D.teams)&&D.teams.find(t=>t.name.toLowerCase()===shown);return from?from.id:(new URLSearchParams(location.search).get('team')||D.def_team||'italia')}
function refreshCue(){
 const box=document.getElementById('vz-audio-cue');if(!box)return;
 const isArg=selectedTeam()==='argentina';
 box.classList.toggle('vz-audio-ready',isArg);
 const p=box.querySelector('.vz-audio-label');p.textContent=isArg?tx.cue:tx.other;
 const a=box.querySelector('.vz-audio-story');a.hidden=!isArg;
 if(!isArg&&active!==-1){player.pause();active=-1}
 currentTeam=selectedTeam();
}
function placeCue(){
 const anchor=document.getElementById('discs-cap');if(!anchor)return;
 let cue=document.getElementById('vz-audio-cue');
 if(!cue){cue=document.createElement('div');cue.id='vz-audio-cue';cue.className='vz-audio-cue';cue.innerHTML='<strong class="vz-audio-label"></strong><span class="vz-audio-status" role="status" aria-live="polite"></span><a class="vz-audio-story" href="argentina/#dischi"></a>';cue.querySelector('a').textContent=tx.story;const grid=document.getElementById('discs');if(grid)grid.before(cue);else anchor.before(cue);}
 refreshCue();
}
function play(i,link){
 if(i<0||i>=9)return;
 if(active===i&&!player.paused){player.pause();active=-1;update();return}
 if(active!==i){player.pause();player.src='../assets/audio/argentina/'+audioNames[i];player.load();active=i}
 const p=player.play();if(p&&p.catch)p.catch(()=>{const el=document.querySelector('#vz-audio-cue .vz-audio-status');if(el)el.textContent=tx.err;});
 update();if(link)link.setAttribute('aria-label',tx.pause);
}
function update(){
 document.querySelectorAll('#discs a.d,.hd-list a').forEach((link,i)=>{
  const list=link.closest('#discs')?Array.from(link.parentElement.children):Array.from(link.closest('.hd-list').querySelectorAll('a'));
  const idx=list.indexOf(link);
  link.classList.toggle('vz-audio-playing',idx===active&&!player.paused);
 });
 const status=document.querySelector('#vz-audio-cue .vz-audio-status');
 if(status)status.textContent=active!==-1?((player.paused?'▶ ':'♫ ')+(D.teams.find(t=>t.id==='argentina')?.goals[active]?.[0]||'')):'';
}
function init(){
 insertAbout();placeCue();
 const discs=document.getElementById('discs');
 if(discs){new MutationObserver(()=>{placeCue();}).observe(discs,{childList:true});}
 document.addEventListener('click',function(e){
  const link=e.target.closest('#discs a.d,.hd-list a');if(!link||selectedTeam()!=='argentina')return;
  const container=link.closest('#discs')?document.getElementById('discs'):document.getElementById('hd-list');
  if(!container)return;const items=Array.from(container.querySelectorAll(container.id==='discs'?'a.d':'li > a'));const i=items.indexOf(link);
  if(i<0)return;e.preventDefault();play(i,link);
 });
 player.addEventListener('ended',()=>{active=-1;update()});player.addEventListener('pause',update);player.addEventListener('play',update);player.addEventListener('error',()=>{let e=document.querySelector('#vz-audio-cue .vz-audio-status');if(e)e.textContent=tx.err});
 const teamName=document.querySelector('#team-pick [data-team-name]');if(teamName)new MutationObserver(refreshCue).observe(teamName,{childList:true,characterData:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target.closest('[data-team]'))setTimeout(refreshCue,950)});
 window.addEventListener('pagehide',()=>player.pause());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();