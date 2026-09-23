// POST /api/save — save one report entry into Cloudflare KV (binding: BACKUP_KV)
// If the entry has a reportKey (date|mode|hub), any earlier entry with the same key
// is replaced, so generating the same report again does not create duplicates.
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
    let updated = Array.isArray(existing) ? existing : [];
    let replaced = false;
    if (newEntry.reportKey) {
      const before = updated.length;
      updated = updated.filter(e => e.reportKey !== newEntry.reportKey);
      replaced = updated.length !== before;
    }
    updated.push(newEntry);
    await env.BACKUP_KV.put('reports', JSON.stringify(updated));
    return new Response(JSON.stringify({ success: true, saved: 1, replaced }), { status: 200, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Save failed', message: err.message }), { status: 500, headers: HEADERS });
  }
}
export async function onRequestOptions() { return new Response('', { headers: { ...HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS' } }); }
