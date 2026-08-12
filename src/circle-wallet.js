import { Buffer } from "buffer";
import util from "util";

// Polyfill global Buffer and util for Circle SDK
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
  window.util = window.util || util;
  if (!window.inherits) {
    window.inherits = util.inherits;
  }
}

export async function loginWithCircleGoogle() {
  try {
    const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");
    
    const circleSdk = new W3SSdk({
      appSettings: {
        appId: import.meta.env.VITE_CIRCLE_APP_ID || "",
      },
    });

    const response = await fetch("/api/circle-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Circle device token");
    }

    const { deviceToken, deviceEncryptionKey } = await response.json();

    circleSdk.performLogin(
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
