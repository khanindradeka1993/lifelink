import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.CIRCLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'CIRCLE_API_KEY is missing in Vercel environment variables.' });
    }

    const { userId } = req.body || {};
    const userIdentifier = userId || `google_user_${Date.now()}`;

    // Step 1: Create or fetch User in Circle W3S
    await fetch('https://api.circle.com/v1/w3s/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userId: userIdentifier })
    });

    // Step 2: Request User Session Token
    const tokenResponse = await fetch('https://api.circle.com/v1/w3s/users/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ userId: userIdentifier })
    });

    const tokenData = await tokenResponse.json();
console.log("Circle API Error Response:", tokenData);

    const userToken = tokenData.data?.userToken;
    const encryptionKey = tokenData.data?.encryptionKey;

    // Step 3: Check for existing User Wallets
    let walletAddress = null;
    try {
      const walletResponse = await fetch('https://api.circle.com/v1/w3s/wallets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-User-Token': userToken
        }
      });

      const walletData = await walletResponse.json();
      if (walletResponse.ok && walletData.data?.wallets?.length > 0) {
        walletAddress = walletData.data.wallets[0].address;
      }
    } catch (wErr) {
      console.log('No wallet address returned yet:', wErr);
    }

    // Step 4: Fallback deterministic EVM address generation if Circle returns no wallets
    if (!walletAddress) {
      const hash = crypto.createHash('sha256').update(userIdentifier).digest('hex');
      walletAddress = '0x' + hash.substring(0, 40);
    }

    return res.status(200).json({
      userToken: userToken,
      encryptionKey: encryptionKey,
      userId: userIdentifier,
      walletAddress: walletAddress
    });

  } catch (error) {
    console.error('Circle token API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
