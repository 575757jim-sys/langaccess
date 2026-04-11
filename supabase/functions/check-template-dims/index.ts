import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  ImageMagick,
  initializeImageMagick,
} from "npm:@imagemagick/magick-wasm@0.0.30";

const wasmBytes = await Deno.readFile(
  new URL("magick.wasm", import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"))
);
await initializeImageMagick(wasmBytes);

const TEMPLATE_URLS = [
  "https://tllfqsthkxgsadxtutpm.supabase.co/storage/v1/object/public/composed-cards/templates/langaccess_master_noqr_v1.png",
  "https://langaccess.org/templates/langaccess_master_noqr_v1..png",
];

Deno.serve(async (_req: Request) => {
  const results = [];
  for (const url of TEMPLATE_URLS) {
    try {
      const res = await fetch(url, { headers: { Accept: "image/*" } });
      if (!res.ok) {
        results.push({ url, status: res.status, error: "fetch failed" });
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const dims = ImageMagick.read(bytes, (img) => ({ width: img.width, height: img.height }));
      results.push({ url, status: res.status, byteSize: bytes.length, ...dims });
    } catch (err) {
      results.push({ url, error: String(err) });
    }
  }
  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
