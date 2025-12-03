-- Dreams, Goals, and Promises Tables
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ÖNEMLİ: Eğer goals tablosu zaten varsa ve "durum" sütunu varsa, önce onu "status" olarak değiştirin

-- Önce mevcut goals tablosunu kontrol et ve varsa sütun adlarını düzelt
DO $$ 
BEGIN
  -- Eğer goals tablosu varsa ve "durum" sütunu varsa, "status" olarak değiştir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'goals' 
    AND column_name = 'durum'
  ) THEN
    ALTER TABLE public.goals RENAME COLUMN durum TO status;
  END IF;
END $$;

-- Dreams (Hayaller) Table
CREATE TABLE IF NOT EXISTS public.dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🌟',
  image_url TEXT,
  category TEXT DEFAULT 'personal',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals (Hedefler) Table
-- Eğer tablo zaten varsa, sadece eksik sütunları ekle
DO $$ 
BEGIN
  -- Tablo yoksa oluştur
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    CREATE TABLE public.goals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      emoji TEXT DEFAULT '🎯',
      type TEXT CHECK (type IN ('short', 'medium', 'long')) DEFAULT 'short',
      category TEXT DEFAULT 'personal',
      target_date DATE,
      progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
      milestones JSONB DEFAULT '[]',
      status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
      completed_at TIMESTAMP WITH TIME ZONE,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      notes TEXT,
      reminder BOOLEAN DEFAULT FALSE,
      why TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Tablo varsa eksik sütunları ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'dream_id') THEN
      ALTER TABLE public.goals ADD COLUMN dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'type') THEN
      ALTER TABLE public.goals ADD COLUMN type TEXT CHECK (type IN ('short', 'medium', 'long')) DEFAULT 'short';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'target_date') THEN
      ALTER TABLE public.goals ADD COLUMN target_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'progress') THEN
      ALTER TABLE public.goals ADD COLUMN progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'milestones') THEN
      ALTER TABLE public.goals ADD COLUMN milestones JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'status') THEN
      ALTER TABLE public.goals ADD COLUMN status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'completed_at') THEN
      ALTER TABLE public.goals ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'priority') THEN
      ALTER TABLE public.goals ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'notes') THEN
      ALTER TABLE public.goals ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'reminder') THEN
      ALTER TABLE public.goals ADD COLUMN reminder BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'why') THEN
      ALTER TABLE public.goals ADD COLUMN why TEXT;
    END IF;
  END IF;
END $$;

-- Promises (Sözler) Table
CREATE TABLE IF NOT EXISTS public.promises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  emoji TEXT DEFAULT '💝',
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promises ENABLE ROW LEVEL SECURITY;

-- Dreams RLS Policies (eğer yoksa oluştur)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dreams' AND policyname = 'Users can view own dreams') THEN
    CREATE POLICY "Users can view own dreams" ON public.dreams FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dreams' AND policyname = 'Users can insert own dreams') THEN
    CREATE POLICY "Users can insert own dreams" ON public.dreams FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dreams' AND policyname = 'Users can update own dreams') THEN
    CREATE POLICY "Users can update own dreams" ON public.dreams FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dreams' AND policyname = 'Users can delete own dreams') THEN
    CREATE POLICY "Users can delete own dreams" ON public.dreams FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Goals RLS Policies (eğer yoksa oluştur)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals' AND policyname = 'Users can view own goals') THEN
    CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals' AND policyname = 'Users can insert own goals') THEN
    CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals' AND policyname = 'Users can update own goals') THEN
    CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'goals' AND policyname = 'Users can delete own goals') THEN
    CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Promises RLS Policies (eğer yoksa oluştur)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promises' AND policyname = 'Users can view own promises') THEN
    CREATE POLICY "Users can view own promises" ON public.promises FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promises' AND policyname = 'Users can insert own promises') THEN
    CREATE POLICY "Users can insert own promises" ON public.promises FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promises' AND policyname = 'Users can update own promises') THEN
    CREATE POLICY "Users can update own promises" ON public.promises FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promises' AND policyname = 'Users can delete own promises') THEN
    CREATE POLICY "Users can delete own promises" ON public.promises FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance (eğer yoksa)
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_user_created ON public.dreams(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_dream_id ON public.goals(dream_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_id ON public.promises(user_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_active ON public.promises(user_id, is_active);

