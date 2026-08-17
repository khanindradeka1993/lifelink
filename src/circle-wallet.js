import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdkInstance = null;

export function getCircleSdk() {
  if (!circleSdkInstance) {
    const appId = import.meta.env.VITE_CIRCLE_APP_ID || "";
    if (!appId) {
      console.error("VITE_CIRCLE_APP_ID is missing from environment variables.");
    }
    circleSdkInstance = new W3SSdk({
      appSettings: { appId },
    });
  }
  return circleSdkInstance;
}

export async function loginWithCircleGoogle() {
  try {
    const sdk = getCircleSdk();

    const response = await fetch("/api/circle-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "google_user_" + Date.now() })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Circle device token from server endpoint");
    }

    const data = await response.json();

    sessionStorage.setItem("circle_user_token", data.userToken);
    if (data.encryptionKey) {
      sessionStorage.setItem("circle_encryption_key", data.encryptionKey);
    }

    let deviceToken = "";
    try {
      const deviceIdResult = await sdk.getDeviceId();
      deviceToken = deviceIdResult?.deviceToken;
    } catch (err) {
      console.warn("getDeviceId SDK warning, fallback active:", err);
    }

    if (!deviceToken) {
      deviceToken = data.userToken;
    }

    sdk.performLogin(
      {
        provider: "google",
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      },
      {
        deviceToken: deviceToken,
        deviceEncryptionKey: data.encryptionKey,
      }
    );
  } catch (err) {
    console.error("Circle Login Error:", err);
    alert("Circle Login Error: " + err.message);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("circleGoogleBtn");
    if (googleBtn) {
      googleBtn.addEventListener("click", loginWithCircleGoogle);
    }
  });
}
