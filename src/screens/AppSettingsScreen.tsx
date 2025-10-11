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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModernToggle from '../components/ModernToggle';
import {
  requestNotificationPermission,
  saveNotificationSettings,
  scheduleMotivationNotifications,
  cancelMotivationNotifications,
} from '../services/motivationNotificationService';

interface AppSettingsScreenProps {
  navigation: any;
}

export default function AppSettingsScreen({ navigation }: AppSettingsScreenProps) {
  const { currentTheme } = useTheme();
  
  // Bildirim Ayarları
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [motivationSettings, setMotivationSettings] = useState({
    morningEnabled: true,
    lunchEnabled: true,
    eveningEnabled: true,
    morningTime: '08:00',
    lunchTime: '12:00',
    eveningTime: '18:00',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');
      const motivationStr = await AsyncStorage.getItem('motivationSettings');
      
      if (notifEnabled !== null) setNotificationsEnabled(JSON.parse(notifEnabled));
      if (motivationStr) setMotivationSettings(JSON.parse(motivationStr));
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const saveNotificationsEnabled = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
    if (value) {
      await requestNotificationPermission();
    }
  };

  const saveMotivationSettings = async (settings: typeof motivationSettings) => {
    setMotivationSettings(settings);
    await AsyncStorage.setItem('motivationSettings', JSON.stringify(settings));
    await saveNotificationSettings(settings);
    if (settings.morningEnabled || settings.lunchEnabled || settings.eveningEnabled) {
      await scheduleMotivationNotifications();
    } else {
      await cancelMotivationNotifications();
    }
  };

  const showAbout = () => {
    Alert.alert(
      'ℹ️ Hakkında',
      'Daily Diary App v1.0.0\n\nGünlük yazma alışkanlığı kazanmanız için tasarlanmış modern bir uygulamadır.\n\nGeliştirici: Merve Sude Borak\n© 2025\n\nİletişim: support@dailydiary.app',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      '❓ Yardım & Destek',
      'Sık Sorulan Sorular:\n\n❓ Nasıl günlük yazabilirim?\n• Ana sayfadaki "Günlük Yaz" butonuna basın\n\n❓ Verilerimi nasıl yedeklerim?\n• Ayarlar > Veri & Yedekleme bölümünden\n\n❓ Tema nasıl değiştiririm?\n• Ayarlar > Görünüm bölümünden\n\n❓ Bildirimleri nasıl ayarlarım?\n• Ayarlar > Bildirimler bölümünden\n\nDaha fazla yardım için: support@dailydiary.app',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const rateApp = () => {
    Alert.alert(
      '⭐ Uygulamayı Değerlendir',
      'Uygulamamızı beğendiyseniz, App Store\'da 5 yıldız vererek bize destek olabilirsiniz!\n\nDeğerlendirmeniz bizim için çok değerli! 🌟',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Değerlendir',
          style: 'default',
          onPress: () => {
            // App Store linkini aç
            const appStoreUrl = 'https://apps.apple.com/app/daily-diary-app/id1234567890';
            Linking.openURL(appStoreUrl).catch(() => {
              Alert.alert('Hata', 'App Store açılamadı');
            });
          }
        }
      ]
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Daily Diary App - Günlük yazma alışkanlığı kazanın! 📱✨\n\nApp Store\'dan indirin: https://apps.apple.com/app/daily-diary-app/id1234567890',
        title: 'Daily Diary App',
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında hata oluştu');
    }
  };

  const contactSupport = () => {
    Alert.alert(
      '📞 İletişim',
      'Bizimle iletişime geçin:\n\n📧 Email: support@dailydiary.app\n💬 Telegram: @dailydiaryapp\n🐦 Twitter: @dailydiaryapp\n\nSorularınız için 7/24 destek sağlıyoruz!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Email Gönder',
          style: 'default',
          onPress: () => {
            Linking.openURL('mailto:support@dailydiary.app?subject=Daily Diary App - Destek').catch(() => {
              Alert.alert('Hata', 'Email uygulaması açılamadı');
            });
          }
        }
      ]
    );
  };

  const showChangelog = () => {
    Alert.alert(
      '📝 Değişiklik Günlüğü',
      'Versiyon 1.0.0 (2025):\n\n✨ Yeni Özellikler:\n• Günlük yazma sistemi\n• Mood takibi\n• İstatistikler ve analizler\n• Hayaller & Hedefler panosu\n• Pomodoro timer\n• Tema sistemi\n\n🐛 Düzeltmeler:\n• Performans iyileştirmeleri\n• UI/UX geliştirmeleri\n• Bug düzeltmeleri\n\n🔮 Gelecek Güncellemeler:\n• Cloud senkronizasyon\n• Daha fazla tema\n• Sosyal özellikler',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const showSystemInfo = () => {
    Alert.alert(
      '🔧 Sistem Bilgileri',
      'Uygulama Bilgileri:\n\n📱 Versiyon: 1.0.0\n🏗️ Build: 2025.01\n💾 Boyut: ~25 MB\n🔧 Platform: React Native\n📊 Framework: Expo\n\nCihaz Bilgileri:\n• React Native ile geliştirilmiştir\n• iOS ve Android desteklenir\n• Offline çalışır\n• Minimal depolama kullanır',
      [{ text: 'Tamam', style: 'default' }]
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
      color: 'white',
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
      color: 'white',
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
            🔔 Bildirim tercihlerinizi, uygulama bilgilerini ve destek kaynaklarını buradan yönetin.
          </Text>
          <View style={dynamicStyles.versionBadge}>
            <Text style={dynamicStyles.versionBadgeText}>v1.0.0</Text>
          </View>
        </View>

        {/* Bildirimler */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Bildirimler</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="notifications" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Günlük Hatırlatma</Text>
              <ModernToggle
                value={notificationsEnabled}
                onValueChange={saveNotificationsEnabled}
                type="day"
              />
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Her gün günlük yazmanızı hatırlatır
            </Text>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="sunny" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Sabah Motivasyonu</Text>
              <ModernToggle
                value={motivationSettings.morningEnabled}
                onValueChange={(value) => saveMotivationSettings({...motivationSettings, morningEnabled: value})}
                type="day"
              />
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {motivationSettings.morningTime} - Güne pozitif başlangıç
            </Text>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="restaurant" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Öğle Motivasyonu</Text>
              <ModernToggle
                value={motivationSettings.lunchEnabled}
                onValueChange={(value) => saveMotivationSettings({...motivationSettings, lunchEnabled: value})}
                type="day"
              />
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {motivationSettings.lunchTime} - Gün ortası enerjisi
            </Text>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="moon" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Akşam Motivasyonu</Text>
              <ModernToggle
                value={motivationSettings.eveningEnabled}
                onValueChange={(value) => saveMotivationSettings({...motivationSettings, eveningEnabled: value})}
                type="day"
              />
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {motivationSettings.eveningTime} - Günü değerlendirme zamanı
            </Text>
          </View>
        </View>

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

        {/* Yardım & Destek */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Yardım & Destek</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="help-circle" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>Yardım & SSS</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Sık sorulan sorular ve kullanım rehberi.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showHelp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>❓ Yardım</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="mail" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>İletişim</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Sorularınız için bizimle iletişime geçin.
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={contactSupport}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📞 İletişim</Text>
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
              👨‍💻 <Text style={{ fontWeight: '600' }}>Geliştirici:</Text> Merve Sude Borak{'\n'}
              📧 <Text style={{ fontWeight: '600' }}>Email:</Text> merve@dailydiary.app{'\n'}
              🌐 <Text style={{ fontWeight: '600' }}>Website:</Text> dailydiary.app{'\n'}
              📅 <Text style={{ fontWeight: '600' }}>Tarih:</Text> 2025{'\n\n'}
              Bu uygulama React Native ve Expo ile geliştirilmiştir. 
              Tüm hakları saklıdır.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
