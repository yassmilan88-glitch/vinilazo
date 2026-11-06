/* Optional goal requests, per edition; no automatic changes to the nine included discs. */
(function(){
'use strict';
const lang=(document.documentElement.lang||'it').slice(0,2);
const COPY={
it:['Quel gol è anche un pezzo della tua vita.','I nostri 9 gol sono un inizio. Quale altro vorresti rivivere?','Altri brividi per','Questo lo voglio rivivere','Il tuo gol non c’è? Raccontacelo.','Giocatore, avversario, anno. E, se vuoi, perché significa tanto per te.','Richieste di personalizzazione','Scegli fino a 3 ricordi per squadra. Verifichiamo la disponibilità della telecronaca e concordiamo le sostituzioni prima della produzione. I 9 dischi inclusi e il totale non cambiano con questa richiesta.','Le tue preferenze','Nessuna richiesta: mantieni i 9 dischi della selezione.','Preferenze salvate','Modifica','Tutti i pezzi di questa squadra avranno le stesse preferenze. Per scelte diverse, indicacelo nel testo.'],
es:['Ese gol también cuenta tu historia.','Nuestros 9 goles son solo el comienzo. ¿Cuál te gustaría volver a gritar?','Más piel de gallina con','Quiero revivirlo','¿Falta tu gol? Contanos.','Jugador, rival, año. Y, si querés, por qué nunca lo olvidaste.','Pedidos de personalización','Elegí hasta 3 recuerdos por equipo. Confirmamos el audio disponible y acordamos los cambios antes de producir. Esta solicitud no cambia los 9 discos incluidos ni el total.','Tus elecciones','Sin pedido especial: conservás los 9 discos seleccionados.','Preferencias guardadas','Editar','Las preferencias se aplican a todas las unidades de este equipo. Si las querés distintas, contanos en el texto.'],
fr:['Ce but fait partie de votre histoire.','Nos 9 buts, c’est un début. Lequel vous donne encore des frissons ?','Encore des frissons avec','Je veux le revivre','Votre but n’y est pas ? Racontez-nous.','Le joueur, l’adversaire, l’année. Et ce qui rend ce souvenir si précieux.','Demandes de personnalisation','Choisissez jusqu’à 3 souvenirs par équipe. Nous confirmons le commentaire disponible et les remplacements avant fabrication. Cette demande ne modifie ni les 9 disques inclus ni le total.','Vos choix','Aucune demande : vous gardez les 9 disques de notre sélection.','Préférences enregistrées','Modifier','Ces choix s’appliquent à tous les exemplaires de cette équipe. Précisez dans le texte si vous souhaitez des choix différents.'],
en:['That goal is part of your story.','Our 9 goals are just the start. Which other moment still gives you goosebumps?','More memories with','I want to relive this','Your goal missing? Tell us about it.','Player, opponent, year. And, if you like, what made it unforgettable.','Personalisation requests','Choose up to 3 memories per team. We confirm commentary availability and agree replacements before production. This request does not change the 9 included discs or your total.','Your choices','No special request: keep our selection of 9 discs.','Preferences saved','Edit','These choices apply to every unit of this team. Tell us in the text if you want different choices for each.'],
de:['Dieses Tor gehört zu deiner Geschichte.','Unsere 9 Tore sind erst der Anfang. Welcher Moment gibt dir heute noch Gänsehaut?','Noch mehr Gänsehaut mit','Das will ich noch mal erleben','Dein Tor fehlt? Erzähl uns davon.','Spieler, Gegner, Jahr. Und wenn du magst: Warum vergisst du diesen Moment nie?','Personalisierungswünsche','Wähle bis zu 3 Erinnerungen pro Team. Wir prüfen den verfügbaren Kommentar und stimmen den Austausch vor der Produktion ab. Diese Anfrage ändert weder die 9 enthaltenen Platten noch den Gesamtpreis.','Deine Auswahl','Keine Sonderwünsche: Unsere Auswahl mit 9 Platten bleibt bestehen.','Wünsche gespeichert','Bearbeiten','Diese Wünsche gelten für alle Exemplare dieses Teams. Unterschiedliche Wünsche kannst du im Text angeben.']};
const t=COPY[lang]||COPY.it, KEY='vinilazo-goal-wishes-v1';
let catalog={}, wishes={};try{wishes=JSON.parse(localStorage.getItem(KEY)||'{}');if(!wishes||Array.isArray(wishes)||typeof wishes!=='object')wishes={};}catch{wishes={};}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
const form=document.getElementById('order-form');if(!form)return;
const section=el('section','goal-personalization');section.id='personalizza-gol';section.setAttribute('aria-labelledby','goal-personalization-title');
const title=el('h2','',t[0]);title.id='goal-personalization-title';section.append(title,el('p','goal-intro',t[1]));
const teamLine=el('h3'),cards=el('div','goal-options'),label=el('label','',t[4]),note=el('textarea');label.htmlFor='goal-memory';note.id='goal-memory';note.maxLength=180;note.rows=3;note.placeholder=t[5];
const explanation=el('p','goal-explanation',t[7]);explanation.id='goal-explanation';note.setAttribute('aria-describedby',explanation.id);
const status=el('p','goal-status');status.setAttribute('role','status');
section.append(teamLine,cards,label,note,explanation,el('p','goal-explanation',t[12]),status);
document.querySelector('.hero').after(section);
const recap=el('div','goal-recap');recap.hidden=true;form.querySelector('#summary-total').closest('dl').after(recap);
let active='';
function get(id){const w=wishes[id];return {suggestions:Array.isArray(w?.suggestions)?w.suggestions.filter(x=>(catalog[id]||[]).some(g=>g.id===x)).slice(0,3):[],note:typeof w?.note==='string'?w.note.slice(0,180):''};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(wishes));}catch{}status.textContent=t[10];refreshSummary();const ref=form.elements.riferimento_ordine;if(ref)ref.value='';}
function describe(id,w){const goals=(catalog[id]||[]).filter(g=>w.suggestions.includes(g.id)).map(g=>g.player+' · '+g.match);return goals.concat(w.note?[w.note]:[]).join('; ');}
window.VZGoalWishes={collect(items){return (items||[]).map(i=>{const teamId=i.teamId||i.id;return {teamId,...get(teamId)};}).filter(w=>w.suggestions.length||w.note.trim());}};
function refreshSummary(){
 const shop=window.vzShop;const items=shop?.orderItems?shop.orderItems():[{teamId:shop?.current()}];
 const selected=window.VZGoalWishes.collect(items);recap.replaceChildren();recap.hidden=!selected.length;
 if(selected.length){recap.append(el('h3','',t[6]));for(const w of selected){recap.append(el('p','',(shop?.teams[w.teamId]?.name||w.teamId)+': '+describe(w.teamId,w)));}recap.append(el('small','',t[7]));}
 const hidden=form.elements.gol_personalizzati;if(hidden)hidden.value=selected.map(w=>(shop?.teams[w.teamId]?.name||w.teamId)+': '+describe(w.teamId,w)).join('\n');
}
function render(){
 const id=window.vzShop?.current();if(!id)return;active=id;
 const name=window.vzShop.teams[id]?.name||id;teamLine.textContent=t[2]+' '+name;const w=get(id);cards.replaceChildren();
 for(const goal of catalog[id]||[]){
  const option=el('label','goal-option'),input=el('input');input.type='checkbox';input.checked=w.suggestions.includes(goal.id);input.value=goal.id;
  const copy=el('span');copy.append(el('strong','',goal.player),el('span','',goal.match),el('small','',t[3]));option.append(input,copy);cards.append(option);
  input.addEventListener('change',()=>{const entry=get(id);if(input.checked&&entry.suggestions.length>=3){input.checked=false;return;}entry.suggestions=input.checked?entry.suggestions.concat(goal.id):entry.suggestions.filter(x=>x!==goal.id);wishes[id]=entry;save();});
 }
 note.value=w.note;status.textContent='';refreshSummary();
}
note.addEventListener('input',()=>{const w=get(active);w.note=note.value;wishes[active]=w;save();});
form.addEventListener('change',refreshSummary);
window.addEventListener('vinilazo:product',render);window.addEventListener('vinilazo:order-items',refreshSummary);
fetch('/assets/goal-suggestions.json?v=1').then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(data=>{catalog=data;render();}).catch(()=>render());
render();
})();
