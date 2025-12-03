import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { CustomAlert } from '../components/CustomAlert';

export default function AuthCallbackScreen() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
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
    const handleUrl = async (url: string) => {
      try {
        console.log('🔗 URL received:', url);
        
        // Supabase email confirmation formatı: #access_token=xxx&refresh_token=yyy&type=signup
        if (url.includes('#access_token') || url.includes('type=signup') || url.includes('type=email')) {
          console.log('✅ Email confirmation token detected');
          
          // Hash fragment'i parse et
          let accessToken: string | null = null;
          let refreshToken: string | null = null;
          
          if (url.includes('#')) {
            const hashPart = url.split('#')[1];
            const hashParams = new URLSearchParams(hashPart);
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
          }
          
          if (accessToken && refreshToken) {
            // Session'ı set et
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (setSessionError) {
              console.error('❌ Set session error:', setSessionError);
              showAlert('❌ Hata', 'Email onayında hata oluştu. Lütfen tekrar deneyin.', 'error');
              return;
            }
            
            if (data.user) {
              console.log('✅ Email confirmed successfully');
              
              // UI state'ini güncelle
              await refreshUser();
              
              showAlert(
                '✅ Başarılı', 
                'Email adresiniz başarıyla onaylandı! Artık uygulamayı kullanabilirsiniz.',
                'success'
              );
              
              // Navigate to main app after 2 seconds
              setTimeout(() => {
                navigation.navigate('MainTabs' as never);
              }, 2000);
            }
          } else {
            console.warn('⚠️ Tokens not found in URL');
            showAlert('⚠️ Uyarı', 'Geçersiz onay linki. Lütfen email linkini tekrar kullanın.', 'warning');
          }
        } else {
          console.warn('⚠️ No confirmation token found in URL');
          showAlert('⚠️ Uyarı', 'Geçersiz onay linki. Lütfen email linkini tekrar kullanın.', 'warning');
        }
      } catch (error) {
        console.error('❌ URL handling error:', error);
        showAlert('❌ Hata', 'Email onayında beklenmeyen bir hata oluştu.', 'error');
      }
    };

    const initializeAuthCallback = async () => {
      try {
        console.log('🔗 AuthCallback started');
        
        // Deep link'ten gelen URL'i al
        const initialUrl = await Linking.getInitialURL();
        console.log('📱 Initial URL:', initialUrl);
        
        if (initialUrl) {
          await handleUrl(initialUrl);
        } else {
          // Eğer initial URL yoksa, mevcut session'ı kontrol et
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
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        showAlert('❌ Hata', 'Email onayında beklenmeyen bir hata oluştu.', 'error');
      }
    };

    // Initial URL'yi kontrol et
    initializeAuthCallback();

    // Deep link listener ekle (uygulama açıkken gelen linkler için)
    const listener = Linking.addEventListener('url', (event) => {
      console.log('📱 Deep link received:', event.url);
      handleUrl(event.url);
    });

    return () => listener?.remove();
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
