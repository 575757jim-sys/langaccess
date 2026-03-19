import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { ambassador_id, full_name, city_state } =
      JSON.parse(event.body || '{}');

    const nameParts = full_name.trim().toLowerCase().split(' ');
    const first = nameParts[0].charAt(0);
    const last = nameParts[nameParts.length - 1]
      .replace(/[^a-z]/g, '');
    const city = city_state.split(',')[0].trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '');
    const shortId = ambassador_id.split('-')[0];
    const slug = `${first}${last}-${city}-${shortId}`;

    await supabase
      .from('ambassadors')
      .update({ qr_slug: slug })
      .eq('id', ambassador_id);

    const qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300` +
      `&data=${encodeURIComponent(
        `https://langaccess.org/r/${slug}`
      )}`;

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
