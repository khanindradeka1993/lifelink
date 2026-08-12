let circleSdkInstance = null;

/**
 * Dynamically load Circle Web SDK script
 */
function loadCircleScript() {
  return new Promise((resolve, reject) => {
    if (window.W3SSdk) {
      resolve(window.W3SSdk);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@circle-fin/w3s-pw-web-sdk@1.1.3/dist/w3s-pw-web-sdk.standalone.js";
    script.async = true;
    script.onload = () => resolve(window.W3SSdk);
    script.onerror = () => reject(new Error("Failed to load Circle Web SDK from CDN"));
    document.head.appendChild(script);
  });
}

/**
 * Handle Google Login via Circle
 */
export async function loginWithCircleGoogle() {
  try {
    const W3SSdkClass = await loadCircleScript();

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
