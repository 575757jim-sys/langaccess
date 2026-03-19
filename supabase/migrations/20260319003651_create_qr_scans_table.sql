/*
  # Create qr_scans table

  1. New Tables
    - `qr_scans`
      - `id` (uuid, primary key)
      - `qr_slug` (text, not null) - the ambassador's slug extracted from the URL
      - `scanned_at` (timestamptz, not null) - timestamp of the scan
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Allow anonymous inserts only (QR scans come from unauthenticated visitors)
    - No select/update/delete for anon users (analytics are internal only)
*/

CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_slug text NOT NULL DEFAULT '',
  scanned_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a qr scan"
  ON qr_scans FOR INSERT
  TO anon
  WITH CHECK (true);
