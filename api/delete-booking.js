const https = require('https');
const { verifyToken } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing booking ID parameter' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Service configuration error' });
  }

  const options = {
    hostname: supabaseUrl.replace('https://', ''),
    path: `/rest/v1/bookings?id=eq.${id}`,
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ error: 'Failed to delete record from database' });
      }
    });
  });

  request.on('error', () => {
    return res.status(500).json({ error: 'Database connection failed' });
  });

  request.end();
};
