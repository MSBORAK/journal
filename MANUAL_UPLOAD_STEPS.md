# Supabase Storage - Manuel HTML Dosya Yükleme Adımları

## ⚠️ ÖNEMLİ: Content-Type Sorunu Çözümü

iPhone'da HTML dosyaları raw text olarak görünüyor çünkü Supabase Storage Content-Type'ı yanlış kaydediyor.

## ✅ Çözüm: Manuel Yükleme (Garantili)

### Adım 1: Mevcut Dosyaları Sil

1. Supabase Dashboard → Storage → Files
2. `auth-reset` bucket'ına gir
3. `auth-reset.html` dosyasını bul ve **SİL**
4. `auth-confirm` bucket'ına gir  
5. `auth-confirm.html` dosyasını bul ve **SİL**

### Adım 2: INSERT Policy'lerini Kontrol Et

1. Supabase Dashboard → Storage → Files → **Policies** tab'ına git
2. Her iki bucket için de INSERT policy'si olmalı:

#### AUTH-RESET Bucket:
- Policy name: `auth-reset-insert` (veya benzer)
- Allowed operation: **INSERT** ✅
- Target roles: **public** ✅
- Policy definition: `true` ✅

#### AUTH-CONFIRM Bucket:
- Policy name: `auth-confirm-insert` (veya benzer)
- Allowed operation: **INSERT** ✅
- Target roles: **public** ✅
- Policy definition: `true` ✅

**Eğer INSERT policy'leri yoksa:**
1. "New policy" → "Create policy from scratch"
2. Yukarıdaki ayarları yap
3. "Review" → "Save policy"

### Adım 3: Dosyaları Yeniden Yükle (cURL ile)

Terminal'de şu komutları çalıştır:

```bash
cd /Users/mervesudeborak/Desktop/daily

# auth-reset.html yükle
curl -X POST \
  'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/auth-reset/auth-reset.html' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0" \
  -H "Content-Type: text/html; charset=utf-8" \
  -H "x-upsert: true" \
  --data-binary "@public/auth-reset.html"

# auth-confirm.html yükle
curl -X POST \
  'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/auth-confirm/auth-confirm.html' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0" \
  -H "Content-Type: text/html; charset=utf-8" \
  -H "x-upsert: true" \
  --data-binary "@public/auth-confirm.html"
```

### Adım 4: Test Et

1. iPhone'da Safari'yi aç
2. Hard refresh yap (sayfayı aşağı çek)
3. URL'leri test et:
   - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html
   - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html

**Beklenen Sonuç:** HTML sayfası düzgün render edilmeli (gradient background, butonlar, vs.)

## 🔍 Sorun Devam Ederse

Eğer hala raw text görünüyorsa:

1. **Browser cache'i temizle:**
   - iPhone Safari → Settings → Safari → Clear History and Website Data

2. **Supabase Storage metadata'yı kontrol et:**
   - Dashboard → Storage → Files → Dosyaya tıkla
   - "Content-Type" alanının `text/html` olduğundan emin ol

3. **Alternatif: Service Role Key kullan:**
   - Dashboard → Settings → API → Service Role Key'i kopyala
   - Script'te anon key yerine service role key kullan (GÜVENLİK RİSKİ!)

