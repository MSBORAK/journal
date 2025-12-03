# OTP Authentication Implementation - TODO List

## ✅ Tamamlananlar

1. **AuthService.ts'ye OTP Fonksiyonları Eklendi**
   - ✅ `signInWithOtp()` - Email'e OTP kodu gönderme
   - ✅ `verifyOtp()` - OTP kodunu doğrulama
   - ✅ Interface'ler eklendi (`OtpRequestData`, `OtpVerifyData`)
   - ✅ Türkçe hata mesajları eklendi

## 📋 Yapılacaklar

### 1. AuthScreen.tsx Güncellemesi

**Dosya**: `src/screens/AuthScreen.tsx`

**Yapılacaklar**:
- [ ] OTP authentication modu ekle (password yerine OTP)
- [ ] Email input alanı (mevcut)
- [ ] OTP kod input alanı ekle (6 haneli kod)
- [ ] "Kod Gönder" butonu
- [ ] "Kodu Doğrula" butonu
- [ ] OTP gönderildiğinde "Kod email'inize gönderildi" mesajı
- [ ] OTP input ekranı (kod girme ekranı)
- [ ] Otomatik kod doğrulama (6 haneli kod girildiğinde)
- [ ] Geri sayım timer (kod tekrar gönderme için)

**UI Flow**:
```
1. Email gir → "Kod Gönder" butonuna tıkla
2. AuthService.signInWithOtp() çağrılır
3. "Kod email'inize gönderildi" mesajı göster
4. OTP input alanı göster (6 haneli)
5. Kullanıcı kodu girer
6. AuthService.verifyOtp() çağrılır
7. Başarılıysa → MainTabs'a yönlendir
```

### 2. Supabase Dashboard Ayarları

**Yapılacaklar**:
- [ ] Supabase Dashboard → Authentication → Providers
- [ ] Email provider'ın aktif olduğundan emin ol
- [ ] Authentication → Email Templates
- [ ] "Magic Link" template'ini özelleştir (OTP kodu göster)
- [ ] Email template'inde OTP kodu görünecek şekilde ayarla
- [ ] Test email gönder

### 3. AuthContext.tsx Güncellemesi

**Dosya**: `src/contexts/AuthContext.tsx`

**Yapılacaklar**:
- [ ] `signInWithOtp` fonksiyonunu context'e ekle
- [ ] `verifyOtp` fonksiyonunu context'e ekle
- [ ] OTP state management (kod gönderildi mi, doğrulandı mı)

### 4. UI/UX İyileştirmeleri

**Yapılacaklar**:
- [ ] OTP input component'i oluştur (6 haneli kod girişi)
- [ ] Otomatik focus (her rakam girildiğinde sonraki input'a geç)
- [ ] Geri sayım timer (60 saniye - kod tekrar gönderme)
- [ ] Loading state'leri
- [ ] Error handling ve kullanıcı dostu mesajlar
- [ ] "Kod gelmedi mi?" butonu (tekrar gönderme)

### 5. Deep Linking (Opsiyonel)

**Yapılacaklar**:
- [ ] Magic link desteği (email'deki linke tıklayınca direkt giriş)
- [ ] `emailRedirectTo` parametresini ayarla
- [ ] Deep link handler'ı güncelle

### 6. Test

**Yapılacaklar**:
- [ ] OTP gönderme testi
- [ ] OTP doğrulama testi
- [ ] Hatalı kod girme testi
- [ ] Süresi dolmuş kod testi
- [ ] Email gelmeme durumu testi
- [ ] Multi-device test (aynı email farklı cihazlarda)

## 📝 Kod Örnekleri

### AuthScreen.tsx'de Kullanım

```typescript
// OTP gönderme
const handleSendOtp = async () => {
  const result = await AuthService.signInWithOtp({
    email: email,
    shouldCreateUser: true
  });
  
  if (result.success) {
    setOtpSent(true);
    showToast('Kod email\'inize gönderildi', 'success');
    startCountdown(); // 60 saniye geri sayım
  } else {
    showToast(result.error || 'Hata oluştu', 'error');
  }
};

// OTP doğrulama
const handleVerifyOtp = async () => {
  const result = await AuthService.verifyOtp({
    email: email,
    token: otpCode,
    type: 'email'
  });
  
  if (result.success && result.user) {
    // AuthContext'teki user state'ini güncelle
    await refreshUser();
    navigation.navigate('MainTabs');
  } else {
    showToast(result.error || 'Geçersiz kod', 'error');
  }
};
```

### OTP Input Component Örneği

```typescript
// 6 haneli OTP input
const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);

// Her input için ayrı state veya tek string
// Otomatik focus ve validation
```

## 🔒 Güvenlik Notları

1. **Rate Limiting**: Supabase otomatik rate limiting yapıyor
2. **OTP Süresi**: Supabase default OTP süresi (genellikle 60 saniye)
3. **Session Management**: OTP doğrulandıktan sonra JWT token oluşturuluyor
4. **RLS Policies**: Mevcut RLS policy'ler OTP authentication ile de çalışır

## 📚 Referanslar

- Supabase OTP Docs: https://supabase.com/docs/guides/auth/auth-otp
- AuthService.ts: `src/services/authService.ts` (satır 248-360)
- Mevcut Auth Flow: `src/screens/AuthScreen.tsx`

## ⚠️ Önemli Notlar

- OTP authentication password-based authentication'ı **değiştirmez**, **ekler**
- İstersen her iki yöntemi de destekleyebilirsin (password + OTP)
- OTP için ayrı bir ekran oluşturabilirsin veya mevcut AuthScreen'e ekleyebilirsin
- `shouldCreateUser: true` ile yeni kullanıcılar otomatik oluşturulur

---

**Son Güncelleme**: OTP fonksiyonları eklendi, UI implementasyonu bekliyor.

