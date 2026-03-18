export async function onRequestGet(context) {
  try {
    const BIN_ID = context.env.JSONBIN_ID;
    const API_KEY = context.env.JSONBIN_KEY;

    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY,
        "X-Bin-Meta": "false"
      }
    });

    const text = await res.text();

    // Debug response (important)
    if (!res.ok) {
      return new Response(
        JSON.stringify({
          error: "JSONBin failed",
          status: res.status,
          details: text
        }),
        { status: res.status }
      );
    }

    return new Response(text, {
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: err.message
      }),
      { status: 500 }
    );
  }
}
