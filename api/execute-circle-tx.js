import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apikey = process.env.CIRCLE_API_KEY;

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({ error: "Missing or invalid user token. Please sign in again." });
  }

  try {
    let freshUserToken = userToken;
    let freshEncryptionKey = null;

    // 1. Always generate a fresh session token & encryption key pair from Circle
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
      console.warn("Token refresh warning:", e);
    }

    async function getWallet(token) {
      const res = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
        headers: { "Authorization": `Bearer ${apikey}`, "X-User-Token": token }
      });
      const data = await res.json();
      return data.data?.wallets?.[0];
    }

    let wallet = await getWallet(freshUserToken);

    // 2. If no wallet, trigger PIN/User setup challenge
    if (!wallet) {
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
          encryptionKey: freshEncryptionKey // Crucial for SDK execution
        });
      }
    }

    // 3. Auto-create wallet set & wallet if missing
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
            blockchains: ["ETH-SEPOLIA"],
            accountType: "SCA"
          })
        });
      }

      await new Promise(r => setTimeout(r, 2000));
      wallet = await getWallet(freshUserToken);
    }

    if (!wallet) {
      return res.status(400).json({ error: "Failed to create or locate user wallet." });
    }

    // 4. Execute smart contract transaction challenge
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
      encryptionKey: freshEncryptionKey // Crucial for SDK execution
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
