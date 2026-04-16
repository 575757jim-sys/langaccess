/*
  # Recreate certificate_purchases and certificate_records tables

  The PostgREST schema cache is stale and not reflecting these tables via REST API.
  Dropping and recreating them forces PostgREST to register them properly.

  Tables being recreated (both are confirmed empty):
  - certificate_purchases: tracks Stripe payment completions for cert tracks
  - certificate_records: issued certificate metadata

  Security:
  - RLS enabled on both tables
  - Permissive SELECT policies allow anon reads needed for purchase verification
  - INSERT policy allows anon users to create records
*/

DROP TABLE IF EXISTS certificate_purchases;
DROP TABLE IF EXISTS certificate_records;

CREATE TABLE certificate_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  track_id text NOT NULL,
  stripe_session_id text UNIQUE NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read certificate purchases"
  ON certificate_purchases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert certificate purchases"
  ON certificate_purchases FOR INSERT
  TO service_role
  WITH CHECK (true);

GRANT SELECT ON certificate_purchases TO anon, authenticated;
GRANT INSERT, UPDATE ON certificate_purchases TO service_role;


CREATE TABLE certificate_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id text UNIQUE NOT NULL,
  session_id text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  track_id text NOT NULL,
  track_title text NOT NULL DEFAULT '',
  issued_at timestamptz DEFAULT now(),
  email text
);

ALTER TABLE certificate_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read certificate records"
  ON certificate_records FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert certificate records"
  ON certificate_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT SELECT, INSERT ON certificate_records TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON certificate_records TO service_role;

NOTIFY pgrst, 'reload schema';
