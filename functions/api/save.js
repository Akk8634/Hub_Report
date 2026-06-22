// POST /api/save — append one report entry into Cloudflare KV (binding: BACKUP_KV)
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};
export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.BACKUP_KV) {
    return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV' }), { status: 500, headers: HEADERS });
  }
  try {
    const newEntry = await request.json();
    const raw = await env.BACKUP_KV.get('reports');
    const existing = raw ? JSON.parse(raw) : [];
    const updated = Array.isArray(existing) ? existing : [];
    updated.push(newEntry);
    await env.BACKUP_KV.put('reports', JSON.stringify(updated));
    return new Response(JSON.stringify({ success: true, saved: 1 }), { status: 200, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Save failed', message: err.message }), { status: 500, headers: HEADERS });
  }
}
export async function onRequestOptions() { return new Response('', { headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS' } }); }
