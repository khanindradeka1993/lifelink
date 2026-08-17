function getCircleSdkInstance() {
  if (window.circleSdk) {
    return window.circleSdk;
  }

  // Check all possible global variants injected by Circle's CDN script
  const SDKConstructor = window.W3SSdk || window.CircleW3SSdk || window.вичаW3SSdk;

  if (!SDKConstructor) {
    console.error("Circle Web SDK CDN script has not loaded into window scope.");
    return null;
  }

  const appId = window.env?.VITE_CIRCLE_APP_ID || import.meta.env?.VITE_CIRCLE_APP_ID || "";
  
  try {
    window.circleSdk = new SDKConstructor({
      appSettings: {
        appId: appId
      }
    });
    return window.circleSdk;
  } catch (err) {
    console.error("Failed to instantiate W3SSdk:", err);
    return null;
  }
}
