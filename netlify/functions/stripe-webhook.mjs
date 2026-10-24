// VINILAZO — dopo un pagamento confermato da Stripe invia:
//   1. email di conferma al cliente (5 lingue)
//   2. WhatsApp di conferma al cliente (se ha lasciato un numero valido)
//   3. WhatsApp al titolare con i dati essenziali dell'ordine
//   4. email al titolare, solo se è impostata ORDER_NOTIFY_EMAIL
// Variabili da impostare su Netlify (mai nel codice): STRIPE_WEBHOOK_SECRET, BIRD_API_KEY. Facoltativa: ORDER_NOTIFY_EMAIL.
import { createHmac, timingSafeEqual } from 'node:crypto';
import teams from './teams.json' with { type: 'json' };

const SITE = 'https://vinilazo.eu';
const OWNER_WHATSAPP = '+393295865883';
const FROM = { email: 'ordini@vinilazo.eu', name: 'VINILAZO' };
const READY = new Set(['argentina']);
const SELLER = 'AC Distribuzione S.r.l. · Via Pascal 7, 12100 Cuneo (CN), Italia · P.IVA 03660590047';
const LOCALES = { it: 'it-IT', es: 'es-ES', fr: 'fr-FR', en: 'en-GB', de: 'de-DE' };

const TX = {
  it: { subject: 'Ordine confermato', hi: 'Ciao', thanks: 'grazie! Il pagamento è confermato e il tuo ordine è in preparazione.', ref: 'Riferimento ordine', product: 'Prodotto', qty: 'Quantità', total: 'Totale pagato', ship: 'Spedizione', shipIncl: 'inclusa', address: 'Indirizzo di consegna', ready: 'Pronta consegna: lo spediamo subito.', made: 'Stampato apposta per te: arriva in circa 15 giorni lavorativi.', gift: 'Confezione regalo', help: 'Per qualsiasi domanda scrivici su WhatsApp indicando il riferimento ordine.', wa: 'Scrivici su WhatsApp', receipt: 'La ricevuta del pagamento ti arriva separatamente da Stripe.', pair: 'sconto 10% su ogni coppia incluso' },
  es: { subject: 'Pedido confirmado', hi: 'Hola', thanks: '¡gracias! El pago está confirmado y tu pedido está en preparación.', ref: 'Referencia del pedido', product: 'Producto', qty: 'Cantidad', total: 'Total pagado', ship: 'Envío', shipIncl: 'incluido', address: 'Dirección de entrega', ready: 'Entrega inmediata: lo enviamos enseguida.', made: 'Impreso especialmente para vos: llega en unos 15 días hábiles.', gift: 'Envoltorio de regalo', help: 'Para cualquier consulta escribinos por WhatsApp indicando la referencia del pedido.', wa: 'Escribinos por WhatsApp', receipt: 'El recibo del pago te llega por separado de Stripe.', pair: '10% de descuento en cada par incluido' },
  fr: { subject: 'Commande confirmée', hi: 'Bonjour', thanks: 'merci ! Le paiement est confirmé et votre commande est en préparation.', ref: 'Référence de commande', product: 'Produit', qty: 'Quantité', total: 'Total payé', ship: 'Livraison', shipIncl: 'incluse', address: 'Adresse de livraison', ready: 'Expédition immédiate : nous l’envoyons tout de suite.', made: 'Imprimé spécialement pour vous : livraison en 15 jours ouvrés environ.', gift: 'Emballage cadeau', help: 'Pour toute question, écrivez-nous sur WhatsApp en indiquant la référence de commande.', wa: 'Nous écrire sur WhatsApp', receipt: 'Le reçu du paiement vous est envoyé séparément par Stripe.', pair: 'remise de 10 % sur chaque paire incluse' },
  en: { subject: 'Order confirmed', hi: 'Hi', thanks: 'thank you! Your payment is confirmed and your order is being prepared.', ref: 'Order reference', product: 'Product', qty: 'Quantity', total: 'Total paid', ship: 'Shipping', shipIncl: 'included', address: 'Delivery address', ready: 'Ready to ship: we send it right away.', made: 'Printed just for you: arrives in about 15 working days.', gift: 'Gift wrapping', help: 'For any question, message us on WhatsApp with your order reference.', wa: 'Message us on WhatsApp', receipt: 'Stripe sends the payment receipt separately.', pair: '10% off every pair included' },
  de: { subject: 'Bestellung bestätigt', hi: 'Hallo', thanks: 'danke! Die Zahlung ist bestätigt und deine Bestellung wird vorbereitet.', ref: 'Bestellnummer', product: 'Produkt', qty: 'Menge', total: 'Bezahlt', ship: 'Versand', shipIncl: 'inklusive', address: 'Lieferadresse', ready: 'Sofort lieferbar: wir verschicken es sofort.', made: 'Extra für dich gedruckt: Lieferung in etwa 15 Werktagen.', gift: 'Geschenkverpackung', help: 'Bei Fragen schreib uns auf WhatsApp mit deiner Bestellnummer.', wa: 'Schreib uns auf WhatsApp', receipt: 'Die Zahlungsquittung schickt dir Stripe separat.', pair: '10 % Rabatt pro Paar inklusive' }
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function verifyStripeSignature(raw, header, secret, now = Math.floor(Date.now() / 1000), tolerance = 300) {
  if (!header || !secret) return false;
  const parts = header.split(',').map((p) => p.split('='));
  const t = Number((parts.find(([k]) => k === 't') || [])[1]);
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!Number.isFinite(t) || !sigs.length || Math.abs(now - t) > tolerance) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex'), 'utf8');
  return sigs.some((v) => { const b = Buffer.from(v, 'utf8'); return b.length === expected.length && timingSafeEqual(b, expected); });
}

