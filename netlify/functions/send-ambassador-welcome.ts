import type { Handler } from '@netlify/functions';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { full_name, email, slug, qrUrl } =
      JSON.parse(event.body || '{}');
    const firstName = full_name.split(' ')[0];

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'LangAccess <hello@langaccess.org>',
        to: 'LangAccessInfo@gmail.com',
        subject: `New Ambassador: ${full_name}`,
        html: `<p><strong>${full_name}</strong> signed up.</p>
               <p>Email: ${email}</p>
               <p>Slug: ${slug}</p>
               <p>Order 25-card pack via Printful then set
               free_pack_shipped = true in Supabase.</p>`
      })
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'LangAccess <hello@langaccess.org>',
        to: email,
        subject: `Welcome to the Brigade, ${firstName}`,
        html: `<div style="font-family:sans-serif;
                    max-width:520px;margin:0 auto;">
                 <div style="background:#0b0d0c;padding:28px;
                      border-radius:12px 12px 0 0;">
                   <p style="color:#2dff72;font-size:11px;
                      text-transform:uppercase;margin:0 0 8px;">
                     LangAccess</p>
                   <h1 style="color:#f5f3ee;font-size:22px;
                       margin:0;">You're in, ${firstName}.</h1>
                 </div>
                 <div style="background:#f9f9f7;padding:28px;
                      border-radius:0 0 12px 12px;">
                   <p>Your free 25-card pack ships within
                   5 business days.</p>
                   <div style="text-align:center;margin:20px 0;
                        background:#0b0d0c;padding:20px;
                        border-radius:8px;">
                     <img src="${qrUrl}" width="160" height="160"
                          style="border-radius:8px;"
                          alt="Your QR code"/>
                     <p style="color:#2dff72;font-family:monospace;
                        font-size:12px;margin:8px 0 0;">
                       langaccess.org/r/${slug}</p>
                   </div>
                   <p style="font-size:12px;color:#999;">
                     Questions? Reply to this email.<br>
                     — The LangAccess team</p>
                 </div>
               </div>`
      })
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
```

