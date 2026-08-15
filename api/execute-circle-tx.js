import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const userToken = req.body.userToken || req.body.circle_user_token;
    const { functionSignature, contractAddress, args, walletId } = req.body;

    if (!userToken) {
      return res.status(400).json({ error: "Circle session expired. Please sign in again." });
    }

    if (!contractAddress || !functionSignature) {
      return res.status(400).json({ error: "Missing contract details or signature." });
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "CIRCLE_API_KEY missing in Vercel settings." });
    }

    // Must be a valid UUID v4 for Circle API validation
    const idempotencyKey = crypto.randomUUID();

    // Payload following Circle User-Controlled Wallet specifications
    const payload = {
      idempotencyKey,
      contractAddress: contractAddress.trim(),
      abiFunctionSignature: functionSignature.trim(),
      abiParameters: (args || []).map(arg => String(arg)),
      feeLevel: "MEDIUM"
    };

    if (walletId) {
      payload.walletId = walletId;
    }

    // Make request to Circle API with X-User-Token header
    const response = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Circle API parameter validation failed.",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      challengeId: data.data?.challengeId,
      data: data.data
    });

  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
