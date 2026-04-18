/*
  # Schedule daily cron for send-cert-first-win

  1. Changes
    - Schedules a daily pg_cron job at 14:15 UTC that pokes the
      send-cert-first-win edge function. The function only processes rows
      where sent_at IS NULL and scheduled_at <= now(), so running it daily
      is both safe and idempotent.
  2. Notes
    - Runs 15 minutes after the refresher cron to avoid concurrent load.
    - verify_jwt is false on the function, so no auth header is required.
*/

DO $$
DECLARE
  existing_jobid bigint;
BEGIN
  SELECT jobid INTO existing_jobid
  FROM cron.job
  WHERE jobname = 'send-cert-first-win-daily';

  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;

  PERFORM cron.schedule(
    'send-cert-first-win-daily',
    '15 14 * * *',
    $cron$
    SELECT net.http_post(
      url := 'https://tllfqsthkxgsadxtutpm.supabase.co/functions/v1/send-cert-first-win',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
    $cron$
  );
END $$;
