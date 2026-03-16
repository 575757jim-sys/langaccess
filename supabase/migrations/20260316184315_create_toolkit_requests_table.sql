/*
  # Create toolkit_requests table

  ## Summary
  Stores email sign-ups for the free Language Access Toolkit download.

  ## New Tables
  - `toolkit_requests`
    - `id` (uuid, primary key) — auto-generated
    - `email` (text, not null) — submitter's email address
    - `sector` (text, nullable) — optional sector selection
    - `source` (text, not null, default 'toolkit_request') — hardcoded source identifier
    - `created_at` (timestamptz, default now()) — submission timestamp

  ## Security
  - RLS enabled: only the service role can read rows
  - INSERT policy allows any user (authenticated or anonymous) to submit their email
    (needed because toolkit requests come from unauthenticated visitors)
*/

CREATE TABLE IF NOT EXISTS toolkit_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  sector     text,
  source     text NOT NULL DEFAULT 'toolkit_request',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE toolkit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a toolkit request"
  ON toolkit_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
