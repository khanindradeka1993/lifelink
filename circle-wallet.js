import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;

let deviceToken = localStorage.getItem("circleDeviceToken") || "";
let deviceEncryptionKey =
  localStorage.getItem("circleDeviceEncryptionKey") || "";

let userToken = localStorage.getItem("circleUserToken") || "";
let encryptionKey = localStorage.getItem("circleEncryptionKey") || "";
let refreshToken = localStorage.getItem("circleRefreshToken") || "";

function log(...args) {
  console.log(...args);
}

async function initializeCircle() {
  try {
    log("🔵 Starting Circle initialization...");

    if (!appId) {
      console.error("❌ VITE_CIRCLE_APP_ID is missing");
      return;
    }

    if (!googleClientId) {
      console.error("❌ VITE_GOOGLE_CLIENT_ID is missing");
      return;
    }

    log("✅ Circle App ID found");
    log("✅ Google Client ID found");

    const onLoginComplete = async (error, result) => {
      log("🔔 Circle social-login callback fired");

      if (error) {
        console.error("❌ Google login failed:", error);
        return;
      }

      if (!result) {
        console.error("❌ Google login returned no result");
        return;
      }

      log("🟢 Google login successful");
      log("🔐 Circle login result:", result);

      loginResult = result;

      if (result.userToken) {
        userToken = result.userToken;

        localStorage.setItem(
          "circleUserToken",
          userToken
        );
      }

      if (result.encryptionKey) {
        encryptionKey = result.encryptionKey;

        localStorage.setItem(
          "circleEncryptionKey",
          encryptionKey
        );
      }

      if (result.refreshToken) {
        refreshToken = result.refreshToken;

        localStorage.setItem(
          "circleRefreshToken",
          refreshToken
        );
      }

      if (userToken && encryptionKey) {
        circleSdk.setAuthentication({
          userToken,
          encryptionKey,
        });

        log(
          "✅ Circle SDK authenticated after Google login"
        );

        await initializeCircleUser();
      } else {
        console.error(
          "❌ Google login result is missing Circle credentials"
        );
      }
    };

    const initialConfig = {
      appSettings: {
        appId,
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId: googleClientId,
          redirectUri: window.location.origin,
          selectAccountPrompt: true,
        },
      },
    };

    circleSdk = new W3SSdk(
      initialConfig,
      onLoginComplete
    );

    window.circleSdk = circleSdk;

    log("✅ Circle SDK initialized");

    const deviceId =
      await circleSdk.getDeviceId();

    log("🆔 Circle Device ID:", deviceId);

    if (!deviceToken || !deviceEncryptionKey) {
      log("🔵 Requesting Circle device token...");

      const response = await fetch(
        "/api/circle",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "createDeviceToken",
            deviceId,
          }),
        }
      );

      const data = await response.json();

      log(
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

      log(
        "💾 Circle device login state saved"
      );

      log(
        "✅ Circle device token received"
      );
    } else {
      log(
        "♻️ Restored Circle device login state"
      );
    }

    circleSdk.updateConfigs(
      {
        appSettings: {
          appId,
        },

        loginConfigs: {
          deviceToken,
          deviceEncryptionKey,

          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true,
          },
        },
      },

      onLoginComplete
    );

    log(
      "✅ Circle Google login configured"
    );

    const googleButton =
      document.getElementById(
        "googleLoginBtn"
      );

    if (!googleButton) {
      console.error(
        "❌ #googleLoginBtn not found in index.html"
      );

      return;
    }

    googleButton.disabled = false;

    if (
      googleButton.dataset
        .circleListenerAttached === "true"
    ) {
      log(
        "ℹ️ Google listener already attached"
      );

      return;
    }

    googleButton.dataset.circleListenerAttached =
      "true";

    googleButton.addEventListener(
      "click",
      async (event) => {
        event.preventDefault();
        event.stopPropagation();

        log("🔵 GOOGLE BUTTON CLICKED");

        log(
          "🔐 Device token exists:",
          !!deviceToken
        );

        log(
          "🔐 Device encryption key exists:",
          !!deviceEncryptionKey
        );

        try {
          if (
            !deviceToken ||
            !deviceEncryptionKey
          ) {
            throw new Error(
              "Circle device token or encryption key is missing"
            );
          }

          log(
            "🔵 Starting Google login..."
          );

          circleSdk.updateConfigs(
            {
              appSettings: {
                appId,
              },

              loginConfigs: {
                deviceToken,
                deviceEncryptionKey,

                google: {
                  clientId: googleClientId,
                  redirectUri:
                    window.location.origin,
                  selectAccountPrompt: true,
                },
              },
            },

            onLoginComplete
          );

          await circleSdk.performLogin(
            SocialLoginProvider.GOOGLE
          );

          log(
            "🟢 performLogin() returned"
          );

          log(
            "ℹ️ If Google opened, wait for the redirect back to LifeLink."
          );
        } catch (error) {
          console.error(
            "❌ performLogin ERROR:",
            error
          );
        }
      }
    );

    log(
      "🔗 Continue with Google button connected"
    );

    const currentUrl =
      window.location.href;

    log(
      "🌐 Current URL:",
      currentUrl
    );

    if (
      currentUrl.includes("code=") ||
      currentUrl.includes("state=") ||
      currentUrl.includes("error=")
    ) {
      log(
        "🔎 OAuth callback parameters detected in URL"
      );
    } else {
      log(
        "ℹ️ No OAuth query parameters on initial page load"
      );
    }
  } catch (error) {
    console.error(
      "❌ Circle initialization failed:",
      error
    );
  }
}


