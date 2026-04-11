import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

const SUPABASE_FUNCTION_URL = "https://tllfqsthkxgsadxtutpm.supabase.co/functions/v1/generate-card";
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

  if (!full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: full_name, city_state" }),
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
    composeStep = "calling_generate_card";
    console.log("[generate-card-pdf] Calling generate-card:", SUPABASE_FUNCTION_URL);
    console.log("[generate-card-pdf] ambassadorCode:", ambassadorCode);
    console.log("[generate-card-pdf] qrDestinationUrl:", qrDestinationUrl);

    const generateRes = await fetch(SUPABASE_FUNCTION_URL, {
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

    console.log("[generate-card-pdf] generate-card response status:", generateRes.status);

    if (generateRes.ok) {
      composeStep = "parsing_response";
      const generateData = await generateRes.json();
      console.log("[generate-card-pdf] generate-card response body:", JSON.stringify(generateData));

      if (generateData.finalPrintAssetUrl) {
        finalPrintAssetUrl = generateData.finalPrintAssetUrl;
        composedDataUrl = generateData.finalPrintAssetUrl;
        composeStep = "success";
        console.log("[generate-card-pdf] finalPrintAssetUrl received:", finalPrintAssetUrl);
      } else if (generateData.composedDataUrl) {
        composedDataUrl = generateData.composedDataUrl;
        finalPrintAssetUrl = null;
        composeStep = "success_base64_fallback";
        console.warn("[generate-card-pdf] Only base64 data URL available — storage upload may have failed");
      } else {
        composeStep = "generate_card_returned_no_url";
        console.error("[generate-card-pdf] generate-card returned no finalPrintAssetUrl:", JSON.stringify(generateData));
      }
    } else {
      const errText = await generateRes.text();
      composeStep = `generate_card_http_error_${generateRes.status}`;
      let generateDebugJson: unknown = null;
      try {
        generateDebugJson = JSON.parse(errText);
      } catch {
        generateDebugJson = errText;
      }
      console.error(`[generate-card-pdf] generate-card HTTP ${generateRes.status}:`, JSON.stringify(generateDebugJson), "URL used:", SUPABASE_FUNCTION_URL);
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
          composeDebug: generateDebugJson,
        }),
      };
    }
  } catch (err) {
    composeStep = "generate_card_network_error";
    console.error("[generate-card-pdf] generate-card network error. URL used:", SUPABASE_FUNCTION_URL, "Error:", err);
  }

  console.log("[generate-card-pdf] composeStep:", composeStep);
  console.log("[generate-card-pdf] finalPrintAssetUrl:", finalPrintAssetUrl || "(none — will use fallback)");

  if (order_id && !order_id.startsWith("order-")) {
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
  } else {
    console.log("[generate-card-pdf] Skipping DB update — preview mode (no real order_id)");
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
