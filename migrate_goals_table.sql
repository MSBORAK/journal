-- Mevcut goals tablosunu yeni schema'ya migrate et
-- Bu SQL mevcut verileri korur ve eksik sütunları ekler

-- ÖNCE Dreams tablosunu oluştur (foreign key için gerekli)
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

-- 1. Eksik sütunları ekle
DO $$ 
BEGIN
  -- dream_id ekle (dreams tablosu artık var)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'dream_id') THEN
    ALTER TABLE public.goals ADD COLUMN dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL;
  END IF;
  
  -- emoji ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'emoji') THEN
    ALTER TABLE public.goals ADD COLUMN emoji TEXT DEFAULT '🎯';
  END IF;
  
  -- type ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'type') THEN
    ALTER TABLE public.goals ADD COLUMN type TEXT CHECK (type IN ('short', 'medium', 'long')) DEFAULT 'short';
  END IF;
  
  -- milestones ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'milestones') THEN
    ALTER TABLE public.goals ADD COLUMN milestones JSONB DEFAULT '[]';
  END IF;
  
  -- status ekle (tamamlandı boolean'ından türetilecek)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'status') THEN
    ALTER TABLE public.goals ADD COLUMN status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active';
    
    -- Mevcut tamamlandı değerlerine göre status'u güncelle (sütun adını kontrol et)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'tamamlandı') THEN
      UPDATE public.goals 
      SET status = CASE 
        WHEN tamamlandı = true THEN 'completed'
        ELSE 'active'
      END;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'completed') THEN
      UPDATE public.goals 
      SET status = CASE 
        WHEN completed = true THEN 'completed'
        ELSE 'active'
      END;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'is_completed') THEN
      UPDATE public.goals 
      SET status = CASE 
        WHEN is_completed = true THEN 'completed'
        ELSE 'active'
      END;
    END IF;
  END IF;
  
  -- completed_at ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'completed_at') THEN
    ALTER TABLE public.goals ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    
    -- Eğer tamamlandı/completed/is_completed true ise, completed_at'i güncelle
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'tamamlandı') THEN
      UPDATE public.goals 
      SET completed_at = updated_at 
      WHERE tamamlandı = true AND completed_at IS NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'completed') THEN
      UPDATE public.goals 
      SET completed_at = updated_at 
      WHERE completed = true AND completed_at IS NULL;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'is_completed') THEN
      UPDATE public.goals 
      SET completed_at = updated_at 
      WHERE is_completed = true AND completed_at IS NULL;
    END IF;
  END IF;
  
  -- priority ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'priority') THEN
    ALTER TABLE public.goals ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium';
  END IF;
  
  -- notes ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'notes') THEN
    ALTER TABLE public.goals ADD COLUMN notes TEXT;
  END IF;
  
  -- reminder ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'reminder') THEN
    ALTER TABLE public.goals ADD COLUMN reminder BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- why ekle
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'why') THEN
    ALTER TABLE public.goals ADD COLUMN why TEXT;
  END IF;
  
  -- progress sütununu ekle (ilerleme_yüzdesi varsa onu kullan)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'progress') THEN
    ALTER TABLE public.goals ADD COLUMN progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0;
    
    -- Eğer ilerleme_yüzdesi varsa, progress'e kopyala
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'ilerleme_yüzdesi') THEN
      UPDATE public.goals 
      SET progress = COALESCE(ilerleme_yüzdesi, 0);
    END IF;
  END IF;
END $$;

-- 2. Promises tablosunu oluştur (eğer yoksa)
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

-- 3. RLS'yi etkinleştir
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promises ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies oluştur (eğer yoksa)
DO $$ 
BEGIN
  -- Dreams policies
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
  
  -- Goals policies
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
  
  -- Promises policies
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

-- 5. Indexes oluştur (eğer yoksa)
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_user_created ON public.dreams(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_dream_id ON public.goals(dream_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_id ON public.promises(user_id);
CREATE INDEX IF NOT EXISTS idx_promises_user_active ON public.promises(user_id, is_active);

