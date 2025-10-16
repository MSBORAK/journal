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
// import { MotiView } from 'moti'; // Removed for now

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      color: 'white',
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

