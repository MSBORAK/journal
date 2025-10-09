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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';
// import { MotiView } from 'moti'; // Removed for now

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.emailRequired') + ' & ' + t('auth.passwordRequired'));
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert(t('common.error'), t('auth.displayNameRequired'));
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        Alert.alert(t('common.success'), 'Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.');
        setIsLogin(true);
        setDisplayName('');
      }
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={styles.card}
        >
          <Text style={styles.title}>
            {isLogin ? t('auth.signIn') : t('auth.signUp')}
          </Text>
          
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Günlüğünüze devam edin' 
              : 'Günlük tutmaya başlayın'
            }
          </Text>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('auth.displayName')}</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('auth.displayName')}
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.password')}
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setDisplayName('');
            }}
          >
            <Text style={styles.switchText}>
              {isLogin 
                ? t('auth.noAccount') 
                : t('auth.hasAccount')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#a855f7',
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
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '500',
  },
});
