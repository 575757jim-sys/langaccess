import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_FUNCTION_URL = "https://tllfqsthkxgsadxtutpm.supabase.co/functions/v1/compose-card-image";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbGZxc3Roa3hnc2FkeHR1dHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDc5MzgsImV4cCI6MjA5MDQ4MzkzOH0.X2W1DpBKfKIKHCmP-P4m8iX0IPnP1G0OVYNNActJBvk";

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

  try {
    composeStep = "calling_compose_edge_function";
    console.log("[generate-card-pdf] Calling compose-card-image:", SUPABASE_FUNCTION_URL);
    console.log("[generate-card-pdf] ambassadorCode:", ambassadorCode);
    console.log("[generate-card-pdf] qrDestinationUrl:", qrDestinationUrl);

    {
      const composeRes = await fetch(SUPABASE_FUNCTION_URL, {
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
        let composeDebugJson: unknown = null;
        try {
          composeDebugJson = JSON.parse(errText);
        } catch {
          composeDebugJson = errText;
        }
        console.error(`[generate-card-pdf] compose-card-image HTTP ${composeRes.status}:`, JSON.stringify(composeDebugJson), "URL used:", SUPABASE_FUNCTION_URL);
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            finalPrintAssetUrl: null,
            composedDataUrl: null,
            qrImageUrl,
            qrDestinationUrl,
            ambassadorCode,
            composeStep,
            composeDebug: composeDebugJson,
          }),
        };
      }
    }
  } catch (err) {
    composeStep = "compose_network_error";
    console.error("[generate-card-pdf] compose-card-image network error. URL used:", SUPABASE_FUNCTION_URL, "Error:", err);
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
