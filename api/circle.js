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

    async function circleRequest(
      path,
      method,
      userToken = null,
      body = undefined
    ) {
      const headers = {
        Authorization: `Bearer ${CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (userToken) {
        headers["X-User-Token"] = userToken;
      }

      const response = await fetch(
        `${CIRCLE_BASE_URL}${path}`,
        {
          method,
          headers,
          ...(body !== undefined
            ? {
                body: JSON.stringify(body),
              }
            : {}),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {
          error: "Circle returned invalid JSON",
        };
      }

      return {
        response,
        data,
      };
    }

    /* =====================================================
       CREATE DEVICE TOKEN
       ===================================================== */

    if (action === "createDeviceToken") {
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
            idempotencyKey:
              crypto.randomUUID(),
            deviceId,
          }
        );

      if (!response.ok) {
        return res
          .status(response.status)
          .json(data);
      }

      return res.status(200).json(
        data.data || data
      );
    }

    /* =====================================================
       INITIALIZE USER
       This returns the challengeId required to create
       the user's wallet.
       ===================================================== */

    if (action === "initializeUser") {
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
            idempotencyKey:
              crypto.randomUUID(),

            accountType: "SCA",

            blockchains: [
              "ARC-TESTNET",
            ],
          }
        );

      if (!response.ok) {
        return res
          .status(response.status)
          .json(data);
      }

      return res.status(200).json(
        data.data || data
      );
    }

    /* =====================================================
       LIST WALLETS
       ===================================================== */

    if (action === "listWallets") {
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
        return res
          .status(response.status)
          .json(data);
      }

      return res.status(200).json(
        data.data || data
      );
    }

    /* =====================================================
       GET TOKEN BALANCE
       ===================================================== */

    if (action === "getTokenBalance") {
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
        return res
          .status(response.status)
          .json(data);
      }

      return res.status(200).json(
        data.data || data
      );
    }

    /* =====================================================
       UNKNOWN ACTION
       ===================================================== */

    return res.status(400).json({
      error: `Unknown action: ${action}`,
    });

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
