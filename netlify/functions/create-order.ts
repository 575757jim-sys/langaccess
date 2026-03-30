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

  const productUid = process.env.GELATO_PRODUCT_UID || 'cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor';
  const fileUrl = 'https://langaccess.org/card-front.pdf';

  console.log('productUid:', productUid);
  console.log('fileUrl:', fileUrl);

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
    products: [
      {
        itemReferenceId: 'cards',
        productUid,
        fileUrl,
        quantity,
      },
    ],
  };

  console.log('Full Gelato request body:', JSON.stringify(quotePayload, null, 2));

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
      const responseText = await gelatoRes.text();
      console.error('Gelato error:', responseText);
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          error: responseText
        }),
      };
    }

    const gelatoData = await gelatoRes.json();
    console.log('Gelato quote response:', JSON.stringify(gelatoData, null, 2));

    const quote = gelatoData?.quotes?.[0];
    const productPrice = quote?.products?.[0]?.price ?? null;
    const currency = quote?.products?.[0]?.currency ?? quote?.shipmentMethods?.[0]?.currency ?? null;
    const shipmentMethods = quote?.shipmentMethods ?? [];

    let cheapestShipment = null;
    if (shipmentMethods.length > 0) {
      cheapestShipment = shipmentMethods.reduce((cheapest: any, current: any) => {
        if (!cheapest || (current.price != null && current.price < cheapest.price)) {
          return current;
        }
        return cheapest;
      }, null);
    }

    const normalized = {
      success: true,
      product_price: productPrice,
      shipping_price: cheapestShipment?.price ?? null,
      total_price:
        productPrice != null && cheapestShipment?.price != null
          ? Number((productPrice + cheapestShipment.price).toFixed(2))
          : null,
      currency,
      shipment_method_name: cheapestShipment?.name ?? null,
      raw: gelatoData
    };

    console.log('Normalized quote response:', JSON.stringify(normalized, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify(normalized),
    };
  } catch (err) {
    console.error('Gelato quote exception:', err);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        error: String(err)
      }),
    };
  }
};
