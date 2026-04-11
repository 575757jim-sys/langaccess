import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

console.log("[generate-card-pdf] SUPABASE_URL resolved:", SUPABASE_URL || "(MISSING — check env vars)");
console.log("[generate-card-pdf] SUPABASE_ANON_KEY present:", SUPABASE_ANON_KEY ? "yes" : "NO — key is missing");

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
  const ambassadorCode = ambassador_id || slug || batchCode;
  const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(qrDestinationUrl)}`;

  console.log("[generate-card-pdf] ambassadorCode:", ambassadorCode);
  console.log("[generate-card-pdf] qrDestinationUrl:", qrDestinationUrl);
  console.log("[generate-card-pdf] qrImageUrl:", qrImageUrl);

  let finalPrintAssetUrl: string | null = null;
  let composedDataUrl: string | null = null;
  let composeStep = "not_started";

  const composeUrl = `${SUPABASE_URL}/functions/v1/compose-card-image`;

  if (!SUPABASE_URL) {
    composeStep = "compose_missing_supabase_url";
    console.error("[generate-card-pdf] compose-card-image endpoint not found — check deployment or URL. SUPABASE_URL is empty.");
  } else {
    try {
      composeStep = "calling_compose_edge_function";
      console.log("[generate-card-pdf] Calling compose-card-image:", composeUrl);
      console.log("[generate-card-pdf] ambassadorCode:", ambassadorCode);
      console.log("[generate-card-pdf] qrDestinationUrl:", qrDestinationUrl);

      const composeRes = await fetch(composeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          slug: effectiveSlug,
          ambassador_id: ambassadorCode,
          full_name,
          city_state: formattedCityState,
        }),
      });

      console.log("[generate-card-pdf] compose-card-image response status:", composeRes.status);

      if (composeRes.ok) {
        composeStep = "parsing_compose_response";
        const composeData = await composeRes.json();
        console.log("[generate-card-pdf] compose-card-image response body:", JSON.stringify(composeData));

        if (composeData.finalPrintAssetUrl) {
          finalPrintAssetUrl = composeData.finalPrintAssetUrl;
          composedDataUrl = composeData.finalPrintAssetUrl;
          composeStep = "success";
          console.log("[generate-card-pdf] finalPrintAssetUrl received:", finalPrintAssetUrl);
        } else if (composeData.composedDataUrl) {
          composedDataUrl = composeData.composedDataUrl;
          finalPrintAssetUrl = null;
          composeStep = "success_base64_fallback";
          console.warn("[generate-card-pdf] Only base64 data URL available — storage upload may have failed");
        } else {
          composeStep = "compose_returned_no_url";
          console.error("[generate-card-pdf] compose-card-image returned no finalPrintAssetUrl:", JSON.stringify(composeData));
        }
      } else {
        const errText = await composeRes.text();
        composeStep = `compose_http_error_${composeRes.status}`;
        if (composeRes.status === 404) {
          console.error("[generate-card-pdf] compose-card-image endpoint not found — check deployment or URL. URL used:", composeUrl, "Response:", errText);
        } else {
          console.error(`[generate-card-pdf] compose-card-image HTTP ${composeRes.status}:`, errText, "URL used:", composeUrl);
        }
      }
    } catch (err) {
      composeStep = "compose_network_error";
      console.error("[generate-card-pdf] compose-card-image network error. URL used:", composeUrl, "Error:", err);
    }
  }

  console.log("[generate-card-pdf] composeStep:", composeStep);
  console.log("[generate-card-pdf] finalPrintAssetUrl:", finalPrintAssetUrl || "(none — will use fallback)");

  const { error: updateError } = await supabase
    .from("card_orders")
    .update({
      batch_code: batchCode,
      qr_url: qrImageUrl,
      qr_image_path: qrImageUrl,
      card_asset_path: finalPrintAssetUrl || qrImageUrl,
    })
    .eq("id", order_id);

  if (updateError) {
    console.warn("[generate-card-pdf] Could not update card_orders:", updateError.message);
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      success: true,
      finalPrintAssetUrl,
      frontFileUrl: finalPrintAssetUrl || "https://langaccess.org/card-front.pdf",
      backFileUrl: "https://langaccess.org/card-back.pdf",
      composedDataUrl,
      qrImageUrl,
      qrDestinationUrl,
      ambassadorCode,
      batch_code: batchCode,
      city_state: formattedCityState,
      city,
      state,
      composeStep,
    }),
  };
};
