const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;

async function initializeCircle() {
  try {
    console.log("🔵 Starting Circle initialization...");

    if (!appId) {
      console.error("❌ VITE_CIRCLE_APP_ID is missing");
      return;
    }

    if (!googleClientId) {
      console.error("❌ VITE_GOOGLE_CLIENT_ID is missing");
      return;
    }

    // Load Circle Web SDK
    const { W3SSdk } =
      await import("@circle-fin/w3s-pw-web-sdk");

    // Login callback
    const onLoginComplete = async (error, result) => {
      if (error) {
        console.error("❌ Google login failed:", error);
        alert("Google login failed");
        return;
      }

      console.log("✅ Google login successful");

      loginResult = result;

      // Keep credentials locally for this browser
      localStorage.setItem(
        "circleUserToken",
        result.userToken
      );

      localStorage.setItem(
        "circleEncryptionKey",
        result.encryptionKey
      );

      console.log("✅ Circle user credentials received");

      await initializeCircleUser();
    };

    // Create SDK
    circleSdk = new W3SSdk(
      {
        appSettings: {
          appId: appId
        },
        loginConfigs: {
          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true
          }
        }
      },
      onLoginComplete
    );

    window.circleSdk = circleSdk;

    console.log("✅ Circle SDK initialized");

    // Get device ID
    const deviceId = await circleSdk.getDeviceId();

    console.log("✅ Circle Device ID:", deviceId);

    // Ask our backend for Circle device token
    const response = await fetch("/api/circle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "createDeviceToken",
        deviceId: deviceId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Failed to create Circle device token"
      );
    }

    const deviceToken =
      data.deviceToken ||
      data.data?.deviceToken;

    const deviceEncryptionKey =
      data.deviceEncryptionKey ||
      data.data?.deviceEncryptionKey;

    if (!deviceToken || !deviceEncryptionKey) {
      throw new Error(
        "Circle device token response is incomplete"
      );
    }

    console.log("✅ Circle device token received");

    // Configure Google login
    circleSdk.updateConfigs(
      {
        appSettings: {
          appId: appId
        },
        loginConfigs: {
          deviceToken: deviceToken,
          deviceEncryptionKey: deviceEncryptionKey,
          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true
          }
        }
      },
      onLoginComplete
    );

    console.log("✅ Circle Google login configured");

    // Connect our existing Google button
    const googleButton =
      document.getElementById("googleLoginBtn");

    if (googleButton) {
      googleButton.disabled = false;

      googleButton.addEventListener("click", () => {
        console.log("🔵 Starting Google login...");

        circleSdk.performLogin("GOOGLE");
      });

      console.log("✅ Continue with Google button connected");
    } else {
      console.warn(
        "⚠️ googleLoginBtn was not found"
      );
    }

  } catch (error) {
    console.error(
      "❌ Circle initialization failed:",
      error
    );
  }
}


// Initialize Circle user and create wallet
async function initializeCircleUser() {
  try {
    if (!loginResult?.userToken) {
      console.error("❌ Circle userToken missing");
      return;
    }

    console.log(
      "🔵 Initializing Circle user on Arc Testnet..."
    );

    const response = await fetch("/api/circle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "initializeUser",
        userToken: loginResult.userToken
      })
    });

    const data = await response.json();

    // User already initialized
    if (!response.ok) {
      if (data.code === 155106) {
        console.log(
          "✅ Circle user already initialized"
        );

        await loadCircleWallets();
        return;
      }

      throw new Error(
        data.error ||
        data.message ||
        "Circle user initialization failed"
      );
    }

    const challengeId =
      data.challengeId ||
      data.data?.challengeId;

    if (!challengeId) {
      throw new Error(
        "Circle did not return a challenge ID"
      );
    }

    console.log(
      "✅ Circle user initialized"
    );

    console.log(
      "🔵 Challenge ID:",
      challengeId
    );

    // Authenticate SDK
    circleSdk.setAuthentication({
      userToken: loginResult.userToken,
      encryptionKey: loginResult.encryptionKey
    });

    // Execute wallet creation challenge
    circleSdk.execute(
      challengeId,
      async (error, result) => {

        if (error) {
          console.error(
            "❌ Circle wallet creation failed:",
            error
          );
          return;
        }

        console.log(
          "🎉 Circle wallet created successfully!",
          result
        );

        await loadCircleWallets();
      }
    );

  } catch (error) {
    console.error(
      "❌ Circle user initialization failed:",
      error
    );
  }
}


// Load Circle wallets
async function loadCircleWallets() {
  try {
    if (!loginResult?.userToken) {
      return;
    }

    console.log("🔵 Loading Circle wallet...");

    const response = await fetch("/api/circle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "listWallets",
        userToken: loginResult.userToken
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "❌ Failed to load Circle wallet:",
        data
      );
      return;
    }

    const wallets =
      data.wallets ||
      data.data?.wallets ||
      [];

    if (wallets.length === 0) {
      console.log("⚠️ No Circle wallet found yet");
      return;
    }

    const wallet = wallets[0];

    console.log(
      "🎉 Circle Wallet Address:",
      wallet.address
    );

    console.log(
      "🌐 Blockchain:",
      wallet.blockchain
    );

    // Make wallet available to LifeLink
    window.circleWallet = wallet;

    // Update LifeLink UI if desired
    const walletAddress =
      document.getElementById("walletAddress");

    if (walletAddress) {
      walletAddress.innerText =
        "Circle Wallet: " +
        wallet.address.substring(0, 6) +
        "..." +
        wallet.address.substring(
          wallet.address.length - 4
        );
    }

  } catch (error) {
    console.error(
      "❌ Error loading Circle wallet:",
      error
    );
  }
}


// Start Circle
initializeCircle();
