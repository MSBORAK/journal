# Supabase Magic Link Email Template Düzeltmesi

## Sorun
Normal giriş ekranından (`signInWithOtp`) kod gelmiyor. Email'de sadece link görünüyor, OTP kodu görünmüyor.

## Çözüm
Supabase Dashboard'da "Magic Link" email template'ini güncelleyin:

### Adımlar:
1. Supabase Dashboard → **Authentication** → **Email Templates**
2. **"Magic Link"** template'ini seçin (bu `signInWithOtp` için kullanılan template)
3. Template'in **Body** kısmını şu şekilde güncelleyin:

```html
<h2>Giriş Kodu</h2>

<p>Daily uygulamasına giriş yapmak için aşağıdaki kodu kullanın:</p>

<h1 style="font-size: 36px; letter-spacing: 10px; text-align: center; margin: 30px 0; color: #000;">
  {{ .Token }}
</h1>

<p>Bu kod 60 saniye geçerlidir.</p>
<p>Bu kodu Daily uygulamasına girin.</p>

<p>Veya aşağıdaki linke tıklayarak giriş yapabilirsiniz:</p>
<a href="{{ .ConfirmationURL }}">Giriş Yap</a>

<p style="color: #666; font-size: 12px; margin-top: 20px;">
  You're receiving this email because you signed up for an application powered by Supabase ⚡
</p>
```

### Önemli Notlar:
- `{{ .Token }}` OTP kodunu gösterir (6 haneli sayı)
- `{{ .ConfirmationURL }}` magic link'i gösterir (isteğe bağlı)
- Template'de hem OTP kodu hem de magic link olmalı (kullanıcı tercih edebilsin)
- OTP kodu büyük ve belirgin olmalı

### Alternatif (Sadece OTP - Daha Temiz):
Eğer sadece OTP kodu istiyorsanız:

```html
<h2>Giriş Kodu</h2>

<p>Daily uygulamasına giriş yapmak için aşağıdaki kodu kullanın:</p>

<h1 style="font-size: 40px; letter-spacing: 12px; text-align: center; margin: 40px 0; color: #000; font-weight: bold;">
  {{ .Token }}
</h1>

<p style="text-align: center; font-size: 14px; color: #666;">
  Bu kod 60 saniye geçerlidir.
</p>

<p style="text-align: center; font-size: 14px; color: #666;">
  Bu kodu Daily uygulamasına girin.
</p>

<p style="color: #999; font-size: 11px; margin-top: 30px; text-align: center;">
  You're receiving this email because you signed up for an application powered by Supabase ⚡
</p>
```

## Test
1. Template'i kaydedin
2. Uygulamada normal giriş ekranından OTP isteyin
3. Email'inize gelen mesajda OTP kodunu kontrol edin
4. Kod görünmeli ve uygulamaya girilebilmeli

## Not
Eğer template'de `{{ .Token }}` kullanılmıyorsa, Supabase otomatik olarak sadece magic link gönderir. Template'i güncelledikten sonra OTP kodu email'de görünecektir.

