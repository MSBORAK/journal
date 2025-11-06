# Supabase Anonim Kullanıcı Kurulum Rehberi

## 1. Anonim Kullanıcı Özelliğini Etkinleştirme

### Adım 1: Supabase Dashboard'a Giriş
1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. Projenizi seçin

### Adım 2: Authentication Providers Ayarları
1. Sol menüden **Authentication** → **Providers** seçeneğine gidin
2. Provider listesinde **Anonymous** provider'ını bulun
3. **Enable** butonuna tıklayarak anonim kullanıcı özelliğini etkinleştirin

### Adım 3: Authentication Settings Kontrolü
1. **Authentication** → **Settings** sayfasına gidin
2. **"Enable anonymous sign-ins"** seçeneğinin açık olduğundan emin olun
3. Gerekirse **"Enable email confirmations"** seçeneğini kapatabilirsiniz (anonim kullanıcılar için gerekli değil)

## 2. Row Level Security (RLS) Politikaları

Anonim kullanıcıların verilerini okuyup yazabilmesi için RLS politikalarını kontrol edin:

### Örnek RLS Politikaları

#### Diaries Tablosu için:
```sql
-- Anonim kullanıcılar kendi günlüklerini okuyabilir
CREATE POLICY "Anonymous users can read own diaries"
ON diaries FOR SELECT
TO anon
USING (auth.uid() = user_id);

-- Anonim kullanıcılar kendi günlüklerini yazabilir
CREATE POLICY "Anonymous users can insert own diaries"
ON diaries FOR INSERT
TO anon
WITH CHECK (auth.uid() = user_id);

-- Anonim kullanıcılar kendi günlüklerini güncelleyebilir
CREATE POLICY "Anonymous users can update own diaries"
ON diaries FOR UPDATE
TO anon
USING (auth.uid() = user_id);

-- Anonim kullanıcılar kendi günlüklerini silebilir
CREATE POLICY "Anonymous users can delete own diaries"
ON diaries FOR DELETE
TO anon
USING (auth.uid() = user_id);
```

#### Tasks Tablosu için:
```sql
-- Anonim kullanıcılar kendi görevlerini okuyabilir
CREATE POLICY "Anonymous users can read own tasks"
ON tasks FOR SELECT
TO anon
USING (auth.uid() = user_id);

-- Anonim kullanıcılar kendi görevlerini yazabilir
CREATE POLICY "Anonymous users can insert own tasks"
ON tasks FOR INSERT
TO anon
WITH CHECK (auth.uid() = user_id);

-- Anonim kullanıcılar kendi görevlerini güncelleyebilir
CREATE POLICY "Anonymous users can update own tasks"
ON tasks FOR UPDATE
TO anon
USING (auth.uid() = user_id);

-- Anonim kullanıcılar kendi görevlerini silebilir
CREATE POLICY "Anonymous users can delete own tasks"
ON tasks FOR DELETE
TO anon
USING (auth.uid() = user_id);
```

**Not:** Tüm tablolarınız için benzer politikalar oluşturmanız gerekebilir:
- `reminders`
- `settings`
- `achievements`
- `notifications`
- vb.

## 3. Database Ayarları

### RLS'yi Etkinleştirme
Her tablo için RLS'nin etkin olduğundan emin olun:

```sql
-- Örnek: Diaries tablosu için RLS'yi etkinleştir
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
```

## 4. Test Etme

1. Uygulamayı başlatın
2. Uygulama açıldığında otomatik olarak anonim bir kullanıcı oluşturulmalı
3. Supabase Dashboard → **Authentication** → **Users** sayfasından yeni anonim kullanıcıyı görebilirsiniz
4. Anonim kullanıcıların `is_anonymous` değeri `true` olacaktır

## 5. Hesap Bağlama (Link Account) Özelliği

Kullanıcı "Hesabını Bağla" butonuna tıkladığında:
- Anonim kullanıcının email'i güncellenir
- Şifre eklenir
- `is_anonymous` değeri `false` olur (veya email eklenince otomatik olarak false olur)
- Tüm veriler aynı `user_id` ile kalır (yeni kullanıcı oluşturulmaz)

## 6. Sorun Giderme

### Anonim kullanıcı oluşturulamıyor
- Supabase Dashboard'da Anonymous provider'ın etkin olduğundan emin olun
- Authentication Settings'te "Enable anonymous sign-ins" seçeneğinin açık olduğunu kontrol edin

### Veriler kaydedilmiyor
- RLS politikalarının doğru yapılandırıldığından emin olun
- `auth.uid()` fonksiyonunun doğru çalıştığını kontrol edin
- Supabase Dashboard → **Logs** sayfasından hata mesajlarını kontrol edin

### Hesap bağlama çalışmıyor
- Email'in daha önce kullanılmadığından emin olun
- Şifre uzunluğunun en az 6 karakter olduğunu kontrol edin
- Supabase Dashboard → **Logs** sayfasından hata mesajlarını kontrol edin

## 7. Güvenlik Notları

- Anonim kullanıcılar sadece kendi verilerine erişebilir (RLS politikaları sayesinde)
- Hesap bağlama işlemi sırasında email doğrulaması yapılabilir (isteğe bağlı)
- Anonim kullanıcıların verileri, hesap bağlandıktan sonra da aynı `user_id` ile kalır

