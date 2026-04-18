/*
  # Re-engagement day-3 nudges and email open tracking

  Adds the second lifecycle email — a 3-day "haven't started yet?" nudge
  for learners who enrolled but have not completed module 1. Also adds
  Resend email id + opened_at tracking columns to the first-win and
  day-3 tables so we can surface open-rate metrics in the admin view.

  1. New Tables
    - `certificate_day3_nudges`
      - `id` (uuid, primary key)
      - `session_id` (text, nullable) - app session id for progress lookups
      - `stripe_session_id` (text, unique) - natural dedup key
      - `email` (text) - recipient
      - `user_name` (text, default '') - personalization
      - `track_id` (text) - track they purchased
      - `track_title` (text, default '') - human-readable title
      - `scheduled_at` (timestamptz) - when to send (purchase + 3 days)
      - `sent_at` (timestamptz, nullable) - populated after successful send
      - `skipped_at` (timestamptz, nullable) - populated if skipped because
        the learner already completed module 1
      - `resend_email_id` (text, nullable) - Resend id for open-rate tracking
      - `opened_at` (timestamptz, nullable) - first open event from Resend
      - `created_at` (timestamptz, default now())

  2. Modified Tables
    - `certificate_first_wins`
      - `resend_email_id` (text, nullable) - Resend id for open-rate tracking
      - `opened_at` (timestamptz, nullable) - first open event from Resend

  3. Security
    - Enable RLS on `certificate_day3_nudges`
    - Policy: anon + authenticated may INSERT rows (service role scheduling)
    - No SELECT/UPDATE/DELETE policies for anon — service role bypasses RLS
      to process sends and record opens

  4. Indexes
    - Unique index on stripe_session_id
    - Composite index on (sent_at, skipped_at, scheduled_at) for due lookups
    - Index on resend_email_id in first_wins + day3_nudges for webhook updates
*/

CREATE TABLE IF NOT EXISTS certificate_day3_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  stripe_session_id text NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  track_id text NOT NULL,
  track_title text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  skipped_at timestamptz,
  resend_email_id text,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS certificate_day3_nudges_stripe_session_key
  ON certificate_day3_nudges (stripe_session_id);

CREATE INDEX IF NOT EXISTS certificate_day3_nudges_due_idx
  ON certificate_day3_nudges (sent_at, skipped_at, scheduled_at);

CREATE INDEX IF NOT EXISTS certificate_day3_nudges_resend_id_idx
  ON certificate_day3_nudges (resend_email_id);

ALTER TABLE certificate_day3_nudges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'certificate_day3_nudges'
      AND policyname = 'Anyone can schedule a day-3 nudge'
  ) THEN
    CREATE POLICY "Anyone can schedule a day-3 nudge"
      ON certificate_day3_nudges
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificate_first_wins' AND column_name = 'resend_email_id'
  ) THEN
    ALTER TABLE certificate_first_wins ADD COLUMN resend_email_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificate_first_wins' AND column_name = 'opened_at'
  ) THEN
    ALTER TABLE certificate_first_wins ADD COLUMN opened_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS certificate_first_wins_resend_id_idx
  ON certificate_first_wins (resend_email_id);
