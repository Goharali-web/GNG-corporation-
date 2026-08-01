const https = require('https');
const { rateLimit } = require('./_rate-limit');

module.exports = async (req, res) => {
  // Enforce same-origin check for security
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  if (origin && !origin.includes(host) && !host.includes('localhost')) {
    return res.status(403).json({ error: 'CORS policy violation: Access Denied.' });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting: Max 5 submissions per minute per IP
  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'global';
  if (!rateLimit(ip, 5, 60000)) {
    return res.status(429).json({ error: 'Too many lead submissions. Please wait a minute and try again.' });
  }

  const { name, email, job_title, company_name, phone, business_type, service, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required fields' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Service configuration error' });
  }

  const payload = JSON.stringify({
    name,
    email,
    job_title,
    company_name,
    phone,
    business_type,
    service,
    message
  });

  const options = {
    hostname: supabaseUrl.replace('https://', ''),
    path: '/rest/v1/bookings',
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
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
        return res.status(500).json({ error: 'Database transaction failure' });
      }
    });
  });

  request.on('error', () => {
    return res.status(500).json({ error: 'Database connection failed' });
  });

  request.write(payload);
  request.end();
};
