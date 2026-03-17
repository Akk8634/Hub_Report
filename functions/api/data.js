export async function onRequestGet(context) {
  try {
    const BIN_ID = context.env.JSONBIN_ID;
    const API_KEY = context.env.JSONBIN_KEY;

    const res = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: "JSONBin fetch failed",
          status: res.status
        }),
        { status: res.status }
      );
    }

    const data = await res.text();

    return new Response(data, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
