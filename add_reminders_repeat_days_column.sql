-- Migration: Add repeat_days column to reminders table
-- Run this in Supabase SQL Editor
-- This adds the repeat_days column if it doesn't already exist

-- Add repeat_days column (INTEGER[] for weekly repeat days: 0-6, Monday-Sunday)
DO $$ 
BEGIN
  -- Check if repeat_days column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reminders' 
    AND column_name = 'repeat_days'
  ) THEN
    -- Add repeat_days column
    ALTER TABLE public.reminders 
    ADD COLUMN repeat_days INTEGER[] DEFAULT '{}';
    
    -- Add comment to column
    COMMENT ON COLUMN public.reminders.repeat_days IS 'Array of day numbers (0-6) for weekly repeat reminders. 0=Monday, 6=Sunday';
    
    RAISE NOTICE '✅ repeat_days column added to reminders table';
  ELSE
    RAISE NOTICE 'ℹ️ repeat_days column already exists in reminders table';
  END IF;
END $$;

-- Verify: Check if column was added successfully
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reminders'
AND column_name = 'repeat_days';

