const https = require('https');

const BIN_ID  = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

/* ── Simple https helper (no external deps needed) ── */
function httpsRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj  = new URL(url);
    const reqOpts = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   options.method || 'GET',
      headers:  options.headers || {}
    };

    const req = https.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => JSON.parse(data) });
        } catch(e) {
          reject(new Error('JSON parse error: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  // Check env vars are set
  if (!BIN_ID || !API_KEY) {
    console.error('Missing env vars: JSONBIN_BIN_ID or JSONBIN_API_KEY');
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Server config missing — check Netlify env vars' })
    };
  }

  try {

    /* ── GET: fetch all reports ── */
    if (event.httpMethod === 'GET') {
      const res  = await httpsRequest(
        `https://api.jsonbin.io/v3/b/${BIN_ID}`,
        { headers: { 'X-Master-Key': API_KEY } }
      );
      const data = res.json();

      if (!res.ok) {
        console.error('JSONBin GET error:', data);
        return { statusCode: res.status, headers: HEADERS, body: JSON.stringify({ error: data.message || 'Fetch failed' }) };
      }

      const reports = (data.record && data.record.reports) ? data.record.reports : [];
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ reports }) };
    }

    /* ── POST: save new records ── */
    if (event.httpMethod === 'POST') {
      const { records } = JSON.parse(event.body);
      if (!records || !records.length) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No records provided' }) };
      }

      // 1. Fetch existing data
      const fetchRes  = await httpsRequest(
        `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
        { headers: { 'X-Master-Key': API_KEY } }
      );
      const fetchData = fetchRes.json();
      let db = (fetchData.record && Array.isArray(fetchData.record.reports)) ? fetchData.record.reports : [];
      db = db.concat(records);

      // 2. Save updated data
      const bodyStr = JSON.stringify({ reports: db });
      const putRes  = await httpsRequest(
        `https://api.jsonbin.io/v3/b/${BIN_ID}`,
        {
          method:  'PUT',
          headers: {
            'Content-Type':    'application/json',
            'Content-Length':  Buffer.byteLength(bodyStr),
            'X-Master-Key':    API_KEY,
            'X-Bin-Versioning': 'false'
          }
        },
        bodyStr
      );

      if (!putRes.ok) {
        const errData = putRes.json();
        console.error('JSONBin PUT error:', errData);
        return { statusCode: putRes.status, headers: HEADERS, body: JSON.stringify({ error: 'Save failed' }) };
      }

      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, saved: records.length }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('DB function error:', err.message);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
