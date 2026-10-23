/* VINILAZO – product-page declutter: stories and lifestyle photos on request. */
(function(){
  'use strict';
  var root=document.getElementById('data');if(!root)return;
  var data;try{data=JSON.parse(root.textContent)}catch(e){return}
  var l=data.lang||'it';
  var tr={
    it:{story:'Storie e giornali dei gol',storyHint:'Apri se vuoi leggere come sono nati questi momenti.',photos:'Guarda il prodotto da vicino',photosHint:'Foto del campione Argentina e anteprime delle altre squadre.'},
    es:{story:'Historias y diarios de los goles',storyHint:'Abrí para descubrir las historias detrás de estos momentos.',photos:'Mirá el producto de cerca',photosHint:'Fotos del modelo real de Argentina e imágenes de las demás ediciones.'},
    fr:{story:'Histoires et journaux des buts',storyHint:'Ouvrez pour découvrir les récits de ces moments.',photos:'Voir le produit de près',photosHint:'Photos du modèle argentin et aperçus des autres éditions.'},
    en:{story:'Goal stories and newspaper clippings',storyHint:'Open to explore the stories behind these iconic moments.',photos:'See the product up close',photosHint:'Physical Argentina sample and previews of other editions.'},
    de:{story:'Torgeschichten und Zeitungsberichte',storyHint:'Öffnen und die Geschichten hinter den Toren entdecken.',photos:'Produkt aus der Nähe ansehen',photosHint:'Echtes Argentinien-Muster und Vorschauen der anderen Editionen.'}
  }[l]||null;
  if(!tr)return;
  function el(tag,cls,value){var e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
  function boot(){
    if(document.body.classList.contains('vz-catalog-mode')||document.body.classList.contains('pp'))return;
    document.body.classList.add('vz-compact-product');
    var stories=document.getElementById('storie');
    if(stories&&!stories.querySelector('.vz-details-stories')){
      var disclosure=el('details','vz-details-stories');
      var summary=el('summary','vz-compact-summary');
      var text=el('span','vz-compact-summary-copy');
      text.append(el('strong','',tr.story),el('small','',tr.storyHint));
      summary.append(el('span','vz-compact-icon','▤'),text,el('span','vz-compact-arrow','⌄'));
      var contents=el('div','vz-compact-stories-content');
      var headline=stories.querySelector('.rack-head'), grid=stories.querySelector('#story-grid');
      if(headline)contents.append(headline);
      if(grid)contents.append(grid);
      disclosure.append(summary,contents);stories.append(disclosure);
      function ensureOpen(){disclosure.open=true;}
      document.addEventListener('click',function(event){
        var a=event.target.closest('a[href^="#storia-"], a[href="#storie"]');
        if(a)ensureOpen();
      });
      if(/^#storia-\d+$/.test(location.hash)||location.hash==='#storie')ensureOpen();
      window.addEventListener('hashchange',function(){if(location.hash==='#storie'||/^#storia-\d+$/.test(location.hash))ensureOpen();});
    }
    var gallery=document.querySelector('.vz-lifestyle-detail');
    if(gallery&&!gallery.closest('.vz-photo-disclosure')){
      var photo=el('details','vz-photo-disclosure');
      var photosum=el('summary','vz-compact-summary');
      var photosumtext=el('span','vz-compact-summary-copy');
      photosumtext.append(el('strong','',tr.photos),el('small','',tr.photosHint));
      photosum.append(el('span','vz-compact-icon','▧'),photosumtext,el('span','vz-compact-arrow','⌄'));
      gallery.before(photo);photo.append(photosum,gallery);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();