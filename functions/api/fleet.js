export async function onRequestGet(context) {
  const BIN_ID  = context.env.JSONBIN_FLEET_BIN_ID;
  const API_KEY = context.env.JSONBIN_API_KEY;

  const HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const res  = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' }
    });

    const text = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'JSONBin failed', status: res.status, details: text }),
        { status: res.status, headers: HEADERS }
      );
    }

    const data = JSON.parse(text);
    return new Response(
      JSON.stringify({ record: data }),
      { headers: HEADERS }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error', message: err.message }),
      { status: 500, headers: HEADERS }
    );
  }
}

export async function onRequestPost(context) {
  const BIN_ID  = context.env.JSONBIN_FLEET_BIN_ID;
  const API_KEY = context.env.JSONBIN_API_KEY;

  const HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const payload = await context.request.json();

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
      const errText = await putRes.text();
      return new Response(
        JSON.stringify({ error: 'Save failed', details: errText }),
        { status: 500, headers: HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: HEADERS }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error', message: err.message }),
      { status: 500, headers: HEADERS }
    );
  }
}

export async function onRequestOptions() {
  return new Response('', {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  });
}
