export async function onRequestGet(context) {
  try {
    const BIN_ID = context.env.JSONBIN_BIN_ID;
    const API_KEY = context.env.JSONBIN_API_KEY;

    const res = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        method: "GET",
        headers: {
          "X-Master-Key": API_KEY,
          "X-Bin-Meta": "false"
        }
      }
    );

    const text = await res.text();

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
