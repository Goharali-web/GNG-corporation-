const https = require('https');
const { verifyToken } = require('./_auth');

// Helper to make HTTPS requests to Supabase REST endpoint
function supabaseRequest({ method, path, body, useServiceRole }) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    return Promise.reject(new Error('Service configuration error'));
  }

  const hostname = supabaseUrl.replace('https://', '');
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    headers['Prefer'] = 'return=representation';
  }

  const options = {
    hostname,
    path,
    method,
    headers
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    request.on('error', (err) => reject(err));

    if (body) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}

module.exports = async (req, res) => {
  // CORS OPTIONS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  // Define write methods that require admin authentication
  const isWriteMethod = ['POST', 'PUT', 'DELETE'].includes(req.method);

  if (isWriteMethod) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }

    // Verify service role key configuration to catch setup issues
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || serviceRoleKey.trim() === '' || serviceRoleKey.includes('your_supabase_service_role_key')) {
      return res.status(500).json({ 
        error: 'Service configuration error: SUPABASE_SERVICE_ROLE_KEY environment variable is not configured on Vercel. Please add it to your project settings and redeploy.' 
      });
    }
  }

  try {
    if (req.method === 'GET') {
      // Query all non-archived services ordered by display_order asc
      const result = await supabaseRequest({
        method: 'GET',
        path: '/rest/v1/services?is_archived=eq.false&order=display_order.asc',
        useServiceRole: false
      });

      if (result.statusCode >= 200 && result.statusCode < 300) {
        return res.status(200).json(JSON.parse(result.data));
      } else {
        return res.status(500).json({ error: 'Failed to retrieve services database records' });
      }
    } 
    
    else if (req.method === 'POST') {
      const payload = req.body;
      if (!payload || !payload.category || !payload.name || !payload.description || !payload.price) {
        return res.status(400).json({ error: 'Invalid request: missing required fields' });
      }

      // Convert features to JSON array if they are not already
      if (typeof payload.features === 'string') {
        try {
          payload.features = JSON.parse(payload.features);
        } catch (e) {
          payload.features = payload.features.split('\n').map(f => f.trim()).filter(Boolean);
        }
      }

      const result = await supabaseRequest({
        method: 'POST',
        path: '/rest/v1/services',
        body: payload,
        useServiceRole: true // Requires service_role key to write
      });

      if (result.statusCode >= 200 && result.statusCode < 300) {
        const data = JSON.parse(result.data);
        return res.status(201).json(data[0] || data);
      } else {
        return res.status(500).json({ error: 'Failed to create new service record' });
      }
    } 
    
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const payload = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing service identification' });
      }

      // Convert features to JSON array if they are not already
      if (payload.features && typeof payload.features === 'string') {
        try {
          payload.features = JSON.parse(payload.features);
        } catch (e) {
          payload.features = payload.features.split('\n').map(f => f.trim()).filter(Boolean);
        }
      }

      // We use PATCH for updates in PostgREST
      const result = await supabaseRequest({
        method: 'PATCH',
        path: `/rest/v1/services?id=eq.${id}`,
        body: payload,
        useServiceRole: true
      });

      if (result.statusCode >= 200 && result.statusCode < 300) {
        const data = JSON.parse(result.data);
        return res.status(200).json(data[0] || data);
      } else {
        return res.status(500).json({ error: 'Failed to modify service record' });
      }
    } 
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Missing service identification' });
      }

      const result = await supabaseRequest({
        method: 'DELETE',
        path: `/rest/v1/services?id=eq.${id}`,
        useServiceRole: true
      });

      if (result.statusCode >= 200 && result.statusCode < 300) {
        return res.status(200).json({ success: true, message: 'Service removed successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to remove service record' });
      }
    } 
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Services API Error:', err);
    return res.status(500).json({ error: 'Database execution failure' });
  }
};
