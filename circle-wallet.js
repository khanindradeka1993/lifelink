 import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;
let deviceToken = localStorage.getItem("circleDeviceToken") || "";
let deviceEncryptionKey =
  localStorage.getItem("circleDeviceEncryptionKey") || "";

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

    const onLoginComplete = async (error, result) => {
      if (error) {
        console.error("❌ Google login failed:", error);
        alert("Google login failed");
        return;
      }

      console.log("🎉 Google login successful!");
      console.log("🔐 Circle credentials received");

      loginResult = result;

      if (result?.userToken) {
        localStorage.setItem(
          "circleUserToken",
          result.userToken
        );
      }

      if (result?.encryptionKey) {
        localStorage.setItem(
          "circleEncryptionKey",
          result.encryptionKey
        );
      }

      circleSdk.setAuthentication({
        userToken: result.userToken,
        encryptionKey: result.encryptionKey
      });

      console.log("✅ Circle SDK authenticated");

      await initializeCircleUser();
    };

    circleSdk = new W3SSdk({
      appSettings: {
        appId
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId: googleClientId,
          redirectUri: window.location.origin,
          selectAccountPrompt: true
        }
      },

      socialLoginCompleteCallback: onLoginComplete
    });

    window.circleSdk = circleSdk;

    console.log("✅ Circle SDK initialized");

    const deviceId = await circleSdk.getDeviceId();

    console.log(
      "✅ Circle Device ID:",
      deviceId
    );

    if (!deviceToken || !deviceEncryptionKey) {
      console.log(
        "🔵 Requesting Circle device token..."
      );

      const response = await fetch(
        "/api/circle",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            action: "createDeviceToken",
            deviceId
          })
        }
      );

      const data = await response.json();

      console.log(
        "🔵 Device token response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Failed to create Circle device token"
        );
      }

      deviceToken =
        data.deviceToken ||
        data.data?.deviceToken ||
        "";

      deviceEncryptionKey =
        data.deviceEncryptionKey ||
        data.data?.deviceEncryptionKey ||
        "";

      if (
        !deviceToken ||
        !deviceEncryptionKey
      ) {
        throw new Error(
          "Circle device token response is incomplete"
        );
      }

      localStorage.setItem(
        "circleDeviceToken",
        deviceToken
      );

      localStorage.setItem(
        "circleDeviceEncryptionKey",
        deviceEncryptionKey
      );

      console.log(
        "💾 Circle device login state saved"
      );

      console.log(
        "✅ Circle device token received"
      );

    } else {

      console.log(
        "♻️ Restored Circle device login state"
      );
    }

    circleSdk.updateConfigs(
      {
        appSettings: {
          appId
        },

        loginConfigs: {
          deviceToken,
          deviceEncryptionKey,

          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true
          }
        }
      },

      onLoginComplete
    );

    console.log(
      "✅ Circle Google login configured"
    );

    const googleButton =
      document.getElementById(
        "googleLoginBtn"
      );

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

        console.log(
          "🔵 GOOGLE BUTTON CLICKED"
        );

        console.log(
          "🔵 Device token exists:",
          !!deviceToken
        );

        console.log(
          "🔵 Device encryption key exists:",
          !!deviceEncryptionKey
        );

        try {

          console.log(
            "🔵 Starting Google login..."
          );

          const result =
            await circleSdk.performLogin(
              SocialLoginProvider.GOOGLE
            );

          console.log(
            "🟢 performLogin returned:",
            result
          );

        } catch (error) {

          console.error(
            "🔴 performLogin ERROR:",
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


// ============================================================
// INITIALIZE CIRCLE USER
// ============================================================

async function initializeCircleUser() {

  try {

    const userToken =
      loginResult?.userToken ||
      localStorage.getItem(
        "circleUserToken"
      );

    const encryptionKey =
      loginResult?.encryptionKey ||
      localStorage.getItem(
        "circleEncryptionKey"
      );

    if (!userToken) {

      console.error(
        "❌ Circle userToken missing"
      );

      return;
    }

    console.log(
      "🔵 Initializing Circle user..."
    );

    const response =
      await fetch(
        "/api/circle",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "initializeUser",
            userToken
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "🔵 Initialize user response:",
      data
    );

    if (!response.ok) {

      if (data.code === 155106) {

        console.log(
          "✅ Circle user already initialized"
        );

        circleSdk.setAuthentication({
          userToken,
          encryptionKey
        });

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

    circleSdk.setAuthentication({
      userToken,
      encryptionKey
    });

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
          "🎉 Circle wallet challenge completed:",
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


// ============================================================
// LOAD CIRCLE WALLETS
// ============================================================

async function loadCircleWallets() {

  try {

    const userToken =
      loginResult?.userToken ||
      localStorage.getItem(
        "circleUserToken"
      );

    if (!userToken) {

      console.error(
        "❌ Cannot load wallets: userToken missing"
      );

      return;
    }

    const response =
      await fetch(
        "/api/circle",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            action: "getWallets",
            userToken
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "🔵 Circle wallets response:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data.error ||
        data.message ||
        "Failed to load Circle wallets"
      );
    }

    const wallets =
      data.wallets ||
      data.data?.wallets ||
      [];

    console.log(
      "💰 Circle wallets loaded:",
      wallets
    );

    window.circleWallets =
      wallets;

  } catch (error) {

    console.error(
      "❌ Failed to load Circle wallets:",
      error
    );
  }
}


// ============================================================
// START
// ============================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCircle,
    { once: true }
  );

} else {

  initializeCircle();

}  
