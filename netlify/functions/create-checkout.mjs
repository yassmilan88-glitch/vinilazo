import { createHash } from 'node:crypto';
import teams from './teams.json' with { type: 'json' };
const SITE = 'https://vinilazo.eu';
const ALLOWED_ORIGINS = new Set([SITE, 'https://www.vinilazo.eu', 'https://vinilazo.netlify.app']);
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
// Carrello: fino a 6 pezzi, anche squadre diverse. Ogni coppia ha il 10% di sconto (2 × 62,10 €); un pezzo dispari resta a 69 €.
export const MAX_ITEMS = 6, UNIT = 6900, PAIR_UNIT = 6210;
export const totalFor = (n) => Math.floor(n / 2) * PAIR_UNIT * 2 + (n % 2) * UNIT;
// Accetta il nuovo formato {items:[{teamId,qty}]} e quello vecchio {qty,teamId,secondTeamId}.
export function normalizeItems(order) {
  if (Array.isArray(order.items)) {
    if (order.items.length < 1 || order.items.length > MAX_ITEMS) return null;
    const out = [], seen = new Set();
    for (const it of order.items) {
      if (!it || typeof it !== 'object') return null;
      const id = it.teamId, q = it.qty;
      if (typeof id !== 'string' || !Object.hasOwn(teams, id) || !Number.isInteger(q) || q < 1 || q > MAX_ITEMS || seen.has(id)) return null;
      seen.add(id); out.push({ id, qty: q });
    }
    const n = out.reduce((a, i) => a + i.qty, 0);
    return n >= 1 && n <= MAX_ITEMS ? out : null;
  }
  const { qty, teamId } = order, secondId = order.secondTeamId || teamId;
  if (![1, 2].includes(qty) || typeof teamId !== 'string' || typeof secondId !== 'string' || !Object.hasOwn(teams, teamId) || !Object.hasOwn(teams, secondId)) return null;
  if (qty === 1) return [{ id: teamId, qty: 1 }];
  return secondId === teamId ? [{ id: teamId, qty: 2 }] : [{ id: teamId, qty: 1 }, { id: secondId, qty: 1 }];
}
// Righe Stripe: prezzo di coppia per tutti i pezzi tranne l'ultimo se il totale è dispari.
export function priceLines(items) {
  const units = items.flatMap((i) => Array(i.qty).fill(i.id)), n = units.length, lines = [];
  units.forEach((id, idx) => {
    const unit = n === 1 || (n % 2 === 1 && idx === n - 1) ? UNIT : PAIR_UNIT;
    const last = lines[lines.length - 1];
    if (last && last.id === id && last.unit === unit) last.qty++; else lines.push({ id, qty: 1, unit });
  });
  return lines;
}
export default async function handler(request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const ready = process.env.VINILAZO_CHECKOUT_ENABLED === 'true' && /^(sk|rk)_live_/.test(key || '');
  if (request.method === 'GET') return json({ready});
  if (request.method !== 'POST') return json({error:'method_not_allowed'},405);
  if (!ALLOWED_ORIGINS.has(request.headers.get('origin'))) return json({error:'origin_not_allowed'},403);
  if (!ready) return json({error:'checkout_not_configured'},503);
  let order;
  try { const raw = await request.text(); if (raw.length > 4096) return json({error:'invalid_order'},400); order=JSON.parse(raw); } catch { return json({error:'invalid_order'},400); }
  if (!order || typeof order !== 'object') return json({error:'invalid_order'},400);
  const {reference,lang,gift}=order;
  const items = normalizeItems(order);
  if (!items || !/^VZ-[A-F0-9]{16}$/.test(reference || '') || !['it','en','es','fr','de'].includes(lang) || typeof gift !== 'boolean') return json({error:'invalid_order'},400);
  // All amounts are computed here in cents; client-supplied totals are ignored.
  const qty = items.reduce((a, i) => a + i.qty, 0), expected = totalFor(qty), teamId = items[0].id;
  const params = new URLSearchParams({mode:'payment',locale:lang,client_reference_id:reference,
    success_url:`${SITE}/payment-return.html?lang=${lang}&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${SITE}/${lang}/?team=${encodeURIComponent(teamId)}#ordina`,
    'automatic_tax[enabled]':'false','adaptive_pricing[enabled]':'false',
    'metadata[order_reference]':reference,'metadata[quantity]':String(qty),'metadata[first_team]':teamId,
    'metadata[second_team]':items[1] ? items[1].id : (qty>=2 ? teamId : ''), 'metadata[items]':items.map((i)=>`${i.id}:${i.qty}`).join(','),
    'metadata[gift]':gift?'yes':'no','metadata[discount_percent]':qty>=2?'10':'0'});
  priceLines(items).forEach((line,i)=>{
    params.set(`line_items[${i}][quantity]`,String(line.qty));
    params.set(`line_items[${i}][price_data][currency]`,'eur');
    params.set(`line_items[${i}][price_data][unit_amount]`,String(line.unit));
    params.set(`line_items[${i}][price_data][tax_behavior]`,'inclusive');
    params.set(`line_items[${i}][price_data][product_data][name]`,`VINILAZO · ${teams[line.id]}`);
    params.set(`line_items[${i}][price_data][product_data][description]`,line.unit===PAIR_UNIT?'Sconto coppia 10% già incluso. Spedizione inclusa.':'Spedizione inclusa.');
  });
  params.set('payment_intent_data[metadata][order_reference]',reference);
  // Shipping details typed on the site, kept with the payment for the confirmation messages (optional, never blocks the payment).
  const c = order.customer && typeof order.customer === 'object' ? order.customer : {};
  const clean = (v, max) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '';
  const customer = { c_name: clean(c.name, 120), c_phone: clean(c.phone, 30), c_address: clean(c.address, 200), c_cap: clean(c.cap, 20), c_city: clean(c.city, 100), c_country: clean(c.country, 60), c_iso: /^[A-Z]{2}$/.test(c.iso || '') ? c.iso : '' };
  Object.entries(customer).forEach(([k, v]) => { if (v) params.set(`metadata[${k}]`, v); });
  params.set('metadata[lang]', lang);
  // Email already typed on the site: prefill it in Stripe (optional, never blocks the payment).
  const email = typeof order.email === 'string' ? order.email.trim() : '';
  if (email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) params.set('customer_email', email);
  const createSession = (body) => fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':createHash('sha256').update(body.toString()).digest('hex')},body,signal:AbortSignal.timeout(15000)});
  try {
    let response=await createSession(params);
    if (!response.ok && params.has('customer_email')) { params.delete('customer_email'); response=await createSession(params); }
    const session=await response.json();
    if (!response.ok || session.livemode !== true || session.amount_total !== expected || !/^https:\/\/checkout\.stripe\.com\//.test(session.url || '')) return json({error:'checkout_unavailable'},502);
    return json({url:session.url});
  } catch { return json({error:'checkout_unavailable'},502); }
}
