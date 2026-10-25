import { createHash } from 'node:crypto';
import teams from './teams.json' with { type: 'json' };
import { campaign, reserve, pricing, store, digest } from './lib/commerce.mjs';
const SITE = 'https://vinilazo.eu';
const ALLOWED_ORIGINS = new Set([SITE, 'https://www.vinilazo.eu', 'https://vinilazo.netlify.app']);
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
// Carrello: fino a 6 pezzi, anche squadre diverse. Ogni coppia ha il 10% di sconto (2 × 62,10 €); un pezzo dispari resta a 69 €.
export const MAX_ITEMS = 6, UNIT = 4900, PAIR_UNIT = 3900;
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
export function priceLines(items, launch = false) {
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
  if (request.method === 'GET') return json({ready, version:'launch-v2'});
  if (request.method !== 'POST') return json({error:'method_not_allowed'},405);
  if (!ALLOWED_ORIGINS.has(request.headers.get('origin'))) return json({error:'origin_not_allowed'},403);
  if (!ready) return json({error:'checkout_not_configured'},503);
  let order;
  try { const raw = await request.text(); if (raw.length > 4096) return json({error:'invalid_order'},400); order=JSON.parse(raw); } catch { return json({error:'invalid_order'},400); }
  if (!order || typeof order !== 'object') return json({error:'invalid_order'},400);
  const {reference,lang,gift}=order;
  const method = order.method || 'online';
  if (!['online','cod'].includes(method)) return json({error:'invalid_payment_method'},400);
  const items = normalizeItems(order);
  if (!items || !/^VZ-[A-F0-9]{16}$/.test(reference || '') || !['it','en','es','fr','de'].includes(lang) || typeof gift !== 'boolean') return json({error:'invalid_order'},400);
  // All amounts are computed here in cents; client-supplied totals are ignored.
  const qty = items.reduce((a, i) => a + i.qty, 0), teamId = items[0].id;
  const customerInput = order.customer || {};
  if (method === 'cod' && (!['IT','FR','CH'].includes(customerInput.iso) || !['name','phone','address','cap','city'].every(k => typeof customerInput[k] === 'string' && customerInput[k].trim().length > 0) || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(order.email || ''))) return json({error:'invalid_customer'},400);
  let quote, launch, db, record, fingerprint;
  try {
    db = store();
    fingerprint = digest({items, method, customer:customerInput, email:order.email, gift, lang});
    const entry = await db.getWithMetadata('orders/' + reference, {type:'json'});
    const existing = entry?.data;
    if (existing) {
      if (existing.fingerprint !== fingerprint) return json({error:'reference_conflict'},409);
      if (existing.result) return json(existing.result);
      if (existing.processingUntil > Date.now()) return json({error:'order_in_progress'},409);
      record = {...existing, processingUntil:Date.now()+60000};
      if (order.quoteOnly !== true) {
        const lease = await db.setJSON('orders/' + reference, record, {onlyIfMatch:entry.etag});
        if (!lease.modified) return json({error:'order_in_progress'},409);
      }
    }
    const available = await campaign(db);
    launch = record ? record.quote.launch : available.active;
    quote = record ? record.quote : pricing(qty, launch, method, customerInput.iso);
    if (order.quoteOnly === true) return json({quote});
    if (order.expectedTotal !== undefined && order.expectedTotal !== quote.total) return json({error:'price_changed',quote},409);
    if (!record) {
      launch = launch && await reserve(reference, db);
      quote = pricing(qty, launch, method, customerInput.iso);
      if (order.expectedTotal !== undefined && order.expectedTotal !== quote.total) return json({error:'price_changed',quote},409);
      record = {processingUntil:Date.now()+60000, reference, fingerprint, items, method, customer:customerInput, email:order.email, gift, lang, quote, createdAt:new Date().toISOString(), status:method === 'cod' ? 'awaiting_collection' : 'awaiting_payment'};
      const saved = await db.setJSON('orders/' + reference, record, {onlyIfNew:true});
      if (!saved.modified) {
        record = await db.get('orders/' + reference, {type:'json'});
        if (record.fingerprint !== fingerprint) return json({error:'reference_conflict'},409);
        if (record.result) return json(record.result);
        return json({error:'order_in_progress'},409);
      }
    }
    if (method === 'cod') {
      // Persist the authoritative order before acknowledging it. Mirror it into
      // Netlify Forms for fulfilment using a dedicated server-calculated form.
      const fields = new URLSearchParams({'form-name':'ordine-contrassegno', riferimento_ordine:reference, stato:'DA INCASSARE - NON PAGATO', nome:customerInput.name, email:order.email, telefono:customerInput.phone, indirizzo:customerInput.address, cap:customerInput.cap, citta:customerInput.city, paese:customerInput.iso, articoli:items.map(i => teams[i.id]+' x'+i.qty).join(', '), totale_eur:(quote.total/100).toFixed(2), supplemento_eur:(quote.fee/100).toFixed(2), sconto_eur:(quote.discount/100).toFixed(2), lingua:lang});
      if (!record.formSaved) {
        const submitted = await fetch(SITE + '/cod-form.html', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:fields, signal:AbortSignal.timeout(15000)});
        if (!submitted.ok) return json({error:'order_registration_pending'},503);
        record.formSaved = true;
      }
      const result = {cod:true, reference, quote, status:'awaiting_collection'};
      await db.setJSON('orders/' + reference, {...record, result});
      return json(result);
    }
  } catch { return json({error:'order_storage_unavailable'},503); }
  const expected = quote.total;
  const params = new URLSearchParams({mode:'payment',locale:lang,client_reference_id:reference,
    success_url:`${SITE}/payment-return.html?lang=${lang}&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${SITE}/${lang}/?team=${encodeURIComponent(teamId)}#ordina`,
    'automatic_tax[enabled]':'false','adaptive_pricing[enabled]':'false',
    'metadata[order_reference]':reference,'metadata[quantity]':String(qty),'metadata[first_team]':teamId,
    'metadata[second_team]':items[1] ? items[1].id : (qty>=2 ? teamId : ''), 'metadata[items]':items.map((i)=>`${i.id}:${i.qty}`).join(','),
    'metadata[gift]':gift?'yes':'no','metadata[discount_percent]':qty>=2?'bundle':'0', 'metadata[launch]':launch?'yes':'no'});
  priceLines(items, launch).forEach((line,i)=>{
    params.set(`line_items[${i}][quantity]`,String(line.qty));
    params.set(`line_items[${i}][price_data][currency]`,'eur');
    params.set(`line_items[${i}][price_data][unit_amount]`,String(line.unit));
    params.set(`line_items[${i}][price_data][tax_behavior]`,'inclusive');
    params.set(`line_items[${i}][price_data][product_data][name]`,`VINILAZO · ${teams[line.id]}`);
    params.set(`line_items[${i}][price_data][product_data][description]`,line.unit===PAIR_UNIT?'Offerta 2 pezzi: 39 euro ciascuno. Spedizione inclusa.':'Spedizione inclusa.');
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
    const result = {url:session.url, quote};
    await db.setJSON('orders/' + reference, {...record, sessionId:session.id, result});
    return json(result);
  } catch { return json({error:'checkout_unavailable'},502); }
}
