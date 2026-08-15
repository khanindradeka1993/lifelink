import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userToken, contractAddress, functionSignature, args } = req.body;
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!userToken || !contractAddress || !functionSignature) {
    return res.status(400).json({ 
      error: "Missing required parameters (userToken, contractAddress, functionSignature)" 
    });
  }

  try {
    // 1. Automatically fetch the logged-in user's active wallet
    const walletRes = await fetch("https://api.circle.com/v1/w3s/user/wallets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-User-Token": userToken
      }
    });

    const walletData = await walletRes.json();
    
    if (!walletRes.ok || !walletData.data?.wallets?.[0]) {
      return res.status(walletRes.status || 400).json({ 
        error: "Could not retrieve user wallet from Circle", 
        details: walletData 
      });
    }

    const walletId = walletData.data.wallets[0].id;

    // 2. Execute transaction dynamically for ANY target smart contract
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
        abiParameters: args || []
      })
    });

    const txData = await txRes.json();
    return res.status(txRes.status).json(txData);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
