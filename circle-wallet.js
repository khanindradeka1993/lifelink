import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

const appId = import.meta.env.VITE_CIRCLE_APP_ID;

let circleSdk = null;

export function initializeCircle() {
  if (!appId) {
    throw new Error("VITE_CIRCLE_APP_ID is missing");
  }

  circleSdk = new W3SSdk({
    appSettings: {
      appId,
    },
  });

  console.log("✅ Circle SDK initialized");

  return circleSdk;
}

export function getCircleSdk() {
  if (!circleSdk) {
    throw new Error("Circle SDK has not been initialized");
  }

  return circleSdk;
}
