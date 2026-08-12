import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdk = null;

export function initializeCircle() {
  console.log("🟣 Circle module loaded");

  circleSdk = new W3SSdk();

  console.log("✅ Circle SDK object created");

  return circleSdk;
}

export function getCircleSdk() {
  return circleSdk;
}
