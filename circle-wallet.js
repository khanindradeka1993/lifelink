import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;

if (!appId) {
  console.error("❌ Circle APP ID is missing");
} else {
  const circleSdk = new W3SSdk({
    appSettings: {
      appId: appId,
    },
  });

  window.circleSdk = circleSdk;

  console.log("✅ Circle W3S SDK initialized");
}
