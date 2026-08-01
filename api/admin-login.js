const crypto = require('crypto');
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

  // Rate Limiting: Max 5 login attempts per 5 minutes per IP
  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'global';
  if (!rateLimit(ip, 5, 300000)) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'gng-secret-key-10928';

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Service configuration error' });
  }

  if (email === adminEmail && password === adminPassword) {
    const timestamp = Date.now();
    const message = `${email}:${timestamp}`;
    const signature = crypto.createHmac('sha256', sessionSecret).update(message).digest('hex');
    const token = `${message}:${signature}`;

    return res.status(200).json({ success: true, token });
  } else {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
};
