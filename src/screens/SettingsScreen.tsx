import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// import { View } from 'moti'; // Removed for now
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { CustomAlert } from '../components/CustomAlert';
import { 
  sendLocalNotification, 
  listScheduledNotifications,
  scheduleAllNotifications,
  cancelAllNotifications 
} from '../services/notificationService';
import * as Notifications from 'expo-notifications';

interface SettingsScreenProps {
  navigation: any;
}

interface Theme {
  name: string;
  label: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    accent: string;
    secondary: string;
  };
}

interface FontOption {
  name: string;
  label: string;
  size: number;
  weight: 'normal' | 'bold';
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { user, signOut } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const [reminderTime, setReminderTime] = useState('21:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.name);
  const [loading, setLoading] = useState(false);

  const [selectedFont, setSelectedFont] = useState('system');
  const [notificationSound, setNotificationSound] = useState('default');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartTime, setQuietStartTime] = useState('22:00');
  const [quietEndTime, setQuietEndTime] = useState('08:00');
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showFocusTimeModal, setShowFocusTimeModal] = useState(false);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 dakika saniye cinsinden
  const [focusTimerId, setFocusTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Custom Alert States
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    primaryButton: null as any,
    secondaryButton: null as any,
  });

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
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 20,
    },
    userCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    userEmail: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 4,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      marginHorizontal: 20,
    },
    settingItem: {
      backgroundColor: currentTheme.colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.colors.text,
    },
    settingDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    timeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginHorizontal: 4,
      backgroundColor: currentTheme.colors.background,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    timeButtonSelected: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    timeButtonText: {
      fontSize: 14,
      color: currentTheme.colors.text,
    },
    timeButtonTextSelected: {
      color: 'white',
      fontWeight: '500',
    },
    signOutButton: {
      backgroundColor: '#ef4444',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 20,
      marginTop: 20,
    },
    signOutText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
    },
    themeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      paddingHorizontal: 20,
    },
    themeOption: {
      flex: 1,
      minWidth: '45%',
      aspectRatio: 1.5,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
    },
    themeOptionSelected: {
      borderColor: currentTheme.colors.primary,
      borderWidth: 3,
    },
    themePreview: {
      width: '100%',
      height: '60%',
      borderRadius: 8,
      marginBottom: 8,
    },
    themeLabel: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    fontContainer: {
      paddingHorizontal: 20,
    },
    fontOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: currentTheme.colors.card,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    fontOptionSelected: {
      borderColor: currentTheme.colors.primary,
      borderWidth: 2,
      backgroundColor: currentTheme.colors.primary + '10',
    },
    fontOptionLeft: {
      flex: 1,
    },
    fontOptionName: {
      fontSize: 16,
      color: currentTheme.colors.text,
    },
    fontOptionDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    fontPreview: {
      fontSize: 18,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    settingText: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    timePickerContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    timePickerLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    timePicker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    timeOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    selectedTimeOption: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    timeOptionText: {
      fontSize: 14,
      color: currentTheme.colors.text,
    },
    selectedTimeOptionText: {
      color: 'white',
      fontWeight: '500',
    },
    themeSelector: {
      paddingHorizontal: 20,
    },
    selectedThemeOption: {
      borderColor: currentTheme.colors.primary,
      borderWidth: 3,
    },
    selectedThemeLabel: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    themeCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fontSelector: {
      paddingHorizontal: 20,
    },
    selectedFontOption: {
      borderColor: currentTheme.colors.primary,
      borderWidth: 2,
      backgroundColor: currentTheme.colors.primary + '10',
    },
    selectedFontPreview: {
      color: currentTheme.colors.primary,
    },
    fontIcon: {
      fontSize: 18,
      color: currentTheme.colors.primary,
    },
    signOutContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    modalCloseButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
    },
    modalContent: {
      padding: 20,
    },
    // Sound Options
    soundOption: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.background,
    },
    selectedSoundOption: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    soundLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    selectedSoundLabel: {
      color: currentTheme.colors.primary,
    },
    soundDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    selectedSoundDescription: {
      color: currentTheme.colors.secondary,
    },
    // Quiet Hours
    quietHoursToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
    },
    quietHoursLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    timeSelector: {
      marginBottom: 20,
    },
    timeSelectorLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    timeOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    saveButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    soundActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    soundTestButton: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    soundTestButtonText: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    progressCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    progressItem: {
      marginBottom: 16,
    },
    progressLabel: {
      fontSize: 14,
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
    },
    progressValue: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 4,
      textAlign: 'right',
    },
    achievementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    achievementCard: {
      width: '48%',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    achievementIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    achievementTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    achievementDesc: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    reportCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    reportTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    reportStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    reportItem: {
      alignItems: 'center',
    },
    reportNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    reportLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    reportInsight: {
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 12,
      padding: 16,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    insightText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      lineHeight: 20,
    },
    focusCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
    },
    focusTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    focusTimer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    focusTime: {
      fontSize: 48,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    focusLabel: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
    },
    focusStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 20,
    },
    focusItem: {
      alignItems: 'center',
    },
    focusNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    focusDesc: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    startFocusButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    // Test Buttons Styles
    testButtonsContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderStyle: 'dashed',
    },
    testSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.primary,
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      gap: 8,
    },
    testButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    startFocusText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    focusStatus: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '500',
    },
    focusButtonContainer: {
      width: '100%',
    },
  });

  const fontOptions: FontOption[] = [
    {
      name: 'system',
      label: 'Sistem Varsayılanı',
      size: 16,
      weight: 'normal',
    },
    {
      name: 'large',
      label: 'Büyük',
      size: 18,
      weight: 'normal',
    },
    {
      name: 'small',
      label: 'Küçük',
      size: 14,
      weight: 'normal',
    },
    {
      name: 'bold',
      label: 'Kalın',
      size: 16,
      weight: 'bold',
    },
  ];


  const getCurrentFont = () => {
    return fontOptions.find(font => font.name === selectedFont) || fontOptions[0];
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedReminderTime = await AsyncStorage.getItem('reminderTime');
      const storedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const storedTheme = await AsyncStorage.getItem('selectedTheme');
      const storedFont = await AsyncStorage.getItem('selectedFont');

      if (storedReminderTime) setReminderTime(storedReminderTime);
      if (storedNotifications !== null) setNotificationsEnabled(JSON.parse(storedNotifications));
      if (storedTheme) setSelectedTheme(storedTheme);
      if (storedFont) setSelectedFont(storedFont);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveReminderTime = async (time: string) => {
    try {
      await AsyncStorage.setItem('reminderTime', time);
      setReminderTime(time);
    } catch (error) {
      console.error('Error saving reminder time:', error);
    }
  };

  const notificationSounds = [
    { name: 'default', label: '🔔 Varsayılan', description: 'Sistem bildirim sesi' },
    { name: 'gentle', label: '🌸 Nazik Hatırlatma', description: 'Yumuşak bildirim sesi' },
    { name: 'task', label: '🔔 Görev Hatırlatması', description: 'Dikkat çekici ses' },
    { name: 'achievement', label: '🎊 Başarı Sesi', description: 'Kutlama sesi' },
    { name: 'silent', label: '🔇 Sessiz', description: 'Sadece titreşim' },
  ];

  const playNotificationSound = async (soundType: string) => {
    try {
      console.log('🔊 Testing sound:', soundType);
      
      // Önce bildirim izni kontrol et
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          '⚠️ İzin Gerekli',
          'Bildirim izni verilmedi. Lütfen ayarlardan izin verin.',
          'warning',
          {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          }
        );
        return;
      }

      // Sessiz seçenek için sadece haptic
      if (soundType === 'silent') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showAlert(
          '🔇 Sessiz',
          'Sadece titreşim - ses yok',
          'info',
          {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          }
        );
        return;
      }

      // Gerçek bildirim gönder (ses ile)
      let channelId = 'gentle-reminders';
      let title = '🔊 Ses Testi';
      let body = `${soundType} sesi test ediliyor...`;

      switch (soundType) {
        case 'default':
          channelId = 'default';
          title = '🔔 Varsayılan Ses';
          body = 'Sistem bildirim sesi test ediliyor';
          break;
        case 'gentle':
          channelId = 'gentle-reminders';
          title = '🌸 Nazik Hatırlatma';
          body = 'Yumuşak bildirim sesi test ediliyor';
          break;
        case 'task':
          channelId = 'task-reminders';
          title = '🔔 Görev Hatırlatması';
          body = 'Dikkat çekici ses test ediliyor';
          break;
        case 'achievement':
          channelId = 'achievements';
          title = '🎊 Başarı Sesi';
          body = 'Kutlama sesi test ediliyor';
          break;
      }

      // Test bildirimi gönder
      await sendLocalNotification(title, body, { type: 'sound-test', soundType }, channelId);
      
      // Haptic feedback de ekle
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Başarılı test mesajı
      showAlert(
        '🔊 Test Gönderildi',
        `${soundType} sesi test bildirimi gönderildi! Birkaç saniye içinde duyacaksın.`,
        'success',
        {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
      
    } catch (error) {
      console.error('Ses test hatası:', error);
      showAlert(
        '❌ Test Hatası',
        `Ses test edilemedi: ${error}`,
        'error',
        {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
    }
  };

  const saveNotificationSound = async (sound: string) => {
    try {
      console.log('🔊 Saving notification sound:', sound);
      console.log('🔍 Modal states before:', { showSoundModal, showCustomAlert });
      
      // Modal'ı hemen kapat
      setShowSoundModal(false);
      console.log('🔍 Modal closed');
      
      // AsyncStorage işlemini ayrı thread'e at
      await new Promise(res => setTimeout(res, 100));
      await AsyncStorage.setItem('notificationSound', sound);
      setNotificationSound(sound);
      
      console.log('🔊 Sound saved successfully:', sound);
      console.log('🔍 Modal states after save:', { showSoundModal, showCustomAlert });
      
      // Alert'i güvenli şekilde göster
      setTimeout(() => {
        console.log('🔍 Showing alert after timeout');
        showAlert('✅ Başarılı!', `${sound} sesi seçildi`, 'success', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
      }, 300);
      
    } catch (error) {
      console.error('❌ Error saving notification sound:', error);
      
      // Hata durumunda da güvenli alert
      setTimeout(() => {
        showAlert('❌ Hata', `Ses kaydedilemedi`, 'error', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
      }, 300);
    }
  };

  const saveQuietHours = async () => {
    setShowQuietHoursModal(false);
    try {
      await AsyncStorage.setItem('quietHoursEnabled', quietHoursEnabled.toString());
      await AsyncStorage.setItem('quietStartTime', quietStartTime);
      await AsyncStorage.setItem('quietEndTime', quietEndTime);
    } catch (error) {
      console.error('Error saving quiet hours:', error);
    }
  };

  const startFocusSession = () => {
    setIsFocusActive(true);
    
    // Eğer focusTime 0 ise yeni oturum, değilse devam et
    if (focusTime === 0) {
      setFocusTime(25 * 60); // Yeni 25 dakikalık oturum
    }
    
    // Önceki timer'ı temizle
    if (focusTimerId) {
      clearInterval(focusTimerId);
    }
    
    // Yeni timer başlat
    const timer = setInterval(() => {
      setFocusTime((prevTime) => {
        if (prevTime <= 1) {
          // Süre bitti
          clearInterval(timer);
          setFocusTimerId(null);
          setIsFocusActive(false);
          showAlert(
            '🎉 Odaklanma Tamamlandı!',
            '25 dakikalık odaklanma süreniz bitti. Şimdi 5 dakika mola verebilirsiniz!',
            'success',
            {
              text: '☕ Mola Ver',
              onPress: () => {
                setShowCustomAlert(false);
                startBreak();
              },
              style: 'primary'
            },
            {
              text: '🔄 Yeni Oturum',
              onPress: () => {
                setShowCustomAlert(false);
                setFocusTime(25 * 60);
                startFocusSession();
              },
              style: 'secondary'
            }
          );
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setFocusTimerId(timer);
  };

  const startBreak = () => {
    setIsFocusActive(true);
    setFocusTime(5 * 60); // 5 dakika mola
    
    // Önceki timer'ı temizle
    if (focusTimerId) {
      clearInterval(focusTimerId);
    }
    
    const timer = setInterval(() => {
      setFocusTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setFocusTimerId(null);
          setIsFocusActive(false);
          showAlert(
            '☕ Mola Bitti!',
            'Mola süreniz tamamlandı. Yeni bir odaklanma oturumu başlatabilirsiniz!',
            'success',
            {
              text: '🚀 Başla',
              onPress: () => {
                setShowCustomAlert(false);
                startFocusSession();
              },
              style: 'primary'
            }
          );
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setFocusTimerId(timer);
  };

  const stopFocusSession = () => {
    // Timer'ı durdur ama focusTime'ı koru
    if (focusTimerId) {
      clearInterval(focusTimerId);
      setFocusTimerId(null);
    }
    setIsFocusActive(false);
    showAlert(
      '⏸️ Odaklanma Duraklatıldı',
      'Odaklanma oturumunuz duraklatıldı. Devam etmek için "Başlat" butonuna basın.',
      'info',
      {
        text: '▶️ Devam Et',
        onPress: () => {
          setShowCustomAlert(false);
          startFocusSession();
        },
        style: 'primary'
      },
      {
        text: '🔄 Sıfırla',
        onPress: () => {
          setShowCustomAlert(false);
          resetFocusSession();
        },
        style: 'secondary'
      }
    );
  };

  const resetFocusSession = () => {
    // Timer'ı durdur ve sıfırla
    if (focusTimerId) {
      clearInterval(focusTimerId);
      setFocusTimerId(null);
    }
    setIsFocusActive(false);
    setFocusTime(25 * 60);
    showAlert(
      '🔄 Oturum Sıfırlandı',
      'Odaklanma oturumunuz sıfırlandı. Yeni bir oturum başlatabilirsiniz.',
      'success',
      {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      }
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showAlert = React.useCallback((title: string, message: string, type: 'success' | 'warning' | 'error' | 'info', primaryButton?: any, secondaryButton?: any) => {
    console.log('🔔 showAlert called:', { title, message, type });
    setAlertConfig({
      title,
      message,
      type,
      primaryButton,
      secondaryButton,
    });
    setShowCustomAlert(true);
  }, []);

  const saveNotificationsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  const saveTheme = async (themeName: string) => {
    try {
      await setTheme(themeName);
      setSelectedTheme(themeName);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const saveFont = async (fontName: string) => {
    try {
      await AsyncStorage.setItem('selectedFont', fontName);
      setSelectedFont(fontName);
    } catch (error) {
      console.error('Error saving font:', error);
    }
  };

  const handleSignOut = async () => {
    showAlert(
      '🚪 Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      'warning',
      {
        text: '✅ Çıkış Yap',
        onPress: async () => {
          setShowCustomAlert(false);
          setLoading(true);
          try {
            await signOut();
          } catch (error) {
            setLoading(false);
            showAlert('Hata', 'Çıkış yapılırken bir hata oluştu', 'error', {
              text: 'Tamam',
              onPress: () => setShowCustomAlert(false),
              style: 'primary'
            });
          }
        },
        style: 'danger'
      },
      {
        text: '❌ İptal',
        onPress: () => setShowCustomAlert(false),
        style: 'secondary'
      }
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    rightComponent, 
    onPress 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={dynamicStyles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={dynamicStyles.settingLeft}>
        <View style={dynamicStyles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#a855f7" />
        </View>
        <View style={dynamicStyles.settingContent}>
          <Text style={dynamicStyles.settingTitle}>{title}</Text>
          {subtitle && <Text style={dynamicStyles.settingDescription}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  const TimePicker = () => (
    <View style={dynamicStyles.timePickerContainer}>
      <Text style={dynamicStyles.timePickerLabel}>Hatırlatma Saati</Text>
      <View style={dynamicStyles.timePicker}>
        {['18:00', '19:00', '20:00', '21:00', '22:00'].map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              dynamicStyles.timeOption,
              reminderTime === time && dynamicStyles.selectedTimeOption,
            ]}
            onPress={() => saveReminderTime(time)}
          >
            <Text style={[
              dynamicStyles.timeOptionText,
              reminderTime === time && dynamicStyles.selectedTimeOptionText,
            ]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ThemeSelector = () => (
    <View style={dynamicStyles.themeSelector}>
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.name}
          style={[
            dynamicStyles.themeOption,
            selectedTheme === theme.name && dynamicStyles.selectedThemeOption,
          ]}
          onPress={() => saveTheme(theme.name)}
        >
          <View style={[dynamicStyles.themePreview, { backgroundColor: theme.colors.primary }]} />
          <Text style={[
            dynamicStyles.themeLabel,
            selectedTheme === theme.name && dynamicStyles.selectedThemeLabel,
          ]}>
            {theme.label}
          </Text>
          {selectedTheme === theme.name && (
            <View style={dynamicStyles.themeCheck}>
              <Ionicons name="checkmark" size={20} color={currentTheme.colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const FontSelector = () => (
    <View style={dynamicStyles.fontSelector}>
      {fontOptions.map((font) => (
        <TouchableOpacity
          key={font.name}
          style={[
            dynamicStyles.fontOption,
            selectedFont === font.name && dynamicStyles.selectedFontOption,
          ]}
          onPress={() => saveFont(font.name)}
        >
          <Text style={[
            dynamicStyles.fontPreview,
            { 
              fontSize: font.size,
              fontWeight: font.weight,
            },
            selectedFont === font.name && dynamicStyles.selectedFontPreview,
          ]}>
            {font.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Ayarlar</Text>
        
        <View style={dynamicStyles.userCard}>
          <View style={dynamicStyles.userInfo}>
            <Text style={dynamicStyles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
            <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>🔔 Bildirimler</Text>
        
        <SettingItem
          icon="notifications-outline"
          title="Günlük Hatırlatma"
          subtitle="Her gün günlük yazmanızı hatırlatır"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={saveNotificationsEnabled}
              trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
              thumbColor={notificationsEnabled ? 'white' : currentTheme.colors.secondary}
            />
          }
        />
        
        {notificationsEnabled && (
          <>
            <View style={{ marginTop: 12 }}>
              <TimePicker />
            </View>
            
            <SettingItem
              icon="moon-outline"
              title="Sessiz Saatler"
              subtitle="Belirli saatlerde bildirimleri sustur"
              onPress={() => setShowQuietHoursModal(true)}
            />
            
            <SettingItem
              icon="vibrate-outline"
              title="Titreşim"
              subtitle="Bildirimlerde titreşim kullan"
              rightComponent={
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
                  thumbColor={'white'}
                />
              }
            />
            
            <SettingItem
              icon="musical-notes-outline"
              title="Bildirim Sesi"
              subtitle="Bildirim sesini değiştir"
              onPress={() => setShowSoundModal(true)}
            />

            {/* Test Butonları - Geliştirme için */}
            <View style={dynamicStyles.testButtonsContainer}>
              <Text style={dynamicStyles.testSectionTitle}>🧪 Test Araçları</Text>
              
              <TouchableOpacity
                style={dynamicStyles.testButton}
                activeOpacity={0.7}
                onPress={async () => {
                  console.log('🔴 TEST BUTONU ÇALIŞTI!');
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  
                  try {
                    console.log('Sending test notification...');
                    
                    // İzin kontrol et
                    const { status } = await Notifications.getPermissionsAsync();
                    console.log('Permission status:', status);
                    
                    if (status !== 'granted') {
                      // İzin iste
                      console.log('Requesting notification permission...');
                      const { status: newStatus } = await Notifications.requestPermissionsAsync();
                      console.log('New permission status:', newStatus);
                      
                      if (newStatus !== 'granted') {
                        showAlert('⚠️ İzin Gerekli', 'Bildirim izni verilmedi. Lütfen:\n\n1. Settings → Notifications → Daily App\n2. Allow Notifications → ON', 'warning', {
                          text: 'Tamam',
                          onPress: () => setShowCustomAlert(false),
                          style: 'primary'
                        });
                        return;
                      }
                    }
                    
                    // Test bildirimi gönder - farklı kanallar test et
                    const testChannels = ['default', 'gentle-reminders', 'task-reminders', 'achievements'];
                    const randomChannel = testChannels[Math.floor(Math.random() * testChannels.length)];
                    
                    await sendLocalNotification(
                      '🧪 Test Bildirimi',
                      `Bu bir test bildirimidir. Kanal: ${randomChannel}`,
                      { type: 'test', channel: randomChannel },
                      randomChannel
                    );
                    
                    // Haptic feedback
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    
                    console.log('Test notification sent!');
                    
                    // Alert'i gecikmeyle göster - donmayı önle
                    setTimeout(() => {
                      showAlert('✅ Başarılı!', 'Test bildirimi gönderildi. Birkaç saniye içinde görmelisin.', 'success', {
                        text: 'Tamam',
                        onPress: () => setShowCustomAlert(false),
                        style: 'primary'
                      });
                    }, 500);
                  } catch (error) {
                    console.error('Test notification error:', error);
                    
                    // Hata alert'i de gecikmeyle göster
                    setTimeout(() => {
                      showAlert('❌ Hata', 'Test bildirimi gönderilemedi: ' + error, 'error', {
                        text: 'Tamam',
                        onPress: () => setShowCustomAlert(false),
                        style: 'primary'
                      });
                    }, 500);
                  }
                }}
              >
                <Ionicons name="send" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Test Bildirimi Gönder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.testButton, { backgroundColor: '#8b5cf6' }]}
                activeOpacity={0.7}
                onPress={async () => {
                  console.log('🟣 LİSTE BUTONU ÇALIŞTI!');
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    console.log('Listing scheduled notifications...');
                    const notifications = await listScheduledNotifications();
                    console.log('Found notifications:', notifications);
                    setTimeout(() => {
                      showAlert(
                        '📋 Planlı Bildirimler', 
                        notifications.length > 0 
                          ? `${notifications.length} adet planlı bildirim var. Console'da detayları görebilirsin.` 
                          : 'Hiç planlı bildirim yok.',
                        'info',
                        {
                          text: 'Tamam',
                          onPress: () => setShowCustomAlert(false),
                          style: 'primary'
                        }
                      );
                    }, 300);
                  } catch (error) {
                    console.error('List notifications error:', error);
                    setTimeout(() => {
                      showAlert('❌ Hata', 'Bildirimler listelenemedi: ' + error, 'error', {
                        text: 'Tamam',
                        onPress: () => setShowCustomAlert(false),
                        style: 'primary'
                      });
                    }, 300);
                  }
                }}
              >
                <Ionicons name="list" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Planlı Bildirimleri Listele</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.testButton, { backgroundColor: '#10b981' }]}
                activeOpacity={0.7}
                onPress={async () => {
                  console.log('🟢 YENİDEN PLANLA BUTONU ÇALIŞTI!');
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    console.log('Rescheduling all notifications...');
                    await scheduleAllNotifications();
                    console.log('All notifications rescheduled!');
                    showAlert('✅ Başarılı!', 'Tüm bildirimler yeniden planlandı.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  } catch (error) {
                    console.error('Reschedule error:', error);
                    showAlert('❌ Hata', 'Bildirimler yeniden planlanamadı: ' + error, 'error', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }
                }}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Bildirimleri Yeniden Planla</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.testButton, { backgroundColor: '#ef4444' }]}
                activeOpacity={0.7}
                onPress={async () => {
                  console.log('🔴 İPTAL BUTONU ÇALIŞTI!');
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  try {
                    console.log('Cancelling all notifications...');
                    await cancelAllNotifications();
                    console.log('All notifications cancelled!');
                    showAlert('✅ Başarılı!', 'Tüm bildirimler iptal edildi.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  } catch (error) {
                    console.error('Cancel error:', error);
                    showAlert('❌ Hata', 'Bildirimler iptal edilemedi: ' + error, 'error', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }
                }}
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Tüm Bildirimleri İptal Et</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Görünüm</Text>
        
        <SettingItem
          icon="color-palette-outline"
          title="Tema"
          subtitle="Uygulama temasını seçin"
          onPress={() => navigation.navigate('ThemeSelection' as never)}
        />
        
        <SettingItem
          icon="text-outline"
          title="Yazı Tipi"
          subtitle="Metin boyutu ve stilini seçin"
          onPress={() => navigation.navigate('FontSelection' as never)}
        />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Sağlık</Text>
        
        <SettingItem
          icon="heart-outline"
          title="Sağlık Takibi"
          subtitle="Su, egzersiz, uyku ve diğer wellness metrikleri"
          onPress={() => navigation.navigate('WellnessTracking' as never)}
        />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>🎯 Üretkenlik</Text>
        
        <SettingItem
          icon="trending-up-outline"
          title="İlerleme Takibi"
          subtitle="Günlük hedeflerinizi ve ilerlemenizi görün"
          onPress={() => setShowProgressModal(true)}
        />
        
        <SettingItem
          icon="trophy-outline"
          title="Başarılarım"
          subtitle="Kazanılan rozetler ve başarılar"
          onPress={() => setShowAchievementsModal(true)}
        />
        
        <SettingItem
          icon="calendar-outline"
          title="Haftalık Rapor"
          subtitle="Haftalık aktivite ve mood raporu"
          onPress={() => setShowWeeklyReportModal(true)}
        />
        
        <SettingItem
          icon="time-outline"
          title="Odaklanma Süresi"
          subtitle="Günlük yazma ve üretkenlik sürenizi takip edin"
          onPress={() => setShowFocusTimeModal(true)}
        />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Veri & Yedekleme</Text>
        
        <SettingItem
          icon="cloud-upload-outline"
          title="Veri Yedekleme"
          subtitle="Günlüklerinizi buluta yedekleyin"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="cloud-download-outline"
          title="Veri Geri Yükleme"
          subtitle="Yedeklenen verilerinizi geri yükleyin"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Veri Temizleme"
          subtitle="Tüm verilerinizi silin"
          onPress={() => {}}
        />
      </View>


      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Hesap</Text>
        
        <SettingItem
          icon="person-outline"
          title="Profil Bilgileri"
          subtitle="Ad, email ve profil fotoğrafı"
          onPress={() => showAlert('Profil Bilgileri', 'Bu özellik yakında eklenecek!', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="mail-outline"
          title="Email Değiştir"
          subtitle="Hesap email adresinizi değiştirin"
          onPress={() => showAlert('Email Değiştir', 'Bu özellik yakında eklenecek!', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="key-outline"
          title="Şifre Değiştir"
          subtitle="Hesap şifrenizi güncelleyin"
          onPress={() => showAlert('Şifre Değiştir', 'Bu özellik yakında eklenecek!', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="shield-checkmark-outline"
          title="Hesap Güvenliği"
          subtitle="2FA ve güvenlik ayarları"
          onPress={() => showAlert('Hesap Güvenliği', 'Bu özellik yakında eklenecek!', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="download-outline"
          title="Verilerimi İndir"
          subtitle="Tüm günlük verilerinizi JSON formatında indirin"
          onPress={() => showAlert('Veri İndirme', 'Bu özellik yakında eklenecek!', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Hesabı Sil"
          subtitle="Tüm verilerinizi kalıcı olarak silin"
          onPress={() => showAlert(
            '⚠️ Hesap Silme',
            'Bu işlem geri alınamaz! Tüm günlük verileriniz kalıcı olarak silinecek. Devam etmek istediğinizden emin misiniz?',
            'error',
            {
              text: '✅ Evet, Sil',
              onPress: () => {
                setShowCustomAlert(false);
                showAlert(
                  '✅ Hesap Silindi',
                  'Hesabınız başarıyla silindi.',
                  'success',
                  {
                    text: 'Tamam',
                    onPress: () => setShowCustomAlert(false),
                    style: 'primary'
                  }
                );
              },
              style: 'danger'
            },
            {
              text: '❌ İptal',
              onPress: () => setShowCustomAlert(false),
              style: 'secondary'
            }
          )}
        />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Uygulama</Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="Hakkında"
          subtitle="Versiyon 1.0.0 - Daily Diary App"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="help-circle-outline"
          title="Yardım & Destek"
          subtitle="SSS ve teknik destek"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="star-outline"
          title="Uygulamayı Değerlendir"
          subtitle="App Store'da değerlendirme yapın"
          onPress={() => {}}
        />
        
        <SettingItem
          icon="share-outline"
          title="Arkadaşlarla Paylaş"
          subtitle="Uygulamayı arkadaşlarınızla paylaşın"
          onPress={() => {}}
        />
      </View>

      <View style={dynamicStyles.signOutContainer}>
        <TouchableOpacity
          style={dynamicStyles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={dynamicStyles.signOutText}>
            {loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bildirim Sesi Modal */}
      <Modal
        visible={showSoundModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSoundModal(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSoundModal(false)}
        >
          <TouchableOpacity
            style={dynamicStyles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>🔔 Bildirim Sesi</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowSoundModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              {notificationSounds.map((sound) => (
                <TouchableOpacity
                  key={sound.name}
                  style={[
                    dynamicStyles.soundOption,
                    notificationSound === sound.name && dynamicStyles.selectedSoundOption
                  ]}
                  onPress={() => saveNotificationSound(sound.name)}
                >
                  <Text style={[
                    dynamicStyles.soundLabel,
                    notificationSound === sound.name && dynamicStyles.selectedSoundLabel
                  ]}>
                    {sound.label}
                  </Text>
                  <Text style={[
                    dynamicStyles.soundDescription,
                    notificationSound === sound.name && dynamicStyles.selectedSoundDescription
                  ]}>
                    {sound.description}
                  </Text>
                  <View style={dynamicStyles.soundActions}>
                    <TouchableOpacity
                      style={dynamicStyles.testButton}
                      onPress={() => playNotificationSound(sound.name)}
                    >
                      <Text style={dynamicStyles.testButtonText}>🔊 Test</Text>
                    </TouchableOpacity>
                    {notificationSound === sound.name && (
                      <Ionicons name="checkmark" size={20} color={currentTheme.colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Sessiz Saatler Modal */}
      <Modal
        visible={showQuietHoursModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>🌙 Sessiz Saatler</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowQuietHoursModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.quietHoursToggle}>
                <Text style={dynamicStyles.quietHoursLabel}>Sessiz Saatleri Etkinleştir</Text>
                <Switch
                  value={quietHoursEnabled}
                  onValueChange={setQuietHoursEnabled}
                  trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
                  thumbColor={quietHoursEnabled ? 'white' : currentTheme.colors.secondary}
                />
              </View>

              {quietHoursEnabled && (
                <>
                  <View style={dynamicStyles.timeSelector}>
                    <Text style={dynamicStyles.timeSelectorLabel}>Başlangıç Saati</Text>
                    <View style={dynamicStyles.timeOptions}>
                      {['22:00', '23:00', '00:00', '01:00'].map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            dynamicStyles.timeOption,
                            quietStartTime === time && dynamicStyles.selectedTimeOption
                          ]}
                          onPress={() => setQuietStartTime(time)}
                        >
                          <Text style={[
                            dynamicStyles.timeOptionText,
                            quietStartTime === time && dynamicStyles.selectedTimeOptionText
                          ]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={dynamicStyles.timeSelector}>
                    <Text style={dynamicStyles.timeSelectorLabel}>Bitiş Saati</Text>
                    <View style={dynamicStyles.timeOptions}>
                      {['06:00', '07:00', '08:00', '09:00'].map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            dynamicStyles.timeOption,
                            quietEndTime === time && dynamicStyles.selectedTimeOption
                          ]}
                          onPress={() => setQuietEndTime(time)}
                        >
                          <Text style={[
                            dynamicStyles.timeOptionText,
                            quietEndTime === time && dynamicStyles.selectedTimeOptionText
                          ]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={dynamicStyles.saveButton}
                onPress={saveQuietHours}
              >
                <Text style={dynamicStyles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* İlerleme Takibi Modal */}
      <Modal
        visible={showProgressModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📈 İlerleme Takibi</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.progressCard}>
                <Text style={dynamicStyles.progressTitle}>🎯 Günlük Hedefler</Text>
                <View style={dynamicStyles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>Günlük Yazma</Text>
                  <View style={dynamicStyles.progressBar}>
                    <View style={[dynamicStyles.progressFill, { width: '80%' }]} />
                  </View>
                  <Text style={dynamicStyles.progressValue}>8/10 gün</Text>
                </View>
                <View style={dynamicStyles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>Su İçme</Text>
                  <View style={dynamicStyles.progressBar}>
                    <View style={[dynamicStyles.progressFill, { width: '60%' }]} />
                  </View>
                  <Text style={dynamicStyles.progressValue}>6/8 bardak</Text>
                </View>
                <View style={dynamicStyles.progressItem}>
                  <Text style={dynamicStyles.progressLabel}>Egzersiz</Text>
                  <View style={dynamicStyles.progressBar}>
                    <View style={[dynamicStyles.progressFill, { width: '40%' }]} />
                  </View>
                  <Text style={dynamicStyles.progressValue}>4/7 gün</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İlerleme Takibi Modal */}
      <Modal
        visible={showProgressModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProgressModal(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📈 İlerleme Takibi</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowProgressModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={styles.progressContainer}>
                <View style={styles.progressCard}>
                  <Text style={styles.progressTitle}>📝 Günlük Yazma</Text>
                  <Text style={styles.progressValue}>15/30 gün</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '50%' }]} />
                  </View>
                  <Text style={styles.progressDesc}>Bu ay 15 günlük yazdın</Text>
                </View>
                
                <View style={styles.progressCard}>
                  <Text style={styles.progressTitle}>💧 Su İçme</Text>
                  <Text style={styles.progressValue}>8/8 bardak</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '100%', backgroundColor: '#3b82f6' }]} />
                  </View>
                  <Text style={styles.progressDesc}>Bugün hedefini tamamladın!</Text>
                </View>
                
                <View style={styles.progressCard}>
                  <Text style={styles.progressTitle}>🎯 Hedefler</Text>
                  <Text style={styles.progressValue}>3/5 tamamlandı</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%', backgroundColor: '#10b981' }]} />
                  </View>
                  <Text style={styles.progressDesc}>Bu hafta 3 hedefini tamamladın</Text>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Başarılar Modal */}
      <Modal
        visible={showAchievementsModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowAchievementsModal(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAchievementsModal(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>🏆 Başarılarım</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowAchievementsModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.achievementGrid}>
                <View style={dynamicStyles.achievementCard}>
                  <Text style={dynamicStyles.achievementIcon}>🔥</Text>
                  <Text style={dynamicStyles.achievementTitle}>7 Gün Serisi</Text>
                  <Text style={dynamicStyles.achievementDesc}>7 gün üst üste günlük yazdın</Text>
                </View>
                <View style={dynamicStyles.achievementCard}>
                  <Text style={dynamicStyles.achievementIcon}>📚</Text>
                  <Text style={dynamicStyles.achievementTitle}>Kelime Ustası</Text>
                  <Text style={dynamicStyles.achievementDesc}>1000+ kelime yazdın</Text>
                </View>
                <View style={dynamicStyles.achievementCard}>
                  <Text style={dynamicStyles.achievementIcon}>💧</Text>
                  <Text style={dynamicStyles.achievementTitle}>Su İçici</Text>
                  <Text style={dynamicStyles.achievementDesc}>Hedef su miktarına ulaştın</Text>
                </View>
                <View style={dynamicStyles.achievementCard}>
                  <Text style={dynamicStyles.achievementIcon}>🌅</Text>
                  <Text style={dynamicStyles.achievementTitle}>Erken Kalkan</Text>
                  <Text style={dynamicStyles.achievementDesc}>Sabah 7'den önce günlük yazdın</Text>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Haftalık Rapor Modal */}
      <Modal
        visible={showWeeklyReportModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowWeeklyReportModal(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWeeklyReportModal(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📊 Haftalık Rapor</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowWeeklyReportModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.reportCard}>
                <Text style={dynamicStyles.reportTitle}>📈 Bu Hafta</Text>
                <View style={dynamicStyles.reportStats}>
                  <View style={dynamicStyles.reportItem}>
                    <Text style={dynamicStyles.reportNumber}>5</Text>
                    <Text style={dynamicStyles.reportLabel}>Günlük Yazıldı</Text>
                  </View>
                  <View style={dynamicStyles.reportItem}>
                    <Text style={dynamicStyles.reportNumber}>2,450</Text>
                    <Text style={dynamicStyles.reportLabel}>Toplam Kelime</Text>
                  </View>
                  <View style={dynamicStyles.reportItem}>
                    <Text style={dynamicStyles.reportNumber}>4.2</Text>
                    <Text style={dynamicStyles.reportLabel}>Ortalama Mood</Text>
                  </View>
                </View>
                <View style={dynamicStyles.reportInsight}>
                  <Text style={dynamicStyles.insightTitle}>💡 İçgörü</Text>
                  <Text style={dynamicStyles.insightText}>
                    Bu hafta çok üretkensin! Pazartesi ve Salı günleri en verimli günlerin olmuş. 
                    Hafta sonları biraz daha az yazmışsın, bu normal. Devam et! 🚀
                  </Text>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Odaklanma Süresi Modal */}
      <Modal
        visible={showFocusTimeModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFocusTimeModal(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFocusTimeModal(false)}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>⏱️ Odaklanma Süresi</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowFocusTimeModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.focusCard}>
                <Text style={dynamicStyles.focusTitle}>
                  {isFocusActive ? '🔥 Aktif Odaklanma' : '🎯 Bugünkü Odaklanma'}
                </Text>
                <View style={dynamicStyles.focusTimer}>
                  <Text style={[
                    dynamicStyles.focusTime,
                    isFocusActive && { color: '#ff6b35' }
                  ]}>
                    {formatTime(focusTime)}
                  </Text>
                  <Text style={dynamicStyles.focusLabel}>
                    {isFocusActive ? 'kalan süre' : 'dakika'}
                  </Text>
                </View>
                <View style={dynamicStyles.focusStats}>
                  <View style={dynamicStyles.focusItem}>
                    <Text style={dynamicStyles.focusNumber}>2.5</Text>
                    <Text style={dynamicStyles.focusDesc}>Ortalama oturum süresi</Text>
                  </View>
                  <View style={dynamicStyles.focusItem}>
                    <Text style={dynamicStyles.focusNumber}>4</Text>
                    <Text style={dynamicStyles.focusDesc}>Günlük oturum sayısı</Text>
                  </View>
                </View>
                
                {!isFocusActive ? (
                  <View style={dynamicStyles.focusButtonContainer}>
                    <TouchableOpacity 
                      style={dynamicStyles.startFocusButton}
                      onPress={startFocusSession}
                    >
                      <Text style={dynamicStyles.startFocusText}>
                        {focusTime === 25 * 60 ? '🚀 Odaklanma Başlat' : '▶️ Devam Et'}
                      </Text>
                    </TouchableOpacity>
                    {focusTime !== 25 * 60 && (
                      <TouchableOpacity 
                        style={[dynamicStyles.startFocusButton, { backgroundColor: '#6b7280', marginTop: 8 }]}
                        onPress={resetFocusSession}
                      >
                        <Text style={dynamicStyles.startFocusText}>🔄 Sıfırla</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[dynamicStyles.startFocusButton, { backgroundColor: '#dc2626' }]}
                    onPress={stopFocusSession}
                  >
                    <Text style={dynamicStyles.startFocusText}>⏸️ Duraklat</Text>
                  </TouchableOpacity>
                )}
                
                {isFocusActive && (
                  <Text style={dynamicStyles.focusStatus}>
                    🍅 Pomodoro tekniği aktif - Odaklan!
                  </Text>
                )}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={showCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={alertConfig.primaryButton}
        secondaryButton={alertConfig.secondaryButton}
        onClose={() => setShowCustomAlert(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // İlerleme Takibi Stilleri
  progressContainer: {
    padding: 20,
    gap: 16,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a855f7',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 4,
  },
  progressDesc: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
