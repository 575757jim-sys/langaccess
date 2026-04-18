/*
  # Email suppressions and bounce tracking

  Adds a central suppression list plus per-row bounce timestamps so we can
  stop sending to addresses that hard-bounced, while keeping an audit
  trail for the admin dashboard.

  1. New Tables
    - `email_suppressions`
      - `email` (text, primary key, lowercased) - the suppressed address
      - `reason` (text, default 'bounce') - why it was suppressed
      - `resend_email_id` (text, nullable) - id of the send that triggered it
      - `bounce_type` (text, nullable) - "hard" / "soft" / other
      - `created_at` (timestamptz, default now())

  2. Modified Tables
    - `certificate_first_wins`
      - `bounced_at` (timestamptz, nullable)
    - `certificate_day3_nudges`
      - `bounced_at` (timestamptz, nullable)

  3. Security
    - Enable RLS on `email_suppressions`
    - No anon or authenticated policies - only the service role (edge
      functions) should read or write the suppression list. This keeps
      user email addresses private.
*/

CREATE TABLE IF NOT EXISTS email_suppressions (
  email text PRIMARY KEY,
  reason text NOT NULL DEFAULT 'bounce',
  resend_email_id text,
  bounce_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificate_first_wins' AND column_name = 'bounced_at'
  ) THEN
    ALTER TABLE certificate_first_wins ADD COLUMN bounced_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificate_day3_nudges' AND column_name = 'bounced_at'
  ) THEN
    ALTER TABLE certificate_day3_nudges ADD COLUMN bounced_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS email_suppressions_created_idx
  ON email_suppressions (created_at DESC);
