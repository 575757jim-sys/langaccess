/*
  # Create templates storage bucket

  Creates a public storage bucket for card template images used during card composition.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for templates"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'templates');

CREATE POLICY "Service role can upload templates"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'templates');
