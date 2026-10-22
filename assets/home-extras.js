/* VINILAZO – genuine story + Argentina home audio previews */
(function(){
'use strict';
const root=document.getElementById('data');if(!root)return;
let D;try{D=JSON.parse(root.textContent)}catch(e){return}
const lang=D.lang||'it';
const tx={
 it:{heading:'Chi siamo',eyebrow:'CALCIO, PANE E RICORDI',body:'Siamo cresciuti con il calcio a tavola, le partite alla radio e le domeniche passate al campo. Alcuni di noi hanno giocato fino all’Eccellenza: sappiamo cosa significa vivere un gol dentro e fuori dal campo. VINILAZO nasce da quella passione, per riportare a casa la voce e l’emozione di un momento indimenticabile.',sign:'Non vendiamo soltanto dischi. Custodiamo emozioni.',cue:'🎧 Tocca un disco e ascolta il gol',other:'🎧 Anteprime audio delle altre squadre in preparazione',pause:'Metti in pausa',listen:'Ascolta il gol',story:'Leggi la storia completa',err:'Audio non disponibile al momento'},
 es:{heading:'Quiénes somos',eyebrow:'FÚTBOL, PAN Y RECUERDOS',body:'Crecimos con el fútbol en la mesa, los partidos por la radio y los domingos en la cancha. Algunos llegamos a jugar en categorías regionales de alto nivel en Italia, hasta Eccellenza. Sabemos lo que significa vivir un gol dentro y fuera del campo. Así nació VINILAZO: para traer a casa la voz y la emoción de esos momentos inolvidables.',sign:'No son solo discos. Son recuerdos que siguen vivos.',cue:'🎧 Tocá un disco y escuchá el gol',other:'🎧 Avances de audio de otros equipos en preparación',pause:'Pausar',listen:'Escuchá el gol',story:'Leer la historia completa',err:'Audio no disponible por ahora'},
 fr:{heading:'Qui sommes-nous ?',eyebrow:'FOOT, PAIN ET SOUVENIRS',body:'Nous avons grandi avec le football à table, les matchs à la radio et les dimanches sur le terrain. Certains d’entre nous ont joué jusqu’au niveau Eccellenza en Italie. Nous connaissons l’émotion d’un but sur le terrain comme dans les tribunes. VINILAZO est né de cette passion : faire revivre chez soi les voix et les instants inoubliables.',sign:'Bien plus que des disques : des émotions à transmettre.',cue:'🎧 Touchez un disque pour écouter le but',other:'🎧 Extraits audio des autres équipes en préparation',pause:'Pause',listen:'Écouter le but',story:'Découvrir son histoire',err:'Audio momentanément indisponible'},
 en:{heading:'Who we are',eyebrow:'FOOTBALL, FOOD AND MEMORIES',body:'We grew up with football at the dinner table, matches on the radio and Sundays on the pitch. Some of us played as high as Eccellenza, a competitive regional level in Italy. We know what a goal feels like, on and off the pitch. VINILAZO was born from that passion: bringing those unforgettable voices and moments back into your home.',sign:'More than records. Memories worth keeping.',cue:'🎧 Tap a record to hear the goal',other:'🎧 Audio previews for other teams are in preparation',pause:'Pause',listen:'Hear the goal',story:'Read the full story',err:'Audio unavailable right now'},
 de:{heading:'Über uns',eyebrow:'FUSSBALL, BROT UND ERINNERUNGEN',body:'Wir sind mit Fußball am Esstisch, Spielen im Radio und Sonntagen auf dem Platz aufgewachsen. Einige von uns haben in Italien bis zur Eccellenza gespielt. Wir wissen, wie sich ein Tor auf und neben dem Platz anfühlt. Aus dieser Leidenschaft entstand VINILAZO: Die Stimmen und Emotionen unvergesslicher Fußballmomente nach Hause holen.',sign:'Mehr als Schallplatten. Erinnerungen fürs Leben.',cue:'🎧 Tippe auf eine Platte und hör das Tor',other:'🎧 Hörproben der anderen Teams sind in Vorbereitung',pause:'Pause',listen:'Tor anhören',story:'Die ganze Geschichte',err:'Audio derzeit nicht verfügbar'}
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