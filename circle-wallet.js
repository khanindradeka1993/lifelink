import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let circleSdk = null;
let loginResult = null;

function getCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  return item ? decodeURIComponent(item.slice(prefix.length)) : "";
}

function setCookie(name, value, maxAge = 86400) {
  if (!value) return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

let deviceToken =
  localStorage.getItem("circleDeviceToken") ||
  getCookie("deviceToken") ||
  "";

let deviceEncryptionKey =
  localStorage.getItem("circleDeviceEncryptionKey") ||
  getCookie("deviceEncryptionKey") ||
  "";

let userToken =
  localStorage.getItem("circleUserToken") || "";

let encryptionKey =
  localStorage.getItem("circleEncryptionKey") || "";

let refreshToken =
  localStorage.getItem("circleRefreshToken") || "";

function log(...args) {
  console.log(...args);
}

/* =====================================================
   INITIALIZE CIRCLE
   ===================================================== */

async function initializeCircle() {
 console.log("🔎 OAUTH RETURN DEBUG");
console.log("🔎 URL:", window.location.href);
console.log("🔎 HASH:", window.location.hash);
console.log(
  "🔎 socialLoginProvider:",
  localStorage.getItem("socialLoginProvider")
);
console.log(
  "🔎 state exists:",
  !!localStorage.getItem("state")
);
console.log(
  "🔎 nonce exists:",
  !!localStorage.getItem("nonce")
); 
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

    /*
     * Circle social-login completion callback.
     * This callback must be available on the SDK instance
     * when the page is restored after Google's redirect.
     */
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

    /*
     * Restore the values that must survive the full-page
     * Google OAuth redirect.
     *
     * Circle's official Google social-login quickstart
     * persists these configuration values in cookies.
     */
    const restoredAppId =
      getCookie("appId") || appId;

    const restoredGoogleClientId =
      getCookie("google.clientId") ||
      googleClientId;

    deviceToken =
      deviceToken ||
      getCookie("deviceToken") ||
      "";

    deviceEncryptionKey =
      deviceEncryptionKey ||
      getCookie("deviceEncryptionKey") ||
      "";

    const initialConfig = {
      appSettings: {
        appId: restoredAppId,
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId: restoredGoogleClientId,
          redirectUri: window.location.origin,
          selectAccountPrompt: true,
        },
      },
    };

    const isOAuthReturn =
  window.location.hash.includes("state=") &&
  localStorage.getItem("socialLoginProvider") ===
    SocialLoginProvider.GOOGLE;
    /*
     * Use the constructor callback form used by Circle's
     * official social-login wallet quickstart.
     */
    circleSdk = new W3SSdk(
  initialConfig,
  onLoginComplete
);
    window.circleSdk = circleSdk;

    log("✅ Circle SDK initialized");


let deviceId = "";

if (!isOAuthReturn) {
  deviceId = await circleSdk.getDeviceId();

  log(
    "🆔 Circle Device ID:",
    deviceId
  );
} else {
  log(
    "⏭️ OAuth return detected — skipping getDeviceId until Google login completes"
  );
}

    log(
      "🆔 Circle Device ID:",
      deviceId
    );

    if (
  !deviceToken ||
  !deviceEncryptionKey
) {
  if (isOAuthReturn) {
    throw new Error(
      "OAuth return detected but Circle device credentials are missing"
    );
  }
      log(
        "🔵 Requesting Circle device token..."
      );

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
              action:
                "createDeviceToken",
              deviceId,
            }),
          }
        );

      const data =
        await response.json();

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

      /*
       * Persist the same values in cookies so they are
       * available after Google sends the browser back
       * to the app.
       */
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

      log(
        "💾 Circle device login state saved"
      );

      log(
        "🍪 Circle OAuth configuration saved in cookies"
      );

      log(
        "✅ Circle device token received"
      );
    } else {
      /*
       * Make sure restored localStorage values are also
       * available to the SDK after a future OAuth redirect.
       */
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

      log(
        "♻️ Restored Circle device login state"
      );

      log(
        "🍪 Circle OAuth configuration restored/saved"
      );
    }

    /*
     * Re-apply configuration after the device token is
     * available.
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
            clientId: googleClientId,
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

          /*
           * Persist all OAuth configuration immediately
           * before leaving the page for Google.
           */
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

          log(
            "🍪 OAuth configuration persisted before Google redirect"
          );

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

          console.log(
            "🔎 GOOGLE PROVIDER VALUE:",
            SocialLoginProvider.GOOGLE
          );

          console.log(
            "🔎 GOOGLE CONFIG:",
            googleClientId
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

    const hasOAuthParams =
      currentUrl.includes("code=") ||
      currentUrl.includes("state=") ||
      currentUrl.includes("error=");

    if (hasOAuthParams) {
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


/* =====================================================
   INITIALIZE CIRCLE USER
   ===================================================== */

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
            action:
              "initializeUser",

            userToken:
              token,
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
      async (
        error,
        result
      ) => {
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


/* =====================================================
   LOAD CIRCLE WALLETS
   ===================================================== */

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
            action:
              "getWallets",

            userToken:
              token,
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


/* =====================================================
   PUBLIC HELPERS
   ===================================================== */

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


/* =====================================================
   START
   ===================================================== */

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
