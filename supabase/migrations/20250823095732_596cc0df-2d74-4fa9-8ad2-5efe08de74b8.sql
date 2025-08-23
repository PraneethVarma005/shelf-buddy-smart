
-- Add a cancelled column to track cancelled reminders separately from sent reminders
ALTER TABLE products 
ADD COLUMN cancelled BOOLEAN DEFAULT FALSE;
