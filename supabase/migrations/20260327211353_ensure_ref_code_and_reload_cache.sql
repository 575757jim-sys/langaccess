/*
  # Ensure ref_code column exists and reload PostgREST schema cache

  This migration verifies the ref_code column exists on ambassadors
  and explicitly reloads the PostgREST schema cache.
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

CREATE INDEX IF NOT EXISTS ambassadors_ref_code_idx ON ambassadors (ref_code);

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';