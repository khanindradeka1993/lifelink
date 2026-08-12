export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CIRCLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'CIRCLE_API_KEY environment variable is missing' });
  }

  try {
    const response = await fetch('https://api.circle.com/v1/w3s/deviceTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Circle API request failed' });
    }

    return res.status(200).json({
      deviceToken: data.data.deviceToken,
      deviceEncryptionKey: data.data.deviceEncryptionKey,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
