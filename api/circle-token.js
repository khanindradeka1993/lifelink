module.exports = async (req, res) => {
  // CORS Headers
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
      return res.status(500).json({ error: 'CIRCLE_API_KEY missing in Vercel Environment Variables' });
    }

    // Call Circle API
    const response = await fetch('https://api.circle.com/v1/w3s/users/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        userId: req.body?.userId || 'test_user_1',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Circle API request failed',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'Unhandled runtime error',
      message: err.message
    });
  }
};
