import type { Handler } from '@netlify/functions';
const KEY = process.env.RESEND_API_KEY || '';
const post = (to: string, subject: string, body: string) =>
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'LangAccess <hello@langaccess.org>',
      to: to,
      reply_to: 'LangAccessInfo@gmail.com',
      subject: subject,
      html: body
    })
  });
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Not allowed' };
  }
  try {
    const d = JSON.parse(event.body || '{}');
    const name = d.full_name || '';
    const email = d.email || '';
    const slug = d.slug || '';
    const qr = d.qrUrl || '';
    const first = name.split(' ')[0];
    await post(
      'LangAccessInfo@gmail.com',
      'New Ambassador Brigade signup: ' + name,
      '<p><strong>' + name + '</strong> just joined the Ambassador Brigade.</p>' +
      '<p>Email: ' + email + '</p>' +
      '<p>QR Slug: ' + slug + '</p>' +
      '<p>Next step: Ambassador will order their cards at cost via langaccess.org/order-cards</p>' +
      '<p>No action needed from you unless they need support.</p>'
    );
    await post(
      email,
      'Welcome to the Ambassador Brigade, ' + first,
      '<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">' +
      '<div style="background:#0b0d0c;padding:24px;border-radius:12px 12px 0 0;">' +
      '<p style="color:#2dff72;font-size:11px;text-transform:uppercase;' +
      'letter-spacing:0.1em;margin:0 0 8px;">LangAccess Ambassador Brigade</p>' +
      '<h1 style="color:#f5f3ee;font-size:22px;margin:0;">' +
      'You are in the Brigade, ' + first + '.</h1>' +
      '</div>' +
      '<div style="background:#f9f9f7;padding:24px;border-radius:0 0 12px 12px;">' +
      '<p>Your Ambassador cards are printed with your unique QR code and shipped' +
      ' directly to you at cost. No markup. Each card connects people to food,' +
      ' shelter, restrooms, power, and crisis aid in English, Spanish, Tagalog,' +
      ' Vietnamese, Mandarin, and Cantonese.</p>' +
      '<div style="text-align:center;margin:20px 0;background:#0b0d0c;' +
      'padding:16px;border-radius:8px;">' +
      '<p style="color:#6b7a6e;font-size:11px;text-transform:uppercase;' +
      'margin:0 0 10px;">Your Personal QR Code</p>' +
      '<img src="' + qr + '" width="150" height="150"' +
      ' style="border-radius:8px;" alt="Your QR code"/>' +
      '<p style="color:#2dff72;font-family:monospace;font-size:12px;' +
      'margin:8px 0 0;">langaccess.org/r/' + slug + '</p>' +
      '</div>' +
      '<p><strong>Next step:</strong> Order your cards at cost —' +
      ' printed with your QR code above and shipped directly to you.</p>' +
      '<div style="text-align:center;margin:20px 0;">' +
      '<a href="https://langaccess.org/order-cards"' +
      ' style="background:#2dff72;color:#0b0d0c;font-weight:700;' +
      'padding:12px 24px;border-radius:100px;text-decoration:none;' +
      'font-size:14px;display:inline-block;">' +
      'Order My Cards →</a>' +
      '</div>' +
      '<p>When your cards arrive, leave them in waiting rooms, break rooms,' +
      ' teacher lounges, or hand them directly to anyone who might need help.' +
      ' You do not need to say anything. The card does the work.</p>' +
      '<p style="font-size:12px;color:#999;margin-top:16px;">' +
      'Questions? Reply to this email.<br>The LangAccess team</p>' +
      '</div></div>'
    );
    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
