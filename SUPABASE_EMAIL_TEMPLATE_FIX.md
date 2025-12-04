# Supabase Email Template Düzeltmesi

## Sorun
Hesap bağlama işleminde `updateUser` kullanıldığında Supabase "Change Email Address" template'ini kullanıyor ve bu template sadece magic link gönderiyor, OTP kodu göndermiyor.

## Çözüm
Supabase Dashboard'da "Change Email Address" template'ini güncelleyin:

### Adımlar:
1. Supabase Dashboard → **Authentication** → **Email Templates**
2. **"Change Email Address"** template'ini seçin
3. Template'in **Body** kısmını şu şekilde güncelleyin:

```html
<h2>Confirm Change of Email</h2>

<p>Your verification code is:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; margin: 20px 0;">
  {{ .Token }}
</h1>

<p>Enter this code in the app to confirm your email change from {{ .Email }} to {{ .NewEmail }}.</p>

<p>Or click the link below:</p>
<a href="daily://auth/callback#access_token={{ .Token }}&refresh_token={{ .RefreshToken }}&type=email_change">
  Confirm Email Change
</a>

<p>This code will expire in 1 hour.</p>
```

### Önemli Notlar:
- `{{ .Token }}` OTP kodunu gösterir (6 haneli sayı)
- Template'de hem OTP kodu hem de magic link olmalı (kullanıcı tercih edebilsin)
- OTP kodu büyük ve belirgin olmalı

### Alternatif (Sadece OTP):
Eğer sadece OTP kodu istiyorsanız:

```html
<h2>Confirm Change of Email</h2>

<p>Your verification code is:</p>
<h1 style="font-size: 36px; letter-spacing: 10px; text-align: center; margin: 30px 0; color: #000;">
  {{ .Token }}
</h1>

<p>Enter this 6-digit code in the app to confirm your email change from {{ .Email }} to {{ .NewEmail }}.</p>

<p style="color: #666; font-size: 12px;">This code will expire in 1 hour.</p>
```

## Test
1. Template'i kaydedin
2. Uygulamada "Hesabını Bağla" özelliğini test edin
3. Email'inize gelen mesajda OTP kodunu kontrol edin