// Numero in formato internazionale; senza prefisso si usa quello del paese di consegna (solo i più comuni).
const PREFIX = { IT: '39', SM: '378', VA: '39', CH: '41', FR: '33', DE: '49', AT: '43', ES: '34', BE: '32', NL: '31', PT: '351', GB: '44', IE: '353', AR: '54', US: '1', MX: '52', BR: '55' };
export function normalizePhone(raw, iso) {
  let p = String(raw || '').replace(/[\s().\-\/]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (!p.startsWith('+')) { const cc = PREFIX[iso]; if (!cc) return ''; p = '+' + cc + p.replace(/^0(?=\d)/, iso === 'IT' || iso === 'SM' || iso === 'VA' ? '0' : ''); }
  return /^\+[1-9]\d{6,14}$/.test(p) ? p : '';
}

export function buildOrder(s) {
  const m = s.metadata || {};
  const lang = TX[m.lang] ? m.lang : (TX[(s.locale || '').slice(0, 2)] ? s.locale.slice(0, 2) : 'it');
  const qty = Number(m.quantity) || 1;
  // Ordini dal carrello: metadata.items = "milan:2,inter:1"
  const items = String(m.items || '').split(',').map((x) => x.split(':')).filter(([id, q]) => teams[id] && Number(q) > 0).map(([id, q]) => ({ id, qty: Number(q) }));
  const first = teams[m.first_team] || '';
  const second = m.second_team && m.second_team !== m.first_team ? teams[m.second_team] || '' : '';
  const product = items.length
    ? 'VINILAZO · ' + items.map((i) => teams[i.id] + (i.qty > 1 ? ' ×' + i.qty : '')).join(' + ')
    : (first ? 'VINILAZO · ' + first + (second ? ' + ' + second : '') : 'VINILAZO');
  const ids = items.length ? items.map((i) => i.id) : [m.first_team, m.second_team || m.first_team].filter(Boolean);
  const cd = s.customer_details || {};
  const addr = cd.address || {};
  return {
    lang, qty, product, gift: m.gift === 'yes', pair: qty >= 2, cart: items.length > 0,
    ready: ids.length > 0 && ids.every((id) => READY.has(id)),
    reference: m.order_reference || s.client_reference_id || s.id,
    amount: (s.amount_total || 0) / 100,
    currency: (s.currency || 'eur').toUpperCase(),
    email: cd.email || s.customer_email || '',
    name: m.c_name || cd.name || '',
    phone: normalizePhone(m.c_phone || cd.phone, m.c_iso || addr.country),
    address: [m.c_address || addr.line1, [m.c_cap || addr.postal_code, m.c_city || addr.city].filter(Boolean).join(' '), m.c_country || addr.country].filter(Boolean).join(', '),
    city: m.c_city || addr.city || '',
    paymentIntent: typeof s.payment_intent === 'string' ? s.payment_intent : '',
    sessionId: s.id
  };
}

const money = (o) => new Intl.NumberFormat(LOCALES[o.lang] || 'it-IT', { style: 'currency', currency: o.currency }).format(o.amount);

export function customerEmail(o) {
  const t = TX[o.lang];
  const firstName = (o.name || '').split(/\s+/)[0];
  const waText = encodeURIComponent(`${t.ref}: ${o.reference}`);
  const row = (k, v) => `<tr><td style="padding:8px 0;color:#5b6b82;font-size:14px">${esc(k)}</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:14px">${esc(v)}</td></tr>`;
  const html = `<!doctype html><html lang="${o.lang}"><body style="margin:0;background:#eef2f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0c1a33">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#08142a;padding:22px 26px;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:.03em">VINILAZO</td></tr>
<tr><td style="padding:26px">
<p style="margin:0 0 14px;font-size:18px;font-weight:700">${esc(t.hi)}${firstName ? ' ' + esc(firstName) : ''}, ${esc(t.thanks)}</p>
<p style="margin:0 0 18px;padding:12px 14px;background:#eef5fc;border-radius:10px;font-size:14px">${esc(t.ref)}: <b style="font-size:16px;letter-spacing:.03em;white-space:nowrap">${esc(o.reference)}</b></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e8ef;border-bottom:1px solid #e3e8ef">
${row(t.product, o.product)}${row(t.qty, String(o.qty) + (o.pair ? ' · ' + t.pair : ''))}${o.gift ? row(t.gift, '✓') : ''}${row(t.ship, t.shipIncl)}${row(t.total, money(o))}
</table>
${o.address ? `<p style="margin:18px 0 4px;color:#5b6b82;font-size:14px">${esc(t.address)}</p><p style="margin:0;font-size:15px">${esc(o.name)}<br>${esc(o.address)}</p>` : ''}
<p style="margin:18px 0 0;font-size:15px">${esc(o.ready ? t.ready : t.made)}</p>
<p style="margin:14px 0 20px;font-size:14px;color:#5b6b82">${esc(t.help)}</p>
<a href="https://wa.me/${OWNER_WHATSAPP.slice(1)}?text=${waText}" style="display:inline-block;background:#25D366;color:#06210f;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:999px">${esc(t.wa)}</a>
<p style="margin:22px 0 0;font-size:12px;color:#7a889c">${esc(t.receipt)}</p>
</td></tr>
<tr><td style="padding:16px 26px;background:#f6f8fb;font-size:11px;color:#7a889c">${esc(SELLER)} · <a href="${SITE}/${o.lang}/" style="color:#7a889c">vinilazo.eu</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [`${t.hi}${firstName ? ' ' + firstName : ''}, ${t.thanks}`, '', `${t.ref}: ${o.reference}`, `${t.product}: ${o.product}`, `${t.qty}: ${o.qty}${o.pair ? ' (' + t.pair + ')' : ''}`, o.gift ? `${t.gift}: ✓` : '', `${t.ship}: ${t.shipIncl}`, `${t.total}: ${money(o)}`, o.address ? `\n${t.address}: ${o.name}, ${o.address}` : '', '', o.ready ? t.ready : t.made, '', `${t.help} https://wa.me/${OWNER_WHATSAPP.slice(1)}`, '', t.receipt, '', SELLER].filter((l) => l !== '').join('\n');
  return { subject: `${t.subject} · VINILAZO ${o.reference}`, html, text };
}

function birdHost(key) {
  if (key.startsWith('bk_us1_')) return 'https://us1.platform.bird.com';
  if (key.startsWith('bk_eu1_')) return 'https://eu1.platform.bird.com';
  return process.env.BIRD_API_HOST || 'https://eu1.platform.bird.com';
}
async function bird(key, path, body, idem) {
  let r;
  try { r = await fetch(birdHost(key) + path, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idem }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) }); }
  catch (e) { const err = new Error(`${path} network ${e && e.message}`); err.transient = true; throw err; }
  if (!r.ok) { const err = new Error(`${path} ${r.status} ${(await r.text()).slice(0, 300)}`); err.transient = r.status >= 500 || r.status === 429 || r.status === 408; throw err; }
  return r.json().catch(() => ({}));
}
const waTemplate = (to, ref, amount) => ({ to, template: { slug: 'bird_order_confirmation', language: 'en', components: [{ type: 'body', parameters: [{ type: 'text', name: 'ref', text: ref }, { type: 'text', name: 'amount', text: amount }] }] } });

