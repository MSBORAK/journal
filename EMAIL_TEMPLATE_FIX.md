# Email Template Düzeltme - OTP Kodu Görünmüyor

## 🔴 Sorun
Email'de sadece link görünüyor, OTP kodu görünmüyor.

## ✅ Çözüm

### Adım 1: Supabase Dashboard'a Git
1. `Authentication` → `Email Templates` → `Magic Link`
2. Template'i aç

### Adım 2: Template'i Düzelt

**Subject (Konu)**:
```
Daily - Giriş Kodu
```

**Body (İçerik)** - Aşağıdakini kopyala-yapıştır:

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

### Adım 3: Kaydet ve Test Et
1. "Save" butonuna tıkla
2. Uygulamada yeni kod gönder
3. Email'i kontrol et - **kod görünmeli!**

---

## ⚠️ ÖNEMLİ: Ne Değişti?

### ❌ YANLIŞ (Önceki):
```html
<a href="{{ .ConfirmationURL }}">Giriş yapmak için tıklayın</a>
```
Bu sadece link gösterir, kod göstermez!

### ✅ DOĞRU (Yeni):
```html
<h1>{{ .Token }}</h1>
```
Bu OTP kodunu gösterir!

---

## 📧 Template Değişkenleri

Supabase'in OTP email template'inde kullanabileceğin değişkenler:

- **`{{ .Token }}`** → OTP kodu (6 haneli) - **KULLAN!**
- **`{{ .ConfirmationURL }}`** → Magic link URL'i - **KULLANMA!** (OTP flow'unda gerekli değil)
- **`{{ .Email }}`** → Kullanıcının email adresi
- **`{{ .SiteURL }}`** → Site URL'i

---

## 🎯 Minimal Versiyon (Sadece Kod)

Eğer sadece kodu göstermek istiyorsan:

```html
<p>Giriş kodunuz:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; text-align: center;">
  {{ .Token }}
</h1>
<p>Bu kod 60 saniye geçerlidir.</p>
```

---

## ✅ Kontrol Listesi

- [ ] Template'de `{{ .Token }}` var mı?
- [ ] `{{ .ConfirmationURL }}` kaldırıldı mı? (veya kullanılmıyor mu?)
- [ ] Template kaydedildi mi?
- [ ] Yeni kod gönderildi mi?
- [ ] Email'de kod görünüyor mu?

---

## 🚀 Test Et

1. Uygulamayı aç
2. Email gir
3. "Kod Gönder" butonuna tıkla
4. Email'i kontrol et
5. **6 haneli kod görünmeli!** (örn: `123456`)
6. Kodu uygulamaya gir
7. Giriş yapılmalı!

---

**Sorun devam ederse**: Supabase Dashboard → Authentication → Email Templates → Magic Link → Preview butonuna tıkla ve template'in doğru göründüğünden emin ol.

