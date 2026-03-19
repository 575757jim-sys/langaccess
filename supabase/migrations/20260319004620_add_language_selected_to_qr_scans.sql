/*
  # Add language_selected column to qr_scans

  1. Modified Tables
    - `qr_scans`
      - `language_selected` (text, nullable) - the language the user tapped on the QR landing page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_scans' AND column_name = 'language_selected'
  ) THEN
    ALTER TABLE qr_scans ADD COLUMN language_selected text;
  END IF;
END $$;
