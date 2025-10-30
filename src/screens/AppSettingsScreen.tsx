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
      t('settings.aboutTitle'),
      t('settings.aboutContent'),
      'info'
    );
  };

  const showHelp = () => {
    showAlert(
      t('settings.helpSupportTitle'),
      t('settings.helpSupportContent'),
      'info'
    );
  };

  const rateApp = () => {
    showAlert(
      t('settings.rateAppTitle'),
      t('settings.rateAppContent'),
      'info'
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: t('settings.shareAppMessage'),
        title: 'Rhythm',
      });
    } catch (error) {
      showAlert(
        t('common.error'),
        t('settings.shareError'),
        'error'
      );
    }
  };

  const contactSupport = () => {
    showAlert(
      t('settings.contactTitle'),
      t('settings.contactContent'),
      'info'
    );
  };

  const showChangelog = () => {
    showAlert(
      t('settings.changelogTitle'),
      t('settings.changelogContent'),
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
        <Text style={dynamicStyles.headerTitle}>{t('settings.app')}</Text>
      </View>

      <ScrollView 
        style={dynamicStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            📱 {t('settings.manageAppInfo')}
          </Text>
          <View style={dynamicStyles.versionBadge}>
            <Text style={dynamicStyles.versionBadgeText}>v1.0.0</Text>
          </View>
        </View>

        {/* Bildirimler bölümü kaldırıldı; tüm bildirim ayarları Bildirimler ekranında yönetilir */}

        {/* Uygulama Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.applicationInformation')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="information-circle" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.about')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.viewAppDetails')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showAbout}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>ℹ️ {t('settings.information')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="document-text" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.changelog')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.viewUpdateHistory')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showChangelog}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📝 {t('settings.diary')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="settings" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.systemInfoTitle')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.viewTechnicalDetails')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showSystemInfo}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🔧 {t('settings.system')}</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Rate & Share */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.rateAndShare')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="star" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.rateAppTitle')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.rateAppDescription')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={rateApp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>⭐ {t('settings.rateAppButton')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="share" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.shareAppSection')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.shareAppDescription')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={shareApp}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📤 {t('settings.shareAppButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Geliştirici Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.developer')}</Text>
          
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>
              👨‍💻 <Text style={{ fontWeight: '600' }}>{t('settings.developer') + ':'}</Text> MSESOFT{'\n'}
              📧 <Text style={{ fontWeight: '600' }}>Email:</Text> msesoftware1425@gmail.com{'\n'}
              🌐 <Text style={{ fontWeight: '600' }}>Website:</Text> www.msesoftware.com{'\n'}
              📅 <Text style={{ fontWeight: '600' }}>{t('common.date') + ':'}</Text> 2025{'\n\n'}
              
              {t('settings.allRightsReserved')}
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
          text: t('common.ok'),
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}
