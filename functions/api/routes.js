// /api/routes — hub route list via Cloudflare KV (binding: BACKUP_KV)
// GET  = { hubs }  (hubs is null until routes are first saved from the frontend)
// POST = { hubs }  overwrite the full route list
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};
const HUB_NAMES = ['central', 'harbour', 'western'];

function isValidRoute(r) {
  return r && typeof r.id === 'string' && r.id.trim()
    && typeof r.morning === 'string' && r.morning.trim()
    && typeof r.evening === 'string' && r.evening.trim();
}

function isValidHubs(hubs) {
  if (!hubs || typeof hubs !== 'object') return false;
  return HUB_NAMES.every(h => {
    const hub = hubs[h];
    return hub && typeof hub.label === 'string'
      && Array.isArray(hub.main) && Array.isArray(hub.secondary)
      && [...hub.main, ...hub.secondary].every(isValidRoute);
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: HEADERS });
  if (!env.BACKUP_KV) return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV' }), { status: 500, headers: HEADERS });
  try {
    if (request.method === 'GET') {
      const raw = await env.BACKUP_KV.get('routes');
      return new Response(JSON.stringify({ hubs: raw ? JSON.parse(raw) : null }), { status: 200, headers: HEADERS });
    }
    if (request.method === 'POST') {
      const body = await request.json();
      if (!isValidHubs(body.hubs)) {
        return new Response(JSON.stringify({ error: 'Invalid route data' }), { status: 400, headers: HEADERS });
      }
      await env.BACKUP_KV.put('routes', JSON.stringify(body.hubs));
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: HEADERS });
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: HEADERS });
  }
}
