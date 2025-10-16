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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { resetOnboarding } from '../services/onboardingService';
import { resetAllTooltips } from '../services/tooltipService';

interface SettingsScreenProps {
  navigation: any;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  action?: () => void;
  color: string;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const { t, language } = useLanguage();

  // Avatar renk fonksiyonu
  const getAvatarColor = (name: string) => {
    const colors = [
      '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
      '#ef4444', '#06b6d4', '#84cc16', '#f97316',
    ];
    const firstChar = name.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Onboarding\'i Yeniden Göster',
      'İlk kullanım rehberini tekrar görmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              await resetOnboarding(user?.uid);
              Alert.alert('Başarılı', 'Uygulamayı yeniden başlatın ve onboarding\'i göreceksiniz.');
            } catch (error) {
              Alert.alert('Hata', 'Onboarding sıfırlanırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleResetTooltips = async () => {
    Alert.alert(
      'Tooltipleri Yeniden Göster',
      'Tüm ipuçlarını tekrar görmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              await resetAllTooltips(user?.uid);
              Alert.alert('Başarılı', 'Tooltipler sıfırlandı. Uygulamayı yeniden başlatın.');
            } catch (error) {
              Alert.alert('Hata', 'Tooltipler sıfırlanırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'theme',
      title: 'Tema Seçimi',
      subtitle: `Şu anki tema: ${currentTheme.name}`,
      icon: 'color-palette-outline',
      screen: 'ThemeSelection',
      color: currentTheme.colors.primary,
    },
    {
      id: 'language',
      title: 'Dil Seçimi',
      subtitle: language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English',
      icon: 'language-outline',
      screen: 'LanguageSelection',
      color: '#3b82f6',
    },
    {
      id: 'notifications',
      title: 'Bildirimler',
      subtitle: 'Günlük hatırlatıcılar ve bildirim ayarları',
      icon: 'notifications-outline',
      screen: 'NotificationSettings',
      color: '#f59e0b',
    },
    {
      id: 'account',
      title: 'Hesap Ayarları',
      subtitle: 'Profil, e-posta ve şifre ayarları',
      icon: 'person-outline',
      screen: 'AccountSettings',
      color: '#10b981',
    },
    {
      id: 'achievements',
      title: 'Başarılarım',
      subtitle: 'Rozetler ve başarılarım',
      icon: 'trophy-outline',
      screen: 'Achievements',
      color: '#FFD700',
    },
    {
      id: 'app',
      title: 'Uygulama Ayarları',
      subtitle: 'Diğer uygulama tercihleri',
      icon: 'settings-outline',
      screen: 'AppSettings',
      color: '#8b5cf6',
    },
    {
      id: 'privacy',
      title: 'Gizlilik ve Güvenlik',
      subtitle: 'Gizlilik tercihleri ve güvenlik ayarları',
      icon: 'shield-checkmark-outline',
      screen: 'PrivacySecuritySettings',
      color: '#f59e0b',
    },
    {
      id: 'backup',
      title: 'Veri Yedekleme',
      subtitle: 'Verilerinizi yedekleyin ve geri yükleyin',
      icon: 'cloud-upload-outline',
      screen: 'DataBackupSettings',
      color: '#06b6d4',
    },
    {
      id: 'help',
      title: 'Yardım & Kılavuz',
      subtitle: 'Hızlı başlangıç ve SSS',
      icon: 'help-buoy-outline',
      screen: 'HelpGuide',
      color: currentTheme.colors.primary,
    },
    {
      id: 'onboarding',
      title: 'Onboarding\'i Yeniden Göster',
      subtitle: 'İlk kullanım rehberini tekrar göster',
      icon: 'refresh-outline',
      action: handleResetOnboarding,
      color: '#8b5cf6',
    },
    {
      id: 'tooltips',
      title: 'Tooltipleri Yeniden Göster',
      subtitle: 'Tüm ipuçlarını tekrar göster',
      icon: 'help-circle-outline',
      action: handleResetTooltips,
      color: '#10b981',
    },
    {
      id: 'logout',
      title: 'Çıkış Yap',
      subtitle: 'Hesabınızdan güvenli bir şekilde çıkın',
      icon: 'log-out-outline',
      action: handleSignOut,
      color: '#ef4444',
    },
  ];

  const handleMenuPress = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.action) {
      item.action();
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 20,
    },
    userCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border + '30',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    menuSection: {
      padding: 20,
      paddingTop: 10,
    },
    menuItem: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: currentTheme.colors.border + '20',
      overflow: 'hidden',
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      gap: 16,
    },
    menuIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.9,
    },
    menuItemText: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    menuItemSubtitle: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      lineHeight: 18,
    },
    chevron: {
      opacity: 0.5,
    },
    appVersion: {
      padding: 20,
      alignItems: 'center',
    },
    versionText: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      opacity: 0.6,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>⚙️ Ayarlar</Text>

          {/* User Card */}
          <View style={dynamicStyles.userCard}>
            <View style={dynamicStyles.userInfo}>
              <View
                style={[
                  dynamicStyles.avatar,
                  { backgroundColor: getAvatarColor(user?.displayName || 'Kullanıcı') },
                ]}
              >
                <Text style={dynamicStyles.avatarText}>
                  {(user?.displayName || 'Kullanıcı').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={dynamicStyles.userDetails}>
                <Text style={dynamicStyles.userName}>
                  {user?.displayName || 'Kullanıcı'}
                </Text>
                <Text style={dynamicStyles.userEmail}>
                  {user?.email || 'email@example.com'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={dynamicStyles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={dynamicStyles.menuItem}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[item.color + '15', item.color + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={dynamicStyles.menuItemContent}>
                <View
                  style={[
                    dynamicStyles.menuIconContainer,
                    { backgroundColor: item.color + '20' },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={dynamicStyles.menuItemText}>
                  <Text style={dynamicStyles.menuItemTitle}>{item.title}</Text>
                  <Text style={dynamicStyles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={currentTheme.colors.secondary}
                  style={dynamicStyles.chevron}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Version */}
        <View style={dynamicStyles.appVersion}>
          <Text style={dynamicStyles.versionText}>Günlük v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
