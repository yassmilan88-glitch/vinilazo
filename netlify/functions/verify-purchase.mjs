const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
export default async function handler(request){
 if(request.method!=='GET')return json({error:'method_not_allowed'},405);
 const id=new URL(request.url).searchParams.get('session_id');
 if(!/^cs_live_[A-Za-z0-9]{20,250}$/.test(id||''))return json({paid:false},400);
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key)return json({paid:false},503);
 try{
 const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
 if(!r.ok)return json({paid:false},502);
 const s=await r.json(),m=s.metadata||{};
 if(s.livemode!==true||s.status!=='complete'||s.payment_status!=='paid'||!/^VZ-[A-F0-9]{16}$/.test(m.order_reference||'')||!['1','2'].includes(m.quantity)||s.currency!=='eur'||s.amount_total!==(m.quantity==='2'?12420:6900))return json({paid:false});
 return json({paid:true,event_id:'purchase_'+s.id,value:s.amount_total/100,currency:'EUR',content_type:'product',content_ids:m.quantity==='2'?[m.first_team,m.second_team]:[m.first_team],num_items:Number(m.quantity)});
 }catch{return json({paid:false},502);}
}
