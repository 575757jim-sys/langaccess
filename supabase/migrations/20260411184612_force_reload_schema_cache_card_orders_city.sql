/*
  # Force PostgREST schema cache reload

  The card_orders table has a city column that exists in the database but PostgREST
  returns PGRST204 ("could not find the 'city' column") due to a stale schema cache.
  This migration forces PostgREST to reload its schema cache.
*/

NOTIFY pgrst, 'reload schema';