/*
  # Create ambassadors table

  1. New Tables
    - `ambassadors`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text, unique, not null)
      - `city_state` (text, not null)
      - `profession` (text, not null)
      - `distribution_location` (text, not null)
      - `how_heard` (text, nullable)
      - `additional_context` (text, nullable)
      - `agreement_accepted` (boolean, default false)
      - `agreement_timestamp` (timestamptz, nullable)
      - `slug` (text, nullable) - QR code slug returned from generate-qr-slug
      - `qr_url` (text, nullable) - QR code image URL
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Allow anonymous inserts (public signup form)
    - Allow select by email for duplicate check (anon)
    - No update/delete for anon users
*/

CREATE TABLE IF NOT EXISTS ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  city_state text NOT NULL DEFAULT '',
  profession text NOT NULL DEFAULT '',
  distribution_location text NOT NULL DEFAULT '',
  how_heard text,
  additional_context text,
  agreement_accepted boolean NOT NULL DEFAULT false,
  agreement_timestamp timestamptz,
  slug text,
  qr_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert an ambassador"
  ON ambassadors FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can check for duplicate email"
  ON ambassadors FOR SELECT
  TO anon
  USING (true);
