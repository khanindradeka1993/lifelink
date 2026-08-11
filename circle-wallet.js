import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;

let deviceToken =
  localStorage.getItem("circleDeviceToken") || "";
let deviceEncryptionKey =
  localStorage.getItem("circleDeviceEncryptionKey") || "";

let userToken =
  localStorage.getItem("circleUserToken") || "";
let encryptionKey =
  localStorage.getItem("circleEncryptionKey") || "";
let refreshToken =
  localStorage.getItem("circleRefreshToken") || "";

function log(...args) {
  console.log(...args);
}

function getCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  return item
    ? decodeURIComponent(item.slice(prefix.length))
    : "";
}

function setCookie(name, value, maxAge = 2592000) {
  if (!value) return;

  const secure =
    window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

function persistOAuthConfig() {
  setCookie("appId", appId);
  setCookie("google.clientId", googleClientId);
  setCookie("deviceToken", deviceToken);
  setCookie("deviceEncryptionKey", deviceEncryptionKey);
}

async function callCircleApi(body) {
  const response = await fetch("/api/circle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error ||
        data.message ||
        `Circle API failed (${response.status})`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function loadCircleWallets() {
  const token =
    userToken ||
    loginResult?.userToken ||
    localStorage.getItem("circleUserToken") ||
    "";

  if (!token) {
    console.error(
      "❌ Cannot load wallets: userToken missing"
    );
    return [];
  }

  try {
    const data = await callCircleApi({
      action: "listWallets",
      userToken: token,
    });

    const wallets =
      data.wallets ||
      data.data?.wallets ||
      [];

    window.circleWallets = wallets;

    log("💰 Circle wallets loaded:", wallets);

    return wallets;
  } catch (error) {
    console.error(
      "❌ Failed to load Circle wallets:",
      error
    );
    return [];
  }
}

async function executeWalletChallenge(challengeId) {
  if (!challengeId) {
    throw new Error(
      "Circle did not return a challenge ID"
    );
  }

  if (!circleSdk || !userToken || !encryptionKey) {
    throw new Error(
      "Circle SDK authentication is unavailable"
    );
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log("🆔 Challenge ID:", challengeId);

  return new Promise((resolve, reject) => {
    circleSdk.execute(
      challengeId,
      async (error, result) => {
        if (error) {
          console.error(
            "❌ Circle wallet challenge failed:",
            error
          );
          reject(error);
          return;
        }

        log(
          "🎉 Circle wallet challenge completed:",
          result
        );

        // Give Circle a moment to make the new wallet
        // visible to the wallet-list endpoint.
        await new Promise((r) =>
          setTimeout(r, 2000)
        );

        await loadCircleWallets();

        resolve(result);
      }
    );
  });
}

async function initializeOrCreateWallet() {
  if (!userToken || !encryptionKey) {
    console.error(
      "❌ Circle authentication is incomplete"
    );
    return;
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  try {
    log("🔵 Initializing Circle user...");

    const initData = await callCircleApi({
      action: "initializeUser",
      userToken,
    });

    const initChallengeId =
      initData.challengeId ||
      initData.data?.challengeId;

    if (initChallengeId) {
      log("🟢 Circle user initialized");
      await executeWalletChallenge(
        initChallengeId
      );
      return;
    }

    await loadCircleWallets();
  } catch (error) {
    /*
     * Circle returns 155106 when this user has already
     * been initialized. In that case we must request a
     * wallet-creation challenge instead of stopping.
     */
    if (
      error?.data?.code === 155106 ||
      error?.status === 155106
    ) {
      log(
        "ℹ️ Circle user already initialized; requesting wallet creation..."
      );

      try {
        const walletData =
          await callCircleApi({
            action: "createWallet",
            userToken,
          });

        const challengeId =
          walletData.challengeId ||
          walletData.data?.challengeId;

        if (!challengeId) {
          // A wallet may already exist.
          await loadCircleWallets();
          return;
        }

        await executeWalletChallenge(
          challengeId
        );
        return;
      } catch (walletError) {
        /*
         * If Circle says the wallet already exists,
         * just load the existing wallet(s).
         */
        if (
          walletError?.data?.code === 155106
        ) {
          await loadCircleWallets();
          return;
        }

        console.error(
          "❌ Circle wallet creation request failed:",
          walletError
        );
        return;
      }
    }

    console.error(
      "❌ Circle user initialization failed:",
      error
    );
  }
}

async function initializeCircle() {
  try {
    log("🔵 Starting Circle initialization...");

    if (!appId) {
      console.error(
        "❌ VITE_CIRCLE_APP_ID is missing"
      );
      return;
    }

    if (!googleClientId) {
      console.error(
        "❌ VITE_GOOGLE_CLIENT_ID is missing"
      );
      return;
    }

    log("✅ Circle App ID found");
    log("✅ Google Client ID found");

    const onLoginComplete = async (
      error,
      result
    ) => {
      log(
        "🔔 Circle social-login callback fired"
      );
console.log("🔎 RAW CALLBACK:", {
  error,
  result,
  userToken: result?.userToken,
  encryptionKey: result?.encryptionKey,
  refreshToken: result?.refreshToken,
  oAuthInfo: result?.oAuthInfo
});
      if (error) {
        console.error(
          "❌ Google login failed:",
          error
        );
        return;
      }

      if (!result) {
        console.error(
          "❌ Google login returned no result"
        );
        return;
      }

      log(
        "🟢 Google login successful"
      );
      log(
        "🔐 Circle login result:",
        result
      );

      loginResult = result;

      userToken =
        result.userToken || "";
      encryptionKey =
        result.encryptionKey || "";
      refreshToken =
        result.refreshToken || "";

      if (!userToken || !encryptionKey) {
        console.error(
          "❌ Google login result is missing Circle credentials"
        );
        return;
      }

      localStorage.setItem(
        "circleUserToken",
        userToken
      );

      localStorage.setItem(
        "circleEncryptionKey",
        encryptionKey
      );

      if (refreshToken) {
        localStorage.setItem(
          "circleRefreshToken",
          refreshToken
        );
      }

      circleSdk.setAuthentication({
        userToken,
        encryptionKey,
      });

      log(
        "✅ Circle SDK authenticated after Google login"
      );

      await initializeOrCreateWallet();
    };

    const restoredAppId =
      getCookie("appId") || appId;

    const restoredGoogleClientId =
      getCookie("google.clientId") ||
      googleClientId;

    deviceToken =
      localStorage.getItem(
        "circleDeviceToken"
      ) ||
      getCookie("deviceToken") ||
      "";

    deviceEncryptionKey =
      localStorage.getItem(
        "circleDeviceEncryptionKey"
      ) ||
      getCookie(
        "deviceEncryptionKey"
      ) ||
      "";

    const initialConfig = {
      appSettings: {
        appId: restoredAppId,
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId:
            restoredGoogleClientId,
          redirectUri:
            window.location.origin,
          selectAccountPrompt: true,
        },
      },
    };

    circleSdk = new W3SSdk({
  configs: initialConfig,
  socialLoginCompleteCallback: onLoginComplete,
});

    window.circleSdk = circleSdk;

    log(
      "✅ Circle SDK initialized"
    );

    const deviceId =
      await circleSdk.getDeviceId();

    log(
      "🆔 Circle Device ID:",
      deviceId
    );

    if (
      !deviceToken ||
      !deviceEncryptionKey
    ) {
      log(
        "🔵 Requesting Circle device token..."
      );

      const data =
        await callCircleApi({
          action:
            "createDeviceToken",
          deviceId,
        });

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

      persistOAuthConfig();

      log(
        "✅ Circle device token received"
      );
    } else {
      persistOAuthConfig();

      log(
        "♻️ Restored Circle device login state"
      );
    }

    /*
     * Keep the callback on the SDK instance created
     * above. updateConfigs only updates login settings.
     */
    circleSdk.updateConfigs(
      {
        appSettings: {
          appId,
        },

        loginConfigs: {
          deviceToken,
          deviceEncryptionKey,

          google: {
            clientId:
              googleClientId,
            redirectUri:
              window.location.origin,
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
        .circleListenerAttached ===
      "true"
    ) {
      log(
        "ℹ️ Google listener already attached"
      );
      return;
    }

    googleButton.dataset
      .circleListenerAttached =
      "true";

    googleButton.addEventListener(
      "click",
      async (event) => {
        event.preventDefault();
        event.stopPropagation();

        log(
          "🔵 GOOGLE BUTTON CLICKED"
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

          persistOAuthConfig();

          circleSdk.updateConfigs(
            {
              appSettings: {
                appId,
              },

              loginConfigs: {
                deviceToken,
                deviceEncryptionKey,

                google: {
                  clientId:
                    googleClientId,
                  redirectUri:
                    window.location.origin,
                  selectAccountPrompt:
                    true,
                },
              },
            },
            onLoginComplete
          );

          log(
            "🔵 Starting Google login..."
          );

          await circleSdk.performLogin(
            SocialLoginProvider.GOOGLE
          );

          log(
            "🟢 performLogin() returned"
          );
        } catch (error) {
          console.error(
            "❌ performLogin ERROR:",
            error
          );
        }
      },
      true
    );

    log(
      "🎉 Continue with Google button connected"
    );
  } catch (error) {
    console.error(
      "❌ Circle initialization failed:",
      error
    );
  }
}

window.circleSdk = null;
window.circleWallets = [];

window.getCircleUserToken = () =>
  userToken ||
  localStorage.getItem(
    "circleUserToken"
  ) ||
  "";

window.getCircleEncryptionKey = () =>
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
    { once: true }
  );
} else {
  initializeCircle();
      }

      
