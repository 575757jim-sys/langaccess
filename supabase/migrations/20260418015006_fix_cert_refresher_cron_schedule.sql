/*
  # Fix cert refresher cron schedule

  1. Changes
    - Replaces prior scheduled job with one that posts directly to the
      deployed edge function URL (no vault lookup).
    - verify_jwt is false on the function, so no auth header is required.
  2. Notes
    - Runs daily at 14:00 UTC. Safe to run more than once per day; the function
      only processes rows where sent_at IS NULL and scheduled_at <= now().
*/

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
      url := 'https://tllfqsthkxgsadxtutpm.supabase.co/functions/v1/send-cert-refresher',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
