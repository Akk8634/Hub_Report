const BIN_ID  = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET — fetch all records
    if (event.httpMethod === 'GET') {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const data = await res.json();
      const reports = (data.record && data.record.reports) ? data.record.reports : [];
      return { statusCode: 200, headers, body: JSON.stringify({ reports }) };
    }

    // POST — save new records
    if (event.httpMethod === 'POST') {
      const { records } = JSON.parse(event.body);
      if (!records || !records.length) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No records' }) };
      }

      // Fetch existing
      const fetchRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const fetchData = await fetchRes.json();
      let db = (fetchData.record && Array.isArray(fetchData.record.reports)) ? fetchData.record.reports : [];
      db = db.concat(records);

      // Save updated
      const putRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify({ reports: db })
      });

      if (!putRes.ok) throw new Error('Save failed: ' + putRes.status);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, saved: records.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('DB function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
