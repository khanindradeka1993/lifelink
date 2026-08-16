async function executeCircleTransaction(functionSignature, contractAddress, args) {
  const userToken = sessionStorage.getItem("circle_user_token");
  if (!userToken) throw new Error("User session expired. Please sign in again.");

  // 1. Call backend to get a fresh challenge AND a fresh encryption key
  const response = await fetch("/api/execute-circle-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userToken, contractAddress, functionSignature, args })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to initialize transaction");

  // 2. CRITICAL: Save the fresh encryption key returned by the backend
  if (data.userToken && data.encryptionKey) {
    sessionStorage.setItem("circle_user_token", data.userToken);
    sessionStorage.setItem("circle_encryption_key", data.encryptionKey);
  }

  // 3. Initialize Circle SDK with the verified fresh key
  if (!window.circleSdk) {
    const { W3sSdk } = window.W3sSdk || {};
    if (!W3sSdk) throw new Error("Circle SDK failed to load.");
    window.circleSdk = new W3sSdk();
    window.circleSdk.setAppSettings({ appId: "YOUR_CIRCLE_APP_ID" });
  }

  window.circleSdk.setAuthentication({
    userToken: sessionStorage.getItem("circle_user_token"),
    encryptionKey: sessionStorage.getItem("circle_encryption_key")
  });

  // 4. Handle setup challenge or execute transaction challenge
  const challengeId = data.challengeId;

  if (data.needsWalletSetup) {
    alert("First-time setup required. Opening Circle PIN setup...");
    return new Promise((resolve, reject) => {
      window.circleSdk.execute(challengeId, async (error) => {
        if (error) return reject(error);

        alert("Wallet & PIN created successfully! Processing your transaction...");
        setTimeout(async () => {
          try {
            // Retry transaction with skipSetup: true now that wallet exists
            const retryRes = await fetch("/api/execute-circle-tx", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userToken: sessionStorage.getItem("circle_user_token"), contractAddress, functionSignature, args, skipSetup: true })
            });
            const retryData = await retryRes.json();
            if (!retryRes.ok) throw new Error(retryData.error);

            if (retryData.encryptionKey) {
              sessionStorage.setItem("circle_encryption_key", retryData.encryptionKey);
              window.circleSdk.setAuthentication({
                userToken: sessionStorage.getItem("circle_user_token"),
                encryptionKey: retryData.encryptionKey
              });
            }

            window.circleSdk.execute(retryData.challengeId, (err, resObj) => {
              if (err) return reject(err);
              const txHash = resObj?.txHash || resObj?.transactionHash;
              showExplorerButton(txHash);
              resolve(txHash);
            });
          } catch (e) {
            reject(e);
          }
        }, 3000);
      });
    });
  }

  // Execute standard transaction challenge
  return new Promise((resolve, reject) => {
    window.circleSdk.execute(challengeId, (err, resObj) => {
      if (err) return reject(err);
      const txHash = resObj?.txHash || resObj?.transactionHash;
      showExplorerButton(txHash);
      resolve(txHash);
    });
  });
}
