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
  setCookie("google.clientId", googleClientId);
  setCookie("deviceToken", deviceToken);
  setCookie(
    "deviceEncryptionKey",
    deviceEncryptionKey
  );
}


/* =========================================================
   CIRCLE API
========================================================= */

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

    log(
      "💰 Circle wallets loaded:",
      wallets
    );

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
    "🆔 Challenge ID:",
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

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
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
   INITIALIZE USER / CREATE WALLET
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
        action: "initializeUser",
        userToken,
      });

    const initChallengeId =
      initData.challengeId ||
      initData.data?.challengeId;

    if (initChallengeId) {

      log(
        "🟢 Circle user initialized"
      );

      await executeWalletChallenge(
        initChallengeId
      );

      return;
    }

    await loadCircleWallets();

  } catch (error) {

    /*
     * Circle code 155106 means
     * the user has already been initialized.
     */

    if (
      error?.data?.code === 155106 ||
      error?.status === 155106
    ) {

      log(
        "ℹ️ Circle user already initialized."
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

          await loadCircleWallets();

          return;
        }

        await executeWalletChallenge(
          challengeId
        );

        return;

      } catch (walletError) {

        if (
          walletError?.data?.code ===
          155106
        ) {

          await loadCircleWallets();

          return;
        }

        console.error(
          "❌ Circle wallet creation failed:",
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


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeCircle() {

  try {

    log(
      "🔵 Starting Circle initialization..."
    );


    /* -----------------------------------------------------
       ENVIRONMENT CHECK
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       GOOGLE CALLBACK
    ----------------------------------------------------- */

    const onLoginComplete =
      async (
        error,
        result
      ) => {

        console.log(
          "🔔 Circle social-login callback fired"
        );

        console.log(
          "🔎 Circle callback:",
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


        console.log(
          "🟢 Google login successful"
        );


        loginResult = result;


        userToken =
          result.userToken || "";

        encryptionKey =
          result.encryptionKey || "";

        refreshToken =
          result.refreshToken || "";


        if (
          !userToken ||
          !encryptionKey
        ) {

          console.error(
            "❌ Circle login result is missing credentials"
          );

          return;
        }


        /* -------------------------------------------------
           SAVE AUTHENTICATION
        ------------------------------------------------- */

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


        console.log(
          "✅ Circle SDK authenticated"
        );


        /* -------------------------------------------------
           CREATE / RESTORE WALLET
        ------------------------------------------------- */

        await initializeOrCreateWallet();
      };


    /* -----------------------------------------------------
       RESTORE DEVICE INFORMATION
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       INITIAL CONFIG
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       CREATE SDK
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       UPDATE SDK CONFIG
    ----------------------------------------------------- */

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
      "✅ Circle Google login configured"
    );


    /* -----------------------------------------------------
       GOOGLE BUTTON
    ----------------------------------------------------- */

    const googleButton =
      document.getElementById(
        "googleLoginBtn"
      );


    if (!googleButton) {

      console.error(
        "❌ #googleLoginBtn not found"
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

      async (event) => {

        event.preventDefault();

        event.stopPropagation();


        console.log(
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


          /*
           * IMPORTANT:
           *
           * Do NOT use:
           *
           *   performLogin("Google")
           *
           * Use Circle's actual enum:
           *
           *   SocialLoginProvider.GOOGLE
           *
           * This is the main fix.
           */

          console.log(
            "🔵 Starting Google login..."
          );


          await circleSdk.performLogin(
            SocialLoginProvider.GOOGLE
          );


          console.log(
            "🟢 Circle performLogin() returned"
          );

        } catch (error) {

          console.error(
            "❌ performLogin ERROR:",
            error
          );

          alert(
            error?.message ||
            "Google login failed. Please try again."
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


/* =========================================================
   GLOBALS
========================================================= */

window.circleSdk =
  null;

window.circleWallets =
  [];


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
