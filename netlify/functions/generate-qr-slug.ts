import type { Handler } from '@netlify/functions';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { ambassador_id, full_name, city_state } =
      JSON.parse(event.body || '{}');

    const nameParts = full_name.trim().toLowerCase().split(' ');
    const first = nameParts[0].charAt(0);
    const last = nameParts[nameParts.length - 1].replace(/[^a-z]/g, '');
    const city = city_state.split(',')[0].trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '');
    const shortId = ambassador_id.split('-')[0];
    const slug = `${first}${last}-${city}-${shortId}`;

    await fetch(
      `${SUPABASE_URL}/rest/v1/ambassadors?id=eq.${ambassador_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ qr_slug: slug })
      }
    );

    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300` +
      `&data=${encodeURIComponent(`https://langaccess.org/r/${slug}`)}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, qrUrl })
    };

  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
