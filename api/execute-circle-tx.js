import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken) return res.status(400).json({ error: "Missing userToken" });

  try {
    // 1. Fetch user wallets
    let walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      }
    });

    let walletData = await walletRes.json();
    let wallet = walletData.data?.wallets?.[0];

    // 2. If no wallet exists, generate the Wallet Creation challenge
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
      
      return res.status(200).json({
        needsWalletSetup: true,
        challengeId: initWalletData.data?.challengeId,
        message: "Wallet setup challenge created. Execute challenge in Circle SDK."
      });
    }

    // 3. If wallet exists, proceed with contract transaction execution
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
    return res.status(txRes.status).json(txData);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
