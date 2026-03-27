/*
  # Add ref_code to ambassadors table

  ## Summary
  Adds a `ref_code` column to the ambassadors table. This is a short, uppercase
  identifier (first 8 characters of the ambassador's UUID) used in order links
  sent via welcome email (e.g. langaccess.org/order-cards?ref=ABCD1234).

  ## Changes
  - `ambassadors` table: new `ref_code text` column (nullable, unique where set)

  ## Notes
  - Existing rows will have NULL ref_code; they continue to work via ambassador ID lookup
  - New signups will have ref_code set at insert time from the client
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'ref_code'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN ref_code text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ambassadors_ref_code_unique
  ON ambassadors (ref_code)
  WHERE ref_code IS NOT NULL;
