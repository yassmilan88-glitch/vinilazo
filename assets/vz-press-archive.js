/* VINILAZO — archivio stampa: solo immagini già presenti nel repository. */
(function(){
'use strict';
var covers=[
{team:'argentina',event:'Mondiali 2022',title:'La Nación · Argentina 2022',src:'la-nacion-2022.webp'},
{team:'argentina',event:'Mondiali 2022',title:'The Sun · Argentina 2022',src:'the-sun-2022.webp'},
{team:'argentina',event:'Mondiali 1986',title:'El Gráfico · Argentina 1986',src:'eg-3482-1986.webp'},
{team:'argentina',event:'Mondiali 1986',title:'El Gráfico · Argentina-Inghilterra',src:'eg-3481-1986.webp'},
{team:'argentina',event:'Mondiali 1978',title:'El Gráfico · Argentina 1978',src:'eg-3065-1978.webp'},
{team:'barcelona',event:'Champions League 2006–07',title:'Mundo Deportivo · archivio 2007',src:'mundo-deportivo-2007.webp'}
];
var root=document.getElementById('vz-catalog-main');if(!root)return;
var s=document.createElement('section');s.id='vz-press-archive';s.className='vz-press-archive';
s.innerHTML='<div class="vz-press-head"><span>ARCHIVIO STORICO</span><h2>Le prime pagine che hanno fatto la storia.</h2><p>Giornali originali, grandi vittorie e ricordi che non passano.</p></div><div class="vz-press-filters" role="group" aria-label="Filtra i giornali"></div><div class="vz-press-rail" tabindex="0" aria-label="Scorri le copertine"><div class="vz-press-track"></div></div>';
var filters=s.querySelector('.vz-press-filters'),track=s.querySelector('.vz-press-track');
[['all','Tutte'],['argentina','Argentina'],['barcelona','Barcellona']].forEach(function(a){var b=document.createElement('button');b.type='button';b.textContent=a[1];b.dataset.filter=a[0];b.addEventListener('click',function(){render(a[0]);});filters.appendChild(b);});
function render(team){track.replaceChildren();filters.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.filter===team));});covers.filter(function(c){return team==='all'||c.team===team;}).forEach(function(c){var a=document.createElement('a');a.className='vz-press-card';a.href='../assets/img/press/'+c.src;a.target='_blank';a.rel='noopener';var im=document.createElement('img');im.src='../assets/img/press/'+c.src;im.loading='lazy';im.decoding='async';im.alt=c.title;var p=document.createElement('p');p.textContent=c.title;var small=document.createElement('small');small.textContent=c.event;a.append(im,p,small);track.appendChild(a);});}
render('all');
var anchor=document.getElementById('vz-lifestyle-gallery');if(anchor)anchor.after(s);else root.appendChild(s);
})();