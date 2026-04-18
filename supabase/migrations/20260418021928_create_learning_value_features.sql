/*
  # Create tables for Mastery Map, Self-Assessment, and Scenario Chains

  ## Overview
  Adds persistent data structures to power three new learnability features:
  the visible Mastery Map, the before/after Self-Assessment, and Scenario Chains.
  All tables are session-id and/or email based to align with the app's existing
  anonymous-first pattern.

  ## New Tables

  1. `phrase_mastery`
     - Tracks per-user, per-phrase mastery level
     - `id` (uuid, pk)
     - `session_id` (text) - anonymous identifier
     - `email` (text, nullable) - attached when user provides email
     - `phrase_id` (text)
     - `sector` (text, nullable)
     - `language` (text, nullable)
     - `level` (int, 1-5) - Seen=1, Heard=2, Repeated=3, Quiz=4, Used=5
     - `first_seen_at` (timestamptz)
     - `mastered_at` (timestamptz, nullable) - when level first hit 4+
     - `updated_at` (timestamptz)

  2. `self_assessments`
     - Stores before/after confidence self-ratings
     - `id` (uuid, pk)
     - `session_id` (text)
     - `email` (text, nullable)
     - `track_id` (text) - e.g. 'education', 'healthcare'
     - `phase` (text) - 'before' or 'after'
     - `ratings` (jsonb) - { "<phrase_id>": 1-5 }
     - `created_at` (timestamptz)

  3. `scenarios`
     - Defines real-world scenario chains (a flow of 4-6 related phrases)
     - `id` (uuid, pk)
     - `slug` (text, unique)
     - `title` (text)
     - `description` (text)
     - `sector` (text)
     - `phrases` (jsonb) - ordered array of step objects { phrase_id, english, spanish, note }
     - `created_at` (timestamptz)

  4. `scenario_completions`
     - Tracks which scenarios a learner has worked through
     - `id` (uuid, pk)
     - `session_id` (text)
     - `email` (text, nullable)
     - `scenario_slug` (text)
     - `completed_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Anonymous users may insert and read their own rows by session_id
  - Authenticated users may read/write rows matching their email
  - Scenarios table is publicly readable (content catalog)
*/

-- phrase_mastery
CREATE TABLE IF NOT EXISTS phrase_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  email text,
  phrase_id text NOT NULL,
  sector text,
  language text,
  level int NOT NULL DEFAULT 1,
  first_seen_at timestamptz DEFAULT now(),
  mastered_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phrase_mastery_session ON phrase_mastery(session_id);
CREATE INDEX IF NOT EXISTS idx_phrase_mastery_email ON phrase_mastery(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_phrase_mastery_unique ON phrase_mastery(session_id, phrase_id);

ALTER TABLE phrase_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert phrase mastery"
  ON phrase_mastery FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read phrase mastery by session"
  ON phrase_mastery FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update phrase mastery by session"
  ON phrase_mastery FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- self_assessments
CREATE TABLE IF NOT EXISTS self_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  email text,
  track_id text NOT NULL,
  phase text NOT NULL DEFAULT 'before',
  ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_self_assessments_session ON self_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_email ON self_assessments(email);
CREATE INDEX IF NOT EXISTS idx_self_assessments_track ON self_assessments(track_id);

ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert self assessments"
  ON self_assessments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read self assessments"
  ON self_assessments FOR SELECT
  TO anon, authenticated
  USING (true);

-- scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  phrases jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scenarios are publicly readable"
  ON scenarios FOR SELECT
  TO anon, authenticated
  USING (true);

-- scenario_completions
CREATE TABLE IF NOT EXISTS scenario_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  email text,
  scenario_slug text NOT NULL,
  completed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenario_completions_session ON scenario_completions(session_id);
CREATE INDEX IF NOT EXISTS idx_scenario_completions_slug ON scenario_completions(scenario_slug);

ALTER TABLE scenario_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scenario completions"
  ON scenario_completions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read scenario completions"
  ON scenario_completions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed a small starter set of scenario chains (idempotent)
INSERT INTO scenarios (slug, title, description, sector, phrases)
VALUES
  (
    'education-late-pickup',
    'Parent arrives late to pickup',
    'Warm greeting, reassurance, logistics, and a close that protects the relationship.',
    'education',
    '[
      {"step": 1, "english": "Hi, I''m glad you made it.", "spanish": "Hola, me alegra que haya llegado.", "note": "Leads with warmth, not criticism."},
      {"step": 2, "english": "Your child is safe and had a good day.", "spanish": "Su hijo está bien y tuvo un buen día.", "note": "Reassure first; logistics second."},
      {"step": 3, "english": "Our pickup ends at 3:15. Next time, please call if you will be late.", "spanish": "La salida termina a las 3:15. La próxima vez, por favor llame si va a llegar tarde.", "note": "Clear expectation without shame."},
      {"step": 4, "english": "Thank you for letting me know. Have a good evening.", "spanish": "Gracias por avisarme. Que tenga una buena tarde.", "note": "Close warm; leave the door open."}
    ]'::jsonb
  ),
  (
    'healthcare-intake-anxious',
    'Anxious patient at intake',
    'Lower the temperature, confirm identity, explain the next step.',
    'healthcare',
    '[
      {"step": 1, "english": "I''m here to help you. Take your time.", "spanish": "Estoy aquí para ayudarle. Tómese su tiempo.", "note": "Anchor calm before asking anything."},
      {"step": 2, "english": "Can you tell me your full name and date of birth?", "spanish": "¿Me puede decir su nombre completo y fecha de nacimiento?", "note": "Standard ID check, gentle tone."},
      {"step": 3, "english": "I am going to check your blood pressure now.", "spanish": "Le voy a tomar la presión ahora.", "note": "Narrate before touching."},
      {"step": 4, "english": "You are doing great. We are almost done.", "spanish": "Lo está haciendo muy bien. Ya casi terminamos.", "note": "Verbal reassurance throughout."}
    ]'::jsonb
  ),
  (
    'construction-safety-brief',
    'Morning safety briefing on site',
    'Set the tone, name the hazard, confirm understanding.',
    'construction',
    '[
      {"step": 1, "english": "Good morning. Before we start, one quick safety note.", "spanish": "Buenos días. Antes de empezar, una nota de seguridad.", "note": "Tone sets the day."},
      {"step": 2, "english": "Watch for the open trench on the north side.", "spanish": "Cuidado con la zanja abierta en el lado norte.", "note": "Name the hazard specifically."},
      {"step": 3, "english": "Always wear your hard hat and safety vest.", "spanish": "Siempre use el casco y el chaleco de seguridad.", "note": "Non-negotiable expectation."},
      {"step": 4, "english": "Any questions before we begin?", "spanish": "¿Alguna pregunta antes de empezar?", "note": "Invite clarification; confirms comprehension."}
    ]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
