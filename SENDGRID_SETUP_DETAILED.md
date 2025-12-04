# SendGrid Kurulum Rehberi - Detaylı Adımlar

## 🎯 Amaç
Supabase'in email gönderme limitlerini aşmak ve daha güvenilir email gönderimi sağlamak için SendGrid kullanacağız.

## 📋 Adım 1: SendGrid Hesabı Oluşturma

### 1.1. SendGrid'e Git
- Tarayıcıda https://sendgrid.com adresine git
- Sağ üstte "Start for Free" butonuna tıkla

### 1.2. Hesap Oluştur
- **Email**: Kendi email adresini gir (örn: msesoftware1425@gmail.com)
- **Password**: Güçlü bir şifre oluştur
- **Company Name**: "MSESOFT" veya "Daily App"
- **First Name**: İsmini gir
- **Last Name**: Soyadını gir
- **Phone**: Telefon numarasını gir (doğrulama için gerekli)
- **Country**: Türkiye seç
- **Use Case**: "Transactional Email" seç
- **Agree to Terms**: İşaretle
- **"Create Account"** butonuna tıkla

### 1.3. Email Doğrulama
- Email'ine gelen doğrulama linkine tıkla
- SendGrid hesabın aktif olacak

### 1.4. Phone Verification (Opsiyonel ama önerilir)
- Telefon numaranı doğrula (SMS ile kod gelecek)
- Bu spam koruması için önemli

## 📋 Adım 2: API Key Oluşturma

### 2.1. API Keys Sayfasına Git
- SendGrid Dashboard'da sol menüden:
  - **Settings** (Ayarlar) → **API Keys**

### 2.2. Yeni API Key Oluştur
- **"Create API Key"** butonuna tıkla
- **API Key Name**: `Supabase Daily App` (veya istediğin isim)
- **API Key Permissions**: 
  - ✅ **"Full Access"** seç (en kolay yol)
  - VEYA sadece "Mail Send" seç (daha güvenli)
- **"Create & View"** butonuna tıkla

### 2.3. API Key'i Kopyala
- ⚠️ **ÖNEMLİ**: API Key bir daha gösterilmeyecek!
- **"Copy"** butonuna tıkla ve güvenli bir yere kaydet
- Örnek format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 📋 Adım 3: Email Adresini Doğrulama (Sender Verification)

### 3.1. Single Sender Verification
- SendGrid Dashboard'da sol menüden:
  - **Settings** → **Sender Authentication**
- **"Single Sender Verification"** sekmesine git
- **"Create New Sender"** butonuna tıkla

### 3.2. Sender Bilgilerini Gir
- **From Email Address**: `msesoftware1425@gmail.com` (veya kullanmak istediğin email)
- **From Name**: `Daily App` (veya istediğin isim)
- **Reply To**: Aynı email adresi
- **Company Address**: Şirket adresin (veya kişisel adres)
- **City**: Şehir
- **State**: İl (Türkiye için boş bırakabilirsin)
- **Country**: Türkiye
- **Zip Code**: Posta kodu
- **"Create"** butonuna tıkla

### 3.3. Email Doğrulama
- Email'ine gelen doğrulama linkine tıkla
- **"Verify Single Sender"** butonuna tıkla
- ✅ Status "Verified" olana kadar bekle (birkaç dakika sürebilir)

## 📋 Adım 4: Supabase'de SMTP Ayarları

### 4.1. Supabase Dashboard'a Git
- https://supabase.com/dashboard adresine git
- Projeni seç: `daily-app` (veya proje adın)

### 4.2. Auth Settings'e Git
- Sol menüden: **Authentication** → **Providers**
- VEYA: **Project Settings** (sol altta dişli ikonu) → **Auth** → **SMTP Settings**

### 4.3. Custom SMTP'yi Aktif Et
- **"Enable Custom SMTP"** toggle'ını **ON** yap

### 4.4. SMTP Bilgilerini Gir
- **SMTP Host**: `smtp.sendgrid.net`
- **SMTP Port**: `587` (veya `465` SSL için)
- **SMTP User**: `apikey` (kelimesi kelimesine, küçük harf)
- **SMTP Password**: SendGrid'den kopyaladığın API Key'i yapıştır
- **Sender Email**: SendGrid'de doğruladığın email adresi (örn: msesoftware1425@gmail.com)
- **Sender Name**: `Daily App` (veya istediğin isim)

### 4.5. Kaydet
- **"Save"** butonuna tıkla
- ✅ Başarılı mesajı görmelisin

## 📋 Adım 5: Test Etme

### 5.1. Supabase'de Test Email Gönder
- Supabase Dashboard → **Authentication** → **Email Templates**
- Herhangi bir template'i seç (örn: "Magic Link")
- **"Send Test Email"** butonuna tıkla
- Email adresini gir ve gönder
- Email'inin gelip gelmediğini kontrol et

### 5.2. Uygulamada Test Et
- Uygulamayı aç
- Normal giriş ekranından OTP iste
- Email'ine OTP kodunun gelip gelmediğini kontrol et

### 5.3. Hesap Bağlama Test Et
- Ayarlar → Hesabını Bağla
- Email gir ve kod gönder
- Email'ine OTP kodunun gelip gelmediğini kontrol et

## ✅ Başarı Kontrol Listesi

- [ ] SendGrid hesabı oluşturuldu
- [ ] API Key oluşturuldu ve kopyalandı
- [ ] Email adresi doğrulandı (Verified status)
- [ ] Supabase'de Custom SMTP aktif edildi
- [ ] SMTP bilgileri doğru girildi
- [ ] Test email gönderildi ve geldi
- [ ] Uygulamada OTP test edildi ve çalışıyor

## 🚨 Sorun Giderme

### Email gelmiyor
1. SendGrid Dashboard → **Activity** → Email'lerin gönderilip gönderilmediğini kontrol et
2. **Bounce** veya **Blocked** durumunda mı kontrol et
3. Spam klasörünü kontrol et
4. SMTP ayarlarının doğru olduğundan emin ol

### API Key çalışmıyor
1. API Key'in tamamını kopyaladığından emin ol (SG. ile başlamalı)
2. SMTP User'ın `apikey` (küçük harf) olduğundan emin ol
3. Yeni bir API Key oluştur ve tekrar dene

### Email doğrulanmadı
1. Email'in spam klasörüne düşmüş olabilir
2. SendGrid'den yeni doğrulama email'i iste
3. Email adresinin doğru olduğundan emin ol

## 💰 Maliyet

- **Ücretsiz Plan**: 100 email/gün (yeterli başlangıç için)
- **Essentials Plan**: $19.95/ay → 50,000 email/ay
- **Pro Plan**: $89.95/ay → 100,000 email/ay

**Öneri**: Başlangıçta ücretsiz plan yeterli. Kullanıcı sayısı arttıkça plan yükseltebilirsin.

## 📊 SendGrid Dashboard'da İzleme

- **Activity**: Gönderilen email'leri görüntüle
- **Stats**: Email istatistiklerini görüntüle
- **Bounces**: Geri dönen email'leri kontrol et
- **Spam Reports**: Spam şikayetlerini kontrol et

## 🎉 Sonuç

SendGrid kurulumu tamamlandıktan sonra:
- ✅ Email gönderme daha güvenilir olacak
- ✅ Bounce rate düşecek
- ✅ OTP kodları düzgün gönderilecek
- ✅ App Store'a hazır olacaksın

## 📞 Destek

Sorun olursa:
- SendGrid Support: https://support.sendgrid.com
- Supabase Support: https://supabase.com/support

