let circleSdkInstance = null;

/**
 * Dynamically load Circle Web SDK script if not already on window
 */
function ensureCircleScriptLoaded() {
  return new Promise((resolve, reject) => {
    // Check if SDK already attached to window
    const ExistingSdk = window.W3SSdk || (window.Circle && window.Circle.W3SSdk);
    if (ExistingSdk) {
      resolve(ExistingSdk);
      return;
    }

    // Load standalone SDK script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@circle-fin/w3s-pw-web-sdk@1.1.3/dist/w3s-pw-web-sdk.standalone.js";
    script.async = true;
    
    script.onload = () => {
      const SdkClass = window.W3SSdk || (window.Circle && window.Circle.W3SSdk);
      if (SdkClass) {
        resolve(SdkClass);
      } else {
        reject(new Error("Circle SDK loaded but window.W3SSdk was not found."));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Circle SDK script from CDN. Check your network/adblocker."));
    };

    document.head.appendChild(script);
  });
}

export async function loginWithCircleGoogle() {
  try {
    const W3SSdkClass = await ensureCircleScriptLoaded();

    if (!circleSdkInstance) {
      circleSdkInstance = new W3SSdkClass({
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
      throw new Error("Failed to fetch Circle device token from server");
    }

    const { deviceToken, deviceEncryptionKey } = await response.json();

    circleSdkInstance.performLogin(
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
