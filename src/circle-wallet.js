import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdkInstance = null;

export async function loginWithCircleGoogle() {
  try {
    if (!circleSdkInstance) {
      circleSdkInstance = new W3SSdk({
        appSettings: {
          appId: import.meta.env.VITE_CIRCLE_APP_ID || "",
        },
      });
    }

    const response = await fetch("/api/circle-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Circle device token from server endpoint");
    }

    const data = await response.json();

// Store both keys so app.js can use them for SDK challenges
sessionStorage.setItem("circle_user_token", data.userToken);
if (data.encryptionKey) {
  sessionStorage.setItem("circle_encryption_key", data.encryptionKey);
}

circleSdkInstance.performLogin(
  {
    provider: "google",
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  },
  {
    deviceToken: data.deviceToken || data.userToken,
    deviceEncryptionKey: data.deviceEncryptionKey || data.encryptionKey,
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
