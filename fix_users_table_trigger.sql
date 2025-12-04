-- Migration: Fix users table trigger for OTP sign-ins
-- Run this in Supabase SQL Editor
-- This ensures that when a user signs in with OTP, they are automatically added to public.users table

-- 0. First, allow NULL email for anonymous users (if not already done)
DO $$ 
BEGIN
  -- Check if email column allows NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'email'
    AND is_nullable = 'NO'
  ) THEN
    -- Drop NOT NULL constraint
    ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
    
    -- Drop unique constraint if exists (we'll recreate it as partial)
    IF EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'users_email_key'
    ) THEN
      ALTER TABLE public.users DROP CONSTRAINT users_email_key;
    END IF;
    
    -- Create partial unique index for non-NULL emails
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx 
      ON public.users(email) 
      WHERE email IS NOT NULL;
    
    RAISE NOTICE '✅ Email column updated to allow NULL';
  ELSE
    RAISE NOTICE 'ℹ️ Email column already allows NULL';
  END IF;
END $$;

-- 1. Create or replace function to handle new user creation (for all auth methods)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users if not exists (email can be NULL for anonymous users)
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email, -- Can be NULL for anonymous users
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = CASE 
      WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email 
      ELSE public.users.email 
    END,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    updated_at = NOW();
  
  -- Create default settings if not exists
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger for all new users (including OTP sign-ins)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Migrate existing auth.users to public.users (if not already migrated)
-- Handle NULL emails properly
INSERT INTO public.users (id, email, display_name)
SELECT 
  id,
  email, -- Can be NULL
  COALESCE(raw_user_meta_data->>'full_name', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE
SET 
  email = CASE 
    WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email 
    ELSE public.users.email 
  END,
  display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
  updated_at = NOW();

-- 5. Create default settings for existing users
INSERT INTO public.settings (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.settings)
ON CONFLICT (user_id) DO NOTHING;

-- Verify: Check if all auth.users have corresponding public.users entries
SELECT 
  COUNT(*) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count,
  COUNT(*) - (SELECT COUNT(*) FROM public.users) as missing_users
FROM auth.users;
