export async function onRequest(context) {
  const { request, env } = context;

  const BIN_ID  = env.JSONBIN_FLEET_BIN_ID;
  const API_KEY = env.JSONBIN_API_KEY;

  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (!BIN_ID || !API_KEY) {
    return new Response(JSON.stringify({ error: 'Server config missing — check Cloudflare env vars' }), { status: 500, headers });
  }

  try {

    /* ── GET: fetch bus master + excluded buses ── */
    if (request.method === 'GET') {
      const res  = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.message || 'Fetch failed' }), { status: res.status, headers });
      }

      const record = data.record || {};
      return new Response(JSON.stringify({ record }), { status: 200, headers });
    }

    /* ── POST: save bus master + excluded buses ── */
    if (request.method === 'POST') {
      const payload = await request.json();

      const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type':     'application/json',
          'X-Master-Key':     API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(payload)
      });

      if (!putRes.ok) {
        return new Response(JSON.stringify({ error: 'Save failed' }), { status: putRes.status, headers });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
