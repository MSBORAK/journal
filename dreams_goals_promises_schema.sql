-- Dreams, Goals, and Promises Tables
-- Bu SQL'i Supabase SQL Editor'da çalıştırın

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
CREATE TABLE IF NOT EXISTS public.goals (
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
  why TEXT, -- Neden alanı
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Dreams RLS Policies
CREATE POLICY "Users can view own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Goals RLS Policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Promises RLS Policies
CREATE POLICY "Users can view own promises" ON public.promises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promises" ON public.promises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promises" ON public.promises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own promises" ON public.promises
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_user_created ON public.dreams(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_dream_id ON public.goals(dream_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_id ON public.promises(user_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_active ON public.promises(user_id, is_active);

