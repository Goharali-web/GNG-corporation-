const crypto = require('crypto');

function verifyToken(token) {
  if (!token) return false;

  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [email, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  // Check if session expired (e.g. valid for 24 hours)
  const oneDay = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > oneDay || Date.now() - timestamp < -oneDay) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (email !== adminEmail) return false;

  const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'gng-secret-key-10928';
  const expectedMessage = `${email}:${timestampStr}`;
  const expectedSignature = crypto.createHmac('sha256', sessionSecret).update(expectedMessage).digest('hex');

  return signature === expectedSignature;
}

module.exports = { verifyToken };
