-- ============================================================
-- MIGRATION: Add reminder_sent column to appointments table
-- Required for the 24h payment reminder scheduler job
-- Run this once on your production database via pgAdmin
-- ============================================================

-- Add the reminder_sent flag (tracks whether the 24h reminder email was sent)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Verify it was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'reminder_sent';
