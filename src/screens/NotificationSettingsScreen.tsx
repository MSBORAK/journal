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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermissions,
  scheduleAllNotifications,
  cancelAllNotifications,
  NotificationSettings
} from '../services/notificationService';

interface NotificationSettingsScreenProps {
  navigation: any;
}

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    morningEnabled: true,
    morningTime: '09:00',
    eveningEnabled: true,
    eveningTime: '21:00',
    taskRemindersEnabled: true,
    achievementsEnabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    }
  };

  const handlePermissionRequest = async () => {
    try {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Bildirim İzni',
          'Bildirimler için izin gerekli. Lütfen ayarlardan bildirim iznini etkinleştirin.',
          [
            { text: 'Tamam', style: 'default' },
            { 
              text: 'Ayarlar', 
              style: 'default',
              onPress: () => {
                // TODO: Açık ayarlara yönlendirme
              }
            }
          ]
        );
      } else {
        Alert.alert('Başarılı', 'Bildirim izni verildi!');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert('Hata', 'Bildirim izni alınamadı');
    }
  };

  const testNotification = async () => {
    try {
      const { sendLocalNotification } = await import('../services/notificationService');
      await sendLocalNotification(
        '🔔 Test Bildirimi',
        'Bildirimler düzgün çalışıyor!',
        { type: 'test' }
      );
      Alert.alert('Başarılı', 'Test bildirimi gönderildi!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Hata', 'Test bildirimi gönderilemedi');
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
      color: 'white',
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
        <Text style={{ color: currentTheme.colors.text }}>Yükleniyor...</Text>
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
        <Text style={dynamicStyles.headerTitle}>🔔 Bildirimler</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Card */}
        <View style={dynamicStyles.permissionCard}>
          <Text style={dynamicStyles.permissionIcon}>🔔</Text>
          <Text style={dynamicStyles.permissionTitle}>Bildirim İzni</Text>
          <Text style={dynamicStyles.permissionDescription}>
            Günlük hatırlatıcılar ve motivasyon mesajları için bildirim izni gerekli
          </Text>
          <View style={dynamicStyles.statusIndicator}>
            <View style={[
              dynamicStyles.statusDot,
              { backgroundColor: settings.enabled ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={dynamicStyles.statusText}>
              {settings.enabled ? 'İzin Verildi' : 'İzin Gerekli'}
            </Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={handlePermissionRequest}
          >
            <Text style={dynamicStyles.actionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Genel Ayarlar */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>⚙️ Genel Ayarlar</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>Bildirimler</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Tüm bildirimleri aç/kapat
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

        {/* Günlük Hatırlatıcılar */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🌅 Günlük Hatırlatıcılar</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>Sabah Bildirimi</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Motivasyon mesajları ve günlük hatırlatıcılar
                </Text>
              </View>
              <Switch
                value={settings.morningEnabled}
                onValueChange={(value) => updateSetting('morningEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.morningEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
                disabled={!settings.enabled}
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
                <Text style={dynamicStyles.settingTitle}>Akşam Bildirimi</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Günlük özet ve akşam hatırlatıcıları
                </Text>
              </View>
              <Switch
                value={settings.eveningEnabled}
                onValueChange={(value) => updateSetting('eveningEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.eveningEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
                disabled={!settings.enabled}
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

        {/* Diğer Bildirimler */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>📋 Diğer Bildirimler</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>Görev Hatırlatıcıları</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Günlük görevler ve hatırlatıcılar için bildirimler
                </Text>
              </View>
              <Switch
                value={settings.taskRemindersEnabled}
                onValueChange={(value) => updateSetting('taskRemindersEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.taskRemindersEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
                disabled={!settings.enabled}
              />
            </View>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingRow}>
              <View style={dynamicStyles.settingLeft}>
                <Text style={dynamicStyles.settingTitle}>Başarı Bildirimleri</Text>
                <Text style={dynamicStyles.settingDescription}>
                  Streak, başarı rozetleri ve kutlamalar
                </Text>
              </View>
              <Switch
                value={settings.achievementsEnabled}
                onValueChange={(value) => updateSetting('achievementsEnabled', value)}
                trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary + '40' }}
                thumbColor={settings.achievementsEnabled ? currentTheme.colors.primary : currentTheme.colors.secondary}
                style={dynamicStyles.switch}
                disabled={!settings.enabled}
              />
            </View>
          </View>
        </View>

        {/* Test ve Yönetim */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🔧 Test & Yönetim</Text>
          
          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.actionButtonSecondary]}
            onPress={testNotification}
          >
            <Text style={[dynamicStyles.actionButtonText, dynamicStyles.actionButtonTextSecondary]}>
              📤 Test Bildirimi Gönder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.actionButton, dynamicStyles.actionButtonSecondary]}
            onPress={async () => {
              try {
                await scheduleAllNotifications();
                Alert.alert('Başarılı', 'Bildirimler yeniden planlandı');
              } catch (error) {
                Alert.alert('Hata', 'Bildirimler yeniden planlanamadı');
              }
            }}
          >
            <Text style={[dynamicStyles.actionButtonText, dynamicStyles.actionButtonTextSecondary]}>
              🔄 Bildirimleri Yenile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
