import type { Handler } from '@netlify/functions';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DOWNLOAD_URL = 'https://langaccess.org/LangAccess_Strategic_Framework_v3.pdf';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email: string;
  try {
    const body = JSON.parse(event.body ?? '{}');
    email = (body.email ?? '').trim();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@langaccess.org',
      to: email,
      subject: 'Your LangAccess Language Access Toolkit',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0d9488;">Thank you for downloading the LangAccess Toolkit</h2>
          <p>Thank you for your interest in language access. Your toolkit is ready to download:</p>
          <p style="margin: 24px 0;">
            <a href="${DOWNLOAD_URL}"
               style="background: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Download Your Toolkit
            </a>
          </p>
          <p>This guide includes policy templates, staff checklists, and compliance documentation for Title VI and California LEP language access programs.</p>
          <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
            LangAccess &mdash; Helping organizations communicate across languages.<br>
            <a href="https://langaccess.org" style="color: #0d9488;">langaccess.org</a>
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', res.status, text);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to send email' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
