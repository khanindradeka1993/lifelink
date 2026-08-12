import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdk = null;

/**
 * Initialize Circle Web SDK
 */
export function getCircleSDK() {
  if (!circleSdk) {
    circleSdk = new W3SSdk(
      {
        appSettings: {
          appId: import.meta.env.VITE_CIRCLE_APP_ID || "",
        },
      },
      (error, result) => {
        if (error) {
          console.error("Circle SDK Error:", error);
          return;
        }
        if (result && result.userToken) {
          localStorage.setItem("circle_user_token", result.userToken);
          localStorage.setItem("circle_encryption_key", result.encryptionKey);
          
          const statusDiv = document.getElementById("circleWalletStatus");
          if (statusDiv) {
            statusDiv.style.display = "block";
            statusDiv.innerText = "✅ Circle Google Wallet Active";
          }
        }
      }
    );

    // Creates device session context (Works on Desktop & Mobile)
    circleSdk.getDeviceId();
  }
  return circleSdk;
}

/**
 * Trigger Social Login with Google
 */
export async function loginWithCircleGoogle() {
  try {
    const sdk = getCircleSDK();

    // 1. Fetch device token & encryption key from serverless API
    const response = await fetch("/api/circle-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Circle device token");
    }

    const { deviceToken, deviceEncryptionKey } = await response.json();

    // 2. Perform Login with Circle SDK
    sdk.performLogin(
      {
        provider: "google",
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      },
      {
        deviceToken,
        deviceEncryptionKey,
      }
    );
  } catch (err) {
    console.error("Circle Login Failed:", err);
    alert("Circle Login Error: " + err.message);
  }
}

// Bind event listener safely when DOM loads
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("circleGoogleBtn");
    if (googleBtn) {
      googleBtn.addEventListener("click", loginWithCircleGoogle);
    }
  });
}
