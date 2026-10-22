/* VINILAZO quick nav — consistent in every language, lightweight and accessible */
(function(){
'use strict';
function init(){
 const nav=document.getElementById('vz-quick-nav');if(!nav)return;
 const toggle=nav.querySelector('.vz-nav-toggle'),links=nav.querySelector('.vz-nav-links');
 const how=document.querySelector('section.how');if(how&&!how.id)how.id='come-funziona';
 let open=false,scrollTimer,lastY=window.scrollY, glideTimer;
 function setOpen(value){open=value;nav.classList.toggle('vz-open',open);links.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.firstChild.textContent=open?'× ':'☰ ';}
 toggle.addEventListener('click',()=>setOpen(!open));
 document.addEventListener('pointerdown',e=>{if(open&&!nav.contains(e.target))setOpen(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){setOpen(false);toggle.focus()}});
 links.querySelectorAll('a').forEach(link=>link.addEventListener('click',e=>{
  const href=link.getAttribute('href');
  if(href==='#squadre'){
   e.preventDefault();setOpen(false);
   const picker=document.getElementById('squadre'),pickerButton=document.getElementById('team-pick');
   if(picker&&picker.hidden&&pickerButton)pickerButton.click();
   if(picker)requestAnimationFrame(()=>picker.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));
  }else setOpen(false);
 }));
 function onScroll(){
  let y=window.scrollY;
  nav.classList.toggle('vz-compact',y>160&&!open);
  if(open&&Math.abs(y-lastY)>45)setOpen(false);
  lastY=y;
  nav.classList.add('vz-glide');clearTimeout(glideTimer);glideTimer=setTimeout(()=>nav.classList.remove('vz-glide'),450);
  clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{nav.classList.toggle('vz-compact',window.scrollY>160&&!open)},160);
 }
 window.addEventListener('scroll',onScroll,{passive:true});onScroll();
 // Taglines: animate only as lines enter the viewport, no looping or disruptive flashing.
 const lines=document.querySelectorAll('.poem p, .moment-after, .moment-cta');
 lines.forEach(p=>{p.classList.add('vz-copy-line');if(p.classList.contains('hit'))p.classList.add('vz-emphasis')});
 if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('vz-in');obs.unobserve(entry.target)}}),{threshold:.24,rootMargin:'0px 0px -30px 0px'});
  lines.forEach(p=>obs.observe(p));
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
