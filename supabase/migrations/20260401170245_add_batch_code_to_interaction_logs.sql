/*
  # Add batch_code Column to interaction_logs

  ## Summary
  Adds a dedicated batch_code column to interaction_logs table to properly track
  batch QR code interactions without relying on JSONB event_data extraction.

  ## Changes Made
  1. Add `batch_code` column - Text field for storing QR batch codes (e.g., "oakland-001")
  2. Add index on batch_code for efficient batch tracking queries
  3. Make event_data nullable to support both event-based and traditional phrase logging

  ## Security
  - Existing RLS policies remain unchanged
  - Public insert/select access maintained

  ## Notes
  - Uses IF NOT EXISTS guard for idempotency
  - Existing rows will have NULL for batch_code (this is acceptable)
  - This enables simpler, more efficient batch tracking queries
*/

-- Add batch_code column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interaction_logs' AND column_name = 'batch_code'
  ) THEN
    ALTER TABLE interaction_logs ADD COLUMN batch_code text DEFAULT NULL;
  END IF;
END $$;

-- Add index on batch_code for efficient batch tracking
CREATE INDEX IF NOT EXISTS idx_interaction_logs_batch_code
  ON interaction_logs(batch_code);

-- Make event_data nullable (remove default) for flexibility
DO $$
BEGIN
  ALTER TABLE interaction_logs ALTER COLUMN event_data DROP DEFAULT;
  ALTER TABLE interaction_logs ALTER COLUMN event_data DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
