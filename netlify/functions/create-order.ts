import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const body = JSON.parse(event.body || '{}');

  console.log('ORDER RECEIVED:', body);

  const {
    full_name,
    email,
    street_address,
    city,
    state,
    zip,
    quantity,
    ref_code,
  } = body;

  const nameParts = full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const quotePayload = {
    currency: 'USD',
    orderReferenceId: 'quote-' + Date.now(),
    customerReferenceId: ref_code || email,
    recipient: {
      country: 'US',
      firstName,
      lastName,
      addressLine1: street_address,
      city,
      state,
      postCode: zip,
      email,
    },
    items: [
      {
        itemReferenceId: 'cards',
        productUid: process.env.GELATO_PRODUCT_UID || 'cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor',
        fileUrl: 'https://langaccess.org/card-front.pdf',
        quantity,
      },
    ],
  };

  console.log('Gelato quote request:', JSON.stringify(quotePayload, null, 2));

  try {
    const gelatoRes = await fetch('https://order.gelatoapis.com/v3/orders:quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.GELATO_API_KEY!,
      },
      body: JSON.stringify(quotePayload),
    });

    if (!gelatoRes.ok) {
      const errorText = await gelatoRes.text();
      console.error('Gelato quote error:', errorText);
      return {
        statusCode: gelatoRes.status,
        body: JSON.stringify({ error: 'Gelato API error', details: errorText }),
      };
    }

    const gelatoData = await gelatoRes.json();
    console.log('Gelato quote response:', JSON.stringify(gelatoData, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify(gelatoData),
    };
  } catch (err) {
    console.error('Gelato quote exception:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get quote', details: String(err) }),
    };
  }
};
