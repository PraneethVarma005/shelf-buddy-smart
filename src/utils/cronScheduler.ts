
import { supabase } from "@/integrations/supabase/client";

export const scheduleReminderCron = async (
  productId: string,
  userEmail: string,
  productName: string,
  expiryDate: Date
) => {
  // Calculate the reminder date (2 days before expiry)
  const reminderDate = new Date(expiryDate);
  reminderDate.setDate(reminderDate.getDate() - 2);
  
  // Format the cron expression for the reminder date at 8:00 AM and 6:00 PM
  const day = reminderDate.getDate();
  const month = reminderDate.getMonth() + 1;
  const year = reminderDate.getFullYear();
  
  const cronExpression = `0 8,18 ${day} ${month} *`;
  const jobName = `expiry_reminder_${productId}`;
  
  const emailBody = {
    to: userEmail,
    subject: `Reminder: ${productName} expires tomorrow!`,
    body: `Hi! This is a friendly reminder that your ${productName} will expire on ${expiryDate.toDateString()}. Please use it soon to avoid waste.`
  };

  const cronQuery = `
    select cron.schedule(
      '${jobName}',
      '${cronExpression}',
      $$
      select
        net.http_post(
          url:='https://enlatyrcvbzlbmaafjyd.supabase.co/functions/v1/send-remainder-testing-gpt',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGF0eXJjdmJ6bGJtYWFmanlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjE1MTcsImV4cCI6MjA3MTA5NzUxN30.HEh2XxiuQI4J29PPUDFzRmndr8l6IM1JdznnGKzyTPQ"}',
          body:='${JSON.stringify(emailBody).replace(/'/g, "''")}'
        )
      $$
    );
  `;

  const { data, error } = await supabase.rpc('execute_sql', {
    query: cronQuery
  });

  if (error) {
    throw new Error(`Failed to schedule reminder: ${error.message}`);
  }

  return data;
};
