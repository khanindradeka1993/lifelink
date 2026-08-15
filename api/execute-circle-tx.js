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
    const { userToken, functionSignature, contractAddress, args } = req.body;

    if (!userToken) {
      return res.status(400).json({ error: "Missing userToken" });
    }

    if (!contractAddress || !functionSignature) {
      return res.status(400).json({ error: "Missing contract details" });
    }

    const apiKey = process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "CIRCLE_API_KEY missing in environment variables" });
    }

    // Direct Circle REST API Call for User-Controlled Contract Execution Challenge
    const response = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
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
      throw new Error(data.message || "Failed to create Circle transaction challenge");
    }

    const challengeId = data.data?.challengeId;

    return res.status(200).json({
      success: true,
      challengeId,
      data: data.data
    });

  } catch (error) {
    console.error("Execute Circle Tx Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute transaction via Circle"
    });
  }
}
