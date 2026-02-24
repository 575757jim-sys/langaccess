/*
  # Create language_requests table

  ## Summary
  Stores submissions from users requesting support for additional languages
  in LangAccess, submitted via the Request Language form.

  ## New Tables
  - `language_requests`
    - `id` (uuid, primary key, auto-generated)
    - `name` (text) — submitter's name
    - `organization` (text) — submitter's organization
    - `language_requested` (text) — language being requested
    - `sector` (text) — healthcare, education, or construction
    - `created_at` (timestamptz) — submission timestamp

  ## Security
  - RLS enabled
  - INSERT allowed for all (anonymous submissions accepted for public form)
  - SELECT restricted to authenticated users only
*/

CREATE TABLE IF NOT EXISTS language_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  language_requested text NOT NULL,
  sector text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE language_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a language request"
  ON language_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view language requests"
  ON language_requests
  FOR SELECT
  TO authenticated
  USING (true);
