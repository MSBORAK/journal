-- Achievements and User Stats Tables
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Achievements Table
-- Önce tablo yoksa oluştur, varsa eksik sütunları ekle
DO $$ 
BEGIN
  -- Tablo yoksa oluştur
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'achievements') THEN
    CREATE TABLE public.achievements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      achievement_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT CHECK (category IN ('streak', 'mood', 'writing', 'goals', 'tasks', 'health')) DEFAULT 'streak',
      unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Tablo varsa eksik sütunları ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'achievement_id') THEN
      ALTER TABLE public.achievements ADD COLUMN achievement_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'title') THEN
      ALTER TABLE public.achievements ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'description') THEN
      ALTER TABLE public.achievements ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'icon') THEN
      ALTER TABLE public.achievements ADD COLUMN icon TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'category') THEN
      ALTER TABLE public.achievements ADD COLUMN category TEXT CHECK (category IN ('streak', 'mood', 'writing', 'goals', 'tasks', 'health')) DEFAULT 'streak';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'unlocked_at') THEN
      ALTER TABLE public.achievements ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'created_at') THEN
      ALTER TABLE public.achievements ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- User Stats Table
-- Önce tablo yoksa oluştur, varsa eksik sütunları ekle
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_stats') THEN
    CREATE TABLE public.user_stats (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Günlük yazma istatistikleri
  total_diary_entries INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_diary_date DATE,
  
  -- Görev istatistikleri
  total_tasks_completed INTEGER DEFAULT 0,
  tasks_completed_this_week INTEGER DEFAULT 0,
  
  -- Sağlık istatistikleri
  health_tracking_days INTEGER DEFAULT 0,
  last_health_date DATE,
  
  -- Hatırlatıcı istatistikleri
  total_reminders INTEGER DEFAULT 0,
  active_reminders INTEGER DEFAULT 0,
  
  -- Genel istatistikler
  app_usage_days INTEGER DEFAULT 0,
  first_app_use_date DATE,
  
  -- Wellness puanı sistemi
  wellness_score INTEGER DEFAULT 0 CHECK (wellness_score >= 0 AND wellness_score <= 100),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  next_level_exp INTEGER DEFAULT 10 CHECK (next_level_exp >= 0),
  
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Tablo varsa eksik sütunları ekle (tüm sütunları kontrol et)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'total_diary_entries') THEN
      ALTER TABLE public.user_stats ADD COLUMN total_diary_entries INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'current_streak') THEN
      ALTER TABLE public.user_stats ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'longest_streak') THEN
      ALTER TABLE public.user_stats ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'last_diary_date') THEN
      ALTER TABLE public.user_stats ADD COLUMN last_diary_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'total_tasks_completed') THEN
      ALTER TABLE public.user_stats ADD COLUMN total_tasks_completed INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'tasks_completed_this_week') THEN
      ALTER TABLE public.user_stats ADD COLUMN tasks_completed_this_week INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'health_tracking_days') THEN
      ALTER TABLE public.user_stats ADD COLUMN health_tracking_days INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'last_health_date') THEN
      ALTER TABLE public.user_stats ADD COLUMN last_health_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'total_reminders') THEN
      ALTER TABLE public.user_stats ADD COLUMN total_reminders INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'active_reminders') THEN
      ALTER TABLE public.user_stats ADD COLUMN active_reminders INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'app_usage_days') THEN
      ALTER TABLE public.user_stats ADD COLUMN app_usage_days INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'first_app_use_date') THEN
      ALTER TABLE public.user_stats ADD COLUMN first_app_use_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'wellness_score') THEN
      ALTER TABLE public.user_stats ADD COLUMN wellness_score INTEGER DEFAULT 0 CHECK (wellness_score >= 0 AND wellness_score <= 100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'level') THEN
      ALTER TABLE public.user_stats ADD COLUMN level INTEGER DEFAULT 1 CHECK (level >= 1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'experience') THEN
      ALTER TABLE public.user_stats ADD COLUMN experience INTEGER DEFAULT 0 CHECK (experience >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stats' AND column_name = 'next_level_exp') THEN
      ALTER TABLE public.user_stats ADD COLUMN next_level_exp INTEGER DEFAULT 10 CHECK (next_level_exp >= 0);
    END IF;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Achievements RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'achievements' AND policyname = 'Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'achievements' AND policyname = 'Users can insert own achievements') THEN
    CREATE POLICY "Users can insert own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'achievements' AND policyname = 'Users can delete own achievements') THEN
    CREATE POLICY "Users can delete own achievements" ON public.achievements FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- User Stats RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'Users can view own stats') THEN
    CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'Users can insert own stats') THEN
    CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_stats' AND policyname = 'Users can update own stats') THEN
    CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes (sadece sütunlar varsa)
DO $$ 
BEGIN
  -- user_id index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'achievements' AND indexname = 'idx_achievements_user_id') THEN
    CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
  END IF;
  
  -- unlocked_at index (sütun varsa)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'unlocked_at') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'achievements' AND indexname = 'idx_achievements_user_unlocked') THEN
      CREATE INDEX idx_achievements_user_unlocked ON public.achievements(user_id, unlocked_at DESC);
    END IF;
  END IF;
  
  -- category index (sütun varsa)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'achievements' AND column_name = 'category') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'achievements' AND indexname = 'idx_achievements_user_category') THEN
      CREATE INDEX idx_achievements_user_category ON public.achievements(user_id, category);
    END IF;
  END IF;
END $$;

-- Note: wellness_checks tablosu zaten database_schema.sql'de var, sadece kullanılmıyor
-- useHealth hook'unu güncelleyeceğiz

