# Supabase OTP Sorun Giderme Kontrol Listesi

## 🔍 Sorun: "Kod Gönder" butonuna basınca ekran donuyor ve kod gelmiyor

### 1. Email Template Ayarları ✅

**Kontrol Et:**
- Supabase Dashboard → Authentication → Email Templates
- **Magic Link** template'inde `{{ .Token }}` kullanılıyor mu?
- Template şu şekilde olmalı:

```
Email adresinize gönderilen doğrulama kodunuz:

{{ .Token }}

Bu kodu uygulamaya girin.
```

**Yanlış:**
```
{{ .ConfirmationURL }}  ❌ (Bu magic link gönderir, kod göndermez)
```

**Doğru:**
```
{{ .Token }}  ✅ (Bu 6 haneli OTP kodu gönderir)
```

---

### 2. Email Confirmation Ayarları ⚠️

**Kontrol Et:**
- Supabase Dashboard → Authentication → Settings
- **"Enable email confirmations"** ayarı:
  - ✅ **KAPALI** olmalı (OTP flow için)
  - ❌ Açıksa, email confirmation beklenir ve OTP gönderilmez

**Ayarlar:**
```
Enable email confirmations: OFF
Enable email change confirmations: ON (opsiyonel)
```

---

### 3. Rate Limiting (Hız Sınırlaması) 🚦

**Kontrol Et:**
- Supabase Dashboard → Authentication → Settings
- **Rate Limits** bölümünde:
  - Email rate limit aşılmış olabilir
  - Aynı email'e çok fazla OTP gönderilmiş olabilir

**Çözüm:**
- 1 saat bekleyip tekrar dene
- Farklı bir email ile test et

---

### 4. Email Provider Ayarları 📧

**Kontrol Et:**
- Supabase Dashboard → Settings → Auth
- **SMTP Settings** bölümünde:
  - Email provider doğru yapılandırılmış mı?
  - Test email gönderimi çalışıyor mu?

**Test Et:**
- Supabase Dashboard → Authentication → Users
- Bir kullanıcıya manuel olarak "Send magic link" gönder
- Email geliyor mu kontrol et

---

### 5. Anonymous Sign-ins Ayarları 👤

**Kontrol Et:**
- Supabase Dashboard → Authentication → Providers
- **Anonymous** provider'ı:
  - ✅ **AÇIK** olmalı
  - ❌ Kapalıysa anonymous kullanıcılar OTP alamaz

---

### 6. Email Template Değişkenleri 📝

**Magic Link Template'inde kontrol et:**
- `{{ .Token }}` - OTP kodu (6 haneli)
- `{{ .Email }}` - Kullanıcı email'i
- `{{ .ConfirmationURL }}` - Magic link URL'i (OTP için kullanma!)

**OTP Template Örneği:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Doğrulama Kodu</title>
</head>
<body>
    <h2>Doğrulama Kodunuz</h2>
    <p>Email adresinize gönderilen doğrulama kodunuz:</p>
    <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center;">
        {{ .Token }}
    </h1>
    <p>Bu kodu uygulamaya girin.</p>
</body>
</html>
```

---

### 7. Console Logları Kontrolü 🔍

**Kodda şu loglar görünmeli:**
```
🔗 Link Account: OTP gönderiliyor... email@example.com
📧 AuthService: Supabase signInWithOtp çağrılıyor... email@example.com
📧 AuthService: Supabase response - data: {...} error: null
✅ AuthService: OTP başarıyla gönderildi
✅ Link Account: OTP başarıyla gönderildi
```

**Eğer hata varsa:**
```
❌ AuthService: Supabase hatası: {...}
❌ Link Account: OTP gönderme hatası: {...}
```

---

### 8. Network/API Hatası Kontrolü 🌐

**Kontrol Et:**
- Supabase Dashboard → Logs → API Logs
- Son OTP gönderme isteklerini kontrol et
- Hata mesajları var mı?

**Yaygın Hatalar:**
- `Rate limit exceeded` - Çok fazla istek
- `Email provider error` - SMTP hatası
- `Invalid email` - Email formatı hatası
- `User already registered` - Email zaten kayıtlı

---

### 9. Test Adımları ✅

1. **Farklı bir email ile test et:**
   - Yeni bir email adresi kullan
   - Rate limiting'i bypass etmek için

2. **Supabase Dashboard'dan manuel test:**
   - Authentication → Users → Create User
   - Email ile kullanıcı oluştur
   - "Send magic link" butonuna bas
   - Email geliyor mu kontrol et

3. **Email spam klasörünü kontrol et:**
   - OTP email'i spam'e düşmüş olabilir

4. **Email provider loglarını kontrol et:**
   - Supabase Dashboard → Settings → Auth → SMTP Settings
   - Email gönderim loglarını kontrol et

---

### 10. Hızlı Çözümler 🚀

**Çözüm 1: Email Template'i Güncelle**
```
Supabase Dashboard → Authentication → Email Templates → Magic Link
{{ .Token }} kullanıldığından emin ol
```

**Çözüm 2: Email Confirmation'ı Kapat**
```
Supabase Dashboard → Authentication → Settings
Enable email confirmations: OFF
```

**Çözüm 3: Rate Limit'i Bekle**
```
1 saat bekle ve tekrar dene
```

**Çözüm 4: Farklı Email ile Test Et**
```
Yeni bir email adresi kullan
```

---

## 📞 Destek

Eğer yukarıdaki adımlar sorunu çözmediyse:
1. Supabase Dashboard → Support → Open a ticket
2. Console loglarını ve hata mesajlarını paylaş
3. Email template ayarlarını screenshot ile gönder

