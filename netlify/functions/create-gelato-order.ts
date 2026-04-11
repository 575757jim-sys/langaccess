import { Handler } from "@netlify/functions";

function isPublicHttpsUrl(url: string | undefined): boolean {
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
    phone?: string;
    shipping_address: string;
    city: string;
    state: string;
    zip: string;
    quantity: number;
    finalPrintAssetUrl?: string;
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
    shipping_address,
    city,
    state,
    zip,
    quantity,
    finalPrintAssetUrl,
    frontFileUrl,
  } = body;

  const cityClean = (city || "").trim().replace(/,\s*$/, "");
  const stateClean = (state || "").trim().replace(/,/g, "").trim();
  const cityStateDisplay = stateClean ? `${cityClean}, ${stateClean}` : cityClean;

  const nameParts = (full_name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const resolvedPrintUrl = isPublicHttpsUrl(finalPrintAssetUrl)
    ? finalPrintAssetUrl!
    : isPublicHttpsUrl(frontFileUrl)
    ? frontFileUrl!
    : "https://langaccess.org/card-front.pdf";

  const isTestMode = (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_");

  console.log("[GelatoQuote] QUOTE ONLY — no real order submitted");
  console.log("[GelatoQuote] sandboxMode:", isTestMode);
  console.log("[GelatoQuote] ambassadorCode:", ambassador_id);
  console.log("[GelatoQuote] quantity:", quantity);
  console.log("[GelatoQuote] finalPrintAssetUrl (input):", finalPrintAssetUrl || "(none)");
  console.log("[GelatoQuote] resolvedPrintUrl:", resolvedPrintUrl);
  console.log("[GelatoQuote] Shipping to:", cityStateDisplay, zip);

  const gelatoQuotePayload = {
    orderType: "draft",
    orderReferenceId: `quote-${ambassador_id || "anon"}-${Date.now()}`,
    customerReferenceId: ambassador_id,
    currency: "USD",
    items: [
      {
        itemReferenceId: "item-1",
        productUid: process.env.GELATO_PRODUCT_UID || "cards_pf_bx_pt_300-gsm-uncoated_cl_4-4_hor",
        files: [
          { type: "default", url: resolvedPrintUrl },
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
      phone: "0000000000",
    },
  };

  console.log("[GelatoQuote] gelatoQuotePayload:", JSON.stringify(gelatoQuotePayload));

  let gelatoPrice: number | null = null;
  let gelatoCurrency = "USD";

  try {
    const gelatoRes = await fetch("https://order.gelatoapis.com/v4/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.GELATO_API_KEY!,
      },
      body: JSON.stringify(gelatoQuotePayload),
    });

    const gelatoResponseText = await gelatoRes.text();
    console.log("[GelatoQuote] gelatoResponse (raw):", gelatoResponseText);

    if (!gelatoRes.ok) {
      console.error("[GelatoQuote] API error status:", gelatoRes.status, "body:", gelatoResponseText);
      return {
        statusCode: gelatoRes.status,
        body: JSON.stringify({
          error: "Could not retrieve print quote. Please try again.",
          _debug: gelatoResponseText,
        }),
      };
    }

    const gelatoData = JSON.parse(gelatoResponseText);
    console.log("[GelatoQuote] quoteGenerated — response parsed:", JSON.stringify(gelatoData));

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
      gelatoQuotePayload.currency ??
      "USD";

    console.log("[GelatoQuote] quote generated — price:", gelatoPrice, "currency:", gelatoCurrency);
  } catch (err) {
    console.error("[GelatoQuote] Network error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not reach the print service. Please try again.",
        _debug: String(err),
      }),
    };
  }

  console.log("[GelatoQuote] Returning quote to client — NO Gelato order created, NO DB write");

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: true,
      price: gelatoPrice,
      currency: gelatoCurrency,
      quantity,
      quoteOnly: true,
    }),
  };
};
