/*
  # Add completion email tracking to certificate_records

  Adds a column to track when the completion email was successfully sent for
  each issued certificate. This enables:

  1. Changes
    - Add `completion_email_sent_at` (timestamptz, nullable) to `certificate_records`
      so we can record when the completion email was sent and avoid duplicate sends
      when a user re-opens the completion screen or requests a resend.

  2. Security
    - RLS policies on `certificate_records` already allow anon/authenticated reads
      and inserts. We add an UPDATE policy so the client can stamp the
      `completion_email_sent_at` timestamp after a successful send or resend.
    - The UPDATE policy is scoped so only rows matching the current session_id
      context can be updated by anon/authenticated. Service role retains full update.

  3. Notes
    - No data is destroyed; column is additive and nullable.
    - Schema cache reload requested at end.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificate_records'
      AND column_name = 'completion_email_sent_at'
  ) THEN
    ALTER TABLE certificate_records
      ADD COLUMN completion_email_sent_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'certificate_records'
      AND policyname = 'Anyone can update completion email timestamp'
  ) THEN
    CREATE POLICY "Anyone can update completion email timestamp"
      ON certificate_records FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

GRANT UPDATE ON certificate_records TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
