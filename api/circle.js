const CIRCLE_BASE_URL =
  process.env.CIRCLE_BASE_URL || "https://api.circle.com";

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (!CIRCLE_API_KEY) {
    return res.status(500).json({
      error: "CIRCLE_API_KEY is missing",
    });
  }

  try {
    const { action, ...params } = req.body || {};

    if (!action) {
      return res.status(400).json({
        error: "Missing action",
      });
    }

    const circleRequest = async (
      path,
      method,
      userToken,
      body
    ) => {
      const headers = {
        Authorization: `Bearer ${CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
      };

      if (userToken) {
        headers["X-User-Token"] = userToken;
      }

      const response = await fetch(
        `${CIRCLE_BASE_URL}${path}`,
        {
          method,
          headers,
          ...(body
            ? {
                body: JSON.stringify(body),
              }
            : {}),
        }
      );

      const data = await response.json();

      return {
        response,
        data,
      };
    };

    switch (action) {
      /* =================================================
         CREATE DEVICE TOKEN
         ================================================= */
      case "createDeviceToken": {
        const { deviceId } = params;

        if (!deviceId) {
          return res.status(400).json({
            error: "Missing deviceId",
          });
        }

        const { response, data } =
          await circleRequest(
            "/v1/w3s/users/social/token",
            "POST",
            null,
            {
              idempotencyKey: crypto.randomUUID(),
              deviceId,
            }
          );

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.status(200).json(
          data.data || data
        );
      }

      /* =================================================
         INITIALIZE USER
         ================================================= */
          case "initializeUser": {
        const { userToken } = params;

        if (!userToken) {
          return res.status(400).json({
            error: "Missing userToken",
          });
        }

        const { response, data } =
          await circleRequest(
            "/v1/w3s/user/initialize",
            "POST",
            userToken,
            {
              idempotencyKey: crypto.randomUUID(),
              accountType: "SCA",
              blockchains: ["ARC-TESTNET"],
            }
          );

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.status(200).json(
          data.data || data
        );
      }

      /* =================================================
         CREATE WALLET
         Used when the Circle user already exists.
         ================================================= */
      case "createWallet": {
        const { userToken } = params;

        if (!userToken) {
          return res.status(400).json({
            error: "Missing userToken",
          });
        }

        const { response, data } =
          await circleRequest(
            "/v1/w3s/user/wallets",
            "POST",
            userToken,
            {
              idempotencyKey: crypto.randomUUID(),
              blockchains: ["ARC-TESTNET"],
            }
          );

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.status(200).json(
          data.data || data
        );
      }

      /* =================================================
         LIST WALLETS
         ================================================= */
      case "listWallets": {
        const { userToken } = params;

        if (!userToken) {
          return res.status(400).json({
            error: "Missing userToken",
          });
        }

        const { response, data } =
          await circleRequest(
            "/v1/w3s/wallets",
            "GET",
            userToken
          );

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.status(200).json(
          data.data || data
        );
      }

      /* =================================================
         GET TOKEN BALANCE
         ================================================= */
      case "getTokenBalance": {
        const {
          userToken,
          walletId,
        } = params;

        if (!userToken || !walletId) {
                    return res.status(400).json({
            error:
              "Missing userToken or walletId",
          });
        }

        const { response, data } =
          await circleRequest(
            `/v1/w3s/wallets/${encodeURIComponent(
              walletId
            )}/balances`,
            "GET",
            userToken
          );

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.status(200).json(
          data.data || data
        );
      }

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}`,
        });
    }
  } catch (error) {
    console.error(
      "❌ Circle API error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Internal server error",
    });
  }
}