export async function notify(o, key, ownerEmail) {
  const amount = `${o.currency} ${o.amount.toFixed(2)}`;
  const jobs = [];
  if (o.email) {
    const m = customerEmail(o);
    jobs.push(bird(key, '/v1/email/messages', { from: FROM, to: [{ email: o.email, ...(o.name ? { name: o.name } : {}) }], subject: m.subject, html: m.html, text: m.text, category: 'transactional', track_opens: false, track_clicks: false, metadata: { order_reference: o.reference } }, `vz-${o.sessionId}-mail`));
  }
  if (o.phone) jobs.push(bird(key, '/v1/whatsapp/messages', waTemplate(o.phone, o.reference, amount), `vz-${o.sessionId}-wa`));
  const ownerRef = [o.reference, o.cart ? `${o.product} (${o.qty} pz)` : `${o.product} x${o.qty}`, o.name, o.city].filter(Boolean).join(' · ').slice(0, 300);
  jobs.push(bird(key, '/v1/whatsapp/messages', waTemplate(OWNER_WHATSAPP, ownerRef, amount), `vz-${o.sessionId}-owner-wa`));
  if (ownerEmail) {
    const lines = [`Nuovo ordine pagato: ${o.reference}`, `Prodotto: ${o.product} · quantità ${o.qty}${o.gift ? ' · regalo' : ''}`, `Totale: ${money({ ...o, lang: 'it' })}`, `Cliente: ${o.name || '—'} · ${o.email || '—'} · ${o.phone || '—'}`, `Spedire a: ${o.address || 'vedi modulo Netlify'}`, `Lingua: ${o.lang}`, o.paymentIntent ? `Stripe: https://dashboard.stripe.com/payments/${o.paymentIntent}` : ''].filter(Boolean);
    jobs.push(bird(key, '/v1/email/messages', { from: FROM, to: [ownerEmail], subject: `Nuovo ordine ${o.reference} · ${money({ ...o, lang: 'it' })}`, text: lines.join('\n'), category: 'transactional', track_opens: false, track_clicks: false }, `vz-${o.sessionId}-owner-mail`));
  }
  const failed = (await Promise.allSettled(jobs)).filter((r) => r.status === 'rejected').map((r) => r.reason || {});
  // Errori temporanei (rete, 5xx, 429): Stripe riprova. Errori definitivi (es. numero o email non validi): si registrano e basta, così non partono doppioni.
  return { transient: failed.filter((e) => e.transient).map((e) => e.message), permanent: failed.filter((e) => !e.transient).map((e) => e.message) };
}

