import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

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
      gelato_base_cost,
      markup,
      product_price,
      shipping_price,
      total_price,
      currency,
      shipment_method_name,
      street_address,
      city,
      state,
      zip,
      order_type,
      ambassador_id,
      front_file_url,
      back_file_url,
    } = body;

    const missing: string[] = [];
    if (!full_name) missing.push('full_name');
    if (!email) missing.push('email');
    if (!quantity) missing.push('quantity');
    if (!total_price) missing.push('total_price');
    if (missing.length > 0) {
      console.error('Missing required fields:', missing);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
      };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database not configured' }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Stripe not configured' }),
      };
    }

    const lockedGelatoBaseCost = parseFloat(String(gelato_base_cost || product_price || 0));
    const lockedMarkup = parseFloat(String(markup || 0));
    const lockedProductPrice = parseFloat(String(product_price || 0));
    const lockedShippingPrice = parseFloat(String(shipping_price || 0));
    const lockedTotalPrice = parseFloat(String(total_price));
    const lockedFinalTotal = lockedTotalPrice;

    console.log('[Checkout] ambassadorCode:', ref_code || '');
    console.log('[Checkout] quantity:', quantity);
    console.log('[Checkout] gelatoBaseCost:', lockedGelatoBaseCost);
    console.log('[Checkout] markup:', lockedMarkup);
    console.log('[Checkout] finalTotal:', lockedFinalTotal);
    console.log('[Checkout] stripeCheckoutAmount:', lockedFinalTotal);

    const orderRecord = {
      ambassador_id: ref_code || '',
      ref_code: ref_code || '',
      quantity: parseInt(String(quantity)),
      shipping_name: full_name,
      email,
      street_address: street_address || '',
      city: city || '',
      state: state || '',
      zip_code: zip || '',
      product_price: lockedProductPrice,
      shipping_price: lockedShippingPrice,
      total_price: lockedTotalPrice,
      currency: currency || 'USD',
      status: 'pending',
      shipping_address_json: {
        street_address: street_address || '',
        city: city || '',
        state: state || '',
        zip: zip || '',
      },
    };

    const { data: savedOrder, error: dbError } = await supabase
      .from('card_orders')
      .insert([orderRecord])
      .select()
      .single();

    if (dbError || !savedOrder) {
      console.error('Failed to save order:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save order' }),
      };
    }

    console.log('Order saved with pending status:', savedOrder.id);

    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const amountInCents = Math.round(lockedFinalTotal * 100);

    let description = `${quantity} LangAccess Ambassador Cards`;
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
        order_id: savedOrder.id,
        order_type: order_type || 'card_order',
        full_name,
        email,
        quantity: String(quantity),
        ambassadorCode: ref_code || '',
        ref_code: ref_code || '',
        ambassador_id: ambassador_id || '',
        gelatoBaseCost: String(lockedGelatoBaseCost),
        markup: String(lockedMarkup),
        finalTotal: String(lockedFinalTotal),
        shippingCity: city || '',
        shippingState: state || '',
        street_address: street_address || '',
        zip: zip || '',
        currency: currency || 'USD',
        shipment_method_name: shipment_method_name || '',
        front_file_url: front_file_url || '',
        back_file_url: back_file_url || '',
        product_price: String(lockedProductPrice),
        shipping_price: String(lockedShippingPrice),
        total_price: String(lockedFinalTotal),
        city: city || '',
        state: state || '',
      },
      success_url: `${event.headers.origin || 'https://langaccess.org'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || 'https://langaccess.org'}/cancel`,
    });

    console.log('Stripe Checkout session created:', session.id);

    const { error: updateError } = await supabase
      .from('card_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', savedOrder.id);

    if (updateError) {
      console.error('Failed to update order with session ID:', updateError);
    }

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
