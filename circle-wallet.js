import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId =
  import.meta.env.VITE_CIRCLE_APP_ID;

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;

let userToken =
  localStorage.getItem(
    "circleUserToken"
  ) || "";

let encryptionKey =
  localStorage.getItem(
    "circleEncryptionKey"
  ) || "";

let deviceToken =
  localStorage.getItem(
    "circleDeviceToken"
  ) || "";

let deviceEncryptionKey =
  localStorage.getItem(
    "circleDeviceEncryptionKey"
  ) || "";

window.circleSdk = null;
window.circleWallets = [];
window.circleWallet = null;
window.circleWalletAddress = "";


/* =========================================================
   LOGGING
   ========================================================= */

function log(...args) {
  console.log("[LifeLink/Circle]", ...args);
}


/* =========================================================
   COOKIE HELPERS
   ========================================================= */

function getCookie(name) {
  const prefix = `${name}=`;

  const item = document.cookie
    .split("; ")
    .find((row) =>
      row.startsWith(prefix)
    );

  if (!item) {
    return "";
  }

  return decodeURIComponent(
    item.substring(prefix.length)
  );
}


function setCookie(
  name,
  value,
  maxAge = 2592000
) {
  if (!value) {
    return;
  }

  const secure =
    window.location.protocol ===
    "https:"
      ? "; Secure"
      : "";

  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `Max-Age=${maxAge}; ` +
    `Path=/; ` +
    `SameSite=Lax` +
    secure;
}


/* =========================================================
   BACKEND API
   ========================================================= */

async function callCircleApi(body) {
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

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {
      error:
        "Invalid JSON returned by server",
    };
  }

  if (!response.ok) {
    const error = new Error(
      data.error ||
        data.message ||
        `Circle API failed: ${response.status}`
    );

    error.status =
      response.status;

    error.code =
      data.code;

    error.data =
      data;

    throw error;
  }

  return data;
}


/* =========================================================
   SAVE AUTHENTICATION
   ========================================================= */

function saveAuthentication(
  result
) {
  if (!result) {
    throw new Error(
      "Circle login returned no result"
    );
  }

  userToken =
    result.userToken || "";

  encryptionKey =
    result.encryptionKey || "";

  if (!userToken) {
    throw new Error(
      "Circle userToken is missing"
    );
  }

  if (!encryptionKey) {
    throw new Error(
      "Circle encryptionKey is missing"
    );
  }

  localStorage.setItem(
    "circleUserToken",
    userToken
  );

  localStorage.setItem(
    "circleEncryptionKey",
    encryptionKey
  );

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log(
    "✅ Circle authentication saved"
  );
}


/* =========================================================
   LOAD WALLETS
   ========================================================= */

async function loadCircleWallets() {
  if (!userToken) {
    log(
      "⚠️ Cannot load wallets: userToken missing"
    );

    return [];
  }

  try {
    log(
      "🔵 Loading Circle wallets..."
    );

    const data =
      await callCircleApi({
        action: "listWallets",
        userToken,
      });

    const wallets =
      data.wallets ||
      data.data?.wallets ||
      [];

    window.circleWallets =
      wallets;

    log(
      "💰 Wallets:",
      wallets
    );

    if (wallets.length > 0) {
      const wallet =
        wallets[0];

      window.circleWallet =
        wallet;

      const address =
        wallet.address ||
        wallet.walletAddress ||
        wallet.blockchainAddress ||
        "";

      window.circleWalletAddress =
        address;

      log(
        "🎉 Circle wallet address:",
        address
      );

      updateWalletAddressUI(
        address
      );
    } else {
      log(
        "ℹ️ No Circle wallets found"
      );
    }

    return wallets;

  } catch (error) {
    console.error(
      "❌ Failed to load Circle wallets:",
      error
    );

    return [];
  }
}


/* =========================================================
   UPDATE PAGE UI
   ========================================================= */

