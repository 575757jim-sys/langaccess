/*
  # Add email column to favorites

  ## Changes

  ### Modified Tables
  - `favorites`
    - Added `email` (text, nullable) — allows linking favorites to a user's email so they can be restored across devices

  ## Notes
  - Column is nullable so existing anonymous session-based favorites are not broken
  - An index on email is added for fast lookup when a user re-enters their email on a new device
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'favorites' AND column_name = 'email'
  ) THEN
    ALTER TABLE favorites ADD COLUMN email text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_favorites_email ON favorites(email) WHERE email IS NOT NULL;
