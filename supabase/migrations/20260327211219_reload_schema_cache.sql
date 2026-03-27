/*
  # Reload PostgREST schema cache

  Forces PostgREST to pick up the ref_code column that was added
  to the ambassadors table in a prior migration.
*/

NOTIFY pgrst, 'reload schema';