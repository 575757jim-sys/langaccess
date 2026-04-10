import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const STATIC_FRONT_PDF = "https://langaccess.org/card-front.pdf";
const STATIC_BACK_PDF = "https://langaccess.org/card-back.pdf";

function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !url.startsWith("data:");
  } catch {
    return false;
  }
}

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
    frontFileUrl?: string;
    backFileUrl?: string;
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
    frontFileUrl,
    backFileUrl,
  } = body;

  const cityClean = (city || "").trim().replace(/,\s*$/, "");
  const stateClean = (state || "").trim().replace(/,/g, "").trim();
  const cityStateDisplay = stateClean ? `${cityClean}, ${stateClean}` : cityClean;

  const nameParts = full_name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const resolvedFrontUrl = isPublicUrl(frontFileUrl) ? frontFileUrl! : STATIC_FRONT_PDF;
  const resolvedBackUrl = isPublicUrl(backFileUrl) ? backFileUrl! : STATIC_BACK_PDF;

  console.log("[Gelato] Front file URL:", resolvedFrontUrl);
  console.log("[Gelato] Back file URL:", resolvedBackUrl);
  console.log("[Gelato] Shipping to:", cityStateDisplay, zip);

  const orderPayload = {
    orderType: "order",
    orderReferenceId: crypto.randomUUID(),
    customerReferenceId: ambassador_id,
    currency: "USD",
    items: [
      {
        itemReferenceId: "item-1",
        productUid: process.env.GELATO_PRODUCT_UID || "cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor",
        files: [
          { type: "default", url: resolvedFrontUrl },
          { type: "back", url: resolvedBackUrl },
        ],
        quantity: quantity || 1,
      },
    ],
    shippingAddress: {
      firstName,
      lastName,
      addressLine1: shipping_address || "",
      city: cityClean,
      stateCode: stateClean,
      postCode: zip || "",
      countryIsoCode: "US",
      email,
      phone: phone || "0000000000",
    },
  };

  console.log("[Gelato] Order payload:", JSON.stringify(orderPayload));

  let gelatoOrderId: string | null = null;
  let gelatoPrice: number | null = null;
  let gelatoCurrency = "USD";

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
      const errorText = await gelatoRes.text();
      console.error("[Gelato] API error:", errorText);
      return {
        statusCode: gelatoRes.status,
        body: JSON.stringify({
          error: "Could not prepare print file. Please try again.",
          _debug: errorText,
        }),
      };
    }

    const gelatoData = await gelatoRes.json();
    console.log("[Gelato] Full response:", JSON.stringify(gelatoData));
    gelatoOrderId = gelatoData.id || gelatoData.orderId || null;

    const items = gelatoData.items || [];
    const firstItem = items[0] || {};
    gelatoPrice =
      gelatoData.price ??
      gelatoData.totalPrice ??
      gelatoData.total ??
      firstItem.price ??
      null;
    gelatoCurrency =
      gelatoData.currency ??
      gelatoData.currencyIsoCode ??
      orderPayload.currency ??
      "USD";
  } catch (err) {
    console.error("[Gelato] Network error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not reach the print service. Please try again.",
        _debug: String(err),
      }),
    };
  }

  const shippingAddressJson = {
    address: shipping_address,
    city: cityClean,
    state: stateClean,
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
    console.error("[Gelato] Supabase insert error:", dbError);
  }

  const shippingAddressDisplay = [shipping_address, cityStateDisplay, zip].filter(Boolean).join(", ");

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
    console.error("[Gelato] Confirmation email failed (non-fatal):", emailErr);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: true,
      gelatoOrderId,
      price: gelatoPrice,
      currency: gelatoCurrency,
      quantity,
    }),
  };
};
