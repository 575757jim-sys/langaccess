/*
  # Create pilot_requests table

  ## Summary
  Creates a table to store institutional pilot program requests submitted through the LangAccess website.

  ## New Tables
  - `pilot_requests`
    - `id` (uuid, primary key) — auto-generated unique identifier
    - `organization` (text, not null) — name of the requesting organization
    - `sector` (text, not null) — sector dropdown value (Healthcare, Education, etc.)
    - `staff_size` (text, not null) — approximate staff size range
    - `name` (text, not null) — requester's full name
    - `email` (text, not null) — requester's email address
    - `message` (text) — optional message from requester
    - `created_at` (timestamptz) — submission timestamp

  ## Security
  - RLS enabled on `pilot_requests`
  - INSERT policy allows anonymous users to submit requests (public lead capture form)
  - No SELECT/UPDATE/DELETE policies for public users (admin access only via service role)
*/

CREATE TABLE IF NOT EXISTS pilot_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  sector text NOT NULL,
  staff_size text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pilot_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a pilot request"
  ON pilot_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
