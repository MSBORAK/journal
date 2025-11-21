import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
  sendLocalNotification,
  NotificationSettings
} from '../services/notificationService';
import { CustomAlert } from '../components/CustomAlert';
import { getButtonTextColor } from '../utils/colorUtils';

interface NotificationSettingsScreenProps {
  navigation: any;
}

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [systemPermissionGranted, setSystemPermissionGranted] = useState<boolean>(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    morningEnabled: true,
    morningTime: '09:00',
    eveningEnabled: true,
    eveningTime: '21:00',
    taskRemindersEnabled: true,
    achievementsEnabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quietHoursEnabled: false,
    quietStartTime: '23:00',
    quietEndTime: '07:00',
    weeklyMotivationEnabled: true,
    weekendMotivationEnabled: true,
    dailySummaryEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'warning' | 'error' | 'info',
  });

  // Notification permission = system permission + app settings
  const permissionGranted = systemPermissionGranted && settings.enabled;

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
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

  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setSystemPermissionGranted(status === 'granted');
    } catch (e) {
      setSystemPermissionGranted(false);
    }
  };

  const loadSettings = async () => {
    try {
      const loadedSettings = await loadNotificationSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    console.log('🔄 START - Updating setting:', key, '=', value);
    console.log('📋 Current settings before update:', settings);
    
    // Önce state'i hemen güncelle (UI responsive olsun)
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('✅ Haptic done');
      
      // AsyncStorage'a kaydet (arka planda)
      await saveNotificationSettings(newSettings, user?.uid);
      console.log('✅ Settings saved to storage successfully');
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
      console.error('❌ Error details:', JSON.stringify(error));
      // Hata olursa eski ayarlara geri dön
      setSettings(settings);
      showAlert(t('settings.error'), t('settings.reminderNotSaved'), 'error');
    }
  };

  const handlePermissionRequest = async () => {
    try {
      // Eğer uygulama ayarları kapalıysa, önce onları aç
      if (!settings.enabled) {
        await updateSetting('enabled', true);
        showAlert(
          t('settings.notificationsEnabled'),
          t('settings.notificationsEnabledDesc'),
          'success'
        );
        return;
      }

      // System permission check
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        showAlert(
          t('settings.permissionRequired'),
          t('settings.systemPermissionRequiredDesc'),
          'warning'
        );
      } else {
        showAlert(
          t('settings.success'),
          t('settings.permissionGrantedDesc'),
          'success'
        );
        await checkPermission();
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      showAlert(t('settings.error'), t('settings.notificationPermissionRequired'), 'error');
    }
  };

  const handleTestNotification = async () => {
    let userLanguage = 'tr';
    try {
      // Önce izin kontrolü yap
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          t('settings.permissionRequired'),
          t('settings.systemPermissionRequiredDesc'),
          'warning'
        );
        return;
      }

      const { getCurrentLanguage } = await import('../services/languageService');
      userLanguage = await getCurrentLanguage();
      
      let title, body;
      if (userLanguage === 'en') {
        title = 'Test Notification ✅';
        body = 'If you see this, notifications are working perfectly!';
      } else {
        title = 'Test Bildirimi ✅';
        body = 'Eğer bunu görüyorsan, bildirimler mükemmel çalışıyor!';
      }
      
      await sendLocalNotification(title, body, { type: 'test' }, 'default', true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showAlert(
        userLanguage === 'en' ? 'Test Sent!' : 'Test Gönderildi!',
        userLanguage === 'en' 
          ? 'Check your notification bar. If you see it, everything is working!'
          : 'Bildirim çubuğunu kontrol et. Eğer görüyorsan, her şey çalışıyor!',
        'success'
      );
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      
      // Daha spesifik hata mesajları
      let errorMessage = t('settings.notificationPermissionRequired');
      if (error?.message?.includes('bundle') || error?.message?.includes('LoadBundle')) {
        errorMessage = userLanguage === 'en' 
          ? 'Notification service is loading. Please try again in a moment.'
          : 'Bildirim servisi yükleniyor. Lütfen birkaç saniye sonra tekrar deneyin.';
      } else if (error?.message?.includes('permission')) {
        errorMessage = t('settings.systemPermissionRequiredDesc');
      }
      
      showAlert(
        t('settings.error'),
        errorMessage,
        'error'
      );
    }
  };


  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return { hours: parseInt(hours), minutes: parseInt(minutes) };
  };

  const adjustTime = (time: string, delta: number) => {
    const { hours, minutes } = parseTime(time);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + delta);
    
    const newHours = date.getHours().toString().padStart(2, '0');
    const newMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${newHours}:${newMinutes}`;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingLeft: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 8,
      minWidth: 80,
    },
    timeText: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    timeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '30',
    },
    actionButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    actionButtonSecondary: {
      backgroundColor: currentTheme.colors.card,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    actionButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '700',
    },
    actionButtonTextSecondary: {
      color: currentTheme.colors.primary,
    },
    permissionCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '30',
    },
    permissionIcon: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: 12,
    },
    permissionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    permissionDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: currentTheme.colors.text }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>🔔 {t('settings.notificationSettings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Card */}
          <View style={dynamicStyles.permissionCard}>
          <Text style={dynamicStyles.permissionIcon}>🔔</Text>
          <Text style={dynamicStyles.permissionTitle}>{t('settings.notificationPermission')}</Text>
          <Text style={dynamicStyles.permissionDescription}>
            {t('settings.notificationPermissionRequired')}
          </Text>
          <View style={dynamicStyles.statusIndicator}>
            <View style={[
              dynamicStyles.statusDot,
                { backgroundColor: permissionGranted ? currentTheme.colors.success : currentTheme.colors.danger }
            ]} />
            <Text style={dynamicStyles.statusText}>
              {permissionGranted 
                ? t('settings.permissionGranted')
                : !systemPermissionGranted 
                  ? t('settings.systemPermissionRequired')
                  : t('settings.appSettingsDisabled')
              }
            </Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={handlePermissionRequest}
          >
            <Text style={dynamicStyles.actionButtonText}>
              {!settings.enabled ? t('settings.enableNotifications') : t('settings.grantPermission')}
            </Text>
          </TouchableOpacity>
          
          {permissionGranted && (
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.actionButtonSecondary, { marginTop: 12 }]}
              onPress={handleTestNotification}
            >
              <Text style={[dynamicStyles.actionButtonText, dynamicStyles.actionButtonTextSecondary]}>
                {t('settings.sendTestNotification')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Genel Ayarlar */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.generalSettings')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.notificationSettings')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.turnAllNotifications')}
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.enabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>
        </View>

        {/* Daily Reminders */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.dailyRemindersTitle')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {settings.morningEnabled && (
                    <Ionicons 
                      name="sunny-outline" 
                      size={20} 
                      color={currentTheme.colors.primary} 
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={dynamicStyles.settingTitle}>{t('settings.morningNotification')}</Text>
                </View>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.motivationMessagesDaily')}
                </Text>
              </View>
              <Switch
                value={settings.morningEnabled}
                onValueChange={(value) => updateSetting('morningEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.morningEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
            
            {settings.morningEnabled && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginTop: 16 
              }}>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => updateSetting('morningTime', adjustTime(settings.morningTime, -15))}
                >
                  <Ionicons name="remove" size={20} color={currentTheme.colors.primary} />
                </TouchableOpacity>
                
                <View style={dynamicStyles.timeContainer}>
                  <Text style={dynamicStyles.timeText}>{formatTime(settings.morningTime)}</Text>
                </View>
                
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => updateSetting('morningTime', adjustTime(settings.morningTime, 15))}
                >
                  <Ionicons name="add" size={20} color={currentTheme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {settings.eveningEnabled && (
                    <Ionicons 
                      name="moon-outline" 
                      size={20} 
                      color={currentTheme.colors.primary} 
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={dynamicStyles.settingTitle}>{t('settings.eveningNotification')}</Text>
                </View>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.dailySummaryEvening')}
                </Text>
              </View>
              <Switch
                value={settings.eveningEnabled}
                onValueChange={(value) => updateSetting('eveningEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.eveningEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
            
            {settings.eveningEnabled && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginTop: 16 
              }}>
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => updateSetting('eveningTime', adjustTime(settings.eveningTime, -15))}
                >
                  <Ionicons name="remove" size={20} color={currentTheme.colors.primary} />
                </TouchableOpacity>
                
                <View style={dynamicStyles.timeContainer}>
                  <Text style={dynamicStyles.timeText}>{formatTime(settings.eveningTime)}</Text>
                </View>
                
                <TouchableOpacity
                  style={dynamicStyles.timeButton}
                  onPress={() => updateSetting('eveningTime', adjustTime(settings.eveningTime, 15))}
                >
                  <Ionicons name="add" size={20} color={currentTheme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Other Notifications */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>📋 {t('settings.otherNotificationsTitle')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.taskReminders')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.notificationsForTasks')}
                </Text>
              </View>
              <Switch
                value={settings.taskRemindersEnabled}
                onValueChange={(value) => updateSetting('taskRemindersEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.taskRemindersEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.achievementNotifications')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.streakAchievementBadges')}
                </Text>
              </View>
              <Switch
                value={settings.achievementsEnabled}
                onValueChange={(value) => updateSetting('achievementsEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.achievementsEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>
        </View>

        {/* Akıllı Bildirimler */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.smartNotifications')}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.weekdayMotivation')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.motivationMessagesWeekdays')}
                </Text>
              </View>
              <Switch
                value={settings.weeklyMotivationEnabled}
                onValueChange={(value) => updateSetting('weeklyMotivationEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.weeklyMotivationEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.weekendMotivation')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.relaxingMessagesWeekend')}
                </Text>
              </View>
              <Switch
                value={settings.weekendMotivationEnabled}
                onValueChange={(value) => updateSetting('weekendMotivationEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.weekendMotivationEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.dailySummaryNotification')}</Text>
                <Text style={dynamicStyles.settingDescription}>
                  {t('settings.endOfDaySummary')}
                </Text>
              </View>
              <Switch
                value={settings.dailySummaryEnabled}
                onValueChange={(value) => updateSetting('dailySummaryEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.dailySummaryEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>
          </View>
        </View>

        {/* Sessiz Saatler (DND) */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.silentHours')}</Text>
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>{t('settings.activateSilentHours')}</Text>
                <Text style={dynamicStyles.settingDescription}>{t('settings.noNotificationsInterval')}</Text>
              </View>
              <Switch
                value={settings.quietHoursEnabled}
                onValueChange={(v) => updateSetting('quietHoursEnabled', v)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.quietHoursEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
              />
            </View>

            {settings.quietHoursEnabled && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={dynamicStyles.settingTitle}>{t('settings.silentStart')}</Text>
                  <View style={dynamicStyles.timeContainer}>
                    <Text style={dynamicStyles.timeText}>{settings.quietStartTime}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={dynamicStyles.settingTitle}>{t('settings.silentEnd')}</Text>
                  <View style={dynamicStyles.timeContainer}>
                    <Text style={dynamicStyles.timeText}>{settings.quietEndTime}</Text>
                  </View>
                </View>
              </View>
            )}
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
