const https = require('https');

const BIN_ID  = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

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
        try { resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => JSON.parse(data) }); }
        catch(e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (!BIN_ID || !API_KEY) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Server config missing — check Netlify env vars' }) };
  }

  try {

    /* ── GET: fetch bus master + excluded buses ── */
    if (event.httpMethod === 'GET') {
      const res  = await httpsRequest(
        `https://api.jsonbin.io/v3/b/${BIN_ID}`,
        { headers: { 'X-Master-Key': API_KEY } }
      );
      const data = res.json();
      if (!res.ok) return { statusCode: res.status, headers: HEADERS, body: JSON.stringify({ error: data.message || 'Fetch failed' }) };

      // Return the fleet record (busMaster + excludedBuses)
      const record = data.record || {};
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ record }) };
    }

    /* ── POST: save bus master + excluded buses ── */
    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body);

      const bodyStr = JSON.stringify(payload);
      const putRes  = await httpsRequest(
        `https://api.jsonbin.io/v3/b/${BIN_ID}`,
        {
          method:  'PUT',
          headers: {
            'Content-Type':     'application/json',
            'Content-Length':   Buffer.byteLength(bodyStr),
            'X-Master-Key':     API_KEY,
            'X-Bin-Versioning': 'false'
          }
        },
        bodyStr
      );

      if (!putRes.ok) return { statusCode: putRes.status, headers: HEADERS, body: JSON.stringify({ error: 'Save failed' }) };
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('Fleet function error:', err.message);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
