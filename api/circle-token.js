export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.circle.com/v1/w3s/users/social/token", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: req.body?.deviceId || "web-client-device",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
