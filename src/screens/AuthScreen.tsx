import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { Toast } from '../components/Toast';
import OtpInput from '../components/OtpInput';
import { getButtonTextColor } from '../utils/colorUtils';
import { useNavigation } from '@react-navigation/native';

export default function AuthScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const { signInWithOtp, verifyOtp, refreshUser } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  // Countdown timer için useEffect
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown]);

  // Deep link handling - email confirmation için
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('auth/callback') || url.includes('AuthCallback')) {
        navigation.navigate('AuthCallback' as never);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

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
  });


  const handleGuestContinue = async () => {
    try {
      await AsyncStorage.setItem('@has_completed_auth', 'true');
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      console.error('Error saving auth status:', error);
      navigation.navigate('MainTabs' as never);
    }
  };

  const handleSendOtp = async () => {
    if (loading) return;

    if (!email) {
      showToast('Lütfen email adresinizi girin', 'error');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Geçersiz email adresi', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('📧 OTP gönderiliyor...', email.trim());
      const result = await signInWithOtp({
        email: email.trim(),
        shouldCreateUser: true,
      });

      console.log('📧 OTP sonucu:', JSON.stringify(result, null, 2));
      console.log('📧 result.success:', result.success);
      console.log('📧 result.error:', result.error);

      if (result && result.success === true) {
        console.log('✅ OTP başarılı, ekran değiştiriliyor...');
        
        // State'i güncelle
        setOtpSent(true);
        setCountdown(60); // 60 saniye geri sayım başlat
        showToast('📧 Kod email\'inize gönderildi. Lütfen email kutunuzu kontrol edin.', 'success');
      } else {
        const errorMsg = result?.error || 'Kod gönderilemedi';
        console.error('❌ OTP başarısız:', errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error: any) {
      console.error('❌ OTP catch hatası:', error);
      showToast(error?.message || 'Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (loading) return;

    if (!otp || otp.length !== 6) {
      showToast('Lütfen 6 haneli kodu girin', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'email',
      });

      if (result.success) {
        showToast('✅ Giriş başarılı!', 'success');
        
        // User state'ini yenile
        await refreshUser();
        
        // Mark that user has completed auth
        try {
          await AsyncStorage.setItem('@has_completed_auth', 'true');
        } catch (storageError) {
          console.error('Storage error:', storageError);
        }

        // Navigate to main app
        setTimeout(() => {
          navigation.navigate('MainTabs' as never);
        }, 1000);
      } else {
        showToast(result.error || 'Geçersiz kod', 'error');
        setOtpCode(''); // OTP'yi temizle
      }
    } catch (error: any) {
      showToast(error?.message || 'Kod doğrulanamadı', 'error');
      setOtpCode(''); // OTP'yi temizle
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
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
            {otpSent ? '📧 Kodu Girin' : '🔐 Giriş Yap'}
          </Text>
          
          <Text style={dynamicStyles.subtitle}>
            {otpSent 
              ? 'Email\'inize gönderilen 6 haneli kodu girin'
              : 'Email adresinize gönderilecek kod ile giriş yapın'
            }
          </Text>

          {!otpSent ? (
            <>
              {/* Email Input */}
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.label}>Email Adresi</Text>
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
                  editable={!loading}
                />
              </View>

              {/* Kod Gönder Butonu */}
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.primaryButton]}
                onPress={handleSendOtp}
                disabled={loading || !email}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.buttonText, {
                  fontSize: 17,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                }]}>
                  {loading ? 'Gönderiliyor...' : '📧 Kod Gönder'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Email göster (değiştirilemez) */}
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.label}>Email Adresi</Text>
                <TextInput
                  style={[dynamicStyles.input, { opacity: 0.6 }]}
                  value={email}
                  editable={false}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* OTP Input */}
              <OtpInput
                length={6}
                onComplete={handleVerifyOtp}
                autoFocus={true}
              />

              {/* Kod Tekrar Gönder Butonu */}
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: countdown > 0 ? currentTheme.colors.border : currentTheme.colors.primary + '20',
                  borderWidth: 2,
                  borderColor: countdown > 0 ? currentTheme.colors.border : currentTheme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                  marginBottom: 16,
                  minHeight: 44,
                  opacity: countdown > 0 ? 0.5 : 1,
                }}
                onPress={handleResendOtp}
                disabled={loading || countdown > 0}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: countdown > 0 ? currentTheme.colors.secondary : currentTheme.colors.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {countdown > 0 
                    ? `Kod tekrar gönderilebilir (${countdown}s)`
                    : '📧 Kodu Tekrar Gönder'
                  }
                </Text>
              </TouchableOpacity>

              {/* Email Değiştir Butonu */}
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setOtpSent(false);
                  setOtpCode('');
                  setCountdown(0);
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: currentTheme.colors.primary,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  ✏️ Email'i Değiştir
                </Text>
              </TouchableOpacity>
            </>
          )}

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

