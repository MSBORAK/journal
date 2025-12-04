# Yapılacaklar: Magic Link Template Güncelleme

## ✅ SendGrid Kurulumu Tamamlandı
- [x] SendGrid hesabı oluşturuldu
- [x] Email doğrulandı (msesoftware1425@gmail.com)
- [x] API Key oluşturuldu
- [x] Supabase SMTP ayarları yapılandırıldı

## ⚠️ Yapılması Gereken: Magic Link Template Güncelleme

### Adımlar:
1. Supabase Dashboard → Authentication → Email Templates
2. "Magic Link" template'ini seç
3. Body kısmını şu şekilde güncelle:

```html
<h2>Giriş Kodu</h2>

<p>Rhythm uygulamasına giriş yapmak için aşağıdaki kodu kullanın:</p>

<h1 style="font-size: 40px; letter-spacing: 12px; text-align: center; margin: 40px 0; color: #000; font-weight: bold;">
  {{ .Token }}
</h1>

<p style="text-align: center; font-size: 14px; color: #666;">
  Bu kod 60 saniye geçerlidir.
</p>

<p style="text-align: center; font-size: 14px; color: #666;">
  Bu kodu Rhythm uygulamasına girin.
</p>

<p>Veya aşağıdaki linke tıklayarak giriş yapabilirsiniz:</p>
<a href="{{ .ConfirmationURL }}">Giriş Yap</a>

<p style="color: #999; font-size: 11px; margin-top: 30px; text-align: center;">
  You're receiving this email because you signed up for an application powered by Supabase ⚡
</p>
```

4. "Save" butonuna tıkla

### Önemli:
- `{{ .Token }}` mutlaka olmalı (OTP kodu için)
- Template bir kez güncellenir, sonra kalıcı olarak çalışır
- Normal giriş ve hesap bağlama için kullanılır

### Test:
- Template güncellendikten sonra uygulamada OTP test et
- Email'de OTP kodunun göründüğünü kontrol et

