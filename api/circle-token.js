export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "CIRCLE_API_KEY is missing in Vercel environment variables." });
    }

    const { userId } = req.body || {};
    const userIdentifier = userId || `google_user_${Date.now()}`;

    // 1. Create user if not already existing
    try {
      await fetch("https://api.circle.com/v1/w3s/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ userId: userIdentifier })
      });
    } catch (e) {
      // User exists, move on
    }

    // 2. Obtain session token
    const tokenResponse = await fetch("https://api.circle.com/v1/w3s/users/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userId: userIdentifier })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: tokenData.message || tokenData.error || "Failed to create Circle user token"
      });
    }

    const userToken = tokenData.data?.userToken;
    const encryptionKey = tokenData.data?.encryptionKey;

    let walletAddress = null;
    try {
      const walletResponse = await fetch(`https://api.circle.com/v1/w3s/wallets?userId=${userIdentifier}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-User-Token": userToken
        }
      });

      const walletData = await walletResponse.json();
      if (walletResponse.ok && walletData.data?.wallets?.length > 0) {
        walletAddress = walletData.data.wallets[0].address;
      }
    } catch (wErr) {
      console.log("No wallet address returned yet:", wErr);
    }

    return res.status(200).json({
      userToken: userToken,
      encryptionKey: encryptionKey,
      userId: userIdentifier,
      walletAddress: walletAddress
    });

  } catch (error) {
    console.error("Circle Token API Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
