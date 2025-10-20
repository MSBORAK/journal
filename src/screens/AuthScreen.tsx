import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';
import { CustomAlert } from '../components/CustomAlert';
import { supabase } from '../lib/supabase';
// import { MotiView } from 'moti'; // Removed for now

export default function AuthScreen() {
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

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const { signIn, signUp } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useTranslation();

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
      color: currentTheme.colors.background,
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
      color: currentTheme.colors.background,
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.primary,
    },
  });

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      showAlert('⚠️ Uyarı', 'Şifre sıfırlama linki için email adresinizi giriniz.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: 'daily://auth/callback?type=password_reset',
      });

      if (error) {
        throw error;
      }

      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
      showAlert(
        '✅ E-posta Gönderildi', 
        'Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.',
        'success'
      );
    } catch (error: any) {
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('rate limit')) {
        showAlert('⚠️ Uyarı', 'Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.', 'warning');
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        showAlert('❌ Hata', 'Geçersiz email adresi.', 'error');
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        showAlert('❌ Hata', 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.', 'error');
      } else {
        showAlert('❌ Hata', 'Şifre sıfırlama linki gönderilemedi. Lütfen tekrar deneyin.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      showAlert('❌ ' + t('common.error'), t('auth.emailRequired') + ' & ' + t('auth.passwordRequired'), 'error');
      return;
    }

    if (!isLogin && !displayName) {
      showAlert('❌ ' + t('common.error'), t('auth.displayNameRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        showAlert('✅ ' + t('common.success'), 'Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.', 'success');
        setIsLogin(true);
        setDisplayName('');
      }
    } catch (error) {
      showAlert('❌ ' + t('common.error'), error instanceof Error ? error.message : 'Bir hata oluştu', 'error');
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
              ? 'Günlüğünüze devam edin' 
              : 'Günlük tutmaya başlayın'
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

          {isLogin && (
            <TouchableOpacity
              style={[dynamicStyles.switchButton, { marginBottom: 16 }]}
              onPress={() => {
                setForgotPasswordEmail(email); // Mevcut email'i otomatik doldur
                setShowForgotPasswordModal(true);
              }}
              disabled={loading}
            >
              <Text style={[dynamicStyles.switchText, { fontSize: 13, opacity: 0.8 }]}>
                🔑 Şifremi Unuttum
              </Text>
            </TouchableOpacity>
          )}

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
      <Modal visible={showForgotPasswordModal} transparent animationType="fade" onRequestClose={() => setShowForgotPasswordModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={dynamicStyles.modalOverlay}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>🔑 Şifremi Unuttum</Text>
            
            <TextInput
              style={dynamicStyles.modalInput}
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              placeholder="Email adresinizi girin"
              placeholderTextColor={currentTheme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                }}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleForgotPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={{
          text: 'Tamam',
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </KeyboardAvoidingView>
  );
}

