-- Migration: Add missing columns to reminders table
-- Run this in Supabase SQL Editor
-- This migration safely adds columns only if they don't exist

-- 1. Add category column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN category TEXT CHECK (category IN ('task', 'medicine', 'health', 'personal', 'custom')) DEFAULT 'personal';
        
        RAISE NOTICE '✅ Category column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ Category column already exists';
    END IF;
END $$;

-- 2. Add date column (for scheduled reminders)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'date'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN date DATE;
        
        RAISE NOTICE '✅ Date column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ Date column already exists';
    END IF;
END $$;

-- 3. Add reminder_type column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'reminder_type'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN reminder_type TEXT CHECK (reminder_type IN ('today', 'scheduled')) DEFAULT 'today';
        
        RAISE NOTICE '✅ reminder_type column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ reminder_type column already exists';
    END IF;
END $$;

-- 4. Add linked_task_id column (for task-linked reminders)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'linked_task_id'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN linked_task_id UUID;
        
        RAISE NOTICE '✅ linked_task_id column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ linked_task_id column already exists';
    END IF;
END $$;

-- 5. Add is_task_reminder column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'is_task_reminder'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN is_task_reminder BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE '✅ is_task_reminder column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ is_task_reminder column already exists';
    END IF;
END $$;

-- 6. Add priority column (if missing)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reminders' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.reminders 
        ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';
        
        RAISE NOTICE '✅ priority column added successfully';
    ELSE
        RAISE NOTICE 'ℹ️ priority column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reminders'
ORDER BY ordinal_position;

