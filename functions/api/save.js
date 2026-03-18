export async function onRequestPost(context) {
  try {
    const API_KEY = context.env.JSONBIN_API_KEY;
    const BIN_ID = context.env.JSONBIN_BIN_ID;

    const newData = await context.request.json();

    // 1. Existing data fetch karo
    const oldRes = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": API_KEY
        }
      }
    );

    const oldJson = await oldRes.json();
    const oldData = oldJson.record || [];

    // 2. New data add karo
    const updatedData = [...oldData, newData];

    // 3. JSONBin me save karo
    const saveRes = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify(updatedData)
      }
    );

    const result = await saveRes.text();

    return new Response(
  JSON.stringify({
    success: true,
    message: "Saved successfully"
  }),
  {
    headers: { "Content-Type": "application/json" }
  }
);
