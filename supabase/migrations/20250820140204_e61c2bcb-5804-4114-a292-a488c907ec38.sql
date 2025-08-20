
-- 1) Show pending reminders due today (basic)
select 
  id, product_name, category, reminder_date, expiry_date, reminder_sent, user_id
from public.products
where reminder_date <= current_date
  and reminder_sent = false
order by reminder_date asc
limit 50;

-- 2) Show pending reminders with user email (helps detect missing profiles)
select 
  p.id, p.product_name, p.category, p.reminder_date, p.expiry_date, p.reminder_sent,
  pr.email as user_email
from public.products p
left join public.profiles pr on pr.id = p.user_id
where p.reminder_date <= current_date
  and p.reminder_sent = false
order by p.reminder_date asc
limit 50;

-- 3) Verify the two cron jobs are present
select jobname, schedule, active
from cron.job
where jobname in ('send-morning-reminders', 'send-evening-reminders');

-- 4) Manually trigger send-reminders now to send any pending emails immediately
select net.http_post(
  url := 'https://enlatyrcvbzlbmaafjyd.supabase.co/functions/v1/send-reminders',
  headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGF0eXJjdmJ6bGJtYWFmanlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjE1MTcsImV4cCI6MjA3MTA5NzUxN30.HEh2XxiuQI4J29PPUDFzRmndr8l6IM1JdznnGKzyTPQ"}'::jsonb,
  body := '{"manual": true}'::jsonb
) as request_id;
