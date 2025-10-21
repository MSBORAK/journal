import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomAlert } from '../components/CustomAlert';

interface AppSettingsScreenProps {
  navigation: any;
}

export default function AppSettingsScreen({ navigation }: AppSettingsScreenProps) {
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

  const showAbout = () => {
    showAlert(
      t('welcome') === 'Welcome' ? 'ℹ️ About' : 'ℹ️ Hakkında',
      t('welcome') === 'Welcome' 
        ? 'Rhythm v1.0.0\n\n🎵 Spiritual balance and life rhythm app:\n• Daily journaling system\n• Mood tracking and analysis\n• Dreams & goals dashboard\n• Tasks and reminders\n• Pomodoro timer and focus mode\n• Statistics and progress tracking\n• Personality card system\n• 7 different theme options\n• Offline working\n• Data backup\n\nDeveloper: MSESOFT\n© 2025\n\nContact: msesoftware1425@gmail.com'
        : 'Rhythm v1.0.0\n\n🎵 Ruhsal denge ve yaşam ritmi uygulaması:\n• Günlük yazma sistemi\n• Mood takibi ve analizi\n• Hayaller & hedefler panosu\n• Görevler ve hatırlatıcılar\n• Pomodoro timer ve odak modu\n• İstatistikler ve gelişim takibi\n• Kişilik kartı sistemi\n• 7 farklı tema seçeneği\n• Offline çalışma\n• Veri yedekleme\n\nGeliştirici: MSESOFT\n© 2025\n\nİletişim: msesoftware1425@gmail.com',
      'info'
    );
  };

  const showHelp = () => {
    showAlert(
      t('welcome') === 'Welcome' ? '❓ Help & Support' : '❓ Yardım & Destek',
      t('welcome') === 'Welcome' 
        ? 'Frequently Asked Questions:\n\n❓ How can I write a diary?\n• Press the "Write Diary" button on the main page\n\n❓ How can I backup my data?\n• From Settings > Data & Backup section\n\n❓ How can I change the theme?\n• From Settings > Appearance section\n\n❓ How can I set notifications?\n• From Settings > Notifications section\n\nFor more help: msesoftware1425@gmail.com'
        : 'Sık Sorulan Sorular:\n\n❓ Nasıl günlük yazabilirim?\n• Ana sayfadaki "Günlük Yaz" butonuna basın\n\n❓ Verilerimi nasıl yedeklerim?\n• Ayarlar > Veri & Yedekleme bölümünden\n\n❓ Tema nasıl değiştiririm?\n• Ayarlar > Görünüm bölümünden\n\n❓ Bildirimleri nasıl ayarlarım?\n• Ayarlar > Bildirimler bölümünden\n\nDaha fazla yardım için: msesoftware1425@gmail.com',
      'info'
    );
  };

  const rateApp = () => {
    showAlert(
      t('welcome') === 'Welcome' ? '⭐ Rate App' : '⭐ Uygulamayı Değerlendir',
      t('welcome') === 'Welcome' 
        ? 'If you like our app, you can support us by giving 5 stars on the App Store!\n\nYour rating is very valuable to us! 🌟'
        : 'Uygulamamızı beğendiyseniz, App Store\'da 5 yıldız vererek bize destek olabilirsiniz!\n\nDeğerlendirmeniz bizim için çok değerli! 🌟',
      'info'
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: t('welcome') === 'Welcome' 
          ? 'Rhythm - Spiritual balance and life rhythm! 🎵✨\n\nDownload from App Store: https://apps.apple.com/app/rhythm/id1234567890'
          : 'Rhythm - Ruhsal denge ve yaşam ritmi! 🎵✨\n\nApp Store\'dan indirin: https://apps.apple.com/app/rhythm/id1234567890',
        title: 'Rhythm',
      });
    } catch (error) {
      showAlert(
        t('welcome') === 'Welcome' ? '❌ Error' : '❌ Hata', 
        t('welcome') === 'Welcome' ? 'An error occurred during sharing' : 'Paylaşım sırasında hata oluştu', 
        'error'
      );
    }
  };

  const contactSupport = () => {
    showAlert(
      '📞 İletişim',
      'Bizimle iletişime geçin:\n\n📧 Email: msesoftware1425@gmail.com\n💬 İnstagram: @msesoft\nSorularınız için 7/24 destek sağlıyoruz!',
      'info'
    );
  };

  const showChangelog = () => {
    showAlert(
      '📝 Değişiklik Günlüğü',
      'Versiyon 1.0.0 (2025):\n\n✨ Yeni Özellikler:\n• Günlük yazma sistemi\n• Mood takibi\n• İstatistikler ve analizler\n• Hayaller & Hedefler panosu\n• Pomodoro timer\n• Tema sistemi\n\n🐛 Düzeltmeler:\n• Performans iyileştirmeleri\n• UI/UX geliştirmeleri\n• Bug düzeltmeleri\n\n🔮 Gelecek Güncellemeler:\n• Cloud senkronizasyon\n• Daha fazla tema\n• Sosyal özellikler',
      'info'
    );
  };

  const showSystemInfo = () => {
    showAlert(
      '🔧 Sistem Bilgileri',
      'Uygulama Bilgileri:\n\n📱 Versiyon: 1.0.0\n🏗️ Build: 2025.01\n💾 Boyut: ~25 MB\n🔧 Platform: React Native\n📊 Framework: Expo\n\nCihaz Bilgileri:\n• React Native ile geliştirilmiştir\n• iOS ve Android desteklenir\n• Offline çalışır\n• Minimal depolama kullanır',
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
    versionBadge: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    versionBadgeText: {
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
        <Text style={dynamicStyles.headerTitle}>Uygulama</Text>
      </View>

      <ScrollView 
        style={dynamicStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            📱 Uygulama bilgilerini ve destek kaynaklarını buradan yönetin.
          </Text>
          <View style={dynamicStyles.versionBadge}>
            <Text style={dynamicStyles.versionBadgeText}>v1.0.0</Text>
          </View>
        </View>

        {/* Bildirimler bölümü kaldırıldı; tüm bildirim ayarları Bildirimler ekranında yönetilir */}

        {/* Uygulama Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Uygulama Bilgileri</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="information-circle" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Hakkında</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Uygulama hakkında detaylı bilgileri görüntüleyin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showAbout}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>ℹ️ Bilgiler</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="document-text" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Değişiklik Günlüğü</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Uygulamanın güncelleme geçmişini ve yeni özelliklerini görün.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showChangelog}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📝 Günlük</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="settings" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Sistem Bilgileri</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Teknik detaylar ve sistem gereksinimlerini görüntüleyin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showSystemInfo}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🔧 Sistem</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Değerlendirme & Paylaşım */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Değerlendirme & Paylaşım</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="star" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Uygulamayı Değerlendir</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              App Store'da 5 yıldız vererek bize destek olun!
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={rateApp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>⭐ Değerlendir</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="share" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Arkadaşlarla Paylaş</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Uygulamayı arkadaşlarınızla paylaşın.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={shareApp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📤 Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Geliştirici Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Geliştirici</Text>
          
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>
              👨‍💻 <Text style={{ fontWeight: '600' }}>Geliştirici:</Text> MSESOFT{'\n'}
              📧 <Text style={{ fontWeight: '600' }}>Email:</Text> msesoftware1425@gmail.com{'\n'}
              🌐 <Text style={{ fontWeight: '600' }}>Website:</Text> www.msesoftware.com{'\n'}
              📅 <Text style={{ fontWeight: '600' }}>Tarih:</Text> 2025{'\n\n'}
              
              Tüm hakları saklıdır.
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
