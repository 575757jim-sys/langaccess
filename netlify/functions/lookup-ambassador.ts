import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: { ref_code?: string; ambassador_id?: string };
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const select = 'id,full_name,email,street_address,city_state,zip_code,slug,ref_code';
  let queryUrl: string;

  if (body.ref_code) {
    queryUrl = `${supabaseUrl}/rest/v1/ambassadors?select=${select}&ref_code=eq.${encodeURIComponent(body.ref_code.toUpperCase())}`;
  } else if (body.ambassador_id) {
    queryUrl = `${supabaseUrl}/rest/v1/ambassadors?select=${select}&id=eq.${encodeURIComponent(body.ambassador_id)}`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'ref_code or ambassador_id required' }) };
  }

  const res = await fetch(queryUrl, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return { statusCode: 502, body: JSON.stringify({ error: 'Database error', detail: text }) };
  }

  const rows = await res.json();

  if (!rows || rows.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ found: false }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ found: true, ambassador: rows[0] }),
  };
};

export { handler };
