import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { Toast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { getButtonTextColor } from '../utils/colorUtils';
import { useNavigation } from '@react-navigation/native';
// import { MotiView } from 'moti'; // Removed for now

export default function AuthScreen() {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
  });

  // Toast state
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastConfig({
      visible: true,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  const { signIn, signUp } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  // Deep link handling - şifre sıfırlama linki için
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('PasswordReset') || url.includes('password_reset')) {
        // Şifre sıfırlama ekranına yönlendir
        navigation.navigate('PasswordReset' as never);
      }
    };

    // Uygulama açıkken gelen linkler
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Uygulama kapalıyken açılan linkler
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      borderRadius: 28,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 16,
      },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 16,
      transform: [{ translateY: -4 }],
    },
    cardGradient: {
      borderRadius: 28,
      padding: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: currentTheme.colors.card,
      color: currentTheme.colors.text,
    },
    button: {
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
      minHeight: 52,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    primaryButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    buttonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '600',
    },
    switchButton: {
      alignItems: 'center',
      marginTop: 8,
    },
    switchText: {
      color: currentTheme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 60,
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 350,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '20',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: currentTheme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: currentTheme.colors.primary + '15',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '30',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonTextPrimary: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.primary,
    },
  });

  const handleForgotPassword = async () => {
    console.log('🔑 handleForgotPassword fonksiyonu çağrıldı');
    console.log('📧 Email değeri:', forgotPasswordEmail);
    console.log('⏳ Loading durumu:', loading);

    if (!forgotPasswordEmail) {
      console.log('⚠️ Email boş, uyarı gösteriliyor');
      showAlert(
        t('auth.warning'), 
        t('auth.enterEmailForPasswordReset'), 
        'warning'
      );
      return;
    }

    setLoading(true);
    console.log('⏳ Loading true yapıldı');

    try {
      // Email doğrulama
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(forgotPasswordEmail);
      console.log('📧 Email validasyonu:', isValidEmail);

      if (!isValidEmail) {
        console.log('❌ Geçersiz email formatı');
        showAlert(t('auth.error'), t('auth.invalidEmail'), 'error');
        setLoading(false);
        return;
      }

      const trimmedEmail = forgotPasswordEmail.toLowerCase().trim();
      console.log('📧 İşlenmiş email:', trimmedEmail);

      // Web sayfası üzerinden geçiş yöntemi (Gemini'nin önerdiği en iyi yöntem)
      // Supabase verify endpoint'i token'ı doğruladıktan sonra web sayfasına yönlendirecek
      // Web sayfası hash fragment'i alıp mobil uygulamaya deep link ile yönlendirecek
      const redirectUrl = __DEV__ 
        ? 'http://localhost:8081/auth-reset.html' // Development - Expo web server
        : 'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html'; // Production - Supabase Storage
      
      // NOT: Web sayfası (auth-reset.html) Supabase'den gelen hash fragment'i (#access_token=xxx&refresh_token=yyy)
      // alıp rhythm://PasswordReset deep link'ine ekleyecek
      // Bu yöntem hem web hem mobil tarayıcılarda çalışır ve en güvenilir yöntemdir

      console.log('🔗 Şifre sıfırlama redirect URL:', redirectUrl);
      console.log('📧 Supabase API çağrısı yapılıyor...');
      console.log('📧 Email:', trimmedEmail);
      console.log('🔗 RedirectTo:', redirectUrl);
      console.log('');
      console.log('📋 Supabase Dashboard Kontrol Listesi (Email gelmezse):');
      console.log('');
      console.log('1️⃣ Authentication → Settings:');
      console.log('   ✓ Enable email signups: Açık olmalı');
      console.log('   ✓ Site URL: https://jblqkhgwitktbfeppume.supabase.co (sadece domain)');
      console.log('');
      console.log('2️⃣ Authentication → Email Templates:');
      console.log('   ✓ "Reset Password" template: Aktif olmalı');
      console.log('   ✓ Template içeriğinde {{ .ConfirmationURL }} olmalı');
      console.log('   ⚠️ NOT: Email Notifications değil, Email Templates bölümünde!');
      console.log('');
      console.log('3️⃣ Authentication → URL Configuration:');
      console.log('   ✓ Redirect URLs listesinde şu URL olmalı:');
      console.log('     - rhythm://PasswordReset (mevcut)');
      console.log('     - VEYA rhythm://* (wildcard - önerilen)');
      console.log('   ✓ Site URL: https://jblqkhgwitktbfeppume.supabase.co');
      console.log('');
      console.log('4️⃣ Authentication → Users:');
      console.log('   ✓ Email adresi (' + trimmedEmail + ') kayıtlı mı kontrol edin');
      console.log('   ⚠️ NOT: Kayıtlı olmayan email\'lere Supabase email göndermez!');
      console.log('');

      // Supabase API çağrısı
      const startTime = Date.now();
      console.log('📡 Supabase API çağrısı başlatılıyor...');
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail, 
        {
          redirectTo: redirectUrl,
        }
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('⏱️ API çağrısı süresi:', duration, 'ms');
      console.log('📦 Supabase Response - Data:', data);
      console.log('📦 Supabase Response - Error:', error);

      if (error) {
        console.error('❌ Supabase API Hatası:');
        console.error('   - Error Message:', error.message);
        console.error('   - Error Status:', error.status);
        console.error('   - Error Name:', error.name);
        console.error('   - Full Error Object:', JSON.stringify(error, null, 2));
        
        // Özel hata mesajları
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
          throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.');
        } else if (errorMessage.includes('invalid email')) {
          throw new Error('Geçersiz email adresi.');
        } else if (errorMessage.includes('email not found') || errorMessage.includes('user not found')) {
          // NOT: Supabase güvenlik nedeniyle email'in kayıtlı olup olmadığını açık etmez
          // Bu yüzden genel bir mesaj gösteriyoruz
          throw new Error('Email gönderilemedi. Email adresinizin sistemde kayıtlı olduğundan emin olun.');
        } else {
          throw error;
        }
      }

      // NOT: Supabase başarılı durumda genellikle data döndürmez
      // Bu normal bir davranıştır - email gönderildi demektir
      console.log('✅ Supabase API çağrısı başarılı!');
      console.log('📧 NOT: Supabase güvenlik nedeniyle email gönderimini doğrulamaz.');
      console.log('📧 NOT: Email kayıtlı değilse bile hata vermez (güvenlik özelliği)');
      
      if (data) {
        console.log('✅ Email gönderildi! Data:', JSON.stringify(data, null, 2));
      } else {
        console.log('📧 Data boş - bu normal (Supabase başarılı durumda data döndürmez)');
      }
      
      console.log('');
      console.log('📧 Email kontrol listesi:');
      console.log('   1. Gelen kutusunu kontrol edin');
      console.log('   2. Spam/Junk klasörünü kontrol edin');
      console.log('   3. 5-10 dakika bekleyin (email gecikmeli gelebilir)');
      console.log('   4. Email gelmezse:');
      console.log('      a) Supabase Dashboard → Authentication → Users');
      console.log('         Email adresinin kayıtlı olduğundan emin olun');
      console.log('      b) Yukarıdaki Supabase Dashboard kontrol listesini takip edin');

      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
      
      // Detaylı başarı mesajı
      const successMessage = 
        'Şifre sıfırlama linki email adresinize gönderildi.\n\n' +
        '📧 Kontrol edin:\n' +
        '   • Gelen kutusu\n' +
        '   • Spam/Junk klasörü\n' +
        '   • 5-10 dakika bekleyin\n\n' +
        '⚠️ Email gelmezse:\n' +
        '   1. Email adresinizin sistemde kayıtlı olduğundan emin olun\n' +
        '      (Supabase Dashboard → Authentication → Users)\n' +
        '   2. Supabase Dashboard → Authentication → Email Templates\n' +
        '      "Reset Password" template\'ini kontrol edin\n' +
        '   3. Supabase Dashboard → Authentication → URL Configuration\n' +
        '      Redirect URL\'lerin doğru olduğundan emin olun';
      
      showAlert(
        t('auth.emailSent'), 
        successMessage,
        'success'
      );
    } catch (error: any) {
      console.error('❌ handleForgotPassword catch bloğu:');
      console.error('   - Error Type:', typeof error);
      console.error('   - Error:', error);
      console.error('   - Error Message:', error?.message);
      console.error('   - Error Stack:', error?.stack);
      console.error('   - Full Error:', JSON.stringify(error, null, 2));

      // Network hatalarını kontrol et
      const errorMessage = error?.message || error?.toString() || '';
      const errorString = errorMessage.toLowerCase();

      console.log('🔍 Hata mesajı analizi:', errorString);

      if (errorString.includes('network') || 
          errorString.includes('fetch') || 
          errorString.includes('connection') ||
          error?.code === 'NETWORK_ERROR' ||
          error?.name === 'NetworkError') {
        console.log('🌐 Network hatası tespit edildi');
        showAlert(
          t('auth.error'), 
          'İnternet bağlantınızı kontrol edin. Bağlantı hatası oluştu.',
          'error'
        );
      } else if (errorString.includes('rate limit') || errorString.includes('too many')) {
        console.log('⏱️ Rate limit hatası');
        showAlert(t('auth.warning'), t('auth.tooManyAttempts'), 'warning');
      } else if (errorString.includes('invalid email')) {
        console.log('📧 Geçersiz email hatası');
        showAlert(t('auth.error'), t('auth.invalidEmail'), 'error');
      } else       if (errorString.includes('user not found') || errorString.includes('not registered') || errorString.includes('email not found')) {
        console.log('👤 Kullanıcı bulunamadı hatası');
        const notFoundMessage = 
          'Email gönderilemedi.\n\n' +
          '⚠️ Olası nedenler:\n' +
          '   • Bu email adresi sistemde kayıtlı değil\n' +
          '   • Email adresini yanlış yazdınız\n\n' +
          '💡 Çözüm:\n' +
          '   • Kayıt olduğunuz email adresini kullanın\n' +
          '   • Email adresini kontrol edin';
        showAlert(t('auth.error'), notFoundMessage, 'error');
      } else {
        console.log('❓ Bilinmeyen hata');
        const userFriendlyMessage = 
          (errorMessage || 'Şifre sıfırlama linki gönderilemedi.') + '\n\n' +
          '🛠️ Supabase Dashboard\'da kontrol edin:\n' +
          '   1. Authentication → Settings\n' +
          '   2. Authentication → Email Templates\n' +
          '   3. Authentication → URL Configuration';
        showAlert(
          t('auth.error'), 
          userFriendlyMessage,
          'error'
        );
      }
    } finally {
      console.log('🏁 handleForgotPassword finally bloğu - Loading false yapılıyor');
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    try {
      // Mark that user has seen auth screen
      await AsyncStorage.setItem('@has_completed_auth', 'true');
      // Navigate to main app
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      console.error('Error saving auth status:', error);
      // Navigate anyway
      navigation.navigate('MainTabs' as never);
    }
  };

  const handleSubmit = async () => {
    if (loading) {
      console.log('⚠️ Already processing, ignoring duplicate call');
      return;
    }

    if (!email || !password) {
      showToast(t('auth.emailAndPasswordRequired'), 'error');
      return;
    }

    if (!isLogin && !displayName) {
      showToast(t('auth.displayNameRequired'), 'error');
      return;
    }

    setLoading(true);
    console.log('🔐 handleSubmit başladı - isLogin:', isLogin);

    try {
      if (isLogin) {
        console.log('🔐 Sign in işlemi başlatılıyor...');
        await signIn(email, password);
        console.log('✅ Sign in başarılı');
        
        // Mark that user has completed auth
        try {
          await AsyncStorage.setItem('@has_completed_auth', 'true');
          console.log('✅ Auth flag kaydedildi');
        } catch (storageError) {
          console.error('❌ Storage error:', storageError);
        }

        // Navigate to main app
        try {
          navigation.navigate('MainTabs' as never);
          console.log('✅ Navigation to MainTabs');
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
        }
      } else {
        console.log('📝 Sign up işlemi başlatılıyor...');
        await signUp(email, password, displayName);
        console.log('✅ Sign up başarılı');
        
        showToast(t('auth.accountCreated'), 'success');
        setIsLogin(true);
        setDisplayName('');
        
        // Mark that user has completed auth
        try {
          await AsyncStorage.setItem('@has_completed_auth', 'true');
          console.log('✅ Auth flag kaydedildi');
        } catch (storageError) {
          console.error('❌ Storage error:', storageError);
        }

        // Navigate to main app after a short delay
        setTimeout(() => {
          try {
            navigation.navigate('MainTabs' as never);
            console.log('✅ Navigation to MainTabs (delayed)');
          } catch (navError) {
            console.error('❌ Navigation error:', navError);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('❌ handleSubmit error:', error);
      const errorMessage = error instanceof Error ? error.message : t('auth.unknownError');
      
      if (errorMessage.toLowerCase().includes('invalid login credentials')) {
        showToast(t('auth.invalidCredentials'), 'error');
      } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
        showToast(t('auth.emailVerificationRequired'), 'error');
      } else if (errorMessage.toLowerCase().includes('too many requests')) {
        showToast(t('auth.tooManyAttempts'), 'error');
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      console.log('🏁 handleSubmit finally - loading false');
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={dynamicStyles.scrollContainer}>
        <LinearGradient
          colors={[
            currentTheme.colors.card,
            currentTheme.colors.card,
            currentTheme.name === 'dark' ? currentTheme.colors.primary + '15' : currentTheme.colors.primary + '08'
          ]}
          style={dynamicStyles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={dynamicStyles.title}>
            {isLogin ? t('auth.signIn') : t('auth.signUp')}
          </Text>
          
          <Text style={dynamicStyles.subtitle}>
            {isLogin 
            ? t('auth.continueJournal')
            : t('auth.startJournaling')
            }
          </Text>

          {!isLogin && (
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>{t('auth.displayName')}</Text>
              <TextInput
                style={dynamicStyles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('auth.displayName')}
                placeholderTextColor="#9ca3af"
                autoCorrect={false}
                autoCapitalize="words"
                textContentType="name"
              />
            </View>
          )}

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>{t('auth.email')}</Text>
            <TextInput
              style={dynamicStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>{t('auth.password')}</Text>
            <TextInput
              style={dynamicStyles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.password')}
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCorrect={false}
              textContentType={isLogin ? "password" : "newPassword"}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </View>

          {/* Ana Giriş/Kayıt Butonu - En Belirgin */}
          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[dynamicStyles.buttonText, {
              fontSize: 17,
              fontWeight: '700',
              letterSpacing: 0.5,
            }]}>
              {loading ? t('common.loading') : (isLogin ? `🔐 ${t('auth.signIn')}` : `✨ ${t('auth.signUp')}`)}
            </Text>
          </TouchableOpacity>

          {/* Şifremi Unuttum Butonu - Her zaman görünür ve daha belirgin */}
          <TouchableOpacity
            style={[
              {
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: currentTheme.colors.primary + '20',
                borderWidth: 2,
                borderColor: currentTheme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 12,
                marginBottom: 16,
                minHeight: 48,
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              },
              loading && { opacity: 0.5 }
            ]}
            onPress={() => {
              console.log('🔑 Şifremi Unuttum butonuna tıklandı, loading:', loading);
              if (!loading) {
                setForgotPasswordEmail(email || ''); // Mevcut email'i otomatik doldur
                setShowForgotPasswordModal(true);
                console.log('✅ Modal açılıyor, email:', email || forgotPasswordEmail);
              }
            }}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={{
              color: currentTheme.colors.primary,
              fontSize: 15,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}>
              🔑 {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Kayıt Ol / Giriş Yap Toggle Butonu - Outline Style */}
          <TouchableOpacity
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: currentTheme.colors.primary + '40',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              marginBottom: 16,
              minHeight: 48,
            }}
            onPress={() => {
              setIsLogin(!isLogin);
              setDisplayName('');
            }}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={{
              color: currentTheme.colors.primary,
              fontSize: 15,
              fontWeight: '600',
              letterSpacing: 0.3,
            }}>
              {isLogin 
                ? `📝 ${t('auth.noAccount')}`
                : `🔐 ${t('auth.hasAccount')}`
              }
            </Text>
          </TouchableOpacity>

          {/* Misafir Olarak Devam Et Butonu */}
          <View style={{
            marginTop: 24,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: currentTheme.colors.border + '40',
          }}>
            <Text style={{
              fontSize: 14,
              color: currentTheme.colors.secondary,
              textAlign: 'center',
              marginBottom: 12,
            }}>
              {t('auth.guestContinueDesc')}
            </Text>
            <TouchableOpacity
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: currentTheme.colors.background,
                borderWidth: 2,
                borderColor: currentTheme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
              }}
              onPress={handleGuestContinue}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={{
                color: currentTheme.colors.text,
                fontSize: 15,
                fontWeight: '600',
                letterSpacing: 0.3,
              }}>
                👤 {t('auth.guestContinue')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal 
        visible={showForgotPasswordModal} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowForgotPasswordModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={dynamicStyles.modalContent}
            >
              <Text style={dynamicStyles.modalTitle}>🔑 {t('auth.forgotPassword')}</Text>
              
              <TextInput
                style={dynamicStyles.modalInput}
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                placeholder={t('auth.enterEmail')}
                placeholderTextColor={currentTheme.colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                editable={!loading}
              />
              
              <View style={dynamicStyles.modalButtons}>
                <TouchableOpacity
                  style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                  onPress={() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordEmail('');
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                    {t('common.cancel') || 'İptal'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamicStyles.modalButton, 
                    dynamicStyles.modalButtonPrimary,
                    loading && { opacity: 0.5 }
                  ]}
                  onPress={() => {
                    console.log('🔘 Gönder butonuna tıklandı!');
                    console.log('📧 Email:', forgotPasswordEmail);
                    console.log('⏳ Loading:', loading);
                    console.log('🔘 Disabled:', loading);
                    if (!loading) {
                      handleForgotPassword();
                    } else {
                      console.log('⚠️ Buton disabled, işlem yapılmıyor');
                    }
                  }}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                    {loading ? (t('auth.sending') || 'Gönderiliyor...') : (t('auth.send') || 'Gönder')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={{
          text: t('common.ok'),
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />

      {/* Toast */}
      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
}

