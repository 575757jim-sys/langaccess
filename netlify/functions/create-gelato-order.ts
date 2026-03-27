import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: {
    ambassador_id: string;
    full_name: string;
    email: string;
    phone: string;
    shipping_address: string;
    city: string;
    state: string;
    zip: string;
    quantity: number;
  };

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const {
    ambassador_id,
    full_name,
    email,
    phone,
    shipping_address,
    city,
    state,
    zip,
    quantity,
  } = body;

  const nameParts = full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const orderPayload = {
    orderType: "order",
    orderReferenceId: crypto.randomUUID(),
    customerReferenceId: ambassador_id,
    currency: "USD",
    items: [
      {
        itemReferenceId: "item-1",
        productUid: process.env.GELATO_PRODUCT_UID || "cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor",
        designId: "11ed88be-e592-4a23-9711-5316cbfb99a7",
        quantity,
      },
    ],
    shippingAddress: {
      firstName,
      lastName,
      addressLine1: shipping_address,
      city,
      state,
      postCode: zip,
      country: "US",
    },
  };

  console.log("Gelato order payload:", JSON.stringify(orderPayload));

  let gelatoOrderId: string | null = null;

  try {
    const gelatoRes = await fetch("https://order.gelatoapis.com/v4/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.GELATO_API_KEY!,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!gelatoRes.ok) {
      const errText = await gelatoRes.text();
      console.error("Gelato API error response:", gelatoRes.status, errText);
      return {
        statusCode: gelatoRes.status,
        body: JSON.stringify({ error: "Gelato API error", details: errText }),
      };
    }

    const gelatoData = await gelatoRes.json();
    console.log("Gelato API success response:", JSON.stringify(gelatoData));
    gelatoOrderId = gelatoData.id || gelatoData.orderId || null;
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to call Gelato API", details: String(err) }),
    };
  }

  const shippingAddressJson = {
    address: shipping_address,
    city,
    state,
    zip,
  };

  const { error: dbError } = await supabase.from("card_orders").insert({
    ambassador_id,
    gelato_order_id: gelatoOrderId,
    quantity,
    shipping_name: full_name,
    shipping_address_json: shippingAddressJson,
    status: "submitted",
    created_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error("Supabase insert error:", dbError);
  }

  const shippingAddressDisplay = [shipping_address, city, state, zip].filter(Boolean).join(", ");

  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-order-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        full_name,
        email,
        quantity,
        gelato_order_id: gelatoOrderId,
        shipping_address: shippingAddressDisplay,
      }),
    });
  } catch (emailErr) {
    console.error("Confirmation email failed (non-fatal):", emailErr);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, gelatoOrderId }),
  };
};
