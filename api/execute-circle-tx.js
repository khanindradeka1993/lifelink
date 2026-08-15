import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken) {
    return res.status(400).json({ error: "Missing userToken" });
  }

  try {
    // 1. Fetch user wallet from Circle
    const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      }
    });

    const walletData = await walletRes.json();
    const wallet = walletData.data?.wallets?.[0];

    // 2. If no wallet exists, generate initial user wallet setup challenge
    if (!wallet) {
      const initWalletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-User-Token": userToken
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          blockchains: ["ETH-SEPOLIA"],
          accountType: "SCA"
        })
      });

      const initWalletData = await initWalletRes.json();
      const setupChallengeId = initWalletData.data?.challengeId || initWalletData.challengeId;

      return res.status(200).json({
        needsWalletSetup: true,
        challengeId: setupChallengeId || null,
        error: setupChallengeId ? null : (initWalletData.message || "Failed to generate wallet setup challenge")
      });
    }

    // 3. Submit smart contract transaction execution request
    const txRes = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId: wallet.id,
        contractAddress: contractAddress,
        abiFunctionSignature: functionSignature,
        abiParameters: (args || []).map(arg => String(arg))
      })
    });

    const txData = await txRes.json();
    const challengeId = txData.data?.challengeId || txData.challengeId;

    if (!txRes.ok || !challengeId) {
      return res.status(400).json({
        error: txData.message || txData.error || `Circle API Error Code: ${txData.code || txRes.status}`
      });
    }

    return res.status(200).json({
      challengeId: challengeId,
      id: txData.data?.id
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
