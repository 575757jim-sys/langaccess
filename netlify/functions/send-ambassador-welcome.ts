import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { full_name, email, slug, qrUrl } =
      JSON.parse(event.body || '{}');
    const firstName = full_name.split(' ')[0];

    // Notify you
    await resend.emails.send({
      from: 'LangAccess <hello@langaccess.org>',
      to: 'LangAccessInfo@gmail.com',
      subject: `New Ambassador: ${full_name}`,
      html: `
        <p><strong>${full_name}</strong> signed up as an ambassador.</p>
        <p>Email: ${email}</p>
        <p>QR Slug: ${slug}</p>
        <p><strong>Action needed:</strong> Order their 25-card
        pack via Printful, then set
        free_pack_shipped = true in Supabase.</p>
      `
    });

    // Welcome the ambassador
    await resend.emails.send({
      from: 'LangAccess <hello@langaccess.org>',
      to: email,
      subject: `Welcome to the Brigade, ${firstName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:0 auto;">
          <div style="background:#0b0d0c;padding:28px;
                      border-radius:12px 12px 0 0;">
            <p style="color:#2dff72;font-size:11px;
               text-transform:uppercase;letter-spacing:0.1em;
               margin:0 0 8px;">LangAccess</p>
            <h1 style="color:#f5f3ee;font-size:22px;margin:0;">
              You're in, ${firstName}.
            </h1>
          </div>
          <div style="background:#f9f9f7;padding:28px;
                      border-radius:0 0 12px 12px;">
            <p>Your free 25-card starter pack ships within
            5 business days. Each card carries your unique
            QR code — every scan is tracked.</p>
            <div style="text-align:center;margin:24px 0;
                        background:#0b0d0c;padding:20px;
                        border-radius:8px;">
              <p style="color:#6b7a6e;font-size:11px;
                 text-transform:uppercase;margin:0 0 12px;">
                Your QR Code</p>
              <img src="${qrUrl}" width="160" height="160"
                   style="border-radius:8px;"
                   alt="Your ambassador QR code" />
              <p style="color:#2dff72;font-size:12px;
                 font-family:monospace;margin:12px 0 0;">
                langaccess.org/r/${slug}
              </p>
            </div>
            <p>Leave cards in waiting rooms, break rooms,
            anywhere someone might need help finding
            resources in their language.</p>
            <p style="font-size:12px;color:#999;margin-top:20px;">
              Questions? Reply to this email.<br>
              — The LangAccess team
            </p>
          </div>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sent: true })
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
