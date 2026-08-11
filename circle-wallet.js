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

window.circleSdk = null;
window.circleWallets = [];


/* =========================================================
   LOGGING
   ========================================================= */

function log(...args) {
  console.log(...args);
}


/* =========================================================
   COOKIE HELPERS
   ========================================================= */

function getCookie(name) {
  const prefix = `${name}=`;

  const item = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  if (!item) {
    return "";
  }

  return decodeURIComponent(
    item.slice(prefix.length)
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
    window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `Max-Age=${maxAge}; ` +
    `Path=/; ` +
    `SameSite=Lax` +
    secure;
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
   CIRCLE BACKEND API
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
    const error =
      new Error(
        data.error ||
          data.message ||
          `Circle API failed (${response.status})`
      );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
}


/* =========================================================
   LOAD WALLETS
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
    console.error(
      "❌ Cannot load wallets: userToken missing"
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
        userToken: token,
      });

    const wallets =
      data.wallets ||
      data.data?.wallets ||
      [];

    window.circleWallets =
      wallets;

    log(
      "💰 Circle wallets loaded:",
      wallets
    );

    /*
     * Try to expose the first wallet
     * for the rest of the application.
     */
    if (wallets.length > 0) {
      const wallet =
        wallets[0];

      window.circleWallet =
        wallet;

      log(
        "💰 Circle wallet:",
        wallet
      );

      /*
       * Try common address fields.
       */
      const address =
        wallet.address ||
        wallet.walletAddress ||
        wallet.blockchainAddress ||
        "";

      if (address) {
        window.circleWalletAddress =
          address;

        log(
          "📍 Circle wallet address:",
          address
        );
      }
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

  if (
    !circleSdk ||
    !userToken ||
    !encryptionKey
  ) {
    throw new Error(
      "Circle SDK authentication is unavailable"
    );
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  log(
    "🆔 Circle Challenge ID:",
    challengeId
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

          /*
           * Give Circle a short amount
           * of time to make the wallet
           * visible through the wallet
           * listing endpoint.
           */
          await new Promise(
            (resolveDelay) =>
              setTimeout(
                resolveDelay,
                2000
              )
          );

          await loadCircleWallets();

          resolve(result);
        }
      );
    }
  );
}


/* =========================================================
   INITIALIZE OR CREATE WALLET
   ========================================================= */

async function initializeOrCreateWallet() {

  if (
    !userToken ||
    !encryptionKey
  ) {
    console.error(
      "❌ Circle authentication is incomplete"
    );

    return;
  }

  if (!circleSdk) {
    console.error(
      "❌ Circle SDK is not initialized"
    );

    return;
  }

  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });

  try {

    log(
      "🔵 Initializing Circle user..."
    );

    const initData =
      await callCircleApi({
        action:
          "initializeUser",

        userToken,
      });

    log(
      "🔐 initializeUser response:",
      initData
    );

    const initChallengeId =
      initData.challengeId ||
      initData.data?.challengeId;

    /*
     * New Circle user.
     *
     * Circle gives us a challenge.
     */
    if (initChallengeId) {

      log(
        "🟢 Circle user initialized"
      );

      await executeWalletChallenge(
        initChallengeId
      );

      return;
    }

    /*
     * If no challenge came back,
     * check whether a wallet already
     * exists.
     */
    const existingWallets =
      await loadCircleWallets();

    if (
      existingWallets.length > 0
    ) {
      log(
        "✅ Existing Circle wallet found"
      );

      return;
    }

    /*
     * No wallet found, so ask Circle
     * to create one.
     */
    log(
      "🔵 No Circle wallet found; requesting wallet creation..."
    );

    const walletData =
      await callCircleApi({
        action:
          "createWallet",

        userToken,
      });

    log(
      "🔐 createWallet response:",
      walletData
    );

    const challengeId =
      walletData.challengeId ||
      walletData.data?.challengeId;

    if (challengeId) {

      await executeWalletChallenge(
        challengeId
      );

      return;
    }

    /*
     * Some Circle responses can
     * indicate that the wallet already
     * exists without returning a
     * challenge.
     */
    await loadCircleWallets();

  } catch (error) {

    console.error(
      "❌ Circle initialization failed:",
      error
    );

    const code =
      error?.data?.code ||
      error?.code ||
      error?.status;

    /*
     * 155106 is commonly returned
     * when the user is already
     * initialized.
     *
     * In that case, create the
     * wallet instead.
     */
    if (
      code === 155106
    ) {

      log(
        "ℹ️ Circle user already initialized."
      );

      try {

        const walletData =
          await callCircleApi({
            action:
              "createWallet",

            userToken,
          });

        log(
          "🔐 Existing-user wallet response:",
          walletData
        );

        const challengeId =
          walletData.challengeId ||
          walletData.data?.challengeId;

        if (challengeId) {

          await executeWalletChallenge(
            challengeId
          );

          return;
        }

        await loadCircleWallets();

      } catch (walletError) {

        console.error(
          "❌ Circle wallet creation request failed:",
          walletError
        );

        /*
         * If Circle says it already
         * exists, simply load it.
         */
        const walletCode =
          walletError?.data?.code ||
          walletError?.code ||
          walletError?.status;

        if (
          walletCode === 155106
        ) {
          await loadCircleWallets();
        }
      }

      return;
    }

    /*
     * Always attempt one wallet
     * listing after an initialization
     * failure. This helps when the
     * wallet was actually created
     * but the response was unusual.
     */
    await loadCircleWallets();
  }
}


