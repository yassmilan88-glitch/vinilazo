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
  function store(value){choice=value;window.VINILAZO_MARKETING_CONSENT=value;try{localStorage.setItem('vinilazo-consent',JSON.stringify({version:1,marketing:value,at:Date.now()}));}catch(e){}if(!value){document.cookie.split(';').forEach(function(c){var n=c.split('=')[0].trim();if(n==='_fbp'||n==='_fbc'){['',location.hostname,'.'+location.hostname,'.vinilazo.eu'].forEach(function(d){document.cookie=n+'=; Max-Age=0; path=/'+(d?'; domain='+d:'');});}});}if(dialog&&dialog.open)dialog.close();window.dispatchEvent(new CustomEvent('vinilazo:consent',{detail:{marketing:value}}));}
  function show(){
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='consent-dialog';dialog.style.cssText='max-width:520px;border-radius:16px;padding:24px;background:#fff;color:#111;font:16px/1.5 system-ui';dialog.setAttribute('aria-labelledby','consent-title');
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

/* Shared pixel: no Meta resource or event before marketing consent. */
(function(){
 'use strict';
 var initialized=false,pageSent=false,viewSent=null,purchaseBusy=false,purchaseSession=null;
 if(/\/payment-return\.html$/.test(location.pathname)){
  var receiptUrl=new URL(location.href);
  purchaseSession=receiptUrl.searchParams.get('session_id');
  try{if(purchaseSession)sessionStorage.setItem('vz-receipt-session',purchaseSession);else purchaseSession=sessionStorage.getItem('vz-receipt-session');}catch(e){}
  if(receiptUrl.searchParams.has('session_id')){receiptUrl.searchParams.delete('session_id');history.replaceState(null,'',receiptUrl.pathname+receiptUrl.search);}
 }
 function track(name,data,options){
  if(window.VINILAZO_MARKETING_CONSENT!==true||!initialized)return false;
  window.fbq('track',name,data||{},options||{});return true;
 }
 window.vzTrack=track;
 function purchase(){
  if(!/\/payment-return\.html$/.test(location.pathname)||purchaseBusy||window.VINILAZO_MARKETING_CONSENT!==true)return;
  var id=purchaseSession;
  if(!id)return;
  var key='vz-meta-purchase-'+id;
  try{if(localStorage.getItem(key))return;}catch(e){}
  purchaseBusy=true;
  fetch('/.netlify/functions/verify-purchase?session_id='+encodeURIComponent(id),{cache:'no-store',referrerPolicy:'no-referrer'})
  .then(function(r){if(!r.ok)throw Error('verify');return r.json();}).then(function(p){
   if(p.paid!==true)return;
   var eventId=p.event_id;delete p.paid;delete p.event_id;
   if(track('Purchase',p,{eventID:eventId})){try{localStorage.setItem(key,'1');}catch(e){}}
  }).catch(function(){}).finally(function(){purchaseBusy=false;});
 }
 function start(){
  if(window.VINILAZO_MARKETING_CONSENT!==true){if(initialized)window.fbq('consent','revoke');return;}
  var id=(window.VINILAZO_CONFIG||{}).META_PIXEL_ID;if(!/^\d+$/.test(id||''))return;
  if(!initialized){
   if(!window.fbq){
    var n=window.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};
    window._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];
    var s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(s);
   }
   window.fbq('consent','grant');window.fbq('set','autoConfig',false,id);window.fbq('init',id);initialized=true;
  }else window.fbq('consent','grant');
  if(!pageSent){track('PageView');pageSent=true;}
  if(document.readyState!=='loading')view();
  purchase();
 }
 function view(){
  if(document.readyState==='loading')return;
  if(!document.body.classList.contains('vz-catalog-mode')){
   var p=window.VINILAZO_CURRENT_PRODUCT;
   if(!p&&document.body.classList.contains('pp'))p={content_ids:['argentina'],content_name:'Argentina',content_type:'product',value:Number((window.VINILAZO_CONFIG||{}).PRICE)||69,currency:'EUR'};
   var key=p&&JSON.stringify(p.content_ids);
   if(p&&key!==viewSent&&track('ViewContent',p))viewSent=key;
  }
 }
 window.addEventListener('vinilazo:consent',start);
 window.addEventListener('vinilazo:product',view);
 document.addEventListener('DOMContentLoaded',function(){start();view();});
 window.addEventListener('pageshow',purchase);
 start();
})();
