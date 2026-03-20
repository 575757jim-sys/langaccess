/*
  # Add street_address column to ambassadors table

  1. Changes
    - `ambassadors`
      - Add `street_address` (text, nullable) — stores the street line of the ambassador's mailing address

  The existing `mailing_address` column will remain for backwards compatibility.
  The new `street_address` column captures the street line separately from `city_state`.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN street_address text;
  END IF;
END $$;
