/* VINILAZO: visible newspaper carousel and honest, tappable ▶ PLAY prompts. */
(function () {
  'use strict';
  var source=document.getElementById('data');
  if(!source)return;
  var data;try{data=JSON.parse(source.textContent)}catch(e){return;}
  var L={
    it:{hero:'▶ PLAY · Ascolta il gol',disc:'▶ PLAY',ready:'▶ PLAY · Tocca un disco per ascoltare la telecronaca',silent:'Tocca un disco per vederlo sul lettore',index:'▶ PLAY · Tocca uno dei dischi per ascoltare il gol'},
    es:{hero:'▶ PLAY · Escuchá el gol',disc:'▶ PLAY',ready:'▶ PLAY · Tocá un disco para escuchar el relato',silent:'Tocá un disco para verlo en el reproductor',index:'▶ PLAY · Tocá un disco para escuchar el gol'},
    fr:{hero:'▶ PLAY · Écoutez le but',disc:'▶ PLAY',ready:'▶ PLAY · Touchez un disque pour entendre le commentaire',silent:'Touchez un disque pour le voir sur le lecteur',index:'▶ PLAY · Touchez un disque pour écouter le but'},
    en:{hero:'▶ PLAY · Hear the goal',disc:'▶ PLAY',ready:'▶ PLAY · Tap a record to hear the commentary',silent:'Tap a record to preview it on the player',index:'▶ PLAY · Tap a record to hear the goal'},
    de:{hero:'▶ PLAY · Tor anhören',disc:'▶ PLAY',ready:'▶ PLAY · Platte antippen und den Kommentar hören',silent:'Platte antippen, um sie am Spieler zu sehen',index:'▶ PLAY · Platte antippen und das Tor hören'}
  }[data.lang]||null;
  if(!L)return;
  function isArgentina(){
    if(document.body.classList.contains('pp'))return !!data.team&&data.team.id==='argentina';
    var target=document.querySelector('#team-pick [data-team-name]');
    var name=target&&target.textContent.trim().toLowerCase();
    var team=(data.teams||[]).find(function(t){return t.name.toLowerCase()===name;});
    if(team)return team.id==='argentina';
    return new URLSearchParams(location.search).get('team')==='argentina'||data.def_team==='argentina';
  }
  function boot(){
    if(document.body.classList.contains('vz-catalog-mode'))return;
    var stage=document.querySelector('.hero .hero-stage');
    if(!stage)return;
    var play=document.createElement('button');
    play.type='button';play.className='vz-hero-play-btn';play.textContent=L.hero;
    play.setAttribute('aria-label',L.hero);
    stage.append(play);
    play.addEventListener('click',function(){
      if(!isArgentina())return;
      var selector=document.body.classList.contains('pp')?'.ix-list a[href="#disco-1"]':'#hd-list a[data-preview-disc="1"]';
      var first=document.querySelector(selector);
      if(first)first.click();
    });
    function highlight(){
      var arg=isArgentina();
      play.hidden=!arg;
      document.body.classList.toggle('vz-ready-play',arg);
      var caption=document.getElementById('vz-preview-caption');
      if(caption)caption.textContent=arg?L.ready:L.silent;
    }
    if(document.body.classList.contains('pp')){
      var hint=document.querySelector('.pp-index>p');
      if(hint){hint.textContent=L.index;hint.classList.add('vz-play-instruction');}
      document.querySelectorAll('.pp-index .ix-list a[href^="#disco-"]').forEach(function(a){
        if(a.querySelector('.vz-play-indicator'))return;
        var badge=document.createElement('span');badge.className='vz-play-indicator';badge.textContent=L.disc;
        a.append(badge);
        a.setAttribute('aria-label',L.hero+': '+(a.querySelector('.ix-name')?.textContent||''));
      });
    }else{
      var heading=document.querySelector('#team-pick [data-team-name]');
      if(heading&&window.MutationObserver)new MutationObserver(highlight).observe(heading,{subtree:true,characterData:true,childList:true});
      var list=document.getElementById('hd-list');
      if(list&&window.MutationObserver)new MutationObserver(highlight).observe(list,{childList:true});
      document.addEventListener('click',function(e){if(e.target.closest('.team[data-team]'))requestAnimationFrame(highlight);});
    }
    highlight();
    // Preserve all cover assets; cycle their z-order in the original fanned arrangement.
    var hero=document.querySelector('.hero'),paper=hero&&hero.querySelector('.paper'),stack=hero&&hero.querySelector('.stack');
    if(!paper||!stack)return;
    var covers=[],front=0;
    function prepare(){
      covers=Array.prototype.slice.call(stack.querySelectorAll('.cv:not([hidden])'));
      front=Math.max(0,covers.length-1);render();
    }
    function render(){
      var n=covers.length;
      covers.forEach(function(cv,i){
        cv.classList.remove('vz-cover-slot-0','vz-cover-slot-1','vz-cover-slot-2');
        cv.classList.add('vz-cover-slot-'+((i-front+n-1+n)%n));
      });
    }
    prepare();
    if(window.MutationObserver)new MutationObserver(prepare).observe(stack,{childList:true});
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      window.setInterval(function(){
        if(document.hidden||paper.hidden||covers.length<2)return;
        var box=hero.getBoundingClientRect();
        if(box.bottom<0||box.top>window.innerHeight)return;
        front=(front+1)%covers.length;render();
      },5600);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();