/*
  # Schedule daily refresher email cron

  1. Changes
    - Enables pg_cron and pg_net extensions
    - Schedules a daily cron job at 14:00 UTC that calls the
      send-cert-refresher Edge Function, which finds due refreshers and emails them.
  2. Notes
    - pg_net.http_post is async and non-blocking; the function internally
      queries only rows where sent_at IS NULL and scheduled_at <= now().
    - The job is idempotent; running it more than once per day is safe because
      sent_at is set after each email succeeds.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
DECLARE
  existing_jobid bigint;
BEGIN
  SELECT jobid INTO existing_jobid
  FROM cron.job
  WHERE jobname = 'send-cert-refresher-daily';

  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;

  PERFORM cron.schedule(
    'send-cert-refresher-daily',
    '0 14 * * *',
    $cron$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/send-cert-refresher',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
      ),
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
