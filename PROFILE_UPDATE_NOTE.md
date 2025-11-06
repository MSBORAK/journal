# Profil Düzenleme Sorunu - İsim Değişikliği

## Sorun
Kullanıcı ismini değiştiriyor ama UI'da güncellenmiyor.

## Yapılan Değişiklikler
1. ✅ `profileService.ts`: Profil güncellemesi AsyncStorage'a kaydediliyor
2. ✅ `getProfile`: Veritabanından okuyamazsa AsyncStorage'dan okuyor
3. ✅ `AccountSettingsScreen`: Profil güncellemesi sonrası `refreshUser()` çağrılıyor
4. ✅ Dashboard'da `profile?.full_name || user?.displayName` kullanılıyor

## Kontrol Edilmesi Gerekenler

### 1. AsyncStorage Kontrolü
- [ ] Profil güncellemesi AsyncStorage'a kaydediliyor mu?
- [ ] `getProfile` AsyncStorage'dan doğru okuyor mu?
- [ ] Key formatı doğru mu? (`user_profile_${userId}`)

### 2. AuthContext Güncelleme
- [ ] `refreshUser()` fonksiyonu gerçekten `user.displayName`'i güncelliyor mu?
- [ ] Supabase `user_metadata.full_name` güncelleniyor mu?
- [ ] `updateProfile` sonrası `refreshUser()` çağrılıyor mu?

### 3. useProfile Hook
- [ ] `useProfile` hook'u profil değişikliğini algılıyor mu?
- [ ] `refreshProfile()` fonksiyonu çağrılıyor mu?
- [ ] Dashboard'da profil yeniden yükleniyor mu?

### 4. UI Güncellemesi
- [ ] Dashboard'da `profile?.full_name` doğru gösteriliyor mu?
- [ ] `user?.displayName` fallback çalışıyor mu?
- [ ] Component'ler profil değişikliğini algılıyor mu?

### 5. Supabase Kontrolü
- [ ] `users` tablosunda `full_name` kolonu var mı?
- [ ] Kolon varsa update çalışıyor mu?
- [ ] `user_metadata` güncelleniyor mu?

## Olası Çözümler

### Çözüm 1: Supabase user_metadata Güncelleme
```typescript
// profileService.ts içinde
await supabase.auth.updateUser({
  data: { full_name: updates.full_name }
});
```

### Çözüm 2: useProfile Hook'unu Refresh Etme
```typescript
// AccountSettingsScreen.tsx içinde
const { profile, refreshProfile } = useProfile(user?.uid);
await refreshProfile();
```

### Çözüm 3: Dashboard'da Profil Yeniden Yükleme
```typescript
// DashboardScreen.tsx içinde
useEffect(() => {
  if (user?.uid) {
    refreshProfile();
  }
}, [user?.uid]);
```

## Notlar
- Profil güncellemesi şu an AsyncStorage'a kaydediliyor
- Veritabanı şema hatası varsa local state'te kalıyor
- AuthContext refresh ediliyor ama görünmüyor
- Dashboard'da profil öncelikli, user fallback

