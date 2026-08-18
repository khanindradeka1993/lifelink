import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args, skipSetup, encryptionKey } = req.body;
  const apikey = process.env.CIRCLE_API_KEY;

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({ error: "Missing or invalid user token. Please sign in again." });
  }

  try {
    let freshUserToken = userToken;
    let freshEncryptionKey = null;

    // 1. Always acquire a fresh user token and encryption key from Circle
    try {
      const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },
        body: JSON.stringify({ userToken })
      });
                  const tokenData = await tokenRes.json();
      if (tokenData.data) {
        freshUserToken = tokenData.data.userToken || userToken;
        // Fallback to the encryption key sent directly from the frontend request body
        freshEncryptionKey = tokenData.data.encryptionKey || encryptionKey || null;
      }
    } catch (e) {
      console.warn("Token refresh warning:", e);
    }

    async function getWallet(token) {
      try {
        const res = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
          headers: { "Authorization": `Bearer ${apikey}`, "X-User-Token": token }
        });
        const data = await res.json();
        return data.data?.wallets?.[0];
      } catch (err) {
        return null;
      }
    }

    let wallet = await getWallet(freshUserToken);

    // 2. If no wallet exists and setup isn't skipped, request PIN setup
    if (!wallet && !skipSetup) {
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
    }

    // 3. Ensure Wallet Set and Wallet exist
    if (!wallet) {
      let walletSetId = null;
      const wsRes = await fetch("https://api.circle.com/v1/w3s/user/walletSets", {
        headers: { "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken }
      });
      const wsData = await wsRes.json();
      walletSetId = wsData.data?.walletSets?.[0]?.id;

      if (!walletSetId) {
        const createWsRes = await fetch("https://api.circle.com/v1/w3s/user/walletSets", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), name: "LifeLink Wallet Set" })
        });
        const createWsData = await createWsRes.json();
        walletSetId = createWsData.data?.walletSet?.id;
      }

      if (walletSetId) {
        await fetch("https://api.circle.com/v1/w3s/user/wallets", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}`, "X-User-Token": freshUserToken },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            walletSetId: walletSetId,
            blockchains: ["ARC-TESTNET"],
            accountType: "SCA"
          })
        });
      }

      let attempts = 0;
      while (!wallet && attempts < 6) {
        attempts++;
        await new Promise(r => setTimeout(r, 2500));
        wallet = await getWallet(freshUserToken);
      }
    }

    if (!wallet) {
      return res.status(400).json({ error: "Failed to create or locate user wallet. Please try again." });
    }

    // 4. Execute contract transaction challenge
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
      encryptionKey: freshEncryptionKey
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
