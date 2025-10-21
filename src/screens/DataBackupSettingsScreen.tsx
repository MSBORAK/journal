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
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';
import * as Haptics from 'expo-haptics';
import { BackupService } from '../services/backupService';
import { useMigration } from '../hooks/useMigration';

interface DataBackupSettingsScreenProps {
  navigation: any;
}

export default function DataBackupSettingsScreen({ navigation }: DataBackupSettingsScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
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

  const handleMigration = async () => {
    try {
      const result = await migrateData();
      if (result?.success) {
        showAlert('✅ Başarılı', 'Verileriniz başarıyla cloud\'a taşındı! Artık tüm cihazlarınızda senkronize olacak.', 'success');
      } else {
        showAlert('❌ Hata', 'Veri taşıma işlemi başarısız oldu', 'error');
      }
    } catch (error) {
      showAlert('❌ Hata', 'Veri taşıma işlemi başarısız oldu', 'error');
    }
  };
  const { user } = useAuth();
  const { migrateData, isMigrating } = useMigration();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await BackupService.backupToCloud(user.uid);
      showAlert('✅ Başarılı', 'Verileriniz başarıyla yedeklendi!');
    } catch (error) {
      showAlert('❌ Hata', 'Yedekleme sırasında hata oluştu: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await BackupService.restoreFromCloud(user.uid);
      showAlert('✅ Başarılı', 'Verileriniz başarıyla geri yüklendi!');
    } catch (error) {
      showAlert('❌ Hata', 'Geri yükleme sırasında hata oluştu: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
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

  const handleClearData = () => {
    showAlert(
      '⚠️ Veri Temizleme',
      'Tüm verileriniz silinecek! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      'warning'
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
    dangerButton: {
      backgroundColor: '#EF4444',
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
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={[dynamicStyles.header, { paddingTop: 20 }]}>
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
        <Text style={dynamicStyles.headerTitle}>Veri & Yedekleme</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            📱 Verilerinizi güvenli bir şekilde yedekleyin ve yönetin. Tüm günlük yazılarınız, 
            profil bilgileriniz ve ayarlarınız buradan kontrol edilebilir.
          </Text>
        </View>

        {/* Yedekleme İşlemleri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Yedekleme İşlemleri</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="cloud-upload-outline" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Verileri Cloud'a Taşı</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Telefonundaki görevler ve hatırlatıcıları cloud'a taşıyarak tüm cihazlarda senkronize et.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleMigration}
              disabled={isMigrating}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {isMigrating ? 'Taşınıyor...' : '☁️ Cloud\'a Taşı'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="cloud-upload" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Veri Yedekleme</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Günlüklerinizi ve tüm verilerinizi Supabase bulutuna güvenli bir şekilde yedekleyin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleBackup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? 'Yedekleniyor...' : '📤 Yedekle'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="cloud-download" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Veri Geri Yükleme</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Yedeklenen verilerinizi cihazınıza geri yükleyin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleRestore}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? 'Yükleniyor...' : '📥 Geri Yükle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Veri Yönetimi */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Veri Yönetimi</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="download" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Verilerimi İndir</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Tüm kişisel verilerinizi JSON formatında indirin ve başka bir yerde saklayın.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleDownload}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? 'İndiriliyor...' : '📄 İndir'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <Text style={dynamicStyles.settingTitle}>Veri Temizleme</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz!
            </Text>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.dangerButton]}
              onPress={handleClearData}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? 'Siliniyor...' : '🗑️ Temizle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bilgilendirme */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Önemli Bilgiler</Text>
          
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>
              🔒 <Text style={{ fontWeight: '600' }}>Güvenlik:</Text> Tüm verileriniz şifrelenir ve güvenli sunucularda saklanır.{'\n\n'}
              💾 <Text style={{ fontWeight: '600' }}>Yedekleme:</Text> Verilerinizi düzenli olarak yedeklemeyi unutmayın.{'\n\n'}
              📱 <Text style={{ fontWeight: '600' }}>Cihaz Değişikliği:</Text> Yeni cihazınıza geçerken verilerinizi geri yükleyin.
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
