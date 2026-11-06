import catalog from '../../../assets/goal-suggestions.json' with {type:'json'};
export function normalizeWishes(raw,items){
 if(raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>6)return null;
 const seen=new Set(),allowed=new Set(items.map(i=>i.id)),out=[];
 for(const w of raw){
  if(!w||typeof w!=='object'||!allowed.has(w.teamId)||seen.has(w.teamId)||!Array.isArray(w.suggestions)||w.suggestions.length>3||typeof w.note!=='string'||w.note.length>180)return null;
  if(new Set(w.suggestions).size!==w.suggestions.length||w.suggestions.some(id=>!(catalog[w.teamId]||[]).some(g=>g.id===id)))return null;
  seen.add(w.teamId);const note=w.note.replace(/[\u0000-\u001f\u007f]/g,' ').trim();
  if(w.suggestions.length||note)out.push({teamId:w.teamId,suggestions:w.suggestions,note});
 }
 return out;
}
export function wishesText(w){return (catalog[w.teamId]||[]).filter(g=>w.suggestions.includes(g.id)).map(g=>g.player+' · '+g.match).concat(w.note?[w.note]:[]).join('; ');}
export const wishesLabel={it:'Richieste di personalizzazione (da confermare)',es:'Personalización solicitada (por confirmar)',fr:'Personnalisation demandée (à confirmer)',en:'Personalisation requests (to be confirmed)',de:'Personalisierungswünsche (noch zu bestätigen)'};