export default async function handler(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET, key = process.env.BIRD_API_KEY;
  if (request.method === 'GET') return json({ webhook: !!secret, messages: !!key, ownerEmail: !!process.env.ORDER_NOTIFY_EMAIL });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!secret) return json({ error: 'not_configured' }, 503);
  const raw = await request.text();
  if (!verifyStripeSignature(raw, request.headers.get('stripe-signature'), secret)) return json({ error: 'bad_signature' }, 400);
  let event; try { event = JSON.parse(raw); } catch { return json({ error: 'bad_payload' }, 400); }
  const s = event && event.data && event.data.object;
  const paid = s && ((event.type === 'checkout.session.completed' && s.payment_status === 'paid') || event.type === 'checkout.session.async_payment_succeeded');
  if (!paid) return json({ ignored: event && event.type });
  if (s.livemode !== true && process.env.VINILAZO_ALLOW_TEST !== 'true') return json({ ignored: 'test_mode' });
  if (!key) return json({ error: 'messages_not_configured' }, 503); // Stripe riprova: i messaggi partono appena la chiave è impostata
  const res = await notify(buildOrder(s), key, process.env.ORDER_NOTIFY_EMAIL || '');
  if (res.permanent.length) console.error('vinilazo notify permanent errors', s.id, res.permanent);
  if (res.transient.length) { console.error('vinilazo notify transient errors', s.id, res.transient); return json({ error: 'retry', failed: res.transient.length }, 500); }
  return json({ ok: true, skipped: res.permanent.length });
}
