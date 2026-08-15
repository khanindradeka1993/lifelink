export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read userToken or circle_user_token from request body
    const userToken = req.body.userToken || req.body.circle_user_token;
    const { functionSignature, contractAddress, args } = req.body;

    if (!userToken || userToken === "undefined" || userToken === "null") {
      return res.status(400).json({ error: "Circle session expired. Please sign in again." });
    }

    if (!contractAddress || !functionSignature) {
      return res.status(400).json({ error: "Missing contract address or function signature." });
    }

    const apiKey = process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "CIRCLE_API_KEY is not configured in Vercel settings." });
    }

    // Generate reliable UUID for Vercel Serverless environment
    const idempotencyKey = 'idx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);

    // Call Circle REST API for User-Controlled Contract Execution Challenge
    const response = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      },
      body: JSON.stringify({
        idempotencyKey,
        contractAddress,
        abiFunctionSignature: functionSignature,
        abiParameters: args || [],
        fee: {
          type: "level",
          config: {
            feeLevel: "MEDIUM"
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || "Circle API rejected the request."
      });
    }

    return res.status(200).json({
      success: true,
      challengeId: data.data?.challengeId,
      data: data.data
    });

  } catch (error) {
    console.error("Execute Circle Tx Error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error executing Circle transaction."
    });
  }
}
