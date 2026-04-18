/*
  # Create certificate_refreshers table

  Stores scheduled 30-day spaced-repetition refresher emails for certificate holders.
  A row is inserted when a user completes a track. A scheduled job (pg_cron)
  wakes up a refresher edge function that sends due emails.

  1. New Tables
    - `certificate_refreshers`
      - `id` (uuid, primary key)
      - `cert_id` (text) - references the certificate in certificate_records.cert_id
      - `email` (text) - recipient email
      - `user_name` (text) - name to personalize
      - `track_id` (text) - track identifier
      - `track_title` (text) - human-readable track title
      - `scheduled_at` (timestamptz) - when the refresher should be sent
      - `sent_at` (timestamptz, nullable) - when it was actually sent
      - `created_at` (timestamptz) - row insert time
  2. Security
    - Enable RLS on `certificate_refreshers`
    - Add policy: authenticated users and anon may INSERT (client inserts on completion)
    - No SELECT/UPDATE/DELETE policies for anon (service role bypasses RLS for sending)
  3. Indexes
    - Index on (sent_at, scheduled_at) for efficient due-row lookups
    - Unique index on cert_id to prevent duplicate scheduling
*/

CREATE TABLE IF NOT EXISTS certificate_refreshers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id text NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  track_id text NOT NULL,
  track_title text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS certificate_refreshers_cert_id_key
  ON certificate_refreshers (cert_id);

CREATE INDEX IF NOT EXISTS certificate_refreshers_due_idx
  ON certificate_refreshers (sent_at, scheduled_at);

ALTER TABLE certificate_refreshers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'certificate_refreshers'
      AND policyname = 'Anyone can schedule a refresher'
  ) THEN
    CREATE POLICY "Anyone can schedule a refresher"
      ON certificate_refreshers
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;
