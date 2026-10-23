import { createHash } from 'node:crypto';
import teams from './teams.json' with { type: 'json' };
const SITE = 'https://vinilazo.eu';
const ALLOWED_ORIGINS = new Set([SITE, 'https://www.vinilazo.eu', 'https://vinilazo.netlify.app']);
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default async function handler(request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const ready = process.env.VINILAZO_CHECKOUT_ENABLED === 'true' && /^(sk|rk)_live_/.test(key || '');
  if (request.method === 'GET') return json({ready});
  if (request.method !== 'POST') return json({error:'method_not_allowed'},405);
  if (!ALLOWED_ORIGINS.has(request.headers.get('origin'))) return json({error:'origin_not_allowed'},403);
  if (!ready) return json({error:'checkout_not_configured'},503);
  let order;
  try { const raw = await request.text(); if (raw.length > 4096) return json({error:'invalid_order'},400); order=JSON.parse(raw); } catch { return json({error:'invalid_order'},400); }
  const {qty,teamId,reference,lang,gift}=order;
  const secondId = order.secondTeamId || teamId;
  if (![1,2].includes(qty) || !Object.hasOwn(teams,teamId) || !Object.hasOwn(teams,secondId) || !/^VZ-[A-F0-9]{16}$/.test(reference || '') || !['it','en','es','fr','de'].includes(lang) || typeof gift !== 'boolean') return json({error:'invalid_order'},400);
  // All amounts are computed here in cents; client-supplied totals are ignored.
  const unit = qty === 2 ? 6210 : 6900;
  const ids = qty === 2 ? [teamId,secondId] : [teamId];
  const params = new URLSearchParams({mode:'payment',locale:lang,client_reference_id:reference,
    success_url:`${SITE}/payment-return.html`,cancel_url:`${SITE}/${lang}/?team=${encodeURIComponent(teamId)}#ordina`,
    'automatic_tax[enabled]':'false','adaptive_pricing[enabled]':'false',
    'metadata[order_reference]':reference,'metadata[quantity]':String(qty),'metadata[first_team]':teamId,
    'metadata[second_team]':qty===2 ? secondId : '', 'metadata[gift]':gift?'yes':'no','metadata[discount_percent]':qty===2?'10':'0'});
  ids.forEach((id,i)=>{
    params.set(`line_items[${i}][quantity]`,'1');
    params.set(`line_items[${i}][price_data][currency]`,'eur');
    params.set(`line_items[${i}][price_data][unit_amount]`,String(unit));
    params.set(`line_items[${i}][price_data][tax_behavior]`,'inclusive');
    params.set(`line_items[${i}][price_data][product_data][name]`,`VINILAZO · ${teams[id]}`);
    params.set(`line_items[${i}][price_data][product_data][description]`,qty===2?'Pacchetto da 2: sconto 10% già incluso. Spedizione inclusa.':'Spedizione inclusa.');
  });
  params.set('payment_intent_data[metadata][order_reference]',reference);
  const idempotency = createHash('sha256').update(params.toString()).digest('hex');
  try {
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':idempotency},body:params,signal:AbortSignal.timeout(15000)});
    const session=await response.json();
    if (!response.ok || session.livemode !== true || session.amount_total !== unit*qty || !/^https:\/\/checkout\.stripe\.com\//.test(session.url || '')) return json({error:'checkout_unavailable'},502);
    return json({url:session.url});
  } catch { return json({error:'checkout_unavailable'},502); }
}
