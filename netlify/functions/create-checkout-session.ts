import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    console.log('Incoming checkout session request:', body);

    const {
      full_name,
      email,
      quantity,
      ref_code,
      product_price,
      shipping_price,
      total_price,
      currency,
      shipment_method_name,
      street_address,
      city,
      state,
      zip,
    } = body;

    if (!full_name || !email || !quantity || !total_price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Stripe not configured' }),
      };
    }

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const amountInCents = Math.round(total_price * 100);

    let description = `${quantity} cards`;
    if (shipment_method_name) {
      description += ` • ${shipment_method_name}`;
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency?.toLowerCase() || 'usd',
            product_data: {
              name: 'LangAccess Ambassador Cards',
              description,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        full_name,
        email,
        quantity: String(quantity),
        ref_code: ref_code || '',
        street_address: street_address || '',
        city: city || '',
        state: state || '',
        zip: zip || '',
        product_price: String(product_price || ''),
        shipping_price: String(shipping_price || ''),
        total_price: String(total_price),
        currency: currency || 'USD',
        shipment_method_name: shipment_method_name || '',
      },
      success_url: `https://langaccess.org/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://langaccess.org/order-cards',
    });

    console.log('Stripe Checkout session created:', session.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: session.url,
      }),
    };
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        details: (error as Error)?.message || 'Unknown error',
      }),
    };
  }
};

export { handler };
