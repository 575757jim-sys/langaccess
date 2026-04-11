/*
  # Reload PostgREST schema cache

  Forces PostgREST to reload its schema cache so all columns on card_orders
  (including city, state, zip_code, etc.) are recognized without PGRST204 errors.
*/

NOTIFY pgrst, 'reload schema';