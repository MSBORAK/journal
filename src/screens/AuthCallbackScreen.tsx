import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { CustomAlert } from '../components/CustomAlert';

export default function AuthCallbackScreen() {
  const { currentTheme } = useTheme();
  const { refreshUser } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
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
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔗 AuthCallback started');
        
        // Deep link'ten gelen URL'i al
        const url = await Linking.getInitialURL();
        console.log('📱 Initial URL:', url);
        
        if (url) {
          // URL'den hash parametrelerini çıkar
          const urlObj = new URL(url);
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');
          
          console.log('🔑 Token info:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken,
            type 
          });

          if (accessToken && refreshToken) {
            // Token'ları kullanarak session oluştur
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('❌ Session set error:', error);
              showAlert('❌ Hata', 'Email onayında hata oluştu. Lütfen tekrar deneyin.', 'error');
              return;
            }

            if (data.session) {
              console.log('✅ Email confirmed and session updated');
              
              // UI state'ini güncelle
              await refreshUser();
              
              showAlert(
                '✅ Başarılı', 
                'Email adresiniz başarıyla onaylandı ve güncellendi!',
                'success'
              );
              
              // Navigate back to settings after 2 seconds
              setTimeout(() => {
                navigation.navigate('AccountSettings' as never);
              }, 2000);
              return;
            }
          }
        }

        // Eğer URL'den token alamazsak, mevcut session'ı kontrol et
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Get session error:', error);
          showAlert('❌ Hata', 'Email onayında hata oluştu. Lütfen tekrar deneyin.', 'error');
          return;
        }

        if (session) {
          console.log('✅ Session found');
          
          // UI state'ini güncelle
          await refreshUser();
          
          showAlert(
            '✅ Başarılı', 
            'Email adresiniz başarıyla onaylandı!',
            'success'
          );
          
          setTimeout(() => {
            navigation.navigate('AccountSettings' as never);
          }, 2000);
        } else {
          console.warn('⚠️ No session found');
          showAlert('⚠️ Uyarı', 'Email onayı tamamlanamadı. Lütfen linki tekrar kullanın.', 'warning');
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
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
