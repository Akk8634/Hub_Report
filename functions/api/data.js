// GET /api/data — read all reports from Cloudflare KV (binding: BACKUP_KV)
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BACKUP_KV) {
    return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV', reports: [] }), { status: 500, headers: HEADERS });
  }
  try {
    const raw = await env.BACKUP_KV.get('reports');
    const reports = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify({ reports }), { status: 200, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, reports: [] }), { status: 500, headers: HEADERS });
  }
}
export async function onRequestOptions() { return new Response('', { headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'GET, OPTIONS' } }); }
