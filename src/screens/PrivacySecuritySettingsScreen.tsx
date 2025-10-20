import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';
import * as Haptics from 'expo-haptics';
import { BackupService } from '../services/backupService';

interface PrivacySecuritySettingsScreenProps {
  navigation: any;
}

export default function PrivacySecuritySettingsScreen({ navigation }: PrivacySecuritySettingsScreenProps) {
  const { currentTheme } = useTheme();
  
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownloadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await BackupService.downloadUserData(user.uid);
      showAlert('✅ Başarılı', 'Verileriniz JSON formatında indirildi!');
    } catch (error) {
      showAlert('❌ Hata', 'İndirme sırasında hata oluştu: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const showPrivacyPolicy = () => {
    showAlert(
      '🔒 Gizlilik Politikası',
      'Gizlilik Politikamız:\n\n• Günlük verileriniz sadece sizin cihazınızda ve Supabase bulutunda saklanır\n• Verileriniz üçüncü taraflarla paylaşılmaz\n• Tüm verileriniz şifrelenir\n• İstediğiniz zaman verilerinizi silebilirsiniz\n• Anonim istatistikler için verileriniz anonimleştirilir\n\nDetaylı bilgi için: msesoftware1425@gmail.com',
      'info'
    );
  };

  const showDataTransparency = () => {
    showAlert(
      '👁️ Veri Şeffaflığı',
      'Verileriniz nasıl kullanılıyor:\n\n📝 Günlük Yazıları:\n• Sadece sizin erişiminizde\n• İstatistikler için analiz edilir\n• Anonimleştirilmiş içgörüler oluşturulur\n\n📊 Kullanım İstatistikleri:\n• Giriş yapma zamanları\n• Yazma alışkanlıkları\n• Genel uygulama kullanımı\n\n🔐 Güvenlik:\n• Tüm veriler şifrelenir\n• Supabase RLS ile korunur\n• Sadece siz erişebilirsiniz',
      'info'
    );
  };

  const showTermsOfService = () => {
    showAlert(
      '📋 Kullanım Koşulları',
      'Kullanım Koşulları:\n\n• Uygulamayı yasal amaçlarla kullanın\n• Başkalarının haklarını ihlal etmeyin\n• Spam veya kötüye kullanım yapmayın\n• Verilerinizi güvenli tutun\n• Yasal sorumluluğunuz bulunmaktadır\n\nDetaylı bilgi için: terms@dailydiary.app',
      'info'
    );
  };

  const showSecurityInfo = () => {
    showAlert(
      '🛡️ Güvenlik Bilgileri',
      'Güvenlik Özelliklerimiz:\n\n🔐 Şifreleme:\n• End-to-end şifreleme\n• AES-256 güvenlik\n• SSL/TLS bağlantılar\n\n🔑 Kimlik Doğrulama:\n• Email doğrulama\n• Güvenli giriş\n• Oturum yönetimi\n\n📱 Cihaz Güvenliği:\n• Biyometrik giriş\n• Güvenli depolama\n• Otomatik çıkış',
      'info'
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.primary + '20',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 16,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '15',
    },
    settingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    actionButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    actionButtonText: {
      color: currentTheme.colors.background,
      fontSize: 14,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: currentTheme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '20',
    },
    infoText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    securityBadge: {
      backgroundColor: '#10B981',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    securityBadgeText: {
      color: currentTheme.colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={currentTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Gizlilik & Güvenlik</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            🔒 Gizliliğiniz ve güvenliğiniz bizim için çok önemli. Verilerinizin nasıl korunduğunu 
            ve kullanıldığını buradan öğrenebilirsiniz.
          </Text>
          <View style={dynamicStyles.securityBadge}>
            <Text style={dynamicStyles.securityBadgeText}>✅ Güvenli</Text>
          </View>
        </View>

        {/* Gizlilik */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Gizlilik</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="shield-checkmark" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Gizlilik Politikası</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu öğrenin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showPrivacyPolicy}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📄 Görüntüle</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="eye" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Veri Şeffaflığı</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Hangi verilerinizin nasıl kullanıldığını detaylı olarak görün.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showDataTransparency}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>👁️ Detaylar</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="download" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Verilerimi İndir</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Tüm kişisel verilerinizi JSON formatında indirin ve kontrol edin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleDownloadData}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? 'İndiriliyor...' : '📥 İndir'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Güvenlik */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Güvenlik</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="lock-closed" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Güvenlik Bilgileri</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Uygulamanızın güvenlik özelliklerini ve veri koruma yöntemlerini öğrenin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showSecurityInfo}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🛡️ Güvenlik</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="document-text" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Kullanım Koşulları</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Uygulama kullanım koşullarını ve kullanıcı sorumluluklarını okuyun.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showTermsOfService}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📋 Koşullar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Güvenlik Durumu */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Güvenlik Durumu</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>Veri Şifreleme</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Tüm verileriniz end-to-end şifreleme ile korunuyor.
            </Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅ Aktif</Text>
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="cloud-done" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>Güvenli Bulut</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Verileriniz güvenli Supabase sunucularında saklanıyor.
            </Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅ Aktif</Text>
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>Erişim Kontrolü</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Sadece siz verilerinize erişebilirsiniz, üçüncü taraflar erişemez.
            </Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅ Aktif</Text>
            </View>
          </View>
        </View>

        {/* İletişim */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>İletişim</Text>
          
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>
              🔐 Gizlilik veya güvenlik konularında sorularınız varsa bizimle iletişime geçin:{'\n\n'}
              📧 Email: msesoftware1425@gmail.com{'\n'}
              🛡️ Güvenlik: msesoftware1425@gmail.com{'\n'}
              📞 Destek: msesoftware1425@gmail.com
            </Text>
          </View>
        </View>
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
    </SafeAreaView>
  );
}
