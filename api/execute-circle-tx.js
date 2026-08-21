import crypto from "crypto";

export default async function handler(req, res) {
if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

const {
  action,
  userToken,
  userId,
  contractAddress,
  functionSignature,
  args,
  skipSetup,
  walletCreationComplete,
  encryptionKey
} = req.body;

const apikey = process.env.CIRCLE_API_KEY;
console.log("🔎 EXECUTE INPUT:", {
  hasUserToken: !!userToken,
  hasUserId: !!userId,
  hasContractAddress: !!contractAddress,
  hasFunctionSignature: !!functionSignature
});
  
if (!userToken || userToken === "undefined" || !userId) {
  return res.status(400).json({ error: "Missing Circle user ID or user token. Please sign in again." });
}

try {
let freshUserToken = userToken;
let freshEncryptionKey = null;

// 1. Always acquire a fresh user token and encryption key from Circle  
try {  
  const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {  
    method: "POST",  
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apikey}` },  
    body: JSON.stringify({ userId })
  });  
  const tokenData = await tokenRes.json();
console.log("🔎 CIRCLE TOKEN STATUS:", tokenRes.status);
console.log("🔎 CIRCLE TOKEN DATA KEYS:", Object.keys(tokenData.data || {}));

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
    const walletRes = await fetch("https://api.circle.com/v1/w3s/wallets", {
      headers: {
        "Authorization": `Bearer ${apikey}`,
        "X-User-Token": token
      }
    });

    const rawWallet = await walletRes.text();

    console.log("🔎 CIRCLE WALLET STATUS:", walletRes.status);
    console.log("🔎 CIRCLE WALLET RESPONSE:", rawWallet);

    if (!walletRes.ok) {
      return null;
    }

    const walletData = JSON.parse(rawWallet);
    return walletData.data?.wallets?.[0] || null;

  } catch (err) {
    console.error("❌ CIRCLE WALLET ERROR:", err);
    return null;
  }
 }

let wallet = await getWallet(freshUserToken);  
if (action === "lookupTransaction") {
  if (!wallet?.id) {
    return res.status(400).json({
      error: "Circle wallet not available for transaction lookup."
    });
  }

  console.log("🔎 LOOKING UP COMPLETED CIRCLE TRANSACTION...");

  for (let attempt = 1; attempt <= 6; attempt++) {
    const params = new URLSearchParams({
      walletIds: wallet.id,
      operation: "CONTRACT_EXECUTION",
      pageSize: "20",
      order: "DESC"
    });

    const txLookupRes = await fetch(
      `https://api.circle.com/v1/w3s/transactions?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apikey}`,
          "X-User-Token": freshUserToken
        }
      }
    );

    const txLookupData = await txLookupRes.json();

    console.log(
      "🔎 CIRCLE TRANSACTION LOOKUP:",
      attempt,
      txLookupRes.status,
      txLookupData
    );

    if (txLookupRes.ok) {
      const transactions =
        txLookupData.data?.transactions || [];

      const matchingTx = transactions.find(tx =>
        tx.txHash &&
        tx.contractAddress?.toLowerCase() ===
          contractAddress?.toLowerCase() &&
        tx.abiFunctionSignature === functionSignature
      );

      if (matchingTx) {
        console.log(
          "✅ CIRCLE TX HASH FOUND:",
          matchingTx.txHash
        );

        return res.status(200).json({
          transactionHash: matchingTx.txHash,
          txHash: matchingTx.txHash,
          transaction: matchingTx
        });
      }
    }

    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );
  }

  return res.status(404).json({
    error:
      "Transaction completed, but Circle has not returned the transaction hash yet."
  });
}
  
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

// 3. Ensure user wallet exists
if (!wallet) {

  // First call: create wallet challenge
  if (!walletCreationComplete) {
    const walletCreateRes = await fetch(
      "https://api.circle.com/v1/w3s/user/wallets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apikey}`,
          "X-User-Token": freshUserToken
        },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          blockchains: ["ARC-TESTNET"],
          accountType: "SCA"
        })
      }
    );

    const walletCreateData = await walletCreateRes.json();

    console.log(
      "🔎 CIRCLE CREATE WALLET STATUS:",
      walletCreateRes.status
    );

    console.log(
      "🔎 CIRCLE CREATE WALLET RESPONSE:",
      JSON.stringify(walletCreateData)
    );

    if (!walletCreateRes.ok || !walletCreateData.data?.challengeId) {
      return res.status(400).json({
        error:
          walletCreateData.message ||
          walletCreateData.error ||
          "Failed to create wallet challenge"
      });
    }

    return res.status(200).json({
      needsWalletCreation: true,
      challengeId: walletCreateData.data.challengeId,
      userToken: freshUserToken,
      encryptionKey: freshEncryptionKey
    });
  }

  // Second call: wallet-creation challenge was executed.
  // Give Circle a few seconds to make the wallet visible.
  let attempts = 0;

  while (!wallet && attempts < 6) {
    attempts++;

    await new Promise(resolve => setTimeout(resolve, 2500));

    wallet = await getWallet(freshUserToken);

    console.log(
      "🔎 WALLET CHECK AFTER CREATION:",
      attempts,
      wallet ? "FOUND" : "NOT FOUND"
    );
  }

  if (!wallet) {
    return res.status(400).json({
      error:
        "Wallet creation challenge completed, but the wallet is not available yet. Please try again."
    });
  }
}

// Wallet exists → continue to contract execution

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
