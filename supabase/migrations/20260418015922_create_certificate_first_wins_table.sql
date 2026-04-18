/*
  # Create certificate_first_wins table

  Schedules the 7-day "first win" nudge email. A row is inserted when a
  learner completes an enrollment (Stripe checkout). Seven days later, a
  scheduled edge function picks up due rows and sends a short, focused email
  highlighting one phrase from their track plus a reminder that their
  printable flashcards are always one click away.

  1. New Tables
    - `certificate_first_wins`
      - `id` (uuid, primary key)
      - `session_id` (text, nullable) - app session id for ownership lookups
      - `stripe_session_id` (text, unique) - natural key to prevent duplicate
        scheduling for the same purchase
      - `email` (text) - recipient
      - `user_name` (text, default '') - personalization
      - `track_id` (text) - which track they purchased
      - `track_title` (text, default '') - human-readable title
      - `scheduled_at` (timestamptz) - when to send (purchase + 7 days)
      - `sent_at` (timestamptz, nullable) - marks completion
      - `created_at` (timestamptz) - row insert time

  2. Security
    - Enable RLS on `certificate_first_wins`
    - Policy: anon + authenticated may INSERT rows (client or service role
      inserts on successful enrollment)
    - No SELECT/UPDATE/DELETE policies for anon; service role bypasses RLS
      to process and mark rows sent

  3. Indexes
    - Unique index on `stripe_session_id` to prevent duplicate scheduling
    - Composite index on `(sent_at, scheduled_at)` for efficient due-row
      lookups
*/

CREATE TABLE IF NOT EXISTS certificate_first_wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  stripe_session_id text NOT NULL,
  email text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  track_id text NOT NULL,
  track_title text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS certificate_first_wins_stripe_session_key
  ON certificate_first_wins (stripe_session_id);

CREATE INDEX IF NOT EXISTS certificate_first_wins_due_idx
  ON certificate_first_wins (sent_at, scheduled_at);

ALTER TABLE certificate_first_wins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'certificate_first_wins'
      AND policyname = 'Anyone can schedule a first-win email'
  ) THEN
    CREATE POLICY "Anyone can schedule a first-win email"
      ON certificate_first_wins
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;
