import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey =
      process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "CIRCLE_API_KEY is missing in Vercel environment variables.",
      });
    }

    const { deviceId } =
      req.body || {};

    if (!deviceId) {
      return res.status(400).json({
        error:
          "Missing Circle deviceId.",
      });
    }

    /*
     * Circle requires a UUID v4
     * idempotency key.
     */
    const idempotencyKey =
      crypto.randomUUID();

    const requestId =
      crypto.randomUUID();

    /*
     * Create a DEVICE-BOUND token
     * for social login.
     */
    const response = await fetch(
      "https://api.circle.com/v1/w3s/users/social/token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${apiKey}`,

          "X-Request-Id":
            requestId,
        },

        body: JSON.stringify({
          idempotencyKey,
          deviceId,
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "Circle social token HTTP status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "Circle social token error:",
        data
      );

      return res
        .status(response.status)
        .json({
          error:
            data.message ||
            data.error ||
            "Circle failed to create device token.",
          code: data.code,
        });
    }

    /*
     * Circle response:
     *
     * {
     *   data: {
     *     deviceToken,
     *     deviceEncryptionKey
     *   }
     * }
     */
    const deviceToken =
      data.data?.deviceToken;

    const deviceEncryptionKey =
      data.data?.deviceEncryptionKey;

    if (!deviceToken) {
      return res.status(500).json({
        error:
          "Circle response did not contain deviceToken.",
      });
    }

    if (!deviceEncryptionKey) {
      return res.status(500).json({
        error:
          "Circle response did not contain deviceEncryptionKey.",
      });
    }

    /*
     * Return ONLY the device credentials
     * required by the Web SDK.
     */
    return res.status(200).json({
      deviceToken,
      deviceEncryptionKey,
    });
  } catch (error) {
    console.error(
      "Circle Token API Error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Internal server error.",
    });
  }
}
