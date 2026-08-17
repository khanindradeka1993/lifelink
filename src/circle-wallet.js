import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

let sdkInstance = null;

export function getCircleSdk() {
  if (sdkInstance) return sdkInstance;

  const appId = import.meta.env.VITE_CIRCLE_APP_ID || "";

  sdkInstance = new W3SSdk({
    appSettings: {
      appId: appId
    }
  });

  return sdkInstance;
}
