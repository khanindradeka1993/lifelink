import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdk = null;

export function initCircleSdk(appId) {
  if (!appId) {
    throw new Error("Circle App ID is missing");
  }

  circleSdk = new W3SSdk({
    appSettings: {
      appId,
    },
  });

  console.log("[Circle] SDK initialized");

  return circleSdk;
}

export function getCircleSdk() {
  if (!circleSdk) {
    throw new Error("Circle SDK has not been initialized");
  }

  return circleSdk;
}
