import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args, skipSetup } = req.body;
  const apikey = process.env.CIRCLE_API_KEY;

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({ error: "Missing or invalid user token. Please sign in again." });
  }

  try {
    // 1. Fetch fresh session tokens (user token & encryption key) from Circle
    let freshUserToken = userToken;
    let freshEncryptionKey = null;

    try {
      const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({ userToken })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.data) {
        freshUserToken = tokenData.data.userToken || userToken;
        freshEncryptionKey = tokenData.data.encryptionKey || null;
      }
    } catch (e) {
      console.warn("Could not generate fresh session encryption key:", e);
    }

    // 2. Fetch user wallets
    const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      headers: {
        "Authorization": `Bearer ${apikey}`,
        "X-User-Token": freshUserToken
      }
    });

    const walletData = await walletRes.json();
    const wallet = walletData.data?.wallets?.[0];

    // 3. If no wallet exists and skipSetup is not true, create PIN setup challenge
    if (!wallet && !skipSetup) {
      try {
        const pinRes = await fetch(`https://api.circle.com/v1/w3s/user/pin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`,
            "X-User-Token": freshUserToken
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID()
          })
        });

        const pinData = await pinRes.json();
        const challengeId = pinData.data?.challengeId;

        if (pinRes.ok && challengeId) {
          return res.status(200).json({
            needsWalletSetup: true,
            challengeId: challengeId,
            userToken: freshUserToken,
            encryptionKey: freshEncryptionKey
          });
        }
      } catch (e) {
        console.warn("PIN setup skipped or user already initialized:", e);
      }
    }

    // If wallet doesn't exist yet and skipSetup was passed, return error instead of crashing
    if (!wallet) {
      return res.status(400).json({ error: "No wallet found for this user. Please initialize wallet first." });
    }

    // 4. Wallet exists -> Execute smart contract transaction
    const txRes = await fetch(`https://api.circle.com/v1/w3s/user/transactions/contractExecution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
        "X-User-Token": freshUserToken
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId: wallet.id,
        contractAddress: contractAddress,
        abiFunctionSignature: functionSignature,
        abiParameters: args || [],
        feeLevel: "MEDIUM"
      })
    });

    const txData = await txRes.json();

    if (!txRes.ok || !txData.data?.challengeId) {
      return res.status(400).json({
        error: txData.message || txData.error || "Failed to execute transaction"
      });
    }

    return res.status(200).json({
      challengeId: txData.data.challengeId,
      userToken: freshUserToken,
      encryptionKey: freshEncryptionKey,
      id: txData.data.id
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
