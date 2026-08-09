import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;
let deviceToken = localStorage.getItem("circleDeviceToken");
let deviceEncryptionKey = localStorage.getItem("circleDeviceEncryptionKey");


// ==========================================
// CIRCLE INITIALIZATION
// ==========================================

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

    console.log("✅ Circle App ID found");
    console.log("✅ Google Client ID found");


    // ------------------------------------------
    // Google login callback
    // ------------------------------------------

    const onLoginComplete = async (error, result) => {

      if (error) {
        console.error("❌ Google login failed:", error);
        alert("Google login failed");
        return;
      }

      console.log("🎉 Google login successful!");

      loginResult = result;

      localStorage.setItem(
        "circleUserToken",
        result.userToken
      );

      localStorage.setItem(
        "circleEncryptionKey",
        result.encryptionKey
      );

      console.log("✅ Circle credentials received");

circleSdk.setAuthentication({
  userToken: result.userToken,
  encryptionKey: result.encryptionKey
});

console.log("✅ Circle SDK authenticated");

await initializeCircleUser();
    };


    // ------------------------------------------
    // Create Circle SDK
    // ------------------------------------------

    circleSdk = new W3SSdk(
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


    window.circleSdk = circleSdk;

    console.log("✅ Circle SDK initialized");


    // ------------------------------------------
    // Get Device ID
    // ------------------------------------------

    const deviceId = await circleSdk.getDeviceId();

    console.log("✅ Circle Device ID:", deviceId);


    // ------------------------------------------
    // Ask backend for device token
    // ------------------------------------------

    console.log("🔵 Requesting Circle device token...");

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

    console.log("🔵 Device token response:", data);


    if (!response.ok) {

      throw new Error(
        data.error ||
        data.message ||
        "Failed to create Circle device token"
      );

    }


    deviceToken =
  data.deviceToken ||
  data.data?.deviceToken;

deviceEncryptionKey =
  data.deviceEncryptionKey ||
  data.data?.deviceEncryptionKey;

localStorage.setItem(
  "circleDeviceToken",
  deviceToken
);

localStorage.setItem(
  "circleDeviceEncryptionKey",
  deviceEncryptionKey
);


    if (!deviceToken || !deviceEncryptionKey) {

      throw new Error(
        "Circle device token response is incomplete"
      );

    }


    console.log("✅ Circle device token received");


    // ------------------------------------------
    // Configure Circle Google login
    // ------------------------------------------

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


    // ------------------------------------------
    // Connect Google button
    // ------------------------------------------

    const googleButton =
      document.getElementById("googleLoginBtn");


    if (!googleButton) {

      console.error(
        "❌ googleLoginBtn not found in index.html"
      );

      return;

    }


    googleButton.disabled = false;


    googleButton.addEventListener(
  "click",
  async (event) => {

    event.preventDefault();
    event.stopPropagation();

    console.log("🔵 GOOGLE BUTTON CLICKED");

    try {
      console.log("🔵 Starting Google login...");

      await circleSdk.performLogin(
        SocialLoginProvider.GOOGLE
      );

      console.log("🟢 Google login flow started");

    } catch (error) {

      console.error(
        "❌ Google performLogin failed:",
        error
      );

    }
  },
  true
);


    console.log(
      "🎉 Continue with Google button connected"
    );


  } catch (error) {

    console.error(
      "❌ Circle initialization failed:",
      error
    );

  }
}



// ==========================================
// INITIALIZE CIRCLE USER
// ==========================================

async function initializeCircleUser() {

  try {

    if (!loginResult?.userToken) {

      console.error(
        "❌ Circle userToken missing"
      );

      return;

    }


    console.log(
      "🔵 Initializing Circle user on Arc Testnet..."
    );


    const response = await fetch(
      "/api/circle",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          action: "initializeUser",

          userToken: loginResult.userToken

        })

      }
    );


    const data = await response.json();


    console.log(
      "🔵 Initialize user response:",
      data
    );


    // ------------------------------------------
    // User already initialized
    // ------------------------------------------

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


    // ------------------------------------------
    // Authenticate SDK
    // ------------------------------------------

    circleSdk.setAuthentication({

      userToken:
        loginResult.userToken,

      encryptionKey:
        loginResult.encryptionKey

    });


    console.log(
      "✅ Circle SDK authenticated"
    );


    // ------------------------------------------
    // Execute wallet creation challenge
    // ------------------------------------------

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
          "🎉 Circle wallet challenge completed!",
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



// ==========================================
// LOAD CIRCLE WALLETS
// ==========================================

async function loadCircleWallets() {

  try {

    if (!loginResult?.userToken) {

      console.error(
        "❌ Circle userToken missing"
      );

      return;

    }


    console.log(
      "🔵 Loading Circle wallet..."
    );


    const response = await fetch(
      "/api/circle",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          action: "listWallets",

          userToken:
            loginResult.userToken

        })

      }
    );


    const data = await response.json();


    console.log(
      "🔵 Wallet response:",
      data
    );


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

      console.log(
        "⚠️ No Circle wallet found yet"
      );

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


    // Make Circle wallet available
    // to the rest of LifeLink

    window.circleWallet = wallet;


    // ------------------------------------------
    // Update LifeLink UI
    // ------------------------------------------

    const walletAddress =
      document.getElementById(
        "walletAddress"
      );


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



// ==========================================
// START
// ==========================================

initializeCircle();
