# Supabase Email Bounce Rate Sorunu - Çözüm Rehberi

## Sorun
Supabase'den yüksek bounce rate (geri dönen email'ler) uyarısı geldi. Bu durum email gönderme yetkilerinin kısıtlanmasına neden olabilir.

## Acil Çözüm: Custom SMTP Provider Kurulumu

### 1. SendGrid Kurulumu (Önerilen)

#### Adımlar:
1. **SendGrid Hesabı Oluştur**
   - https://sendgrid.com adresinden ücretsiz hesap oluştur
   - Ücretsiz plan: 100 email/gün

2. **API Key Oluştur**
   - SendGrid Dashboard → Settings → API Keys
   - "Create API Key" butonuna tıkla
   - İsim: "Supabase Daily App"
   - Permissions: "Full Access" veya sadece "Mail Send"
   - API Key'i kopyala (bir daha gösterilmeyecek!)

3. **Supabase'de SMTP Ayarları**
   - Supabase Dashboard → Project Settings → Auth → SMTP Settings
   - Enable Custom SMTP: **ON**
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey` (kelimesi kelimesine)
   - SMTP Password: SendGrid API Key'inizi yapıştırın
   - Sender Email: Doğrulanmış email adresiniz (SendGrid'de verify etmeniz gerekiyor)
   - Sender Name: "Daily App" veya istediğiniz isim

4. **Email Doğrulama (SendGrid)**
   - SendGrid Dashboard → Settings → Sender Authentication
   - "Single Sender Verification" → "Create New Sender"
   - Email adresinizi girin ve doğrulayın

### 2. Mailgun Kurulumu (Alternatif)

#### Adımlar:
1. **Mailgun Hesabı Oluştur**
   - https://mailgun.com adresinden hesap oluştur
   - Ücretsiz plan: 5,000 email/ay (ilk 3 ay), sonra 1,000 email/ay

2. **Domain Doğrulama**
   - Mailgun Dashboard → Sending → Domains
   - Domain ekle ve DNS kayıtlarını yapılandır

3. **Supabase'de SMTP Ayarları**
   - SMTP Host: `smtp.mailgun.org`
   - SMTP Port: `587`
   - SMTP User: `postmaster@your-domain.mailgun.org`
   - SMTP Password: Mailgun SMTP password'unuz

### 3. AWS SES Kurulumu (Production için)

#### Adımlar:
1. **AWS SES Hesabı**
   - AWS Console → SES
   - Email adresinizi verify edin
   - Sandbox modundan çıkmak için limit increase request yapın

2. **SMTP Credentials**
   - SES → SMTP Settings → Create SMTP Credentials
   - Username ve password'ü kopyala

3. **Supabase'de SMTP Ayarları**
   - SMTP Host: `email-smtp.{region}.amazonaws.com` (örn: `email-smtp.us-east-1.amazonaws.com`)
   - SMTP Port: `587`
   - SMTP User: AWS SMTP username
   - SMTP Password: AWS SMTP password

## Geçici Çözümler (Hemen Uygulanabilir)

### 1. Email Validasyonunu Güçlendir
- Uygulamada email format kontrolü yap
- Geçersiz email'leri reddet
- Disposable email servislerini engelle (10minutemail, tempmail, vb.)

### 2. Test Email'lerini Azalt
- Development'ta gerçek email gönderme
- Test email'leri için geçerli adresler kullan
- Spam complaint'leri azalt

### 3. Rate Limiting Ekleyin
- Aynı email'e çok sık OTP göndermeyi engelleyin
- Minimum 60 saniye bekleme süresi (zaten var)

## Önerilen: SendGrid (En Kolay)

**Neden SendGrid?**
- ✅ Kolay kurulum
- ✅ Ücretsiz plan yeterli (100 email/gün)
- ✅ Güvenilir deliverability
- ✅ Detaylı analytics
- ✅ Supabase ile kolay entegrasyon

**Maliyet:**
- Ücretsiz: 100 email/gün
- Essentials ($19.95/ay): 50,000 email/ay
- Pro ($89.95/ay): 100,000 email/ay

## Test Etme

1. SMTP ayarlarını yapılandırdıktan sonra
2. Supabase Dashboard → Authentication → Email Templates
3. "Test Email" butonuna tıklayın
4. Email'inizin geldiğini kontrol edin
5. Uygulamada OTP göndermeyi test edin

## Önemli Notlar

- ⚠️ Custom SMTP kullanmadan önce mevcut email template'lerinizi yedekleyin
- ⚠️ SMTP ayarlarını değiştirdikten sonra email göndermeyi test edin
- ⚠️ Bounce rate'i düşürmek için geçerli email adresleri kullanın
- ⚠️ Production'da mutlaka custom SMTP kullanın

## Sonraki Adımlar

1. ✅ SendGrid hesabı oluştur (5 dakika)
2. ✅ SMTP ayarlarını Supabase'de yapılandır (2 dakika)
3. ✅ Email doğrulama yap (1 dakika)
4. ✅ Test email gönder (1 dakika)
5. ✅ Uygulamada OTP test et (2 dakika)

**Toplam süre: ~10 dakika**

