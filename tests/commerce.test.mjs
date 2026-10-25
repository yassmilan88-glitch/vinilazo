import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
const rows = new Map();
const memory = {
 get: async k => structuredClone(rows.get(k) || null),
 list: async ({prefix}) => ({blobs:[...rows.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))}),
 setJSON: async (k,v,opts={}) => {if(opts.onlyIfNew && rows.has(k)) return {modified:false};rows.set(k,structuredClone(v));return {modified:true};}
};
mock.module('@netlify/blobs',{namedExports:{getStore:()=>memory}});
const { pricing, reserve, activeAt, START, END } = await import('../netlify/functions/lib/commerce.mjs');
const { default: handler, priceLines } = await import('../netlify/functions/create-checkout.mjs');
process.env.STRIPE_SECRET_KEY = 'sk_live_test_fixture';
process.env.VINILAZO_CHECKOUT_ENABLED = 'true';
let stripeCalls=0, formCalls=0;
global.fetch = async (url, options) => {
 if(url.startsWith('https://api.stripe.com/')) {
  stripeCalls++;
  const p=options.body;let amount=0;
  for(let i=0;p.has(`line_items[${i}][quantity]`);i++)amount+=Number(p.get(`line_items[${i}][quantity]`))*Number(p.get(`line_items[${i}][price_data][unit_amount]`));
  return Response.json({id:'cs_live_fixture',livemode:true,amount_total:amount,url:'https://checkout.stripe.com/test-fixture'});
 }
 if(url==='https://vinilazo.eu/cod-form.html'){formCalls++;return new Response('stored');}
 throw Error('Unexpected network call');
};
const order = (ref, method='online', iso='IT') => ({reference:`VZ-${ref.padStart(16,'0')}`,lang:'it',gift:false,items:[{teamId:'argentina',qty:1}],method,email:'test@example.com',customer:{name:'TEST NON SPEDIRE',phone:'+39000000000',address:'Test',cap:'12100',city:'Test',iso,country:iso}});
const post = o=>handler(new Request('https://vinilazo.eu/.netlify/functions/create-checkout',{method:'POST',headers:{origin:'https://vinilazo.eu','content-type':'application/json'},body:JSON.stringify(o)}));
test('prices, fees, non-cumulative discount and boundaries',()=>{
 assert.equal(pricing(1,true).total,5520);assert.equal(pricing(2,true).total,11040);
 assert.equal(pricing(3,true).total,16560);assert.equal(pricing(2,false).total,12420);
 for(const [iso,fee] of Object.entries({IT:400,FR:800,CH:1400})) assert.equal(pricing(1,true,'cod',iso).total,5520+fee);
 assert.throws(()=>pricing(1,true,'cod','US'));assert.throws(()=>pricing(7,true));
 assert.equal(activeAt(START-1),false);assert.equal(activeAt(START),true);assert.equal(activeAt(END),false);
 assert.deepEqual(priceLines([{id:'inter',qty:2}],true),[{id:'inter',qty:2,unit:5520}]);
});
test('server creates actual discounted Stripe line items and retries once',async()=>{
 rows.clear();const o={...order('1'),expectedTotal:5520};
 let r=await post(o);assert.equal(r.status,200);assert.equal((await r.json()).quote.total,5520);
 r=await post(o);assert.equal(r.status,200);assert.equal(stripeCalls,1);
 assert.equal((await post({...o,items:[{teamId:'inter',qty:1}]})).status,409);
});
test('COD stores unpaid order, correct fee, and idempotent receipt',async()=>{
 for(const [n,iso,total] of [['2','IT',5920],['3','FR',6320],['4','CH',6920]]){
  const o={...order(n,'cod',iso),expectedTotal:total};
  let r=await post(o);assert.equal(r.status,200);const result=await r.json();assert.equal(result.quote.total,total);assert.equal(result.status,'awaiting_collection');assert.equal(result.url,undefined);
  r=await post(o);assert.equal(r.status,200);
 }
 assert.equal(formCalls,3);assert.equal(stripeCalls,1);
 assert.equal((await post(order('5','cod','US'))).status,400);
});
test('quote does not register order; tampered totals require review',async()=>{
 const before=rows.size;
 let r=await post({...order('6'),quoteOnly:true});assert.equal(r.status,200);assert.equal(rows.size,before);
 r=await post({...order('6'),expectedTotal:1});assert.equal(r.status,409);assert.equal(rows.size,before);
});
test('atomic reservation cap and parallel retries',async()=>{
 rows.clear();
 const claims=await Promise.all(Array.from({length:105},(_,i)=>reserve('REF'+i,memory,START+1)));
 assert.equal(claims.filter(Boolean).length,100);assert.equal(rows.size,100);
 assert.equal(await reserve('REF0',memory,START+1),true);
 rows.clear();const repeats=await Promise.all(Array.from({length:10},()=>reserve('SAME',memory,START+1)));
 assert.equal(repeats.every(Boolean),true);assert.equal(rows.size,1);
});
