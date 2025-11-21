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
    if (!forgotPasswordEmail) {
      showAlert(
        t('auth.warning'), 
        t('auth.enterEmailForPasswordReset'), 
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      // Email doğrulama
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forgotPasswordEmail)) {
        showAlert(t('auth.error'), t('auth.invalidEmail'), 'error');
        setLoading(false);
        return;
      }

      // Deep link URL'i - Web redirect sayfasına yönlendir
      // Web sayfası token'ı alıp deep link'e yönlendirecek
      // Bu sayede hem web hem mobile tarayıcılarda çalışır
      // 
      // ÖNEMLI: Supabase {{ .ConfirmationURL }} şu formatta olur:
      // https://PROJECT.supabase.co/auth/v1/verify?token=XXX&type=recovery&redirect_to=REDIRECT_URL
      // Supabase verify endpoint'i token'ı doğrular ve redirect_to URL'ine hash fragment ile yönlendirir:
      // REDIRECT_URL#access_token=XXX&refresh_token=YYY&type=recovery
      // 
      // KRİTİK: Supabase Dashboard'da Site URL sadece domain olmalı (path olmamalı):
      // ✅ Doğru: https://jblqkhgwitktbfeppume.supabase.co
      // ❌ Yanlış: https://jblqkhgwitktbfeppume.supabase.co/storage/...
      const redirectUrl = __DEV__ 
        ? 'http://localhost:8081/auth-reset.html' // Development - Expo web server
        : 'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html'; // Production - Supabase Storage

      console.log('🔗 Şifre sıfırlama redirect URL:', redirectUrl);
      console.log('📧 Email gönderiliyor...');

      const { data, error } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail.toLowerCase().trim(), 
        {
          redirectTo: redirectUrl,
        }
      );

      if (data) {
        console.log('✅ Email gönderildi! Data:', data);
      }

      if (error) {
        throw error;
      }

      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
      showAlert(
        t('auth.emailSent'), 
        t('auth.passwordResetLinkSent'),
        'success'
      );
    } catch (error: any) {
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('rate limit')) {
        showAlert(t('auth.warning'), t('auth.tooManyAttempts'), 'warning');
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        showAlert(t('auth.error'), t('auth.invalidEmail'), 'error');
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        showAlert(t('auth.error'), t('auth.userNotFound'), 'error');
      } else {
        showAlert(
          t('auth.error'), 
          t('auth.passwordResetLinkNotSent'), 
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showToast(t('auth.emailAndPasswordRequired'), 'error');
      return;
    }

    if (!isLogin && !displayName) {
      showToast(t('auth.displayNameRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        showToast(t('auth.accountCreated'), 'success');
        setIsLogin(true);
        setDisplayName('');
      }
    } catch (error) {
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

          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={dynamicStyles.buttonText}>
              {loading ? t('common.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
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

          <TouchableOpacity
            style={dynamicStyles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setDisplayName('');
            }}
          >
            <Text style={dynamicStyles.switchText}>
              {isLogin 
                ? t('auth.noAccount')
                : t('auth.hasAccount')
              }
            </Text>
          </TouchableOpacity>
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
                  onPress={handleForgotPassword}
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

