import type { Handler } from '@netlify/functions';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = 'LangAccessInfo@gmail.com';

interface PilotRequestBody {
  organization: string;
  sector: string;
  staff_size: string;
  name: string;
  email: string;
  message: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: PilotRequestBody;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { organization, sector, staff_size, name, email, message } = body;

  if (!organization || !sector || !staff_size || !name || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email address' }) };
  }

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  const notificationHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #0d9488;">New Institutional Pilot Request</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 40%;">Organization</td>
          <td style="padding: 10px 0;">${organization}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Sector</td>
          <td style="padding: 10px 0;">${sector}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Approximate Staff Size</td>
          <td style="padding: 10px 0;">${staff_size}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Name</td>
          <td style="padding: 10px 0;">${name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email</td>
          <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0d9488;">${email}</a></td>
        </tr>
        ${message ? `
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #475569; vertical-align: top;">Message</td>
          <td style="padding: 10px 0;">${message}</td>
        </tr>` : ''}
      </table>
      <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
        LangAccess &mdash; Institutional Pilot Requests<br>
        <a href="https://langaccess.org" style="color: #0d9488;">langaccess.org</a>
      </p>
    </div>
  `;

  const confirmationHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #0d9488;">Your LangAccess Pilot Request</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in the LangAccess Institutional Pilot Program. We've received your request for <strong>${organization}</strong> and will be in touch within 1 business day.</p>
      <p>Here's a summary of what you submitted:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 40%;">Organization</td>
          <td style="padding: 10px 0;">${organization}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Sector</td>
          <td style="padding: 10px 0;">${sector}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; font-weight: bold; color: #475569;">Approximate Staff Size</td>
          <td style="padding: 10px 0;">${staff_size}</td>
        </tr>
      </table>
      <p>In the meantime, feel free to explore LangAccess at <a href="https://langaccess.org" style="color: #0d9488;">langaccess.org</a>.</p>
      <p style="color: #64748b; font-size: 13px; margin-top: 32px;">
        LangAccess &mdash; Helping organizations communicate across languages.<br>
        <a href="https://langaccess.org" style="color: #0d9488;">langaccess.org</a>
      </p>
    </div>
  `;

  const [notifyRes, confirmRes] = await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@langaccess.org',
        to: NOTIFY_EMAIL,
        subject: 'New Institutional Pilot Request',
        html: notificationHtml,
      }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@langaccess.org',
        to: email,
        subject: 'Your LangAccess Pilot Request',
        html: confirmationHtml,
      }),
    }),
  ]);

  if (!notifyRes.ok || !confirmRes.ok) {
    const notifyText = !notifyRes.ok ? await notifyRes.text() : '';
    const confirmText = !confirmRes.ok ? await confirmRes.text() : '';
    console.error('Resend error (notify):', notifyRes.status, notifyText);
    console.error('Resend error (confirm):', confirmRes.status, confirmText);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to send email' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
