/* Shared launch pricing, live sales and cash on delivery; no synthetic sales. */
(function () {
  'use strict';
  var lang = (document.documentElement.lang || 'it').slice(0, 2);
  var copy = {
    it:['OFFERTA LANCIO','Primi 100 ordini · massimo 7 giorni','Non cumulabile. Un posto riservato per ogni ordine registrato, anche in attesa di pagamento.','Quantità venduta oggi','Vendite di oggi · sito e marketplace','Pagamento','Online con Stripe','Pagamento alla consegna','Conferma ordine','Da pagare alla consegna','Ordine registrato. Pagherai alla consegna. Conserva il riferimento per l’assistenza.','Sconto applicato','Supplemento alla consegna','Italia +4 € · Francia +8 € · Svizzera +14 €','Il prezzo è cambiato. Controlla il nuovo totale e conferma di nuovo.','Disponibile per Italia, Francia e Svizzera.','Scade il','Vedi su Trustpilot','venduti oggi'],
    fr:['OFFRE DE LANCEMENT','100 premières commandes · 7 jours maximum','Non cumulable. Une place réservée par commande enregistrée, même en attente de paiement.','Quantité vendue aujourd’hui','Ventes du jour · site et marketplace','Paiement','En ligne avec Stripe','Paiement à la livraison','Confirmer la commande','À payer à la livraison','Commande enregistrée. Vous paierez à la livraison. Conservez votre référence.','Remise appliquée','Frais de paiement à la livraison','Italie +4 € · France +8 € · Suisse +14 €','Le prix a changé. Vérifiez le nouveau total et confirmez à nouveau.','Disponible en Italie, France et Suisse.','Jusqu’au','Voir sur Trustpilot','vendus aujourd’hui'],
    en:['LAUNCH OFFER','First 100 orders · maximum 7 days','Cannot be combined. Each registered order reserves a place, including orders awaiting payment.','Quantity sold today','Today’s sales · website and marketplace','Payment','Online with Stripe','Cash on delivery','Confirm order','Due on delivery','Order registered. Pay on delivery. Keep your reference for support.','Discount applied','Cash on delivery fee','Italy +€4 · France +€8 · Switzerland +€14','The price has changed. Review the new total and confirm again.','Available in Italy, France and Switzerland.','Ends','View on Trustpilot','sold today'],
    es:['OFERTA DE LANZAMIENTO','Primeros 100 pedidos · máximo 7 días','No acumulable. Cada pedido registrado reserva una plaza, también si está pendiente de pago.','Cantidad vendida hoy','Ventas de hoy · web y marketplace','Pago','En línea con Stripe','Pago contra entrega','Confirmar pedido','A pagar contra entrega','Pedido registrado. Pagarás contra entrega. Conservá la referencia.','Descuento aplicado','Cargo contra entrega','Italia +4 € · Francia +8 € · Suiza +14 €','El precio ha cambiado. Revisá el nuevo total y confirmá de nuevo.','Disponible en Italia, Francia y Suiza.','Hasta el','Ver en Trustpilot','vendidos hoy'],
    de:['STARTANGEBOT','Erste 100 Bestellungen · maximal 7 Tage','Nicht kombinierbar. Jede registrierte Bestellung reserviert einen Platz, auch vor der Zahlung.','Heute verkaufte Stückzahl','Heutige Verkäufe · Website und Marketplace','Zahlung','Online mit Stripe','Nachnahme','Bestellung bestätigen','Bei Lieferung zu zahlen','Bestellung registriert. Zahlung bei Lieferung. Bitte Bestellnummer aufbewahren.','Rabatt angewendet','Nachnahmegebühr','Italien +4 € · Frankreich +8 € · Schweiz +14 €','Der Preis hat sich geändert. Prüfe den Gesamtbetrag und bestätige erneut.','Verfügbar in Italien, Frankreich und der Schweiz.','Endet am','Auf Trustpilot ansehen','heute verkauft']
  }[lang];
  copy = copy || ['LAUNCH OFFER'];
  var state = null;
  var api = window.VZCommerce = {
    copy:copy, ready:false,
    launch:function(){return false;},
    goods:function(n){return Math.floor(n/2)*78 + (n%2)*49;},
    method:function(){var el=document.getElementById('vz-payment-method');return el ? el.value : 'online';},
    iso:function(){var c=document.getElementById('f-country');return c && c.selectedOptions[0] ? c.selectedOptions[0].dataset.iso : '';},
    fee:function(){return api.method()==='cod' ? ({IT:4,FR:8,CH:14}[api.iso()] || 0) : 0;},
    applyQuote:function(q){if(state && state.campaign)state.campaign.active=q.launch;update();},
    refresh:refresh
  };
  function el(tag,cls,text){var x=document.createElement(tag);x.className=cls||'';if(text!=null)x.textContent=text;return x;}
  function update(){
    var promo=document.getElementById('vz-launch');if(promo)promo.hidden=!api.launch();
    var sales=document.getElementById('vz-sales');
    if(sales){var q=state && state.sales ? state.sales.quantity : 0;sales.hidden=!(q>0);sales.querySelector('strong').textContent=String(q);}
    var terms=document.getElementById('vz-launch-terms');if(terms)terms.hidden=!api.launch();
    var option=document.querySelector('#vz-payment-method option[value="cod"]');
    if(option){option.disabled=!['IT','FR','CH'].includes(api.iso());if(option.disabled && api.method()==='cod')document.getElementById('vz-payment-method').value='online';}
    window.dispatchEvent(new Event('vz-commerce-change'));
  }
  async function refresh(){
    try{var r=await fetch('/.netlify/functions/shop-status',{cache:'no-store'});if(!r.ok)throw new Error();state=await r.json();api.ready=!!state.campaign;update();}catch(e){api.ready=false;state=null;update();}
  }
  function init(){
    var header=document.querySelector('.top');if(!header)return;
    var wrap=el('div','vz-commerce');
    var promo=el('section','vz-launch');promo.id='vz-launch';promo.hidden=true;
    var ends=new Intl.DateTimeFormat(lang,{day:'numeric',month:'short',timeZone:'Europe/Rome'}).format(new Date('2026-11-01T12:00:00Z'));
    var text=el('div','vz-launch-text');
    var l1=el('div','vz-launch-l1');l1.append(el('span','vz-commerce-eyebrow',copy[0]),el('span','vz-launch-sep','·'),el('b','',copy[1].split(' · ')[0]));
    var l2=el('div','vz-launch-l2');l2.append(el('span','',copy[16]+' '+ends));
    var sales=el('span','vz-sales');sales.id='vz-sales';sales.hidden=true;sales.append(el('i','vz-sales-dot'),el('strong','','0'),document.createTextNode(copy[18]));l2.append(sales);
    text.append(l1,l2);promo.append(el('strong','vz-offer-value','−20%'),text);wrap.append(promo);header.after(wrap);
    var url=(window.VINILAZO_CONFIG||{}).TRUSTPILOT_URL;
    if(url && /^https:\/\/(www\.|[a-z]{2}\.)?trustpilot\.com\/review\/vinilazo\.eu\/?$/.test(url)){
      var trust=el('a','vz-trustpilot',copy[17]);trust.href=url;trust.target='_blank';trust.rel='noopener';wrap.append(trust);
    }
    var form=document.getElementById('order-form');
    if(form){
      var field=el('div','field vz-payment-field');var label=el('label','',copy[5]);label.htmlFor='vz-payment-method';
      var select=el('select');select.id='vz-payment-method';select.name='metodo_pagamento';
      [['online',copy[6]],['cod',copy[7]+' · '+copy[13]]].forEach(function(pair){var o=el('option','',pair[1]);o.value=pair[0];select.append(o);});
      field.append(label,select,el('small','hint',copy[15]));
      var summary=document.querySelector('#summary-total').closest('dl');summary.parentElement.before(field);
      var lt=el('p','vz-launch-terms',copy[2]);lt.id='vz-launch-terms';lt.hidden=true;summary.after(lt);
      var fee=el('div');fee.id='vz-fee-row';fee.hidden=true;fee.append(el('dt','',copy[12]),el('dd'));summary.insertBefore(fee,summary.querySelector('.summary-total'));
      document.querySelector('#summary-discount-row dt').textContent=copy[11];
      select.addEventListener('change',update);document.getElementById('f-country').addEventListener('change',update);
    }
    refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
