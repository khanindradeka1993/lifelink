import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { SocialLoginProvider } from "@circle-fin/w3s-pw-web-sdk/dist/src/types";

let circleSdkInstance = null;

function handleSocialLoginComplete(error, result) {
  if (error) {
    console.error("Circle Social Login Error:", error);

    alert(
      "Circle Login Failed: " +
        (error.message || "Unknown error")
    );

    return;
  }

  if (!result) {
    console.error("Circle Login returned no result.");
    alert("Circle Login Failed: No login result returned.");
    return;
  }

  console.log("Circle Google Login successful.");

  // These are the AUTHENTICATED USER credentials.
  const userToken = result.userToken;
  const encryptionKey = result.encryptionKey;

  if (!userToken || !encryptionKey) {
    console.error(
      "Circle login result missing userToken/encryptionKey:",
      result
    );

    alert(
      "Circle Login Failed: Missing user authentication credentials."
    );

    return;
  }

  // Save credentials for the rest of LifeLink.
  sessionStorage.setItem(
    "circle_user_token",
    userToken
  );

  sessionStorage.setItem(
    "circle_encryption_key",
    encryptionKey
  );

  // Set authenticated session on SDK.
  circleSdkInstance.setAuthentication({
    userToken,
    encryptionKey,
  });

  // Make SDK available to app.js.
  window.circleSdk = circleSdkInstance;

  // Let the rest of LifeLink know that Circle login is complete.
  window.dispatchEvent(
    new CustomEvent("circleLoginComplete", {
      detail: {
        userToken,
        encryptionKey,
        refreshToken: result.refreshToken || null,
        oAuthInfo: result.oAuthInfo || null,
      },
    })
  );

  console.log("Circle authentication stored successfully.");
}

async function initializeCircleSdk() {
  if (circleSdkInstance) {
    return circleSdkInstance;
  }

  const appId =
    import.meta.env.VITE_CIRCLE_APP_ID || "";

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  if (!appId) {
    throw new Error(
      "VITE_CIRCLE_APP_ID is missing."
    );
  }

  if (!googleClientId) {
    throw new Error(
      "VITE_GOOGLE_CLIENT_ID is missing."
    );
  }

  circleSdkInstance = new W3SSdk(
    {
      appSettings: {
        appId,
      },

      loginConfigs: {
        deviceToken: "",
        deviceEncryptionKey: "",

        google: {
          clientId: googleClientId,
          redirectUri: window.location.origin,
          selectAccountPrompt: true,
        },
      },
    },
    handleSocialLoginComplete
  );

  window.circleSdk = circleSdkInstance;

  return circleSdkInstance;
}

export async function loginWithCircleGoogle() {
  try {
    const sdk = await initializeCircleSdk();

    /*
     * Circle requires the deviceId from the SDK.
     * The device token returned by the backend is
     * bound to this exact deviceId.
     */
    const deviceId = await sdk.getDeviceId();

    if (!deviceId) {
      throw new Error(
        "Circle device ID could not be generated."
      );
    }

    console.log(
      "Circle deviceId:",
      deviceId
    );

    /*
     * Ask our Vercel backend for:
     * deviceToken
     * deviceEncryptionKey
     */
    const response = await fetch(
      "/api/circle-token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          deviceId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.message ||
          "Failed to create Circle device token."
      );
    }

    const deviceToken =
      data.deviceToken;

    const deviceEncryptionKey =
      data.deviceEncryptionKey;

    if (!deviceToken) {
      throw new Error(
        "Circle did not return deviceToken."
      );
    }

    if (!deviceEncryptionKey) {
      throw new Error(
        "Circle did not return deviceEncryptionKey."
      );
    }

    console.log(
      "Circle device credentials received."
    );

    /*
     * IMPORTANT:
     *
     * These are DEVICE credentials.
     * They are NOT the userToken/encryptionKey.
     */
    sdk.updateConfigs({
      appSettings: {
        appId:
          import.meta.env.VITE_CIRCLE_APP_ID || "",
      },

      loginConfigs: {
        deviceToken,
        deviceEncryptionKey,

        google: {
          clientId:
            import.meta.env.VITE_GOOGLE_CLIENT_ID || "",

          redirectUri:
            window.location.origin,

          selectAccountPrompt: true,
        },
      },
    });

    console.log(
      "Starting Circle Google login..."
    );

    /*
     * Circle social login.
     *
     * The authenticated userToken and encryptionKey
     * will arrive in handleSocialLoginComplete().
     */
    sdk.performLogin(
      SocialLoginProvider.GOOGLE
    );
  } catch (err) {
    console.error(
      "Circle Login Error:",
      err
    );

    alert(
      "Circle Login Error: " +
        (err?.message || "Unknown error")
    );
  }
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "DOMContentLoaded",
    () => {
      const googleBtn =
        document.getElementById(
          "circleGoogleBtn"
        );

      if (googleBtn) {
        googleBtn.addEventListener(
          "click",
          loginWithCircleGoogle
        );
      }
    }
  );
}
