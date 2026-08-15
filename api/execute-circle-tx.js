import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

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
      return res.status(400).json({ error: "Missing userToken for User-Controlled Wallet" });
    }

    if (!contractAddress || !functionSignature) {
      return res.status(400).json({ error: "Missing contract details or signature" });
    }

    const apiKey = process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Server configuration missing: Ensure CIRCLE_API_KEY is set in Vercel settings."
      });
    }

    // Initialize User-Controlled SDK Client
    const circleClient = initiateUserControlledWalletsClient({
      apiKey
    });

    // Create Contract Execution Challenge for User-Controlled Wallet
    const response = await circleClient.createContractExecutionTransaction({
      userToken,
      contractAddress,
      abiFunctionSignature: functionSignature,
      abiParameters: args || [],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM"
        }
      }
    });

    // Return the challengeId to the frontend
    const challengeId = response.data?.challengeId;

    return res.status(200).json({
      success: true,
      challengeId,
      data: response.data
    });

  } catch (error) {
    console.error("Execute Circle Tx Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to create transaction challenge via Circle"
    });
  }
}
