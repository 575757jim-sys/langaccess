/*
  # Create email_captures table

  ## Summary
  Adds a lightweight table to store email addresses voluntarily submitted by users
  when saving favorite phrases. No authentication is required or associated.

  ## New Tables
  - `email_captures`
    - `id` (uuid, primary key) - unique record identifier
    - `email` (text, not null) - the submitted email address
    - `source` (text) - where the capture occurred, e.g. "favorites_modal"
    - `sector` (text) - the sector active when the user saved the phrase
    - `phrase` (text) - the English phrase text the user was saving
    - `created_at` (timestamptz) - when the record was created

  ## Security
  - RLS enabled; only the service role (backend) can read records
  - Authenticated and anonymous users can INSERT their own email
  - No SELECT policy for public/anon — emails are write-only from the client

  ## Notes
  - A unique index on `email` prevents exact duplicate email records
  - No email sending or verification is implemented
*/

CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text DEFAULT 'favorites_modal',
  sector text DEFAULT '',
  phrase text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email capture"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS email_captures_email_unique ON email_captures (email);
