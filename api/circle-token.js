const { initiateUserControlledWalletsClient } = require("@circle-fin/user-controlled-wallets");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "CIRCLE_API_KEY environment variable is not configured." });
    }

    const circleClient = initiateUserControlledWalletsClient({ apiKey });
    const { userId } = req.body || {};
    const userIdentifier = userId || `google_user_${Date.now()}`;

    // 1. Get/Create User Session Token & Encryption Key
    const tokenResponse = await circleClient.createUserToken({
      userId: userIdentifier
    });

    const userToken = tokenResponse.data?.userToken;
    const encryptionKey = tokenResponse.data?.encryptionKey;

    // 2. Fetch User's Wallet Address if available
    let walletAddress = null;
    try {
      const walletsResponse = await circleClient.listWallets({
        userId: userIdentifier
      });

      if (walletsResponse.data?.wallets && walletsResponse.data.wallets.length > 0) {
        walletAddress = walletsResponse.data.wallets[0].address;
      }
    } catch (wErr) {
      console.log("No wallet found yet for user, returning token session...");
    }

    return res.status(200).json({
      userToken: userToken,
      encryptionKey: encryptionKey,
      userId: userIdentifier,
      walletAddress: walletAddress
    });

  } catch (error) {
    console.error("Circle API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process Circle authentication" });
  }
};
