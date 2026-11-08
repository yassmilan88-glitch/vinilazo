import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';
import marketplace from './marketplace-sales.json' with { type: 'json' };
export const START = Date.parse('2026-10-25T12:00:00Z');
export const END = START + 7 * 86400000;
export const LIMIT = 100;
export const COD = { IT: 400, FR: 800, CH: 1400 };
export const store = () => getStore({ name: 'vinilazo-orders-v1', consistency: 'strong' });
export const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const activeAt = (now = Date.now()) => false;
export function pricing(qty, launch, method = 'online', iso = '') {
  if (!Number.isInteger(qty) || qty < 1 || qty > 6) throw new Error('invalid_quantity');
  if (!['online','cod'].includes(method) || (method === 'cod' && !COD[iso])) throw new Error('invalid_payment_method');
  const subtotal = qty * 4900;
  const goods = Math.floor(qty / 2) * 7800 + (qty % 2) * 4900;
  const fee = method === 'cod' ? COD[iso] : 0;
  return { subtotal, discount: subtotal - goods, goods, fee, total: goods + fee, launch: false, currency: 'EUR' };
}
export async function campaign(s = store(), now = Date.now()) {
  if (!activeAt(now)) return { active: false, endsAt: END, limit: LIMIT };
  const { blobs } = await s.list({ prefix: 'launch-20261025/' });
  return { active: blobs.length < LIMIT, endsAt: END, limit: LIMIT };
}
// Immutable claim keys enforce the cap across concurrent requests. Each submitted
// order reserves one place, including orders still awaiting payment; retries reuse it.
export async function reserve(reference, s = store(), now = Date.now()) {
  if (!activeAt(now)) return false;
  const owner = digest(reference);
  for (let i = 0; i < LIMIT; i++) {
    const key = `launch-20261025/${String(i).padStart(3, '0')}`;
    const old = await s.get(key, { type: 'json' });
    if (old) { if (old.owner === owner) return true; continue; }
    const result = await s.setJSON(key, { owner }, { onlyIfNew: true });
    if (result.modified) return true;
    if ((await s.get(key, { type: 'json' }))?.owner === owner) return true;
  }
  return false;
}
export async function stripe(path, options = {}) {
  const r = await fetch('https://api.stripe.com/v1/' + path, { ...options, headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...options.headers }, signal: AbortSignal.timeout(15000) });
  const body = await r.json();
  if (!r.ok) throw new Error('stripe_unavailable');
  return body;
}
export async function salesToday() {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
  const since = Math.floor((Date.now() - 26 * 3600000) / 1000);
  let after = '', quantity = 0;
  const seen = new Set();
  const teams = {};
  // Stripe records are authoritative. Never count checkout starts or unpaid COD.
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ limit:'100', 'created[gte]':String(since) });
    if (after) params.set('starting_after', after);
    const result = await stripe('events?' + params);
    for (const e of result.data) {
      if (!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(e.type)) continue;
      const o = e.data.object;
      if (o.payment_status !== 'paid' || !o.metadata?.order_reference || !o.livemode) continue;
      const paidDay = new Intl.DateTimeFormat('en-CA', { timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date(e.created * 1000));
      if (paidDay !== day) continue;
      // A session can have both completion and async events: deduplicate below.
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      for (const entry of (o.metadata.items || `${o.metadata.first_team}:${o.metadata.quantity || 1}`).split(',')) {
        const [id, q] = entry.split(':');
        if (!/^[a-z-]+$/.test(id) || !(Number(q) > 0)) continue;
        teams[id] = (teams[id] || 0) + Number(q); quantity += Number(q);
      }
    }
    if (!result.has_more) {
      // Real off-site sales (marketplace) entered by the owner for this day only.
      const extra = Number(marketplace[day]?.quantity) || 0;
      return { day, quantity: quantity + extra, teams };
    }
    after = result.data.at(-1).id;
  }
  throw new Error('stats_incomplete');
}
