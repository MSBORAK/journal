# Supabase Storage HTML Dosyaları Kurulum Rehberi

## Adım 1: Bucket'ları Oluştur

### `auth-reset` Bucket'ı:
1. Supabase Dashboard → **Storage**
2. **"+ New bucket"** butonuna tıkla
3. **Bucket name:** `auth-reset`
4. **Public bucket:** ✅ ON (Açık olmalı!)
5. **Create** butonuna tıkla

### `auth-confirm` Bucket'ı:
1. **"+ New bucket"** butonuna tıkla
2. **Bucket name:** `auth-confirm`
3. **Public bucket:** ✅ ON (Açık olmalı!)
4. **Create** butonuna tıkla

---

## Adım 2: Storage Policies Ayarla

Her iki bucket için de public read policy oluştur:

### Supabase Dashboard'dan:
1. Storage → `auth-reset` bucket'ına gir
2. **"Policies"** tab'ına tıkla
3. **"New Policy"** → **"Create policy from scratch"**
4. Policy ayarları:
   - **Policy name:** `Public read access`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `public`
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`
5. **Review** → **Save policy**

Aynısını `auth-confirm` bucket'ı için de yap.

---

## Adım 3: HTML Dosyalarını Yükle (Supabase CLI ile)

### Önce Supabase CLI'ye login ol:
```bash
supabase login
```

### Projeyi link et:
```bash
cd /Users/mervesudeborak/Desktop/daily
supabase link --project-ref jblqkhgwitktbfeppume
```

### Dosyaları yükle (doğru Content-Type ile):
```bash
# auth-reset.html
supabase storage cp public/auth-reset.html ss:///auth-reset/auth-reset.html \
  --content-type "text/html" \
  --experimental

# auth-confirm.html
supabase storage cp public/auth-confirm.html ss:///auth-confirm/auth-confirm.html \
  --content-type "text/html" \
  --experimental
```

---

## Adım 4: Content-Type'ı Doğrula

### Tarayıcıda test et:
1. Hard refresh yap (Cmd+Shift+R)
2. Şu URL'leri aç:
   - `https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`
   - `https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`

### cURL ile Content-Type kontrolü:
```bash
curl -I https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html
```

Response'da şunu görmelisin:
```
Content-Type: text/html; charset=utf-8
```

---

## Alternatif: Supabase Dashboard'dan Manuel Yükleme

Eğer CLI çalışmazsa:

1. Storage → `auth-reset` bucket'ına gir
2. **"Upload files"** → `public/auth-reset.html` seç
3. Upload
4. Yüklenen dosyaya tıkla
5. **"..."** → **"Update metadata"**
6. **Content-Type:** `text/html` yaz
7. **Save**

Aynısını `auth-confirm` için de yap.

---

## Sorun Giderme

### "Bucket not found" hatası:
- Bucket'ın adını kontrol et (tire kullan, boşluk yok)
- Public bucket açık mı kontrol et

### HTML hala raw text görünüyor:
- Hard refresh yap (Cmd+Shift+R)
- Incognito modda test et
- Content-Type'ı cURL ile kontrol et

### RLS Policy hatası:
- Storage → Policies → Public read policy oluştur

