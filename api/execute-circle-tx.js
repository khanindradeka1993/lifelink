import { CircleDeveloperSdk } from "@circle-fin/developer-controlled-wallets";

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

    if (!contractAddress || !functionSignature) {
      return res.status(400).json({ error: "Missing contract details or signature" });
    }

    const apiKey = process.env.CIRCLE_API_KEY;
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    const walletId = process.env.CIRCLE_WALLET_ID;

    if (!apiKey || !entitySecret || !walletId) {
      return res.status(500).json({
        error: "Server configuration missing: Ensure CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET, and CIRCLE_WALLET_ID are set in Vercel settings."
      });
    }

    // Initialize Circle SDK
    const circleDeveloperSdk = new CircleDeveloperSdk({
      apiKey,
      entitySecret
    });

    // Send Contract Execution Transaction via Circle Developer SDK
    const response = await circleDeveloperSdk.createContractExecutionTransaction({
      walletId,
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

    const txHash = response.data?.txHash || response.data?.id || "Pending";

    return res.status(200).json({
      success: true,
      txHash,
      data: response.data
    });

  } catch (error) {
    console.error("Execute Circle Tx Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute transaction via Circle"
    });
  }
}
