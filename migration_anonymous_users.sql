-- Migration: Anonim Kullanıcı Desteği
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- ÖNEMLİ: Önce "Allow anonymous sign-ins" ayarını Supabase Dashboard'da açın!

-- 1. Email constraint'ini NULL'a izin verecek şekilde güncelle
-- Önce mevcut NOT NULL constraint'ini kaldır
ALTER TABLE public.users 
  ALTER COLUMN email DROP NOT NULL;

-- Email unique constraint'i NULL değerler için çalışmaz, bu yüzden partial unique index kullanıyoruz
-- Önce mevcut unique constraint'i kaldır (eğer varsa)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- NULL olmayan email'ler için unique constraint ekle
CREATE UNIQUE INDEX users_email_unique_idx 
  ON public.users(email) 
  WHERE email IS NOT NULL;

-- 2. Anonim kullanıcılar için otomatik profil oluşturma fonksiyonu
-- Bu fonksiyon, anonim kullanıcı oluşturulduğunda otomatik olarak çağrılacak
CREATE OR REPLACE FUNCTION public.handle_anonymous_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Anonim kullanıcı için public.users tablosuna kayıt oluştur
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NULL), -- Email NULL olabilir
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest')
  )
  ON CONFLICT (id) DO NOTHING; -- Eğer zaten varsa hata verme
  
  -- Varsayılan ayarları oluştur
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING; -- Eğer zaten varsa hata verme
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger oluştur - yeni kullanıcı oluşturulduğunda otomatik çalışır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_anonymous_user();

-- 4. Mevcut anonim kullanıcılar için (eğer varsa) profil oluştur
-- Bu sadece bir kez çalıştırılmalı
INSERT INTO public.users (id, email, display_name)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Guest')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Mevcut kullanıcılar için varsayılan ayarları oluştur
INSERT INTO public.settings (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.settings)
ON CONFLICT (user_id) DO NOTHING;

-- 5. RLS politikalarının anonim kullanıcılar için de çalıştığından emin ol
-- (Mevcut politikalar zaten auth.uid() kullanıyor, bu anonim kullanıcılar için de çalışır)

-- Not: Anonim kullanıcılar authenticated rolünü kullanır, bu yüzden mevcut RLS politikaları
-- otomatik olarak onlar için de geçerli olacaktır.

