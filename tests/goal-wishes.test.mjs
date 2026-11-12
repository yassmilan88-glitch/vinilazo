import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWishes,wishesText} from '../netlify/functions/lib/goal-wishes.mjs';
const wish={teamId:'argentina',suggestions:['maxi-mexico-2006'],note:'Il gol visto con mio padre'};
test('only requested teams and verified suggestions, bounded text',()=>{
 assert.deepEqual(normalizeWishes(undefined,[{id:'argentina'}]),[]);
 assert.deepEqual(normalizeWishes([wish],[{id:'argentina'}]),[wish]);
 for(const w of [[wish,wish],[{...wish,teamId:'milan'}],[{...wish,suggestions:['invented']}],[{...wish,note:'x'.repeat(181)}]])assert.equal(normalizeWishes(w,[{id:'argentina'}]),null);
 assert.match(wishesText(wish),/Maxi Rodríguez/);
});
const rows=new Map();
mock.module('@netlify/blobs',{namedExports:{getStore:()=>({getWithMetadata:async k=>rows.has(k)?{data:rows.get(k),etag:'1'}:null,get:async k=>rows.get(k)||null,list:async()=>({blobs:[]}),setJSON:async(k,v)=>{rows.set(k,v);return {modified:true};}})}});
const {default:handler}=await import('../netlify/functions/create-checkout.mjs');
const {buildOrder,customerEmail}=await import('../netlify/functions/stripe-webhook.mjs');
process.env.STRIPE_SECRET_KEY='sk_live_fixture';process.env.VINILAZO_CHECKOUT_ENABLED='true';
let stripe,form;
global.fetch=async(url,opts)=>{if(url.startsWith('https://api.stripe.com/')){stripe=opts.body;return Response.json({id:'cs_fixture',livemode:true,amount_total:3900,url:'https://checkout.stripe.com/fixture'});}form=opts.body;return new Response('OK');};
const order={reference:'VZ-00000000000000A1',lang:'it',gift:false,items:[{teamId:'argentina',qty:1}],email:'test@example.com',customer:{name:'Fixture',phone:'123',address:'Test',cap:'10000',city:'Test',iso:'IT'},goalWishes:[wish]};
const post=o=>handler(new Request('https://vinilazo.eu/.netlify/functions/create-checkout',{method:'POST',headers:{origin:'https://vinilazo.eu'},body:JSON.stringify(o)}));
test('preferences reach storage, Stripe and emails; changing them invalidates reuse',async()=>{
 const r=await post(order);assert.equal(r.status,200,await r.clone().text());
 assert.deepEqual(rows.get('orders/'+order.reference).goalWishes,[wish]);assert.match(stripe.get('metadata[goal_wish_0]'),/mio padre/);
 assert.equal((await post({...order,goalWishes:[{...wish,note:'different'}]})).status,409);
 const o=buildOrder({metadata:{lang:'it',goal_wish_0:'Argentina: <script>alert(1)</script>',first_team:'argentina'},amount_total:4900});
 const mail=customerEmail(o);assert.match(mail.text,/Personalizzazione|personalizzazione/);assert(!mail.html.includes('<script>'));assert(mail.html.includes('&lt;script&gt;'));
});
test('COD preferences reach fulfilment form without Stripe',async()=>{
 const r=await post({...order,reference:'VZ-00000000000000A2',method:'cod'});assert.equal(r.status,200,await r.clone().text());assert.match(form.get('gol_personalizzati'),/Maxi Rodríguez/);
});
