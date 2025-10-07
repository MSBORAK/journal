-- Daily App Database Schema
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

-- Not: auth.users tablosuna dokunmuyoruz (Supabase otomatik yönetiyor)

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diary Entries
CREATE TABLE public.diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  tags TEXT[] DEFAULT '{}',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Tasks
CREATE TABLE public.daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('health', 'personal', 'work', 'hobby', 'custom')),
  emoji TEXT DEFAULT '📝',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  estimated_time INTEGER, -- dakika
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders
CREATE TABLE public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '⏰',
  time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  repeat_type TEXT CHECK (repeat_type IN ('daily', 'weekly', 'monthly', 'once')) DEFAULT 'daily',
  repeat_days INTEGER[] DEFAULT '{}', -- 0-6 (Pazartesi-Pazar)
  category TEXT CHECK (category IN ('task', 'medicine', 'health', 'personal', 'custom')) DEFAULT 'personal',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness Checks
CREATE TABLE public.wellness_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  exercise_minutes INTEGER DEFAULT 0,
  water_glasses INTEGER DEFAULT 0,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE public.settings (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  reminder_time TIME,
  theme TEXT CHECK (theme IN ('light', 'dark', 'lavender', 'mint', 'cream')) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Diary entries policies
CREATE POLICY "Users can view own diary entries" ON public.diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON public.diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON public.diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON public.diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Daily tasks policies
CREATE POLICY "Users can view own tasks" ON public.daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.daily_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON public.reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Wellness checks policies
CREATE POLICY "Users can view own wellness checks" ON public.wellness_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness checks" ON public.wellness_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness checks" ON public.wellness_checks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness checks" ON public.wellness_checks
  FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_diary_entries_user_date ON public.diary_entries(user_id, date DESC);
CREATE INDEX idx_daily_tasks_user_date ON public.daily_tasks(user_id, date DESC);
CREATE INDEX idx_reminders_user_active ON public.reminders(user_id, is_active);
CREATE INDEX idx_wellness_checks_user_date ON public.wellness_checks(user_id, date DESC);

-- Function to automatically create user profile
-- Bu fonksiyon manuel olarak çağrılacak (trigger yerine)
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id UUID, user_email TEXT, display_name TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (user_id, user_email, display_name);
  
  INSERT INTO public.settings (user_id)
  VALUES (user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
