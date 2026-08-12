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
      return res.status(500).json({ error: 'CIRCLE_API_KEY missing in Vercel settings' });
    }

    const userId = req.body?.userId || `user_${crypto.randomBytes(6).toString('hex')}`;

    // 1. Create or register User in Circle
    await fetch('https://api.circle.com/v1/w3s/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    // 2. Fetch User Token and Encryption Key
    const tokenRes = await fetch('https://api.circle.com/v1/w3s/users/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json({ error: tokenData.message || 'Token generation failed' });
    }

    const { userToken, encryptionKey } = tokenData.data;

    // 3. Initialize Wallet Creation Challenge
    const walletRes = await fetch('https://api.circle.com/v1/w3s/user/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-User-Token': userToken,
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        blockchains: ['ETH-SEPOLIA'],
      }),
    });

    const walletData = await walletRes.json();

    return res.status(200).json({
      userToken,
      encryptionKey,
      challengeId: walletData.data?.challengeId || null,
      userId,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error', message: err.message });
  }
}
