import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args, skipSetup } = req.body;
  const apikey = process.env.CIRCLE_API_KEY;

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({ error: "Missing or invalid user token. Please sign in again." });
  }

  try {
    let freshUserToken = userToken;
    let freshEncryptionKey = null;

    try {
      const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
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

    // Helper function to fetch wallets with a built-in retry buffer for propagation delay
    async function fetchUserWallet(token, retries = 3, delay = 1500) {
      for (let i = 0; i < retries; i++) {
        const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
          headers: { "Authorization": `Bearer ${apikey}`, "X-User-Token": token }
        });
        const walletData = await walletRes.json();
        const foundWallet = walletData.data?.wallets?.[0];
        if (foundWallet) return foundWallet;
        if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
      }
      return null;
    }

    let wallet = await fetchUserWallet(freshUserToken);

    // If no wallet exists, check if we need to create a wallet set + wallet automatically
    if (!wallet) {
      try {
        // 1. Create a Wallet Set first if none exists
        const walletSetRes = await fetch("https://api.circle.com/v1/w3s/user/walletSets", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), name: "LifeLink User Wallet Set" })
        });
        const walletSetData = await walletSetRes.json();
        const walletSetId = walletSetData.data?.walletSet?.id;

        if (walletSetId) {
          // 2. Create a Developer-Controlled / User-Controlled Wallet inside that set
          await fetch("https://api.circle.com/v1/w3s/user/wallets", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
            body: JSON.stringify({
              idempotencyKey: crypto.randomUUID(),
              walletSetId: walletSetId,
              blockchains: ["ETH-SEPOLIA"], // Adjust to your active chain if needed
              accountType: "SCA"
            })
          });
        }
      } catch (err) {
        console.warn("Wallet set/wallet creation step notice:", err);
      }
    }

    // Re-check wallet after auto-provisioning attempt
    wallet = await fetchUserWallet(freshUserToken, 3, 2000);

    // If still no wallet and skipSetup is allowed, trigger PIN setup challenge
    if (!wallet && !skipSetup) {
      try {
        const pinRes = await fetch(`https://api.circle.com/v1/w3s/user/pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID() })
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
        console.warn("PIN setup creation notice:", e);
      }
    }

    if (!wallet) {
      return res.status(400).json({ error: "No wallet found for this user. Please complete PIN setup or refresh." });
    }

    // Execute smart contract transaction
    const txRes = await fetch(`https://api.circle.com/v1/w3s/user/transactions/contractExecution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
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
