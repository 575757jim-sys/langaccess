/*
  # Reload schema cache for certificate_purchases

  Forces PostgREST to reload its schema cache so the certificate_purchases
  table columns are correctly recognized and REST queries return 200 instead of 400.
*/
NOTIFY pgrst, 'reload schema';