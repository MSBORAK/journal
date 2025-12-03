# Supabase OTP Authentication Setup Guide

## ✅ Kod Tarafı Tamamlandı
- AuthService.ts → `signInWithOtp()` ve `verifyOtp()` fonksiyonları hazır
- AuthContext.tsx → OTP fonksiyonları entegre edildi
- AuthScreen.tsx → OTP flow UI'ı hazır
- OtpInput.tsx → 6 haneli kod input component'i hazır

## 📋 Supabase Dashboard'da Yapılacaklar

### 1. Email Provider Kontrolü

**Yol**: `Authentication` → `Providers` → `Email`

**Kontrol Listesi**:
- ✅ Email provider **aktif** olmalı
- ✅ "Enable email signups" açık olmalı
- ✅ "Confirm email" ayarı (isteğe bağlı - OTP için gerekli değil)

**Not**: OTP authentication için email confirmation zorunlu değil, ama aktif olabilir.

---

### 2. Email Templates Özelleştirme (ÖNEMLİ!)

**Yol**: `Authentication` → `Email Templates` → `Magic Link`

**Yapılacaklar**:

1. **Template'i Aktif Et**: "Magic Link" template'ini seç

2. **Subject (Konu) Özelleştir**:
```
Daily - Giriş Kodu
```

3. **Body (İçerik) Özelleştir** - ÖNEMLİ: `{{ .Token }}` kullanmalısın!

```html
<h2>Giriş Kodu</h2>
<p>Merhaba,</p>
<p>Daily uygulamasına giriş yapmak için aşağıdaki <strong>6 haneli kodu</strong> kullanın:</p>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h1 style="font-size: 36px; letter-spacing: 12px; color: #ffffff; margin: 0; font-weight: bold; font-family: monospace;">
    {{ .Token }}
  </h1>
</div>

<p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
  ⏱️ Bu kod <strong>60 saniye</strong> geçerlidir.
</p>

<p style="color: #6b7280; font-size: 14px;">
  📱 Bu kodu Daily uygulamasına girin.
</p>

<p style="color: #6b7280; font-size: 14px;">
  🔒 Güvenliğiniz için bu kodu kimseyle paylaşmayın.
</p>

<p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
  Bu işlemi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

<p style="color: #9ca3af; font-size: 12px;">
  Daily - Kişisel Günlük Uygulaması
</p>
```

**⚠️ KRİTİK NOTLAR**:
- **`{{ .Token }}` → MUTLAKA kullanmalısın!** Bu OTP kodunu gösterir (6 haneli)
- **`{{ .ConfirmationURL }}` → KULLANMA!** Bu magic link için, OTP flow'unda gerekli değil
- Email'de sadece **kod** görünmeli, link değil
- HTML formatında yazabilirsin (renkler, stiller vs.)

4. **Preview**: Template'i önizle ve test et

---

### 3. URL Configuration

**Yol**: `Authentication` → `URL Configuration`

**Kontrol Listesi**:
- ✅ **Site URL**: `https://jblqkhgwitktbfeppume.supabase.co` (mevcut)
- ✅ **Redirect URLs**: 
  - `rhythm://auth/callback` (mevcut - email confirmation için)
  - `rhythm://*` (wildcard - önerilen)

**Not**: OTP authentication için deep link gerekli değil, ama email confirmation için kullanılabilir.

---

### 4. Rate Limiting (Opsiyonel)

**Yol**: `Authentication` → `Settings` → `Rate Limits`

**Önerilen Ayarlar**:
- **Email OTP**: 5 request / hour (saat başına 5 kod gönderme)
- **OTP Verification**: 10 attempts / hour (saat başına 10 doğrulama denemesi)

**Not**: Varsayılan ayarlar genellikle yeterlidir.

---

### 5. Test Etme

**Adımlar**:

1. **Uygulamayı Aç**: Expo Go veya development build
2. **Email Gir**: Test email adresini gir
3. **Kod Gönder**: "Kod Gönder" butonuna tıkla
4. **Email Kontrol Et**: 
   - Gelen kutusunu kontrol et
   - Spam klasörünü kontrol et
   - Email'de 6 haneli kod görünmeli
5. **Kodu Gir**: Uygulamada kodu gir
6. **Giriş Yap**: Başarılı olursa MainTabs'a yönlendirilmeli

---

## 🔍 Sorun Giderme

### Email Gelmiyor

**Kontrol Listesi**:
1. ✅ Supabase Dashboard → Authentication → Providers → Email → Aktif mi?
2. ✅ Email Templates → Magic Link → Aktif mi?
3. ✅ Rate limit aşıldı mı? (5 request/hour)
4. ✅ Spam klasörünü kontrol ettin mi?
5. ✅ Email adresi geçerli mi? (test@example.com gibi)

**Çözüm**:
- Email provider'ı kontrol et
- Template'i tekrar kaydet
- Rate limit'i kontrol et (Dashboard → Authentication → Settings → Rate Limits)
- Farklı bir email adresi dene

### Kod Geçersiz Hatası

**Kontrol Listesi**:
1. ✅ Kod 6 haneli mi? (Supabase default: 6 haneli)
2. ✅ Kod süresi dolmuş mu? (default: 60 saniye)
3. ✅ Email adresi doğru mu? (büyük/küçük harf duyarlı değil)

**Çözüm**:
- Yeni kod gönder
- Email adresini kontrol et
- Kod süresini kontrol et (60 saniye)

### Rate Limit Hatası

**Çözüm**:
- 1 saat bekle
- VEYA Supabase Dashboard → Authentication → Settings → Rate Limits → Artır

---

## 📧 Email Template Örnekleri

### Minimal Versiyon (Sadece Kod)

```html
<p>Giriş kodunuz: <strong>{{ .Token }}</strong></p>
<p>Bu kod 60 saniye geçerlidir.</p>
```

### Profesyonel Versiyon (Yukarıdaki örnek)

### Türkçe Versiyon

```html
<h2>Giriş Kodu</h2>
<p>Merhaba,</p>
<p>Daily uygulamasına giriş yapmak için aşağıdaki 6 haneli kodu kullanın:</p>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h1 style="font-size: 36px; letter-spacing: 12px; color: #ffffff; margin: 0; font-weight: bold;">
    {{ .Token }}
  </h1>
</div>

<p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
  ⏱️ Bu kod <strong>60 saniye</strong> geçerlidir.
</p>

<p style="color: #6b7280; font-size: 14px;">
  🔒 Güvenliğiniz için bu kodu kimseyle paylaşmayın.
</p>

<p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
  Bu işlemi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz.
</p>
```

---

## ✅ Tamamlandı Kontrol Listesi

- [ ] Email Provider aktif
- [ ] Magic Link template özelleştirildi
- [ ] Template'de `{{ .Token }}` kullanıldı
- [ ] URL Configuration kontrol edildi
- [ ] Test email gönderildi
- [ ] Kod email'de görünüyor
- [ ] Uygulamada kod girildi
- [ ] Giriş başarılı

---

## 🎉 Hazır!

Artık OTP authentication tamamen hazır! Kullanıcılar email adreslerine gönderilen kod ile giriş yapabilirler.

**Sonraki Adımlar** (Opsiyonel):
- Email template'i daha da özelleştir
- Rate limiting ayarlarını optimize et
- Analytics ekle (kaç kod gönderildi vs.)

