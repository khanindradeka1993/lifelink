import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({ error: "Missing or invalid userToken. Please sign in again." });
  }

  try {
    // 1. Fetch fresh session tokens (userToken & encryptionKey) from Circle
    let freshUserToken = userToken;
    let freshEncryptionKey = null;

    try {
      const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ userToken })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.data) {
        freshUserToken = tokenData.data.userToken || userToken;
        freshEncryptionKey = tokenData.data.encryptionKey || null;
      }
    } catch (e) {
      console.warn("Could not generate fresh session encryptionKey:", e);
    }

    // 2. Fetch user wallets
    const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": freshUserToken
      }
    });

    const walletData = await walletRes.json();
    const wallet = walletData?.data?.wallets?.[0];

    // 3. If no wallet exists, create PIN setup challenge
    if (!wallet) {
      const pinRes = await fetch("https://api.circle.com/v1/w3s/user/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-User-Token": freshUserToken
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID()
        })
      });

      const pinData = await pinRes.json();
      const challengeId = pinData?.data?.challengeId || pinData?.challengeId;

      return res.status(200).json({
        needsWalletSetup: true,
        challengeId: challengeId || null,
        userToken: freshUserToken,
        encryptionKey: freshEncryptionKey,
        error: challengeId ? null : (pinData.message || "Failed to create PIN setup challenge")
      });
    }

    // 4. Wallet exists -> Execute smart contract transaction
    const txRes = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": freshUserToken
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId: wallet.id,
        contractAddress,
        abiFunctionSignature: functionSignature,
        abiParameters: (args || []).map(arg => String(arg))
      })
    });

    const txData = await txRes.json();
    const challengeId = txData?.data?.challengeId || txData?.challengeId;

    if (!txRes.ok || !challengeId) {
      return res.status(400).json({
        error: txData.message || txData.error || "Failed to execute transaction"
      });
    }

    return res.status(200).json({
      challengeId,
      userToken: freshUserToken,
      encryptionKey: freshEncryptionKey,
      id: txData?.data?.id
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
