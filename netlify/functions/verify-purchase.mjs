const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
// Stessa regola di create-checkout: ogni coppia 2 × 62,10 €, pezzo dispari 69 €, massimo 6 pezzi.
export const totalFor=(n)=>Math.floor(n/2)*12420+(n%2)*6900;
export function purchaseFrom(s){
 const m=s.metadata||{},n=Number(m.quantity);
 if(s.livemode!==true||s.status!=='complete'||s.payment_status!=='paid'||!/^VZ-[A-F0-9]{16}$/.test(m.order_reference||'')||!Number.isInteger(n)||n<1||n>6||s.currency!=='eur'||s.amount_total!==totalFor(n))return {paid:false};
 const fromItems=String(m.items||'').split(',').map(x=>x.split(':')[0]).filter(id=>/^[a-z-]{2,40}$/.test(id));
 const ids=fromItems.length?fromItems:(n===2&&m.second_team?[m.first_team,m.second_team]:[m.first_team]);
 return {paid:true,event_id:'purchase_'+s.id,value:s.amount_total/100,currency:'EUR',content_type:'product',content_ids:ids.filter(Boolean),num_items:n};
}
export default async function handler(request){
 if(request.method!=='GET')return json({error:'method_not_allowed'},405);
 const id=new URL(request.url).searchParams.get('session_id');
 if(!/^cs_live_[A-Za-z0-9]{20,250}$/.test(id||''))return json({paid:false},400);
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key)return json({paid:false},503);
 try{
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
 if(!r.ok)return json({paid:false},502);
 return json(purchaseFrom(await r.json()));
 }catch{return json({paid:false},502);}
}
