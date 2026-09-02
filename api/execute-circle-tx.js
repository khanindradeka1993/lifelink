import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    action, userToken, userId, contractAddress, functionSignature, args,
    skipSetup, walletCreationComplete, encryptionKey
  } = req.body;

  const apikey = process.env.CIRCLE_API_KEY;

  if (!apikey) {
    return res.status(500).json({
      error: "CIRCLE_API_KEY is missing in Vercel environment variables."
    });
  }

  if (!userToken || userToken === "undefined" || !userId) {
    return res.status(400).json({
      error: "Missing Circle user ID or user token. Please sign in again."
    });
  }

  try {
    let freshUserToken=userToken;
    let freshEncryptionKey=encryptionKey || null;

    try {
      const tokenRes=await fetch("https://api.circle.com/v1/w3s/users/token",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${apikey}`
        },
        body:JSON.stringify({userId})
      });
      const tokenData=await tokenRes.json().catch(()=>({}));
      if(tokenRes.ok && tokenData.data){
        freshUserToken=tokenData.data.userToken || userToken;
        freshEncryptionKey=tokenData.data.encryptionKey || encryptionKey || null;
      }
    }catch(e){
      console.warn("Token refresh warning:",e);
    }

    async function getWallet(token){
      try{
        const walletRes=await fetch("https://api.circle.com/v1/w3s/wallets",{
          headers:{
            "Authorization":`Bearer ${apikey}`,
            "X-User-Token":token
          }
        });
        const raw=await walletRes.text();
        if(!walletRes.ok){
          console.warn("⚠️ Circle wallet lookup failed:",raw);
          return null;
        }
        const data=JSON.parse(raw);
        return data.data?.wallets?.[0] || null;
      }catch(err){
        console.error("❌ CIRCLE WALLET ERROR:",err);
        return null;
      }
    }

    let wallet=await getWallet(freshUserToken);

    if(action==="lookupTransaction"){
      if(!wallet?.id){
        return res.status(400).json({
          error:"Circle wallet not available for transaction lookup."
        });
      }

      for(let attempt=1;attempt<=6;attempt++){
        const params=new URLSearchParams({
          walletIds:wallet.id,
          operation:"CONTRACT_EXECUTION",
          pageSize:"20",
          order:"DESC"
        });
        const txRes=await fetch(
          `https://api.circle.com/v1/w3s/transactions?${params.toString()}`,
          {
            headers:{
              "Authorization":`Bearer ${apikey}`,
              "X-User-Token":freshUserToken
            }
          }
        );
        const data=await txRes.json().catch(()=>({}));
        if(txRes.ok){
          const txs=data.data?.transactions || [];
          const match=txs.find(tx=>
            tx.txHash &&
            tx.contractAddress?.toLowerCase()===contractAddress?.toLowerCase()
          );
          if(match){
            return res.status(200).json({
              transactionHash:match.txHash,
              txHash:match.txHash,
              transaction:match
            });
          }
        }
        await new Promise(r=>setTimeout(r,2000));
      }

      return res.status(404).json({
        error:"Transaction completed, but Circle has not returned the transaction hash yet."
      });
    }

    /*
     * If a wallet already exists, NEVER start PIN setup.
     * PIN setup is only for the initial wallet setup flow.
     */
    if(!wallet){
      if(skipSetup){
        return res.status(400).json({
          error:"Circle wallet could not be found."
        });
      }

      if(!walletCreationComplete){
        const pinRes=await fetch("https://api.circle.com/v1/w3s/user/pin",{
          method:"POST",
          headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${apikey}`,
            "X-User-Token":freshUserToken
          },
          body:JSON.stringify({
            idempotencyKey:crypto.randomUUID()
          })
        });
        const pinData=await pinRes.json().catch(()=>({}));
        const challengeId=pinData.data?.challengeId;

        if(pinRes.ok && challengeId){
          return res.status(200).json({
            needsWalletSetup:true,
            challengeId,
            userToken:freshUserToken,
            encryptionKey:freshEncryptionKey
          });
        }

        return res.status(400).json({
          error:
            pinData.message ||
            pinData.error ||
            "Circle wallet setup could not be started."
        });
      }

      let attempts=0;
      while(!wallet && attempts<8){
        attempts++;
        await new Promise(r=>setTimeout(r,2500));
        wallet=await getWallet(freshUserToken);
      }

      if(!wallet){
        return res.status(400).json({
          error:"Wallet creation completed, but the existing Circle wallet is not available yet. Please wait and try again."
        });
      }
    }

    const txRes=await fetch(
      "https://api.circle.com/v1/w3s/user/transactions/contractExecution",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${apikey}`,
          "X-User-Token":freshUserToken
        },
        body:JSON.stringify({
          idempotencyKey:crypto.randomUUID(),
          walletId:wallet.id,
          contractAddress,
          abiFunctionSignature:functionSignature,
          abiParameters:args || [],
          feeLevel:"MEDIUM"
        })
      }
    );

    const txData=await txRes.json().catch(()=>({}));

    if(!txRes.ok || !txData.data?.challengeId){
      return res.status(400).json({
        error:txData.message || txData.error || "Failed to execute transaction"
      });
    }

    return res.status(200).json({
      challengeId:txData.data.challengeId,
      userToken:freshUserToken,
      encryptionKey:freshEncryptionKey,
      walletId:wallet.id,
      walletAddress:wallet.address || null
    });
  }catch(err){
    console.error("❌ execute-circle-tx error:",err);
    return res.status(500).json({
      error:err.message || "Internal server error"
    });
  }
  }
