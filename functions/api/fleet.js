// /api/fleet — fleet object via Cloudflare KV (binding: BACKUP_KV). GET = {record}, POST = overwrite
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};
export async function onRequestGet(context) {
  const { env } = context;
  if (!env.BACKUP_KV) return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV' }), { status: 500, headers: HEADERS });
  try {
    const raw = await env.BACKUP_KV.get('fleet');
    const record = raw ? JSON.parse(raw) : {};
    return new Response(JSON.stringify({ record }), { headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', message: err.message }), { status: 500, headers: HEADERS });
  }
}
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BACKUP_KV) return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV' }), { status: 500, headers: HEADERS });
  try {
    const payload = await request.json();
    await env.BACKUP_KV.put('fleet', JSON.stringify(payload));
    return new Response(JSON.stringify({ success: true }), { headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', message: err.message }), { status: 500, headers: HEADERS });
  }
}
export async function onRequestOptions() { return new Response('', { headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } }); }