/* =========================================================
   MAIN CIRCLE INITIALIZATION
   ========================================================= */

async function initializeCircle() {

  try {

    log(
      "🔵 Starting Circle initialization..."
    );

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

    log(
      "✅ Circle App ID found"
    );

    log(
      "✅ Google Client ID found"
    );


    /* =====================================================
       GOOGLE LOGIN CALLBACK
       ===================================================== */

    const onLoginComplete =
      async (
        error,
        result
      ) => {

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

          console.error(
            "❌ Google login result is missing Circle credentials",
            result
          );

          return;
        }


        /*
         * Save Circle authentication
         * locally.
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
         * Authenticate SDK.
         */
        circleSdk.setAuthentication({
          userToken,
          encryptionKey,
        });


        log(
          "✅ Circle SDK authenticated after Google login"
        );


        /*
         * Now create/find the
         * Circle wallet.
         */
        await initializeOrCreateWallet();
      };


    /* =====================================================
       RESTORE CONFIG
       ===================================================== */

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


    /* =====================================================
       CIRCLE CONFIG
       ===================================================== */

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


    /* =====================================================
       CREATE SDK
       ===================================================== */

    /*
     * IMPORTANT:
     *
     * Keep the callback attached to
     * the SDK constructor.
     */
    circleSdk =
      new W3SSdk({
        configs:
          initialConfig,

        socialLoginCompleteCallback:
          onLoginComplete,
      });


    window.circleSdk =
      circleSdk;


    log(
      "✅ Circle SDK initialized"
    );


    /* =====================================================
       GET DEVICE ID
       ===================================================== */

    const deviceId =
      await circleSdk.getDeviceId();


    log(
      "🆔 Circle Device ID:",
      deviceId
    );


    /* =====================================================
       DEVICE TOKEN
       ===================================================== */

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


    /* =====================================================
       UPDATE GOOGLE CONFIG
       ===================================================== */

    /*
     * IMPORTANT:
     *
     * Do NOT pass onLoginComplete
     * to updateConfigs().
     *
     * The callback is already attached
     * when W3SSdk was created.
     */
    circleSdk.updateConfigs({

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
    });


    log(
      "✅ Circle Google login configured"
    );


    /* =====================================================
       GOOGLE BUTTON
       ===================================================== */

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


    googleButton.disabled =
      false;


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

      async (
        event
      ) => {

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


          log(
            "🔵 Starting Google login..."
          );


          /*
           * Use the SDK enum instead of
           * the string "Google".
           */
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


/* =========================================================
   PUBLIC HELPERS
   ========================================================= */

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


window.getCircleWallets =
  () =>
    window.circleWallets ||
    [];


window.getCircleWalletAddress =
  () =>
    window.circleWalletAddress ||
    "";


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
