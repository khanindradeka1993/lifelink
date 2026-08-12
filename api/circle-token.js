import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

// Initialize Circle SDK Client
const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;
    const userIdentifier = userId || `google_user_${Date.now()}`;

    // 1. Create or get Circle User Session Token & Encryption Key
    const tokenResponse = await circleClient.createUserToken({
      userId: userIdentifier
    });

    const userToken = tokenResponse.data?.userToken;
    const encryptionKey = tokenResponse.data?.encryptionKey;

    // 2. Query Circle API to fetch created wallet addresses for this user
    let walletAddress = null;
    try {
      const walletsResponse = await circleClient.listWallets({
        userId: userIdentifier
      });

      if (walletsResponse.data?.wallets?.length > 0) {
        // Pick the primary EVM / Arc Testnet compatible address
        walletAddress = walletsResponse.data.wallets[0].address;
      }
    } catch (wErr) {
      console.log("No existing wallet found for user, initializing new session...");
    }

    // 3. Return token, encryption key, user ID, and wallet address to frontend
    return res.status(200).json({
      userToken: userToken,
      encryptionKey: encryptionKey,
      userId: userIdentifier,
      walletAddress: walletAddress // Returns 0x... address if already generated
    });

  } catch (error) {
    console.error("Circle Token API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate Circle token" });
  }
}
