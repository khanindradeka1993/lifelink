const appId = import.meta.env.VITE_CIRCLE_APP_ID;

async function initializeCircleWallet() {
  if (!appId) {
    console.error("❌ Circle App ID is missing");
    return;
  }

  try {
    const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");

    const circleSdk = new W3SSdk({
      appSettings: {
        appId: appId
      }
    });

    window.circleSdk = circleSdk;

    console.log("✅ Circle W3S SDK initialized");
  } catch (error) {
    console.error("❌ Circle W3S SDK failed to load:", error);
  }
}

initializeCircleWallet();
