import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "CIRCLE_API_KEY is missing in Vercel environment variables."
      });
    }

    const { userId } = req.body || {};
    const userIdentifier = String(userId || "").trim();

    if (!userIdentifier) {
      return res.status(400).json({
        error: "A stable Circle user ID is required."
      });
    }

    console.log("🔎 CIRCLE USER ID:", userIdentifier);

    const createUserResponse = await fetch(
      "https://api.circle.com/v1/w3s/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          userId: userIdentifier
        })
      }
    );

    const createUserData = await createUserResponse.json().catch(() => ({}));
    if (!createUserResponse.ok) {
      console.log(
        "ℹ️ Circle user create/fetch response:",
        createUserResponse.status,
        createUserData
      );
    }

    const tokenResponse = await fetch(
      "https://api.circle.com/v1/w3s/users/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ userId: userIdentifier })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(500).json({
        error:
          tokenData.message ||
          tokenData.error ||
          "Failed to create Circle user token"
      });
    }

    const userToken = tokenData.data?.userToken;
    const encryptionKey = tokenData.data?.encryptionKey;

    if (!userToken) {
      return res.status(500).json({
        error: "Circle did not return a user token."
      });
    }

    let walletAddress = null;
    let walletId = null;

    try {
      const walletResponse = await fetch(
        "https://api.circle.com/v1/w3s/wallets",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "X-User-Token": userToken
          }
        }
      );

      const walletData = await walletResponse.json().catch(() => ({}));

      console.log("🔎 CIRCLE WALLET STATUS:", walletResponse.status);

      if (walletResponse.ok && walletData.data?.wallets?.length > 0) {
        const wallet = walletData.data.wallets[0];
        walletAddress = wallet.address || null;
        walletId = wallet.id || null;
      }
    } catch (walletError) {
      console.log(
        "ℹ️ Circle wallet lookup failed:",
        walletError?.message || walletError
      );
    }

    return res.status(200).json({
      userToken,
      encryptionKey,
      userId: userIdentifier,
      walletAddress,
      walletId
    });
  } catch (error) {
    console.error("Circle token API error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
