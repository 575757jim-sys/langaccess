/*
  # Add batch QR tracking fields to card_orders

  1. New Columns
    - `batch_code` (text) - Unique batch identifier format: <city>-<yyyymmdd>-<shortid>
    - `qr_url` (text) - Full QR URL: https://langaccess.org/help?batch=<batch_code>
    - `qr_image_path` (text) - Path to generated QR PNG file
    - `card_asset_path` (text) - Path to final card with QR overlay

  2. Purpose
    - Track batch-specific QR codes for each card order
    - Enable batch analytics and tracking when users scan cards
    - Store generated asset paths for reuse on retry

  3. Security
    - RLS already enabled on card_orders table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'batch_code'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN batch_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'qr_url'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN qr_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'qr_image_path'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN qr_image_path text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'card_asset_path'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN card_asset_path text;
  END IF;
END $$;
