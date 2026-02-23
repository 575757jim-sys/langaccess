/*
  # Create custom phrases table

  1. New Tables
    - `custom_phrases`
      - `id` (uuid, primary key) - Unique identifier for each custom phrase
      - `english` (text) - English phrase text
      - `translation` (text) - Translated phrase text
      - `language` (text) - Target language (spanish, tagalog, vietnamese, mandarin, cantonese)
      - `sector` (text) - Sector (healthcare, education, construction)
      - `subcategory` (text) - Specific subcategory within the sector
      - `created_at` (timestamptz) - When the phrase was created
      - `user_id` (uuid, nullable) - User who created the phrase (for future auth)

  2. Security
    - Enable RLS on `custom_phrases` table
    - Allow anyone to read custom phrases (for now)
    - Allow anyone to insert custom phrases (for now)
    - Allow anyone to delete their own custom phrases (for now)
    
  3. Indexes
    - Index on (language, sector, subcategory) for fast filtering
*/

CREATE TABLE IF NOT EXISTS custom_phrases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  english text NOT NULL,
  translation text NOT NULL,
  language text NOT NULL,
  sector text NOT NULL,
  subcategory text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE custom_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read custom phrases"
  ON custom_phrases
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert custom phrases"
  ON custom_phrases
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete custom phrases"
  ON custom_phrases
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_custom_phrases_filters 
  ON custom_phrases(language, sector, subcategory);

CREATE INDEX IF NOT EXISTS idx_custom_phrases_created 
  ON custom_phrases(created_at DESC);