import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { CustomAlert } from '../components/CustomAlert';

export default function PasswordResetScreen() {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          showAlert('⚠️ Oturum Hatası', 'Şifre sıfırlama oturumu geçersiz. Lütfen email linkini tekrar kullanın.', 'error');
          setTimeout(() => {
            navigation.navigate('Auth' as never);
          }, 3000);
        }
      } catch (error) {
        console.error('Session check error:', error);
        showAlert('❌ Hata', 'Oturum kontrolünde hata oluştu.', 'error');
      }
    };

    checkSession();
  }, []);

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert('⚠️ Uyarı', 'Lütfen tüm alanları doldurun.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('⚠️ Uyarı', 'Şifre en az 6 karakter olmalıdır.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('⚠️ Uyarı', 'Şifreler eşleşmiyor.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      showAlert(
        '✅ Başarılı', 
        'Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.',
        'success'
      );

      setTimeout(() => {
        navigation.navigate('Auth' as never);
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      showAlert('❌ Hata', error.message || 'Şifre güncellenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        🔐 Yeni Şifre Belirle
      </Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: currentTheme.colors.card,
            color: currentTheme.colors.text,
            borderColor: currentTheme.colors.border
          }]}
          placeholder="Yeni şifre (en az 6 karakter)"
          placeholderTextColor={currentTheme.colors.secondary}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TextInput
          style={[styles.input, { 
            backgroundColor: currentTheme.colors.card,
            color: currentTheme.colors.text,
            borderColor: currentTheme.colors.border
          }]}
          placeholder="Şifreyi tekrar girin"
          placeholderTextColor={currentTheme.colors.secondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.colors.primary }]}
          onPress={handlePasswordReset}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: currentTheme.colors.background }]}>
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

