// /api/db — reports via Cloudflare KV (binding: BACKUP_KV). GET = {reports}, POST {records:[...]} = append
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: HEADERS });
  if (!env.BACKUP_KV) return new Response(JSON.stringify({ error: 'KV not bound — add binding BACKUP_KV' }), { status: 500, headers: HEADERS });
  try {
    if (request.method === 'GET') {
      const raw = await env.BACKUP_KV.get('reports');
      const reports = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ reports }), { status: 200, headers: HEADERS });
    }
    if (request.method === 'POST') {
      const body = await request.json();
      const records = body.records;
      if (!records || !records.length) return new Response(JSON.stringify({ error: 'No records provided' }), { status: 400, headers: HEADERS });
      const raw = await env.BACKUP_KV.get('reports');
      let db = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(db)) db = [];
      db = db.concat(records);
      await env.BACKUP_KV.put('reports', JSON.stringify(db));
      return new Response(JSON.stringify({ success: true, saved: records.length }), { status: 200, headers: HEADERS });
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: HEADERS });
  }
}
