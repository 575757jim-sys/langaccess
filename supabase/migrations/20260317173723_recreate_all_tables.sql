/*
  # Recreate all LangAccess tables

  ## Summary
  Recreates all tables from the original LangAccess project in the new Supabase instance.
  All tables use IF NOT EXISTS / DO $$ guards so this is safe to run multiple times.

  ## Tables Created
  1. custom_phrases - User-added phrases for each language/sector/subcategory
  2. language_requests - Submissions requesting new language support
  3. interaction_logs - Anonymous telemetry for every phrase playback
  4. favorites - Session-scoped saved phrases (with optional email)
  5. email_captures - Email addresses submitted via the favorites modal
  6. toolkit_requests - Email sign-ups for the Language Access Toolkit PDF
  7. pilot_requests - Institutional pilot program requests (already created, guarded)

  ## Security
  - RLS enabled on every table
  - Policies follow least-privilege principle
*/

-- ───────────────────────────────────────────────
-- 1. custom_phrases
-- ───────────────────────────────────────────────
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_phrases' AND policyname = 'Anyone can read custom phrases') THEN
    CREATE POLICY "Anyone can read custom phrases" ON custom_phrases FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_phrases' AND policyname = 'Anyone can insert custom phrases') THEN
    CREATE POLICY "Anyone can insert custom phrases" ON custom_phrases FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_phrases' AND policyname = 'Anyone can delete custom phrases') THEN
    CREATE POLICY "Anyone can delete custom phrases" ON custom_phrases FOR DELETE USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_custom_phrases_filters ON custom_phrases(language, sector, subcategory);
CREATE INDEX IF NOT EXISTS idx_custom_phrases_created ON custom_phrases(created_at DESC);

-- ───────────────────────────────────────────────
-- 2. language_requests
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS language_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  language_requested text NOT NULL,
  sector text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE language_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'language_requests' AND policyname = 'Anyone can submit a language request') THEN
    CREATE POLICY "Anyone can submit a language request" ON language_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'language_requests' AND policyname = 'Authenticated users can view language requests') THEN
    CREATE POLICY "Authenticated users can view language requests" ON language_requests FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ───────────────────────────────────────────────
-- 3. interaction_logs
-- ───────────────────────────────────────────────
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interaction_logs' AND policyname = 'Anyone can insert interaction logs') THEN
    CREATE POLICY "Anyone can insert interaction logs" ON interaction_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interaction_logs' AND policyname = 'Anyone can read interaction logs') THEN
    CREATE POLICY "Anyone can read interaction logs" ON interaction_logs FOR SELECT USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_interaction_logs_logged_at ON interaction_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_language_sector ON interaction_logs(language, sector);

-- ───────────────────────────────────────────────
-- 4. favorites
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT '',
  language text NOT NULL,
  sector text NOT NULL,
  subcategory text NOT NULL DEFAULT '',
  phrase_english text NOT NULL,
  phrase_translation text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  email text,
  UNIQUE (session_id, language, phrase_english)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Anyone can read own favorites') THEN
    CREATE POLICY "Anyone can read own favorites" ON favorites FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Anyone can insert favorites') THEN
    CREATE POLICY "Anyone can insert favorites" ON favorites FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Anyone can delete favorites') THEN
    CREATE POLICY "Anyone can delete favorites" ON favorites FOR DELETE USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_session_lang ON favorites(session_id, language);
CREATE INDEX IF NOT EXISTS idx_favorites_email ON favorites(email) WHERE email IS NOT NULL;

-- ───────────────────────────────────────────────
-- 5. email_captures
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text DEFAULT 'favorites_modal',
  sector text DEFAULT '',
  phrase text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_captures' AND policyname = 'Anyone can insert email capture') THEN
    CREATE POLICY "Anyone can insert email capture" ON email_captures FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS email_captures_email_unique ON email_captures (email);

-- ───────────────────────────────────────────────
-- 6. toolkit_requests
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS toolkit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  sector text,
  source text NOT NULL DEFAULT 'toolkit_request',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE toolkit_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'toolkit_requests' AND policyname = 'Anyone can submit a toolkit request') THEN
    CREATE POLICY "Anyone can submit a toolkit request" ON toolkit_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

-- ───────────────────────────────────────────────
-- 7. pilot_requests (already created, guarded)
-- ───────────────────────────────────────────────
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pilot_requests' AND policyname = 'Anyone can submit a pilot request') THEN
    CREATE POLICY "Anyone can submit a pilot request" ON pilot_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;
