import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

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

let walletProvisioningInProgress = false;
let walletReady = false;


/* =========================================================
   LOGGING
========================================================= */

function log(...args) {
  console.log("[LifeLink / Circle]", ...args);
}


/* =========================================================
   COOKIE HELPERS
========================================================= */

function getCookie(name) {
  const prefix = `${name}=`;

  const item = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  return item
    ? decodeURIComponent(item.slice(prefix.length))
    : "";
}


function setCookie(
  name,
  value,
  maxAge = 2592000
) {
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
  setCookie(
    "google.clientId",
    googleClientId
  );

  setCookie(
    "deviceToken",
    deviceToken
  );

  setCookie(
    "deviceEncryptionKey",
    deviceEncryptionKey
  );
}


/* =========================================================
   UI HELPERS
========================================================= */

function getWalletAddressElement() {
  return document.getElementById(
    "walletAddress"
  );
}


function getGoogleButton() {
  return document.getElementById(
    "googleLoginBtn"
  );
}


function getConnectButton() {
  return document.getElementById(
    "connectBtn"
  );
}


function setWalletStatus(message, color = "#ffffff") {
  const element =
    getWalletAddressElement();

  if (!element) return;

  element.innerText = message;
  element.style.color = color;
}


function setGoogleButtonState(
  text,
  disabled = false,
  background = ""
) {
  const button =
    getGoogleButton();

  if (!button) return;

  button.innerText = text;
  button.disabled = disabled;

  if (background) {
    button.style.background =
      background;
  }
}


function shortAddress(address) {
  if (!address) {
    return "";
  }

  if (address.length <= 14) {
    return address;
  }

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(
      address.length - 6
    )
  );
}


/* =========================================================
   CIRCLE API
========================================================= */

async function callCircleApi(body) {
  log("📡 API request:", body.action);

  const response = await fetch(
    "/api/circle",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      error:
        "Circle API returned invalid JSON",
    };
  }

  if (!response.ok) {
    const error = new Error(
      data?.error ||
        data?.message ||
        `Circle API failed (${response.status})`
    );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  log(
    "✅ API success:",
    body.action,
    data
  );

  return data;
}


/* =========================================================
   CIRCLE ERROR HELPER
========================================================= */

function describeCircleError(error) {
  if (!error) {
    return "Unknown Circle error";
  }

  const code =
    error?.data?.code ||
    error?.code ||
    "";

  const message =
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    "Unknown Circle error";

  if (code) {
    return `${message} (Circle code: ${code})`;
  }

  return message;
}


/* =========================================================
   LOAD CIRCLE WALLETS
========================================================= */

async function loadCircleWallets() {
  const token =
    userToken ||
    loginResult?.userToken ||
    localStorage.getItem(
      "circleUserToken"
    ) ||
    "";

  if (!token) {
    throw new Error(
      "Circle userToken is missing"
    );
  }

  log("💰 Loading Circle wallets...");

  const data =
    await callCircleApi({
      action: "listWallets",
      userToken: token,
    });

  const wallets =
    data?.wallets ||
    data?.data?.wallets ||
    [];

  window.circleWallets =
    wallets;

  log(
    "💰 Circle wallets:",
    wallets
  );

  if (!wallets.length) {
    log(
      "⚠️ Circle returned zero wallets"
    );

    return [];
  }

  /*
   * We use the first wallet returned by Circle.
   * Later we can add support for multiple wallets.
   */
  const wallet =
    wallets[0];

  window.circleWallet =
    wallet;

  walletReady = true;

  const address =
    wallet?.address ||
    wallet?.walletAddress ||
    "";

  const walletId =
    wallet?.id ||
    wallet?.walletId ||
    "";

  const blockchain =
    wallet?.blockchain ||
    wallet?.blockchains?.[0] ||
    "ARC-TESTNET";

  log(
    "✅ Circle wallet ready:",
    {
      walletId,
      address,
      blockchain,
    }
  );

  if (address) {
    setWalletStatus(
      `Circle Wallet: ${shortAddress(address)}`,
      "#4ade80"
    );
  } else {
    setWalletStatus(
      "Circle Wallet Connected",
      "#4ade80"
    );
  }

  setGoogleButtonState(
    "✅ Google Wallet Connected",
    true,
    "#16a34a"
  );

  /*
   * Keep MetaMask button available for now.
   * We will integrate Circle with the existing
   * blockchain transaction layer in the next step.
   */

  /*
   * Notify the rest of LifeLink.
   */
  window.dispatchEvent(
    new CustomEvent(
      "circleWalletReady",
      {
        detail: {
          wallet,
          wallets,
          walletId,
          address,
          blockchain,
        },
      }
    )
  );

  return wallets;
}


