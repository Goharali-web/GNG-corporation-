const https = require('https');
const { verifyToken } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth check
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  const { search, status } = req.query;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Service configuration error' });
  }

  // Fetch all bookings from Supabase
  const options = {
    hostname: supabaseUrl.replace('https://', ''),
    path: '/rest/v1/bookings?select=*&order=created_at.desc',
    method: 'GET',
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
        try {
          const bookings = JSON.parse(data);

          // Apply filters matching the UI filters
          let filtered = bookings;

          // 1. Status Filter
          if (status && status !== 'all' && status !== '') {
            filtered = filtered.filter(b => {
              // Default to 'pending' if status is missing or null
              const currentStatus = (b.status || 'pending').toLowerCase();
              return currentStatus === status.toLowerCase();
            });
          }

          // 2. Search Text Filter
          if (search) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(b => {
              return (b.name || '').toLowerCase().includes(q) ||
                     (b.email || '').toLowerCase().includes(q) ||
                     (b.phone || '').toLowerCase().includes(q) ||
                     (b.service || '').toLowerCase().includes(q) ||
                     (b.company_name || '').toLowerCase().includes(q) ||
                     (b.job_title || '').toLowerCase().includes(q) ||
                     (b.message || '').toLowerCase().includes(q);
            });
          }

          // Format CSV
          function escapeCSV(val) {
            if (val === undefined || val === null) return '';
            let str = String(val);
            str = str.replace(/"/g, '""');
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
              return `"${str}"`;
            }
            return str;
          }

          const headers = [
            'Booking ID',
            'Date',
            'Customer Name',
            'Email',
            'Phone',
            'Company',
            'Role',
            'Service of Interest',
            'Message',
            'Status'
          ];

          let csvContent = headers.join(',') + '\r\n';
          for (const b of filtered) {
            const row = [
              b.id,
              b.created_at,
              b.name,
              b.email,
              b.phone || 'N/A',
              b.company_name || 'N/A',
              b.job_title || 'N/A',
              b.service || 'N/A',
              b.message || '',
              b.status || 'pending'
            ];
            csvContent += row.map(escapeCSV).join(',') + '\r\n';
          }

          // Return CSV file
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="bookings_export.csv"');
          return res.status(200).send(csvContent);

        } catch (e) {
          return res.status(500).json({ error: 'Failed to process export records' });
        }
      } else {
        return res.status(500).json({ error: 'Failed to retrieve database transaction' });
      }
    });
  });

  request.on('error', () => {
    return res.status(500).json({ error: 'Database connection failed' });
  });

  request.end();
};
