import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const {
    userToken,
    contractAddress,
    functionSignature,
    args,
    skipSetup
  } = req.body || {};

  const apikey = process.env.CIRCLE_API_KEY;

  if (!apikey) {
    return res.status(500).json({
      error: "CIRCLE_API_KEY is missing in Vercel environment variables."
    });
  }

  if (!userToken || userToken === "undefined") {
    return res.status(400).json({
      error: "Missing or invalid user token. Please sign in again."
    });
  }

  if (!contractAddress || !functionSignature) {
    return res.status(400).json({
      error: "Missing contract address or function signature."
    });
  }

  const circleHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apikey}`,
    "X-User-Token": userToken
  };

  try {

    // =====================================================
    // 1. CHECK EXISTING USER-CONTROLLED WALLETS
    // =====================================================

    async function getWallet() {
      const response = await fetch(
        "https://api.circle.com/v1/w3s/wallets",
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apikey}`,
            "X-User-Token": userToken
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Circle wallet lookup failed:", data);

        return null;
      }

      const wallets = data.data?.wallets || [];

      // Prefer Arc Testnet wallet
      const arcWallet = wallets.find(
        wallet => wallet.blockchain === "ARC-TESTNET"
      );

      return arcWallet || wallets[0] || null;
    }

    let wallet = await getWallet();


    // =====================================================
    // 2. FIRST-TIME USER INITIALIZATION
    // =====================================================

    if (!wallet && !skipSetup) {

      console.log("🔵 No Circle wallet found.");
      console.log("🔵 Initializing user on ARC-TESTNET...");

      const initializeResponse = await fetch(
        "https://api.circle.com/v1/w3s/user/initialize",
        {
          method: "POST",
          headers: circleHeaders,
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            accountType: "SCA",
            blockchains: ["ARC-TESTNET"]
          })
        }
      );

      const initializeData =
        await initializeResponse.json();

      console.log(
        "🔵 Circle initialize response:",
        initializeData
      );

      // Circle returns this when the user has already
      // been initialized.
      if (
        !initializeResponse.ok &&
        initializeData.code !== 155106
      ) {
        return res.status(initializeResponse.status).json({
          error:
            initializeData.message ||
            initializeData.error ||
            "Failed to initialize Circle user."
        });
      }

      const challengeId =
        initializeData.data?.challengeId;

      if (challengeId) {
        console.log(
          "🟢 Circle wallet initialization challenge:",
          challengeId
        );

        return res.status(200).json({
          needsWalletSetup: true,
          challengeId,
          userToken
        });
      }

      // If already initialized, check wallets again.
      wallet = await getWallet();
    }


    // =====================================================
    // 3. IF USER IS ALREADY INITIALIZED BUT WALLET IS
    //    STILL MISSING, CREATE AN ARC TESTNET WALLET
    // =====================================================

    if (!wallet && !skipSetup) {

      console.log(
        "🔵 User already initialized but no wallet found."
      );

      const walletResponse = await fetch(
        "https://api.circle.com/v1/w3s/user/wallets",
        {
          method: "POST",
          headers: circleHeaders,
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            blockchains: ["ARC-TESTNET"],
            accountType: "SCA"
          })
        }
      );

      const walletData =
        await walletResponse.json();

      console.log(
        "🔵 Circle wallet creation response:",
        walletData
      );

      if (!walletResponse.ok) {
        return res.status(walletResponse.status).json({
          error:
            walletData.message ||
            walletData.error ||
            "Failed to create Circle wallet."
        });
      }

      const walletChallengeId =
        walletData.data?.challengeId;

      if (walletChallengeId) {
        console.log(
          "🟢 Circle wallet creation challenge:",
          walletChallengeId
        );

        return res.status(200).json({
          needsWalletSetup: true,
          challengeId: walletChallengeId,
          userToken
        });
      }
    }


    // =====================================================
    // 4. IF SETUP WAS COMPLETED, FIND THE WALLET AGAIN
    // =====================================================

    if (!wallet) {

      for (let attempt = 1; attempt <= 8; attempt++) {

        await new Promise(resolve =>
          setTimeout(resolve, 2000)
        );

        wallet = await getWallet();

        if (wallet) {
          console.log(
            "🟢 Circle wallet found:",
            wallet.address
          );

          break;
        }

        console.log(
          `⏳ Waiting for Circle wallet... attempt ${attempt}/8`
        );
      }
    }


    // =====================================================
    // 5. WALLET STILL NOT FOUND
    // =====================================================

    if (!wallet) {

      return res.status(400).json({
        error:
          "Circle wallet was not found after setup. Please complete the Circle wallet setup and try again."
      });
    }


    // =====================================================
    // 6. MAKE SURE WE ARE USING ARC TESTNET
    // =====================================================

    if (
      wallet.blockchain &&
      wallet.blockchain !== "ARC-TESTNET"
    ) {

      return res.status(400).json({
        error:
          `Circle wallet is on ${wallet.blockchain}, but LifeLink requires ARC-TESTNET.`
      });
    }


    console.log("=================================");
    console.log("🟢 Circle wallet ready");
    console.log("🆔 Wallet ID:", wallet.id);
    console.log("📍 Wallet address:", wallet.address);
    console.log("⛓️ Blockchain:", wallet.blockchain);
    console.log("=================================");


    // =====================================================
    // 7. CREATE CONTRACT EXECUTION CHALLENGE
    // =====================================================

    const transactionResponse = await fetch(
      "https://api.circle.com/v1/w3s/user/transactions/contractExecution",
      {
        method: "POST",
        headers: circleHeaders,
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),

          walletId: wallet.id,

          contractAddress,

          abiFunctionSignature:
            functionSignature,

          abiParameters:
            Array.isArray(args) ? args : [],

          feeLevel: "MEDIUM"
        })
      }
    );

    const transactionData =
      await transactionResponse.json();

    console.log(
      "🔵 Circle transaction response:",
      transactionData
    );


    // =====================================================
    // 8. TRANSACTION CHALLENGE FAILED
    // =====================================================

    if (
      !transactionResponse.ok ||
      !transactionData.data?.challengeId
    ) {

      return res.status(
        transactionResponse.status || 400
      ).json({
        error:
          transactionData.message ||
          transactionData.error ||
          "Failed to create Circle transaction challenge."
      });
    }


    // =====================================================
    // 9. RETURN CHALLENGE TO FRONTEND
    // =====================================================

    return res.status(200).json({

      success: true,

      challengeId:
        transactionData.data.challengeId,

      walletId:
        wallet.id,

      walletAddress:
        wallet.address,

      blockchain:
        wallet.blockchain,

      userToken
    });


  } catch (error) {

    console.error(
      "❌ Execute Circle transaction error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Internal server error."
    });
  }
}
