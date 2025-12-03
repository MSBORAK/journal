# Supabase Storage HTML Dosya Content-Type Sorunu - Detaylı Açıklama

## 📋 Sorun Özeti

React Native Expo uygulamasında Supabase Authentication için email confirmation ve password reset HTML sayfalarını Supabase Storage'a yüklüyoruz. Ancak dosyalar iPhone Safari'de **raw HTML text** olarak görünüyor, render edilmiyor. Sorun: Supabase Storage dosyaları `text/plain` olarak serve ediyor, `text/html` olarak değil.

## 🔍 Teknik Detaylar

### Proje Bilgileri
- **Platform**: React Native Expo
- **Supabase URL**: `https://jblqkhgwitktbfeppume.supabase.co`
- **Bucket'lar**: 
  - `auth-reset` (password reset HTML sayfası için)
  - `auth-confirm` (email confirmation HTML sayfası için)

### Dosyalar
- `public/auth-reset.html` - Password reset sayfası
- `public/auth-confirm.html` - Email confirmation sayfası

### URL'ler
- Password Reset: `https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`
- Email Confirm: `https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`

## ❌ Sorun

### Belirtiler
1. **Desktop Browser (Chrome/Safari)**: HTML sayfaları bazen düzgün render ediliyor, bazen raw text olarak görünüyor
2. **iPhone Safari**: HTML sayfaları **her zaman raw text** olarak görünüyor (HTML kodları görünüyor, sayfa render edilmiyor)
3. **Content-Type Header**: Supabase Dashboard'da dosya detaylarında `text/html` görünüyor ama browser'da `text/plain` olarak serve ediliyor

### Test Sonuçları
- Web search sonuçlarına göre URL'ler doğru HTML içeriğini döndürüyor
- Ancak iPhone Safari'de sayfa render edilmiyor, raw HTML text görünüyor

## 🔧 Denenen Çözümler

### 1. Supabase Storage Policy'leri Oluşturma
**Durum**: ✅ Tamamlandı

**Yapılanlar**:
- `STORAGE.OBJECTS` altında her iki bucket için:
  - SELECT policy (public read access) ✅
  - INSERT policy (public upload access) ✅
- Policy definition'ları: `true` veya `bucket_id = 'bucket-name'`
- Target roles: `public, anonymous sign-ins`

**Sonuç**: Policy'ler oluşturuldu ama RLS hatası devam ediyor.

### 2. JavaScript SDK ile Upload (Content-Type Header ile)
**Kod**:
```javascript
const { data, error } = await supabase.storage
  .from(bucketName)
  .upload(fileName, file, {
    contentType: 'text/html; charset=utf-8',
    upsert: true,
    cacheControl: '3600',
  });
```

**Hata**: `new row violates row-level security policy`

**Sonuç**: ❌ Başarısız - RLS policy hatası

### 3. cURL ile REST API Upload
**Komut**:
```bash
curl -X POST \
  'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/auth-reset/auth-reset.html' \
  -H "Authorization: Bearer {anon_key}" \
  -H "Content-Type: text/html; charset=utf-8" \
  -H "x-upsert: true" \
  --data-binary "@public/auth-reset.html"
```

**Hata**: `{"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}`

**Sonuç**: ❌ Başarısız - RLS policy hatası

### 4. Supabase Dashboard Manuel Upload
**Yapılanlar**:
- Dashboard → Storage → Files
- Bucket'a gir → "Upload file"
- HTML dosyasını seç → Upload

**Sorun**: 
- Upload başarılı
- Ancak Content-Type metadata'sını güncelleme seçeneği bulunamadı
- Dosya hala `text/plain` olarak serve ediliyor

**Sonuç**: ⚠️ Kısmen başarılı (dosya yüklendi ama Content-Type yanlış)

### 5. Policy Definition Kontrolü
**Kontrol Edilenler**:
- USING expression: `true` veya `bucket_id = 'bucket-name'`
- WITH CHECK expression: `true` veya `bucket_id = 'bucket-name'`
- Target roles: `public`