function updateWalletAddressUI(
  address
) {
  const element =
    document.getElementById(
      "walletAddress"
    );

  if (!element) {
    return;
  }

  if (!address) {
    element.textContent =
      "Wallet not connected";

    return;
  }

  element.textContent =
    `Circle Wallet: ${address}`;
}


/* =========================================================
   EXECUTE WALLET CHALLENGE
   ========================================================= */

function executeWalletChallenge(
  challengeId
) {
  return new Promise(
    (resolve, reject) => {

      if (!circleSdk) {
        reject(
          new Error(
            "Circle SDK is not initialized"
          )
        );

        return;
      }

      if (!userToken) {
        reject(
          new Error(
            "Circle userToken is missing"
          )
        );

        return;
      }

      if (!encryptionKey) {
        reject(
          new Error(
            "Circle encryptionKey is missing"
          )
        );

        return;
      }

      if (!challengeId) {
        reject(
          new Error(
            "Circle challengeId is missing"
          )
        );

        return;
      }

      circleSdk.setAuthentication({
        userToken,
        encryptionKey,
      });

      log(
        "🔐 Executing Circle challenge:",
        challengeId
      );

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
           * Wait briefly for Circle to
           * make the newly created wallet
           * available through listWallets.
           */
          await new Promise(
            (resolveDelay) =>
              setTimeout(
                resolveDelay,
                2000
              )
          );

          const wallets =
            await loadCircleWallets();

          if (
            wallets.length === 0
          ) {
            console.warn(
              "⚠️ Challenge completed but wallet is not visible yet."
            );
          }

          resolve(result);
        }
      );
    }
  );
}


/* =========================================================
   INITIALIZE USER + CREATE WALLET
   ========================================================= */

