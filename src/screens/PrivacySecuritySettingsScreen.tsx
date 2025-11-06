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

interface PrivacySecuritySettingsScreenProps {
  navigation: any;
}

export default function PrivacySecuritySettingsScreen({ navigation }: PrivacySecuritySettingsScreenProps) {
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownloadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await BackupService.downloadUserData(user.uid);
      showAlert(t('settings.success'), t('settings.downloadAllPersonalData'));
    } catch (error) {
      showAlert(t('settings.error'), t('settings.shareError'));
    } finally {
      setLoading(false);
    }
  };

  const showPrivacyPolicy = () => {
    showAlert(
      t('settings.privacyPolicy'),
      t('settings.privacyPolicyContent'),
      'info'
    );
  };

  const showDataTransparency = () => {
    showAlert(
      t('settings.dataTransparency'),
      t('settings.dataTransparencyContent'),
      'info'
    );
  };

  const showTermsOfService = () => {
    showAlert(
      t('settings.termsOfService'),
      t('settings.termsOfServiceContent'),
      'info'
    );
  };

  const showSecurityInfo = () => {
    showAlert(
      t('settings.securityInformation'),
      t('settings.securityInformationContent'),
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
        <Text style={dynamicStyles.headerTitle}>{t('settings.privacySecurity')}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            🔒 {t('settings.privacySecurityInfo')} {t('settings.andUsedHere')}
          </Text>
          <View style={dynamicStyles.securityBadge}>
            <Text style={dynamicStyles.securityBadgeText}>{t('settings.secure')}</Text>
          </View>
        </View>

        {/* Gizlilik */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.privacy')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="shield-checkmark" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.privacyPolicy')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.learnDataProtection')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showPrivacyPolicy}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>{t('settings.view')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="eye" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.dataTransparency')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.seeDataUsageDetails')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showDataTransparency}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>{t('settings.details')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="download" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.downloadMyData')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.downloadAllPersonalData')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleDownloadData}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                {loading ? t('settings.downloading') : t('settings.download')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Güvenlik */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.security')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="lock-closed" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.securityInformation')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>{t('settings.viewTechnicalDetails')}</Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={showSecurityInfo}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>{t('settings.security')}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="document-text" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.termsOfService')}</Text>
            </View>
              <Text style={dynamicStyles.settingDescription}>{t('settings.viewUpdateHistory')}</Text>
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
          <Text style={dynamicStyles.sectionTitle}>{t('settings.security')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.security')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Tüm verileriniz end-to-end şifreleme ile korunuyor.
            </Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅</Text>
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="cloud-done" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.secureCloudTitle')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>{t('settings.secureCloudDesc')}</Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅ {t('settings.active')}</Text>
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.accessControlTitle')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>{t('settings.accessControlDesc')}</Text>
            <View style={dynamicStyles.securityBadge}>
              <Text style={dynamicStyles.securityBadgeText}>✅ {t('settings.active')}</Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.contactTitle')}</Text>
          
          <View style={dynamicStyles.infoCard}>
            <Text style={dynamicStyles.infoText}>{t('settings.contactContent')}</Text>
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
