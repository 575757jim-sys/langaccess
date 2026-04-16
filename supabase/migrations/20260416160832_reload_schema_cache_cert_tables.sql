/*
  # Reload PostgREST schema cache for certificate tables

  Forces PostgREST to re-read the schema so certificate_purchases and
  certificate_records are properly exposed via the REST API.
  Also grants explicit access to ensure anon/authenticated roles can query.
*/

NOTIFY pgrst, 'reload schema';

GRANT SELECT, INSERT, UPDATE ON certificate_purchases TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON certificate_records TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON certificate_progress TO anon, authenticated;
