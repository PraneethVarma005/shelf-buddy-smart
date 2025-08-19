
-- Schedule the send-reminders edge function to run daily at 08:00 UTC
select
  cron.schedule(
    'daily-send-reminders-08-utc',
    '0 8 * * *',  -- runs at 08:00 UTC daily; adjust as needed
    $$
    select
      net.http_post(
        url:='https://enlatyrcvbzlbmaafjyd.supabase.co/functions/v1/send-reminders',
        headers:='{
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGF0eXJjdmJ6bGJtYWFmanlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjE1MTcsImV4cCI6MjA3MTA5NzUxN30.HEh2XxiuQI4J29PPUDFzRmndr8l6IM1JdznnGKzyTPQ"
        }'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