async function initializeUserAndCreateWallet() {
  if (!userToken) {
    throw new Error(
      "Missing Circle userToken"
    );
  }

  if (!encryptionKey) {
    throw new Error(
      "Missing Circle encryptionKey"
    );
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log(
    "🔵 Initializing Circle user..."
  );

  try {

    const data =
      await callCircleApi({
        action:
          "initializeUser",
        userToken,
      });

    log(
      "🔐 initializeUser response:",
      data
    );

    const challengeId =
      data.challengeId ||
      data.data?.challengeId;

    if (!challengeId) {
      console.warn(
        "⚠️ Circle initialization returned no challengeId"
      );

      const existingWallets =
        await loadCircleWallets();

      if (
        existingWallets.length > 0
      ) {
        log(
          "✅ Existing wallet found"
        );

        return existingWallets;
      }

      console.warn(
        "⚠️ No wallet found"
      );

      return [];
    }

    log(
      "🆔 Wallet creation challenge:",
      challengeId
    );

    await executeWalletChallenge(
      challengeId
    );

    return window.circleWallets;

  } catch (error) {

    const code =
      error?.data?.code ??
      error?.code;

    /*
     * Circle error 155106 means
     * the user is already initialized.
     *
     * In that case we DO NOT create
     * another wallet. We simply load
     * the existing wallet.
     */
    if (
      Number(code) === 155106
    ) {

      log(
        "ℹ️ User already initialized. Loading existing wallet..."
      );

      const wallets =
        await loadCircleWallets();

      if (
        wallets.length > 0
      ) {
        return wallets;
      }

      console.warn(
        "⚠️ User is initialized but no wallet was returned."
      );

      return [];
    }

    throw error;
  }
}


/* =========================================================
   GOOGLE LOGIN CALLBACK
   ========================================================= */

async function onGoogleLoginComplete(
  error,
  result
) {
  log(
    "🔔 Circle social-login callback fired"
  );

  console.log(
    "🔎 Circle login callback:",
    {
      error,
      result,
    }
  );

  if (error) {
    console.error(
      "❌ Google/Circle login failed:",
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

  try {

    log(
      "✅ Google authentication successful"
    );

    log(
      "🔐 Circle credentials received"
    );

    saveAuthentication(
      result
    );

    log(
      "🔵 Starting automatic wallet initialization..."
    );

    const wallets =
      await initializeUserAndCreateWallet();

    if (
      wallets.length > 0
    ) {

      log(
        "🎉 GOOGLE LOGIN + WALLET CREATION COMPLETE"
      );

      log(
        "💰 Wallet:",
        wallets[0]
      );

    } else {

      console.warn(
        "⚠️ Google login succeeded, but no wallet was returned."
      );
    }

  } catch (walletError) {

    console.error(
      "❌ Wallet creation flow failed:",
      walletError
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


    /* -----------------------------------------------------
       RESTORE DEVICE TOKENS
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       INITIAL SDK CONFIG
       ----------------------------------------------------- */

    const initialConfig = {
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
    };


    /* -----------------------------------------------------
       CREATE SDK
       ----------------------------------------------------- */

    circleSdk =
      new W3SSdk(
        initialConfig,
        onGoogleLoginComplete
      );

    window.circleSdk =
      circleSdk;

    log(
      "✅ Circle SDK initialized"
    );


    /* -----------------------------------------------------
       GET DEVICE ID
       ----------------------------------------------------- */

    const deviceId =
      await circleSdk.getDeviceId();

    log(
      "🆔 Circle Device ID:",
      deviceId
    );


    /* -----------------------------------------------------
       CREATE DEVICE TOKEN IF NEEDED
       ----------------------------------------------------- */

    if (
      !deviceToken ||
      !deviceEncryptionKey
    ) {

      log(
        "🔵 Creating Circle device token..."
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

      setCookie(
        "deviceToken",
        deviceToken
      );

      setCookie(
        "deviceEncryptionKey",
        deviceEncryptionKey
      );

      log(
        "✅ Circle device token created"
      );

    } else {

      log(
        "♻️ Restored Circle device login state"
      );
    }


    /* -----------------------------------------------------
       UPDATE SDK WITH DEVICE TOKEN
       ----------------------------------------------------- */

    circleSdk.updateConfigs({
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
    });


    /* -----------------------------------------------------
       RESTORE AUTHENTICATION IF AVAILABLE
       ----------------------------------------------------- */

    if (
      userToken &&
      encryptionKey
    ) {

      try {

        circleSdk.setAuthentication({
          userToken,
          encryptionKey,
        });

        log(
          "♻️ Restored Circle authentication"
        );

        await loadCircleWallets();

      } catch (error) {

        console.warn(
          "⚠️ Could not restore Circle authentication:",
          error
        );
      }
    }


    /* -----------------------------------------------------
       GOOGLE BUTTON
       ----------------------------------------------------- */

    const googleButton =
      document.getElementById(
        "googleLoginBtn"
      );

    if (!googleButton) {
      throw new Error(
        "googleLoginBtn not found"
      );
    }

    if (
      googleButton.dataset
        .circleListenerAttached ===
      "true"
    ) {
      return;
    }

    googleButton.dataset
      .circleListenerAttached =
      "true";

    googleButton.disabled =
      false;


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
              "Circle device token is missing"
            );
          }

          setCookie(
            "appId",
            appId
          );

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


          circleSdk.updateConfigs({
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
          });


          log(
            "🔵 Starting Google login..."
          );

          circleSdk.performLogin(
            SocialLoginProvider.GOOGLE
          );

        } catch (error) {

          console.error(
            "❌ Google login error:",
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


/* =========================================================
   PUBLIC HELPERS
   ========================================================= */

window.getCircleUserToken =
  function () {
    return (
      userToken ||
      localStorage.getItem(
        "circleUserToken"
      ) ||
      ""
    );
  };


window.getCircleEncryptionKey =
  function () {
    return (
      encryptionKey ||
      localStorage.getItem(
        "circleEncryptionKey"
      ) ||
      ""
    );
  };


window.getCircleWallets =
  function () {
    return (
      window.circleWallets ||
      []
    );
  };


window.getCircleWalletAddress =
  function () {
    return (
      window.circleWalletAddress ||
      ""
    );
  };


/* =========================================================
   START
   ========================================================= */

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