async function initializeCircleUser() {
  try {
    const token =
      userToken ||
      loginResult?.userToken ||
      localStorage.getItem(
        "circleUserToken"
      );

    const key =
      encryptionKey ||
      loginResult?.encryptionKey ||
      localStorage.getItem(
        "circleEncryptionKey"
      );

    if (!token) {
      console.error(
        "❌ Circle userToken missing"
      );

      return;
    }

    log(
      "🔵 Initializing Circle user..."
    );

    if (circleSdk && key) {
      circleSdk.setAuthentication({
        userToken: token,
        encryptionKey: key,
      });
    }

    const response =
      await fetch(
        "/api/circle",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "initializeUser",
            userToken: token,
          }),
        }
      );

    const data =
      await response.json();

    log(
      "🔵 Initialize user response:",
      data
    );

    if (!response.ok) {

      if (data.code === 155106) {
        log(
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

    log(
      "🟢 Circle user initialized"
    );

    log(
      "🆔 Challenge ID:",
      challengeId
    );

    if (!circleSdk || !key) {
      throw new Error(
        "Circle SDK authentication is not available"
      );
    }

    circleSdk.setAuthentication({
      userToken: token,
      encryptionKey: key,
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

        log(
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


async function loadCircleWallets() {
  try {

    const token =
      userToken ||
      loginResult?.userToken ||
      localStorage.getItem(
        "circleUserToken"
      );

    if (!token) {
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
              "application/json",
          },

          body: JSON.stringify({
            action: "getWallets",
            userToken: token,
          }),
        }
      );

    const data =
      await response.json();

    log(
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

    log(
      "💰 Circle wallets loaded:",
      wallets
    );

    window.circleWallets =
      wallets;

    return wallets;

  } catch (error) {

    console.error(
      "❌ Failed to load Circle wallets:",
      error
    );
  }
}


/*
 * Public helpers
 */

window.circleSdk = null;

window.circleWallets = [];

window.getCircleUserToken =
  () =>
    userToken ||
    localStorage.getItem(
      "circleUserToken"
    ) ||
    "";

window.getCircleEncryptionKey =
  () =>
    encryptionKey ||
    localStorage.getItem(
      "circleEncryptionKey"
    ) ||
    "";


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCircle,
    {
      once: true,
    }
  );

} else {

  initializeCircle();

}
