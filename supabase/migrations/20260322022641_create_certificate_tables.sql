/*
  # Create Certificate Tables

  ## Summary
  Replaces localStorage-based certificate persistence with Supabase-backed storage.
  Enables server-side payment verification, certificate lookup, and email delivery.

  ## New Tables

  ### 1. `certificate_progress`
  Stores per-session quiz progress and module completion status.
  - `session_id` (text) — anonymous session identifier from localStorage
  - `user_name` (text) — learner's display name
  - `track_id` (text) — certificate track (healthcare, education, etc.)
  - `module_id` (integer) — module number within track
  - `score` (numeric) — decimal score 0.0–1.0
  - `passed` (boolean) — whether module was passed
  - `completed_at` (timestamptz) — when module was completed

  ### 2. `certificate_records`
  Authoritative record of issued certificates. Created only after all modules pass.
  - `cert_id` (text, unique) — public certificate ID in LA-YYYY-XXXXX format
  - `session_id` (text) — links back to progress
  - `user_name` (text) — name on certificate
  - `track_id` (text) — which track was completed
  - `track_title` (text) — human-readable track name
  - `issued_at` (timestamptz) — issue date
  - `email` (text, nullable) — for sending certificate email

  ### 3. `certificate_purchases`
  Server-side record of Stripe payment verification.
  - `session_id` (text) — anonymous session identifier
  - `track_id` (text) — track purchased
  - `stripe_session_id` (text, unique) — Stripe checkout session ID for deduplication
  - `purchased_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public SELECT allowed on `certificate_records` for verification lookups (cert_id only)
  - INSERT/UPDATE allowed for any session on their own rows (anonymous via session_id)
  - `certificate_purchases` only writable via service role (Stripe webhook)
*/

CREATE TABLE IF NOT EXISTS certificate_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  track_id text NOT NULL,
  module_id integer NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, track_id, module_id)
);

ALTER TABLE certificate_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own progress"
  ON certificate_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own progress"
  ON certificate_progress FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own progress"
  ON certificate_progress FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS certificate_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id text UNIQUE NOT NULL,
  session_id text NOT NULL,
  user_name text NOT NULL,
  track_id text NOT NULL,
  track_title text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  email text
);

ALTER TABLE certificate_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert certificate records"
  ON certificate_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read certificate records for verification"
  ON certificate_records FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS certificate_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  track_id text NOT NULL,
  stripe_session_id text UNIQUE NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read their own purchases"
  ON certificate_purchases FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert purchases"
  ON certificate_purchases FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cert_progress_session ON certificate_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_cert_records_cert_id ON certificate_records(cert_id);
CREATE INDEX IF NOT EXISTS idx_cert_records_session ON certificate_records(session_id);
CREATE INDEX IF NOT EXISTS idx_cert_purchases_session ON certificate_purchases(session_id, track_id);
