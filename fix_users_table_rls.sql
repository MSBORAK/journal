-- Fix RLS Policies for public.users table
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut politikaları kontrol et ve gerekirse sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- 2. full_name ve bio kolonlarını ekle (eğer yoksa)
DO $$ 
BEGIN
  -- full_name kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN full_name TEXT;
    RAISE NOTICE 'full_name column added';
  END IF;
  
  -- bio kolonu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.users ADD COLUMN bio TEXT;
    RAISE NOTICE 'bio column added';
  END IF;
  
  -- avatar_url kolonu (eğer yoksa)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'avatar_url column added';
  END IF;
END $$;

-- 3. RLS'yi etkinleştir (eğer kapalıysa)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. SELECT politikası - Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- 5. UPDATE politikası - Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. INSERT politikası - Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 7. Anonymous kullanıcılar için de aynı politikaları ekle
CREATE POLICY "Anonymous users can view own profile" ON public.users
  FOR SELECT 
  TO anon
  USING (auth.uid() = id);

CREATE POLICY "Anonymous users can update own profile" ON public.users
  FOR UPDATE 
  TO anon
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anonymous users can insert own profile" ON public.users
  FOR INSERT 
  TO anon
  WITH CHECK (auth.uid() = id);

-- 8. Mevcut kullanıcılar için display_name'i full_name'e kopyala (eğer full_name boşsa)
UPDATE public.users 
SET full_name = display_name 
WHERE full_name IS NULL OR full_name = '' 
AND display_name IS NOT NULL;