**Sonuç**: ✅ Policy'ler doğru görünüyor ama hala çalışmıyor

## 🐛 Hata Mesajları

### RLS Policy Hatası
```
Error: new row violates row-level security policy
```

**Detaylar**:
- INSERT policy'leri var ve doğru yapılandırılmış görünüyor
- Ancak anon key ile upload yaparken hata veriyor
- Dashboard'dan manuel upload çalışıyor (admin erişimi)

### Content-Type Sorunu
- Supabase Dashboard'da dosya detaylarında `text/html` görünüyor
- Browser'da `Content-Type: text/plain` olarak serve ediliyor
- iPhone Safari özellikle bu sorundan etkileniyor

## 📊 Mevcut Durum

### Policy'ler
✅ **STORAGE.OBJECTS** altında:
- `auth-reset-public-read` - SELECT - public, anonymous sign-ins
- `auth-reset-insert` - INSERT - public, anonymous sign-ins
- `auth-confirm-public-read` - SELECT - public, anonymous sign-ins
- `auth-confirm-insert` - INSERT - public, anonymous sign-ins

### Dosyalar
✅ HTML dosyaları Supabase Storage'da mevcut
❌ Ancak Content-Type yanlış (`text/plain` yerine `text/html` olmalı)

### Test Sonuçları
- ✅ Desktop browser: Bazen çalışıyor, bazen çalışmıyor
- ❌ iPhone Safari: Her zaman raw text görünüyor

## 🎯 İstenen Sonuç

1. HTML dosyaları Supabase Storage'a `text/html` Content-Type ile yüklenmeli
2. Browser'lar (özellikle iPhone Safari) dosyaları HTML olarak render etmeli
3. Email confirmation ve password reset flow'ları çalışmalı

## 💡 Denenmemiş Çözümler

1. **Service Role Key Kullanımı**: 
   - Anon key yerine service role key ile upload (güvenlik riski var)
   - RLS policy'lerini bypass eder

2. **Supabase Storage Metadata API**:
   - Dosya yüklendikten sonra metadata'yı güncelleme
   - Ancak Supabase Storage metadata güncelleme API'si var mı bilinmiyor

3. **Farklı Upload Yöntemi**:
   - Multipart/form-data ile upload
   - Base64 encode ile upload

4. **Alternatif Hosting**:
   - Netlify/Vercel gibi static hosting kullanma
   - Supabase Storage yerine başka bir CDN kullanma

## 🔍 Soru

**Supabase Storage'a HTML dosyalarını `text/html` Content-Type ile nasıl yükleyebiliriz?**

- RLS policy'ler doğru görünüyor ama upload çalışmıyor
- Dashboard'dan manuel upload çalışıyor ama Content-Type yanlış
- JavaScript SDK, cURL, ve REST API hepsi RLS hatası veriyor
- iPhone Safari özellikle bu sorundan etkileniyor

**Çözüm önerileri:**
1. RLS policy'lerini nasıl düzeltiriz?
2. Content-Type metadata'sını nasıl güncelleriz?
3. Alternatif bir yöntem var mı?

## 📝 Ek Bilgiler

### Supabase Storage API Dokümantasyonu
- Storage API: `https://supabase.com/docs/reference/javascript/storage-from-upload`
- RLS Policies: `https://supabase.com/docs/guides/storage/security/access-control`

### Kullanılan Teknolojiler
- React Native Expo
- Supabase JavaScript SDK (`@supabase/supabase-js`)
- Supabase Storage
- Deep linking (`rhythm://`)

### İlgili Dosyalar
- `src/services/authService.ts` - Auth servisleri
- `src/screens/PasswordResetScreen.tsx` - Password reset ekranı
- `public/auth-reset.html` - Password reset HTML sayfası
- `public/auth-confirm.html` - Email confirmation HTML sayfası

