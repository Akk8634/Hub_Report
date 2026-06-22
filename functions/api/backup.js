// Cloudflare Pages Function — Backup Alignment shared storage (Cloudflare KV)
// Route: /api/backup   (GET = load, POST = save)
// Requires a KV namespace bound as  BACKUP_KV  in Cloudflare Pages settings.

const KEY = 'backup_alignment_current';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: HEADERS });
  }

  if (!env.BACKUP_KV) {
    return new Response(
      JSON.stringify({ error: 'KV not bound — add a KV namespace binding named BACKUP_KV in Cloudflare Pages settings' }),
      { status: 500, headers: HEADERS }
    );
  }

  try {
    // GET — return the current shared data (or empty object)
    if (request.method === 'GET') {
      const val = await env.BACKUP_KV.get(KEY);
      return new Response(val || '{}', { status: 200, headers: HEADERS });
    }

    // POST — overwrite the current shared data
    if (request.method === 'POST') {
      const body = await request.text();
      // basic guard: must be valid JSON
      try { JSON.parse(body); } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: HEADERS });
      }
      await env.BACKUP_KV.put(KEY, body);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: HEADERS });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: HEADERS });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: HEADERS });
  }
}
