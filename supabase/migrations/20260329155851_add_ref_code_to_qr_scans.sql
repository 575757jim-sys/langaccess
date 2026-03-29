/*
  # Add ref_code column to qr_scans

  1. Modified Tables
    - `qr_scans`
      - `ref_code` (text, nullable) - the ambassador ref code from the URL query param
        Used when a visitor lands on /order-cards?ref=ABC123 to track which ambassador
        card QR code drove the visit.

  2. Notes
    - Column is nullable so existing rows are unaffected
    - Uses IF NOT EXISTS guard to make migration idempotent
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_scans' AND column_name = 'ref_code'
  ) THEN
    ALTER TABLE qr_scans ADD COLUMN ref_code text;
  END IF;
END $$;
