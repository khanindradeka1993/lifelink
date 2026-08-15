import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken || !contractAddress || !functionSignature) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

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
    let walletId = walletData.data?.wallets?.[0]?.id;

    // 2. Auto-create wallet if none exists for this user session
    if (!walletId) {
      const createRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-User-Token": userToken
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          blockchains: ["ETH-SEPOLIA"], // Or MATIC-AMOY
          accountType: "SCA"
        })
      });
      const createData = await createRes.json();
      walletId = createData.data?.wallets?.[0]?.id;
    }

    if (!walletId) {
      return res.status(400).json({ 
        error: "User has no wallet initialized. Please complete wallet setup in Circle SDK.",
        details: walletData
      });
    }

    // 3. Execute contract transaction
    const txRes = await fetch("https://api.circle.com/v1/w3s/user/transactions/contractExecution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        walletId: walletId,
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
