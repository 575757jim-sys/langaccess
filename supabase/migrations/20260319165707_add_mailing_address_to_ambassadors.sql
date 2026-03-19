/*
  # Add mailing_address to ambassadors table

  1. Changes
    - Adds `mailing_address` text column to the `ambassadors` table
    - Nullable to avoid breaking existing rows
    - Used to ship the free 25-card pack to the ambassador
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'mailing_address'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN mailing_address text;
  END IF;
END $$;
