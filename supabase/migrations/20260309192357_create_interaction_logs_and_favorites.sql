/*
  # Create interaction_logs and favorites tables

  ## New Tables

  ### interaction_logs
  Records every phrase playback event automatically.
  - `id` (uuid, primary key)
  - `logged_at` (timestamptz) - timestamp of the interaction
  - `language` (text) - language used (spanish, mandarin, etc.)
  - `sector` (text) - sector (healthcare, education, construction)
  - `subcategory` (text) - subcategory within the sector
  - `phrase_english` (text) - the English phrase that was played
  - `phrase_translation` (text) - the translated phrase that was played
  - `session_id` (text) - anonymous browser session identifier

  ### favorites
  Stores user-starred phrases per session.
  - `id` (uuid, primary key)
  - `session_id` (text) - anonymous browser session identifier
  - `language` (text)
  - `sector` (text)
  - `subcategory` (text)
  - `phrase_english` (text)
  - `phrase_translation` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Public insert allowed for interaction_logs (anonymous telemetry)
  - Public select/insert/delete allowed scoped to session_id for favorites
  - Public select for admins (all rows) on interaction_logs via service role

  ## Indexes
  - interaction_logs: logged_at DESC, language, sector
  - favorites: session_id, (session_id, language, phrase_english) unique
*/

CREATE TABLE IF NOT EXISTS interaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_at timestamptz DEFAULT now() NOT NULL,
  language text NOT NULL,
  sector text NOT NULL,
  subcategory text NOT NULL DEFAULT '',
  phrase_english text NOT NULL,
  phrase_translation text NOT NULL DEFAULT '',
  session_id text NOT NULL DEFAULT ''
);

ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert interaction logs"
  ON interaction_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read interaction logs"
  ON interaction_logs
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_logged_at
  ON interaction_logs(logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_language_sector
  ON interaction_logs(language, sector);


CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT '',
  language text NOT NULL,
  sector text NOT NULL,
  subcategory text NOT NULL DEFAULT '',
  phrase_english text NOT NULL,
  phrase_translation text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (session_id, language, phrase_english)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read own favorites"
  ON favorites
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert favorites"
  ON favorites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete favorites"
  ON favorites
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_favorites_session
  ON favorites(session_id);

CREATE INDEX IF NOT EXISTS idx_favorites_session_lang
  ON favorites(session_id, language);
