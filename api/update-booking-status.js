const https = require('https');
const { verifyToken } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PATCH,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  const { id, status } = req.body || {};
  if (!id || !status) {
    return res.status(400).json({ error: 'Missing required parameters: id and status' });
  }

  // Validate status values
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Service configuration error' });
  }

  const payload = JSON.stringify({ status });

  const options = {
    hostname: supabaseUrl.replace('https://', ''),
    path: `/rest/v1/bookings?id=eq.${id}`,
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
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
        return res.status(500).json({ error: 'Failed to update record in database' });
      }
    });
  });

  request.on('error', () => {
    return res.status(500).json({ error: 'Database connection failed' });
  });

  request.write(payload);
  request.end();
};
