export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, deviceId, userToken } = req.body || {};

    const apiKey = process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "CIRCLE_API_KEY is not configured"
      });
    }

    const baseUrl = "https://api.circle.com/v1/w3s";

    // Step 1: Get device token for Google social login
    if (action === "createDeviceToken") {
      if (!deviceId) {
        return res.status(400).json({
          error: "Missing deviceId"
        });
      }

      const response = await fetch(
        `${baseUrl}/users/social/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            deviceId
          })
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // Step 2: Initialize the Circle user
    if (action === "initializeUser") {
      if (!userToken) {
        return res.status(400).json({
          error: "Missing userToken"
        });
      }

      const response = await fetch(
        `${baseUrl}/user/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-User-Token": userToken
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            accountType: "SCA",
            blockchains: ["ARC-TESTNET"]
          })
        }
      );

      const data = await response.json();

      return res.status(response.status).json(data);
    }

    // Step 3: List Circle wallets
if (action === "listWallets") {
  if (!userToken) {
    return res.status(400).json({
      error: "Missing userToken"
    });
  }

  const response = await fetch(
    `${baseUrl}/wallets`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-User-Token": userToken
      }
    }
  );

  const data = await response.json();

  return res.status(response.status).json(data);
}
    return res.status(400).json({
      error: "Unknown action"
    });

  } catch (error) {
    console.error("Circle API error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
