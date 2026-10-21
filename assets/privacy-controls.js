/* Optional marketing consent. No marketing script starts before an affirmative choice. */
(function () {
  'use strict';
  var cfg=window.VINILAZO_CONFIG||{}, lang=document.documentElement.lang;
  var texts={
    it:['Preferenze cookie','Il sito usa strumenti tecnici per ricordare la squadra e gestire la navigazione. Se acconsenti, possiamo usare il Pixel Meta per misurare gli annunci. Puoi rifiutare e continuare a usare il sito.','Accetta marketing','Rifiuta marketing','Chiudi senza accettare','Gestisci cookie'],
    en:['Cookie preferences','The site uses technical storage to remember your team and support navigation. With your consent, we may use the Meta Pixel to measure ads. You can reject it and still use the site.','Accept marketing','Reject marketing','Close without accepting','Manage cookies'],
    es:['Preferencias de cookies','El sitio utiliza almacenamiento técnico para recordar tu equipo y facilitar la navegación. Con tu consentimiento podemos usar el Pixel de Meta para medir anuncios. Puedes rechazarlo y seguir usando el sitio.','Aceptar marketing','Rechazar marketing','Cerrar sin aceptar','Gestionar cookies'],
    fr:['Préférences des cookies','Le site utilise un stockage technique pour mémoriser votre équipe et faciliter la navigation. Avec votre accord, nous pouvons utiliser le Pixel Meta pour mesurer les publicités. Vous pouvez refuser et continuer à utiliser le site.','Accepter le marketing','Refuser le marketing','Fermer sans accepter','Gérer les cookies'],
    de:['Cookie-Einstellungen','Die Website nutzt technischen Speicher für deine Teamauswahl und Navigation. Mit deiner Einwilligung können wir den Meta-Pixel zur Werbemessung verwenden. Du kannst ablehnen und die Website weiterhin nutzen.','Marketing akzeptieren','Marketing ablehnen','Ohne Zustimmung schließen','Cookies verwalten']
  };var t=texts[lang]||texts.en,choice=null,dialog=null;
  try {var saved=JSON.parse(localStorage.getItem('vinilazo-consent'));if(saved&&saved.version===1&&Date.now()-saved.at<180*86400000)choice=saved.marketing===true;}catch(e){}
  window.VINILAZO_MARKETING_CONSENT=choice===true;
  function store(value){choice=value;window.VINILAZO_MARKETING_CONSENT=value;try{localStorage.setItem('vinilazo-consent',JSON.stringify({version:1,marketing:value,at:Date.now()}));}catch(e){}if(dialog&&dialog.open)dialog.close();window.dispatchEvent(new CustomEvent('vinilazo:consent',{detail:{marketing:value}}));}
  function show(){
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='consent-dialog';dialog.setAttribute('aria-labelledby','consent-title');
      var heading=document.createElement('h2');heading.id='consent-title';heading.textContent=t[0];dialog.appendChild(heading);
      var paragraph=document.createElement('p');paragraph.textContent=t[1];dialog.appendChild(paragraph);
      [true,false].forEach(function(value,index){var button=document.createElement('button');button.type='button';button.className='consent-action';button.textContent=t[index+2];button.addEventListener('click',function(){store(value);});dialog.appendChild(button);});
      var close=document.createElement('button');close.type='button';close.className='consent-close';close.textContent=t[4];close.addEventListener('click',function(){store(false);});dialog.appendChild(close);
      dialog.addEventListener('cancel',function(event){event.preventDefault();store(false);});document.body.appendChild(dialog);
    }
    if(typeof dialog.showModal==='function')dialog.showModal();
  }
  document.querySelectorAll('[data-privacy-settings]').forEach(function(button){button.textContent=t[5];button.addEventListener('click',show);});
  if(cfg.META_PIXEL_ID&&choice===null)show();
})();
