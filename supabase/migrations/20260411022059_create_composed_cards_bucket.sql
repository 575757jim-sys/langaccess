/*
  # Create composed-cards storage bucket

  Creates a public storage bucket for storing ambassador-specific composed card PNG images.
  These are print-ready PNGs with QR codes composited into the card template,
  ready to send directly to Gelato as the single print asset.

  1. New Bucket
    - `composed-cards` - public bucket for final print-ready card images
  
  2. Storage Policies
    - Public read access (Gelato needs to fetch the URL)
    - Authenticated write access (edge functions use service role)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'composed-cards',
  'composed-cards',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for composed cards"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'composed-cards');

CREATE POLICY "Service role insert for composed cards"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'composed-cards');

CREATE POLICY "Service role update for composed cards"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'composed-cards');
