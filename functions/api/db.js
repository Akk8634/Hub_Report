async function onRequest(context) {
  const { request, env } = context;

  const BIN_ID  = env.JSONBIN_BIN_ID;
  const API_KEY = env.JSONBIN_API_KEY;

  const HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: HEADERS });
  }

  if (!BIN_ID || !API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server config missing — check Cloudflare env vars' }),
      { status: 500, headers: HEADERS }
    );
  }

  try {

    /* ── GET: fetch all reports ── */
    if (request.method === 'GET') {
      const r    = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await r.json();

      if (!r.ok) {
        return new Response(
          JSON.stringify({ error: data.message || 'Fetch failed' }),
          { status: r.status, headers: HEADERS }
        );
      }

      const reports = (data.record && data.record.reports) ? data.record.reports : [];
      return new Response(JSON.stringify({ reports }), { status: 200, headers: HEADERS });
    }

    /* ── POST: save new records ── */
    if (request.method === 'POST') {
      const body    = await request.json();
      const records = body.records;

      if (!records || !records.length) {
        return new Response(
          JSON.stringify({ error: 'No records provided' }),
          { status: 400, headers: HEADERS }
        );
      }

      // Fetch existing
      const fetchRes  = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const fetchData = await fetchRes.json();
      let db = (fetchData.record && Array.isArray(fetchData.record.reports)) ? fetchData.record.reports : [];
      db = db.concat(records);

      // Save updated
      const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type':     'application/json',
          'X-Master-Key':     API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify({ reports: db })
      });

      if (!putRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Save failed' }),
          { status: putRes.status, headers: HEADERS }
        );
      }

      return new Response(
        JSON.stringify({ success: true, saved: records.length }),
        { status: 200, headers: HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: HEADERS }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: HEADERS }
    );
  }
}
