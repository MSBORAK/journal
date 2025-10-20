import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { CustomAlert } from '../components/CustomAlert';

export default function AuthCallbackScreen() {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();
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
    // Handle email confirmation - ChatGPT'nin önerisi doğrultusunda
    const handleEmailConfirmation = async () => {
      try {
        // Deep link'ten gelen token'ları kontrol et
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          showAlert('❌ Hata', 'Email onayında hata oluştu. Lütfen tekrar deneyin.', 'error');
          return;
        }

        if (session) {
          console.log('Email confirmed successfully');
          showAlert(
            '✅ Başarılı', 
            'Email adresiniz başarıyla onaylandı ve güncellendi.',
            'success'
          );
          
          // Navigate back to settings after 2 seconds
          setTimeout(() => {
            navigation.navigate('AccountSettings' as never);
          }, 2000);
        } else {
          showAlert('⚠️ Uyarı', 'Oturum bulunamadı. Email linkini tekrar kullanın.', 'warning');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        showAlert('❌ Hata', 'Email onayında beklenmeyen bir hata oluştu.', 'error');
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        📧 Email Onayı
      </Text>
      <Text style={[styles.message, { color: currentTheme.colors.secondary }]}>
        Email adresiniz onaylanıyor...
      </Text>

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
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
