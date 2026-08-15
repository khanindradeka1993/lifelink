import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken) return res.status(400).json({ error: "Missing userToken" });

  try {
    // 1. Fetch user wallet
    const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      headers: { Authorization: `Bearer ${apiKey}`, "X-User-Token": userToken }
    });
    const walletData = await walletRes.json();
    const walletId = walletData.data?.wallets?.[0]?.id;

    if (!walletId) {
      // Return wallet setup challenge if needed
      const initWalletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-User-Token": userToken },
        body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), blockchains: ["ETH-SEPOLIA"], accountType: "SCA" })
      });
      const initWalletData = await initWalletRes.json();
      return res.status(200).json({ needsWalletSetup: true, challengeId: initWalletData.data?.challengeId });
    }

    // 2. Submit contract transaction
    const txRes = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-User-Token": userToken },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId,
        contractAddress,
        abiFunctionSignature: functionSignature,
        abiParameters: (args || []).map(arg => String(arg))
      })
    });

    const txData = await txRes.json();
    
    // Return challengeId to frontend SDK execution
    return res.status(txRes.status).json({
      challengeId: txData.data?.challengeId,
      id: txData.data?.id
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
