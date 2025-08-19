
-- Remove existing cron job
SELECT cron.unschedule('send-daily-reminders');

-- Schedule reminders at 08:00 AM IST (02:30 AM UTC)
SELECT cron.schedule(
  'send-morning-reminders',
  '30 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://enlatyrcvbzlbmaafjyd.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGF0eXJjdmJ6bGJtYWFmanlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjE1MTcsImV4cCI6MjA3MTA5NzUxN30.HEh2XxiuQI4J29PPUDFzRmndr8l6IM1JdznnGKzyTPQ"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);

-- Schedule reminders at 06:00 PM IST (12:30 PM UTC)  
SELECT cron.schedule(
  'send-evening-reminders',
  '30 12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://enlatyrcvbzlbmaafjyd.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGF0eXJjdmJ6bGJtYWFmanlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjE1MTcsImV4cCI6MjA3MTA5NzUxN30.HEh2XxiuQI4J29PPUDFzRmndr8l6IM1JdznnGKzyTPQ"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);
