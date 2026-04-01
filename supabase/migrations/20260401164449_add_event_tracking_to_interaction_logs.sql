/*
  # Add Event Tracking Columns to interaction_logs

  ## Summary
  Extends the interaction_logs table to support flexible event tracking including
  batch QR code scans, language selections, and other user interactions.

  ## Changes Made
  1. Add `event_type` column - Categorizes the type of event (batch_visit, batch_language_select, phrase_play, etc.)
  2. Add `event_data` column - JSONB field for flexible event metadata (batch_code, user_agent, etc.)
  3. Add `created_at` column - Explicit timestamp for when the event occurred
  4. Update indexes for better query performance on event tracking

  ## Security
  - Existing RLS policies remain unchanged
  - Public insert/select access maintained for anonymous telemetry

  ## Notes
  - Uses IF NOT EXISTS guards for idempotency
  - Existing rows will have NULL for new columns (this is acceptable)
  - The original columns (logged_at, language, sector, etc.) remain for backward compatibility
*/

-- Add event_type column for categorizing events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interaction_logs' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE interaction_logs ADD COLUMN event_type text;
  END IF;
END $$;

-- Add event_data column for flexible metadata storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interaction_logs' AND column_name = 'event_data'
  ) THEN
    ALTER TABLE interaction_logs ADD COLUMN event_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add created_at column (separate from logged_at for flexibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interaction_logs' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE interaction_logs ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add index on event_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_interaction_logs_event_type
  ON interaction_logs(event_type);

-- Add index on event_data batch_code for batch tracking queries
CREATE INDEX IF NOT EXISTS idx_interaction_logs_event_data_batch
  ON interaction_logs((event_data->>'batch_code'));

-- Add index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at
  ON interaction_logs(created_at DESC);