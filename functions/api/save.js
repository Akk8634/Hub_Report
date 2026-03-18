export async function onRequestPost(context) {
  try {
    const API_KEY = context.env.JSONBIN_API_KEY;
    const BIN_ID = context.env.JSONBIN_BIN_ID;

    const newEntry = await context.request.json();

    // 1. Existing data fetch
    const oldRes = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        method: "GET",
        headers: {
          "X-Master-Key": API_KEY,
          "X-Bin-Meta": "false"
        }
      }
    );

    if (!oldRes.ok) {
      const errText = await oldRes.text();
      return new Response(
        JSON.stringify({ error: "Fetch failed", details: errText }),
        { status: 500 }
      );
    }

    const oldData = await oldRes.json();

    // 2. Ensure array
    const existing = Array.isArray(oldData) ? oldData : [];

    // 3. Append new entry
    const updated = [...existing, newEntry];

    // 4. Save to JSONBin
    const saveRes = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify(updated)
      }
    );

    const saveText = await saveRes.text();

    if (!saveRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Save failed",
          details: saveText
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        saved: 1
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

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
