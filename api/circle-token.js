const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.CIRCLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'CIRCLE_API_KEY environment variable is missing on Vercel' });
    }

    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');

    const response = await fetch('https://api.circle.com/v1/w3s/deviceTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        idempotencyKey: idempotencyKey,
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
    return res.status(500).json({ error: err.message || 'Server execution error' });
  }
};
