const appId = import.meta.env.VITE_CIRCLE_APP_ID;

async function initializeCircleWallet() {
  console.log("🔵 Circle initialization started");
  console.log("🔵 App ID exists:", !!appId);

  if (!appId) {
    console.error("❌ Circle App ID is missing");
    return;
  }

  try {
    console.log("🔵 Loading Circle SDK...");

    const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

    console.log("🔵 Circle SDK loaded:", !!W3SSdk);

    const circleSdk = new W3SSdk({
      appSettings: {
        appId: appId
      }
    });

    window.circleSdk = circleSdk;

    console.log("✅ Circle W3S SDK initialized");
  } catch (error) {
    console.error("❌ Circle W3S SDK failed:", error);
  }
}

initializeCircleWallet();
