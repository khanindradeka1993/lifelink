import crypto from 'node:crypto';

export default async function handler(req, res) {
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

    // Generate a unique userId or use the one provided by client
    const userId = req.body?.userId || `user_${crypto.randomBytes(6).toString('hex')}`;

    // Step 1: Create the User in Circle
    await fetch('https://api.circle.com/v1/w3s/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    // Step 2: Acquire User Token & Encryption Key for the created user
    const tokenResponse = await fetch('https://api.circle.com/v1/w3s/users/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({
        error: tokenData.message || 'Failed to acquire Circle user token',
        details: tokenData,
      });
    }

    return res.status(200).json(tokenData.data);
  } catch (err) {
    return res.status(500).json({
      error: 'Runtime execution error',
      message: err.message,
    });
  }
}
