import { campaign, salesToday, COD } from './lib/commerce.mjs';
export default async function handler(request) {
  if (request.method !== 'GET') return new Response(null, { status:405 });
  const [promo, sales] = await Promise.allSettled([campaign(), salesToday()]);
  return Response.json({ campaign: promo.status === 'fulfilled' ? promo.value : null, sales: sales.status === 'fulfilled' ? sales.value : null, cod: COD }, { headers:{ 'Cache-Control':'no-store' } });
}
