import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode, generateBatchQRUrl } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

function normalizeCityState(raw: string): { city: string; state: string; formatted: string } {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || "";
  const stateRaw = parts[1] || "";
  const state = stateRaw.replace(/,/g, "").trim();
  const formatted = state ? `${city}, ${state}` : city;
  return { city, state, formatted };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: { order_id: string; full_name: string; city_state: string; slug?: string; ambassador_id?: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { order_id, full_name, city_state, slug, ambassador_id } = body;

  if (!order_id || !full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: order_id, full_name, city_state" }),
    };
  }

  const { city, state, formatted: formattedCityState } = normalizeCityState(city_state);
  const batchCode = generateBatchCode(city);

  const effectiveSlug = slug || batchCode;
  const refCode = ambassador_id || slug || batchCode;
  const qrTarget = `https://langaccess.org/help?ref=${encodeURIComponent(refCode)}`;

  console.log("[generate-card-pdf] Final QR destination URL:", qrTarget);

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(qrTarget)}`;

  const backFileUrl = "https://langaccess.org/card-back.pdf";
  const frontFileUrl = "https://langaccess.org/card-front.pdf";

  let composedDataUrl: string | null = null;
  let composeStep = "not_started";

  try {
    composeStep = "calling_compose_edge_function";
    console.log("[generate-card-pdf] Calling compose-card-image for slug:", effectiveSlug);

    const composeRes = await fetch(`${SUPABASE_URL}/functions/v1/compose-card-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        slug: effectiveSlug,
        ambassador_id: refCode,
        full_name,
        city_state: formattedCityState,
      }),
    });

    if (composeRes.ok) {
      composeStep = "parsing_compose_response";
      const composeData = await composeRes.json();
      if (composeData.composedDataUrl) {
        composedDataUrl = composeData.composedDataUrl;
        composeStep = "success";
        console.log("[generate-card-pdf] Composed image received, length:", composedDataUrl.length);
      } else {
        composeStep = "compose_returned_no_data_url";
        console.warn("[generate-card-pdf] compose-card-image returned no composedDataUrl:", JSON.stringify(composeData));
      }
    } else {
      const errText = await composeRes.text();
      composeStep = `compose_http_error_${composeRes.status}`;
      console.warn(`[generate-card-pdf] compose-card-image HTTP ${composeRes.status}:`, errText);
    }
  } catch (err) {
    composeStep = "compose_network_error";
    console.error("[generate-card-pdf] compose-card-image network error:", err);
  }

  const { error: updateError } = await supabase
    .from("card_orders")
    .update({
      batch_code: batchCode,
      qr_url: qrApiUrl,
      qr_image_path: qrApiUrl,
      card_asset_path: composedDataUrl ? "data_url" : qrApiUrl,
    })
    .eq("id", order_id);

  if (updateError) {
    console.warn("[generate-card-pdf] Could not update card_orders:", updateError.message);
  }

  const finalPrintAssetUrl = composedDataUrl ? "(composedDataUrl — base64 image)" : frontFileUrl;
  console.log("[generate-card-pdf] Final print asset URL:", finalPrintAssetUrl);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: true,
      frontFileUrl,
      backFileUrl,
      composedDataUrl,
      qrUrl: qrApiUrl,
      batch_code: batchCode,
      city_state: formattedCityState,
      city,
      state,
      composeStep,
    }),
  };
};
