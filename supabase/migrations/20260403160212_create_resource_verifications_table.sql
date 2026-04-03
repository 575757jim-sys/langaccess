/*
  # Create Resource Verifications Table

  1. New Tables
    - `resource_verifications`
      - `id` (uuid, primary key) - Unique identifier for each verification
      - `resource_name` (text) - Name of the verified resource
      - `resource_address` (text) - Address of the resource
      - `category` (text) - Category (food, medical, bathrooms, power, shelter, lockers)
      - `city` (text) - City where resource is located
      - `is_open` (text) - Status: Yes, No, or Unsure
      - `hours` (text, optional) - Operating hours
      - `notes` (text, optional) - Additional notes about the resource
      - `verified_by` (text, optional) - Name or identifier of verifier
      - `verification_type` (text) - Type: verify or update
      - `created_at` (timestamptz) - Timestamp of verification

    - `resource_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `name` (text) - Resource name
      - `category` (text) - Category (food, medical, bathrooms, power, shelter, lockers)
      - `address` (text) - Full address
      - `hours` (text, optional) - Operating hours
      - `notes` (text, optional) - Additional notes
      - `city` (text) - City where resource is located
      - `submitted_by` (text, optional) - Identifier of submitter
      - `status` (text) - Status: pending, verified, or needs-review
      - `created_at` (timestamptz) - Timestamp of submission
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public read and insert access

  3. Indexes
    - Add indexes on common query fields for performance
*/

-- Create resource_verifications table
CREATE TABLE IF NOT EXISTS resource_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_name text NOT NULL,
  resource_address text NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'medical', 'bathrooms', 'power', 'shelter', 'lockers')),
  city text NOT NULL,
  is_open text NOT NULL CHECK (is_open IN ('Yes', 'No', 'Unsure')),
  hours text,
  notes text,
  verified_by text,
  verification_type text NOT NULL CHECK (verification_type IN ('verify', 'update')),
  created_at timestamptz DEFAULT now()
);

-- Create resource_submissions table
CREATE TABLE IF NOT EXISTS resource_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'medical', 'bathrooms', 'power', 'shelter', 'lockers')),
  address text NOT NULL,
  hours text,
  notes text,
  city text NOT NULL,
  submitted_by text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'needs-review')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resource_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for resource_verifications
CREATE POLICY "Anyone can read verifications"
  ON resource_verifications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert verifications"
  ON resource_verifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for resource_submissions
CREATE POLICY "Anyone can read submissions"
  ON resource_submissions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert submissions"
  ON resource_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update submissions"
  ON resource_submissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_verifications_city ON resource_verifications(city);
CREATE INDEX IF NOT EXISTS idx_verifications_category ON resource_verifications(category);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON resource_verifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_city ON resource_submissions(city);
CREATE INDEX IF NOT EXISTS idx_submissions_category ON resource_submissions(category);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON resource_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON resource_submissions(created_at DESC);
