import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { generateBatchCode, generateBatchQRUrl } from "./utils/batchGenerator";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

function normalizeCityState(raw: string): { city: string; state: string; formatted: string } {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || "";
  const state = parts[1] || "";
  const formatted = state ? `${city}, ${state}` : city;
  return { city, state, formatted };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: { order_id: string; full_name: string; city_state: string; slug?: string };
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { order_id, full_name, city_state, slug } = body;

  if (!order_id || !full_name || !city_state) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: order_id, full_name, city_state" }),
    };
  }

  try {
    const { city, formatted: formattedCityState } = normalizeCityState(city_state);

    const batchCode = generateBatchCode(city);

    const qrTarget = slug
      ? `https://langaccess.org/r/${encodeURIComponent(slug)}`
      : generateBatchQRUrl(batchCode);

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&ecc=H&data=${encodeURIComponent(qrTarget)}`;

    const frontFileUrl = qrApiUrl;
    const backFileUrl = "https://langaccess.org/card-back.pdf";

    const { error: updateError } = await supabase
      .from("card_orders")
      .update({
        batch_code: batchCode,
        qr_url: qrApiUrl,
        qr_image_path: qrApiUrl,
        card_asset_path: qrApiUrl,
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
        frontFileUrl,
        backFileUrl,
        batch_code: batchCode,
        qr_url: qrApiUrl,
        city_state: formattedCityState,
      }),
    };
  } catch (err) {
    console.error("[generate-card-pdf] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate card assets", details: String(err) }),
    };
  }
};
