import type { Handler } from '@netlify/functions';
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { full_name, email, slug, qrUrl } = JSON.parse(event.body || '{}');
    const firstName = full_name.split(' ')[0];
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'LangAccess <hello@langaccess.org>', to: 'LangAccessInfo@gmail.com', subject: 'New Ambassador: ' + full_name, html: '<p>' + full_name + ' signed up.</p><p>Email: ' + email + '</p><p>Slug: ' + slug + '</p><p>Order 25-card pack via Printful then set free_pack_shipped = true in Supabase.</p>' })
    });
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'LangAccess <hello@langaccess.org>', to: email, subject: 'Welcome to the Brigade, ' + firstName, html: '<p>You are in, ' + firstName + '. Your free 25-card pack ships within 5 business days.</p><p>Your QR code: <img src="' + qrUrl + '" width="160" height="160"/></p><p>langaccess.org/r/' + slug + '</p><p>Questions? Reply to this email. The LangAccess team</p>' })
    });
    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
