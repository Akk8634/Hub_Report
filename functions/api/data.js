const BIN_ID = context.env.JSONBIN_BIN_ID;
const API_KEY = context.env.JSONBIN_API_KEY;

const res = await fetch(
  `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
  {
    headers: {
      "X-Master-Key": API_KEY,
      "X-Bin-Meta": "false"
    }
  }
);