/* =========================================================
   EXECUTE CIRCLE CHALLENGE
========================================================= */

async function executeWalletChallenge(
  challengeId
) {
  if (!challengeId) {
    throw new Error(
      "Circle did not return a challenge ID"
    );
  }

  if (!circleSdk) {
    throw new Error(
      "Circle SDK is not initialized"
    );
  }

  if (
    !userToken ||
    !encryptionKey
  ) {
    throw new Error(
      "Circle authentication credentials are missing"
    );
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log(
    "🔐 Executing Circle challenge:",
    challengeId
  );

  setWalletStatus(
    "Creating your Circle wallet...",
    "#facc15"
  );

  setGoogleButtonState(
    "Creating Circle Wallet...",
    true,
    "#7c3aed"
  );

  return new Promise(
    (resolve, reject) => {
      circleSdk.execute(
        challengeId,
        async (
          error,
          result
        ) => {
          if (error) {
            console.error(
              "❌ Circle challenge failed:",
              error
            );

            reject(error);
            return;
          }

          log(
            "🎉 Circle challenge completed:",
            result
          );

          /*
           * Circle may need a short moment before
           * the wallet becomes visible through the
           * wallet-list endpoint.
           */
          await new Promise(
            (resolveDelay) =>
              setTimeout(
                resolveDelay,
                2000
              )
          );

          try {
            const wallets =
              await loadCircleWallets();

            if (!wallets.length) {
              throw new Error(
                "Circle challenge completed, but no wallet was returned."
              );
            }

            resolve({
              result,
              wallets,
            });
          } catch (walletError) {
            reject(walletError);
          }
        }
      );
    }
  );
}


/* =========================================================
   INITIALIZE OR CREATE WALLET
========================================================= */

async function initializeOrCreateWallet() {
  if (walletProvisioningInProgress) {
    log(
      "⏳ Wallet provisioning already running"
    );

    return;
  }

  if (
    !userToken ||
    !encryptionKey
  ) {
    throw new Error(
      "Circle authentication is incomplete"
    );
  }

  walletProvisioningInProgress =
    true;

  try {
    circleSdk.setAuthentication({
      userToken,
      encryptionKey,
    });

    /*
     * FIRST:
     * Check whether a wallet already exists.
     *
     * This prevents unnecessary wallet creation
     * when an existing user logs in again.
     */
    log(
      "🔎 Checking for existing Circle wallet..."
    );

    const existingWallets =
      await loadCircleWallets();

    if (existingWallets.length) {
      log(
        "✅ Existing Circle wallet found"
      );

      return existingWallets;
    }


    /*
     * SECOND:
     * Initialize the Circle user.
     */
    log(
      "🔵 Initializing Circle user..."
    );

    setWalletStatus(
      "Setting up your Circle account...",
      "#facc15"
    );

    const initData =
      await callCircleApi({
        action:
          "initializeUser",
        userToken,
      });

    const initChallengeId =
      initData?.challengeId ||
      initData?.data?.challengeId ||
      "";

    /*
     * New Circle user.
     */
    if (initChallengeId) {
      log(
        "🟢 Circle user initialization challenge received:",
        initChallengeId
      );

      await executeWalletChallenge(
        initChallengeId
      );

      return window.circleWallets;
    }


    /*
     * If initialization returned no challenge,
     * check wallets again.
     */
    log(
      "ℹ️ No initialization challenge returned. Checking wallets..."
    );

    const walletsAfterInit =
      await loadCircleWallets();

    if (walletsAfterInit.length) {
      return walletsAfterInit;
    }

    /*
     * If the Circle user is already initialized
     * but has no wallet, request wallet creation.
     */
    log(
      "🔵 Requesting Circle wallet creation..."
    );

    const walletData =
      await callCircleApi({
        action:
          "createWallet",
        userToken,
      });

    const challengeId =
      walletData?.challengeId ||
      walletData?.data?.challengeId ||
      "";

    if (!challengeId) {
      /*
       * It may already exist.
       */
      const wallets =
        await loadCircleWallets();

      if (wallets.length) {
        return wallets;
      }

      throw new Error(
        "Circle did not return a wallet-creation challenge."
      );
    }

    await executeWalletChallenge(
      challengeId
    );

    return window.circleWallets;

  } catch (error) {

    /*
     * Circle code 155106 is commonly used when
     * the user is already initialized.
     *
     * Try the wallet-creation path.
     */
    const circleCode =
      error?.data?.code ||
      error?.code;

    if (
      String(circleCode) ===
      "155106"
    ) {
      log(
        "ℹ️ Circle user already initialized."
      );

      try {
        const existingWallets =
          await loadCircleWallets();

        if (
          existingWallets.length
        ) {
          return existingWallets;
        }

        log(
          "🔵 Existing Circle user has no wallet. Creating one..."
        );

        const walletData =
          await callCircleApi({
            action:
              "createWallet",
            userToken,
          });

        const challengeId =
          walletData?.challengeId ||
          walletData?.data?.challengeId ||
          "";

        if (!challengeId) {
          const wallets =
            await loadCircleWallets();

          if (wallets.length) {
            return wallets;
          }

          throw new Error(
            "Circle did not return a wallet-creation challenge."
          );
        }

        await executeWalletChallenge(
          challengeId
        );

        return window.circleWallets;

      } catch (walletError) {
        throw walletError;
      }
    }

    throw error;

  } finally {
    walletProvisioningInProgress =
      false;
  }
}


/* =========================================================
   GOOGLE LOGIN CALLBACK
========================================================= */

async function handleGoogleLoginComplete(
  error,
  result
) {
  log(
    "🔔 Circle social-login callback fired"
  );

  console.log(
    "🔎 RAW CIRCLE CALLBACK:",
    {
      error,
      result,
      userToken:
        result?.userToken,
      encryptionKey:
        result?.encryptionKey,
      refreshToken:
        result?.refreshToken,
      oAuthInfo:
        result?.oAuthInfo,
    }
  );

  if (error) {
    console.error(
      "❌ Google/Circle login failed:",
      error
    );

    setWalletStatus(
      `Google login failed: ${describeCircleError(error)}`,
      "#f87171"
    );

    setGoogleButtonState(
      "❌ Google Login Failed",
      false,
      "#dc2626"
    );

    return;
  }

  if (!result) {
    const message =
      "Google login returned no Circle result.";

    console.error(
      "❌",
      message
    );

    setWalletStatus(
      message,
      "#f87171"
    );

    setGoogleButtonState(
      "Continue with Google",
      false
    );

    return;
  }

  loginResult =
    result;

  userToken =
    result.userToken ||
    "";

  encryptionKey =
    result.encryptionKey ||
    "";

  refreshToken =
    result.refreshToken ||
    "";

  if (
    !userToken ||
    !encryptionKey
  ) {
    const message =
      "Google login succeeded, but Circle credentials were not returned.";

    console.error(
      "❌",
      message
    );

    setWalletStatus(
      message,
      "#f87171"
    );

    setGoogleButtonState(
      "Continue with Google",
      false
    );

    return;
  }

  /*
   * Persist Circle credentials.
   */
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

  /*
   * Authenticate Circle SDK.
   */
  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log(
    "✅ Circle SDK authenticated after Google login"
  );

  setWalletStatus(
    "Google connected. Setting up your Circle wallet...",
    "#facc15"
  );

  setGoogleButtonState(
    "Setting Up Wallet...",
    true,
    "#7c3aed"
  );

  try {
    await initializeOrCreateWallet();

    if (
      !window.circleWallets ||
      !window.circleWallets.length
    ) {
      throw new Error(
        "Login completed, but Circle wallet was not found."
      );
    }

    log(
      "🎉 COMPLETE: Google → Circle → Wallet"
    );

  } catch (walletError) {
    console.error(
      "❌ Circle wallet provisioning failed:",
      walletError
    );

    const message =
      describeCircleError(
        walletError
      );

    setWalletStatus(
      `Wallet setup failed: ${message}`,
      "#f87171"
    );

    setGoogleButtonState(
      "Retry Google Wallet",
      false,
      "#dc2626"
    );

  }
}


/* =========================================================
   INITIALIZE CIRCLE
========================================================= */

async function initializeCircle() {
  try {
    log(
      "🔵 Starting Circle initialization..."
    );

    if (!appId) {
      throw new Error(
        "VITE_CIRCLE_APP_ID is missing"
      );
    }

    if (!googleClientId) {
      throw new Error(
        "VITE_GOOGLE_CLIENT_ID is missing"
      );
    }

    log(
      "✅ Circle App ID found"
    );

    log(
      "✅ Google Client ID found"
    );


    /*
     * Restore device state.
     */
    const restoredAppId =
      getCookie("appId") ||
      appId;

    const restoredGoogleClientId =
      getCookie(
        "google.clientId"
      ) ||
      googleClientId;

    deviceToken =
      localStorage.getItem(
        "circleDeviceToken"
      ) ||
      getCookie(
        "deviceToken"
      ) ||
      "";

    deviceEncryptionKey =
      localStorage.getItem(
        "circleDeviceEncryptionKey"
      ) ||
      getCookie(
        "deviceEncryptionKey"
      ) ||
      "";


    /*
     * Circle SDK initial configuration.
     */
    const initialConfig = {
      appSettings: {
        appId:
          restoredAppId,
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId:
            restoredGoogleClientId,

          redirectUri:
            window.location.origin,

          selectAccountPrompt:
            true,
        },
      },
    };


    /*
     * Create Circle SDK.
     */
    circleSdk.updateConfigs(
  {
    ...
  },
  onLoginComplete
);

    window.circleSdk =
      circleSdk;

    log(
      "✅ Circle SDK initialized"
    );


    /*
     * Get Circle device ID.
     */
    const deviceId =
      await circleSdk.getDeviceId();

    log(
      "🆔 Circle Device ID:",
      deviceId
    );


    /*
     * Create Circle device token if necessary.
     */
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
        data?.deviceToken ||
        data?.data?.deviceToken ||
        "";

      deviceEncryptionKey =
        data?.deviceEncryptionKey ||
        data?.data?.deviceEncryptionKey ||
        "";

      if (
        !deviceToken ||
        !deviceEncryptionKey
      ) {
        throw new Error(
          "Circle device-token response is incomplete."
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
     * Update login configuration.
     */
    circleSdk.updateConfigs({
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
});

    log(
      "✅ Circle Google login configured"
    );


    /*
     * Google button.
     */
    const googleButton =
      getGoogleButton();

    if (!googleButton) {
      throw new Error(
        "#googleLoginBtn was not found in index.html"
      );
    }

    googleButton.disabled =
      false;


    /*
     * Prevent duplicate listeners.
     */
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
      .circ
