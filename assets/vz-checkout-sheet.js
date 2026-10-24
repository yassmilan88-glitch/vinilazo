/* VINILAZO — focused checkout and order tracking (product pages only). */
(function(){
 'use strict';
 function init(){
  if(document.body.classList.contains('vz-catalog-mode'))return;
  var order=document.getElementById('ordina');
  var status=document.getElementById('il-mio-ordine');
  if(!order||!status||!document.getElementById('order-form'))return;
  var lang=document.documentElement.lang||'it';
  var copy={
   it:{order:'Completa il tuo ordine',status:'Dov’è il mio ordine?',close:'Chiudi',pay:'Pagamento sicuro con Stripe. I metodi disponibili appariranno prima della conferma.',privacy:'Informativa sulla privacy'},
   es:{order:'Finaliza tu pedido',status:'¿Dónde está mi pedido?',close:'Cerrar',pay:'Pago seguro con Stripe. Verás los métodos disponibles antes de confirmar.',privacy:'Información de privacidad'},
   fr:{order:'Finalisez votre commande',status:'Où est ma commande ?',close:'Fermer',pay:'Paiement sécurisé avec Stripe. Les moyens disponibles s’affichent avant confirmation.',privacy:'Informations de confidentialité'},
   en:{order:'Complete your order',status:'Where is my order?',close:'Close',pay:'Secure payment with Stripe. Available payment methods appear before you confirm.',privacy:'Privacy information'},
   de:{order:'Bestellung abschließen',status:'Wo ist meine Bestellung?',close:'Schließen',pay:'Sichere Zahlung mit Stripe. Verfügbare Zahlungsarten erscheinen vor der Bestätigung.',privacy:'Datenschutzhinweise'}
  }[lang]||null;
  if(!copy)return;
  // Native, legible field wording instead of cramped display text or long instructions.
  var fieldWords={
    it:['Nome e cognome','Cellulare','Paese di consegna','Indirizzo e numero civico','CAP','Città','Email di contatto','Numero con prefisso internazionale, ad esempio +39.'],
    es:['Nombre y apellido','Móvil','País de entrega','Dirección y número','Código postal','Ciudad','Email de contacto','Número con prefijo internacional, por ejemplo +34.'],
    fr:['Nom et prénom','Téléphone','Pays de livraison','Adresse et numéro','Code postal','Ville','Email de contact','Numéro avec indicatif international, par exemple +33.'],
    en:['Full name','Mobile','Delivery country','Address and house number','Postal code','City','Contact email','Include country code, for example +44.'],
    de:['Vor- und Nachname','Handynummer','Lieferland','Straße und Hausnummer','PLZ','Ort','Kontakt-E-Mail','Mit internationaler Vorwahl, z. B. +49.']
  }[lang];
  ['f-name','f-phone','f-country','f-street','f-cap','f-city','f-email'].forEach(function(id,i){
    var input=document.getElementById(id);
    if(input){var label=document.querySelector('label[for="'+id+'"]');if(label)label.textContent=fieldWords[i]}
  });
  var phoneHint=document.getElementById('phone-hint');if(phoneHint)phoneHint.textContent=fieldWords[7];
  var heading=document.getElementById('order-h');
  var statusHeading=document.getElementById('order-help-heading');
  if(heading)heading.textContent=copy.order;
  if(statusHeading)statusHeading.textContent=copy.status;
  var pay=document.getElementById('pay-note');
  if(pay)pay.textContent=copy.pay;
  // Provide actual privacy text in the dialog, instead of linking to the first FAQ question.
  var wrongPrivacy=document.getElementById('privacy-details');
  if(wrongPrivacy)wrongPrivacy.removeAttribute('id');
  var privacy=document.createElement('details');privacy.id='privacy-details';
  privacy.className='vz-checkout-privacy-details';
  var summary=document.createElement('summary');summary.textContent=copy.privacy;
  var text=document.createElement('p');
  var fromFooter=document.querySelector('footer.foot details p');
  text.textContent=fromFooter?fromFooter.textContent:'';
  privacy.append(summary,text);
  var privacyNote=order.querySelector('.checkout-privacy');
  if(privacyNote)privacyNote.after(privacy);
  var privacyLink=document.getElementById('checkout-privacy-link');
  if(privacyLink)privacyLink.addEventListener('click',function(event){event.preventDefault();privacy.open=true;summary.focus()});
  var backdrop=document.createElement('div');backdrop.className='vz-modal-backdrop';
  backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
  var former=null,active='',restoreOverflow='';
  var sections={order:order,status:status};
  function close(){
   if(!active)return;
   document.body.classList.remove('vz-order-open','vz-status-open','vz-modal-open');
   sections[active].setAttribute('aria-hidden','true');
   sections[active].removeAttribute('aria-modal');
   active='';
   if(former&&former.isConnected&&typeof former.focus==='function')former.focus({preventScroll:true});
  }
  function open(which,opener){
   if(!sections[which])return;
   if(active&&active!==which)close();
   former=opener||document.activeElement;
   active=which;
   document.body.classList.remove('vz-order-open','vz-status-open');
   document.body.classList.add('vz-modal-open',which==='order'?'vz-order-open':'vz-status-open');
   sections[which].setAttribute('aria-hidden','false');
   sections[which].setAttribute('aria-modal','true');
   sections[which].scrollTop=0;
   var focus=which==='order'?order.querySelector('#f-name'):status.querySelector('#order-reference');
   var first=sections[which].querySelector('.vz-modal-close');
   if(first)first.focus({preventScroll:true});
   else if(focus)focus.focus({preventScroll:true});
  }
  [[order,'order','order-h'],[status,'status','order-help-heading']].forEach(function(item){
   var node=item[0],which=item[1];
   node.setAttribute('role','dialog');
   node.setAttribute('aria-labelledby',item[2]);
   node.setAttribute('aria-hidden','true');
   var closeButton=document.createElement('button');closeButton.type='button';
   closeButton.className='vz-modal-close';closeButton.textContent='×';
   closeButton.setAttribute('aria-label',copy.close);
   closeButton.addEventListener('click',close);
   node.prepend(closeButton);
  });
  backdrop.addEventListener('click',close);
  document.addEventListener('click',function(event){
   var anchor=event.target.closest&&event.target.closest('a[href]');
   if(!anchor||event.defaultPrevented)return;
   var url=anchor.getAttribute('href');
   if(url==='#ordina'||url==='#il-mio-ordine'){
    event.preventDefault();
    open(url==='#ordina'?'order':'status',anchor);
   }
  },true);
  document.addEventListener('keydown',function(event){
   if(!active)return;
   if(event.key==='Escape'){event.preventDefault();close();return}
   if(event.key!=='Tab')return;
   var dialog=sections[active];
   var elements=Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(function(el){
    return el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
   });
   if(!elements.length)return;
   var first=elements[0],last=elements[elements.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  document.body.classList.add('vz-checkout-shell');
  // Keep a direct link to the order or tracking dialog working on reload.
  if(location.hash==='#ordina'||location.hash==='#il-mio-ordine'){
   var initial=location.hash==='#ordina'?'order':'status';
   requestAnimationFrame(function(){window.scrollTo(0,0);open(initial,null)});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
