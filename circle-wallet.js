import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let circleSdk = null;

export function initializeCircleSDK() {
  if (!circleSdk) {
    circleSdk = new W3SSdk();
  }

  return circleSdk;
}

export function getCircleSDK() {
  return circleSdk;
}
