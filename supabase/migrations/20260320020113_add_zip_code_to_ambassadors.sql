/*
  # Add zip_code to ambassadors table

  1. Changes
    - `ambassadors` table: adds `zip_code` (text, nullable) column to store the 5-digit US ZIP code
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN zip_code text;
  END IF;
END $$;
