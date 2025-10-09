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
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useDiary } from '../hooks/useDiary';
import { getAllInsights } from '../utils/insightsEngine';
import { getProfile, updateProfile, createProfile } from '../services/profileService';
import { backupToCloud, restoreFromCloud, clearAllData, downloadUserData } from '../services/backupService';
import { updateEmail, updatePassword } from '../lib/supabase';
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
import {
  requestNotificationPermission,
  saveNotificationSettings,
  loadNotificationSettings,
  scheduleMotivationNotifications,
  cancelMotivationNotifications,
  sendTestNotification,
  sendTaskReminderNotification,
  sendMissingUserNotification,
  scheduleTaskReminder,
  scheduleDailyTaskCheck
} from '../services/motivationNotificationService';
import { recordUserActivity, checkUserActivityAndNotify } from '../services/userActivityService';
import * as Notifications from 'expo-notifications';
import { useTimer } from '../contexts/TimerContext';
import ModernToggle from '../components/ModernToggle';

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
  const { user, signOut, refreshSession } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { entries } = useDiary(user?.uid);
  const { timerState, startTimer, pauseTimer, stopTimer, resetTimer } = useTimer();
  const [reminderTime, setReminderTime] = useState('21:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Motivasyon bildirim ayarları
  const [motivationSettings, setMotivationSettings] = useState({
    morningEnabled: true,
    lunchEnabled: true,
    eveningEnabled: true,
    morningTime: '08:00',
    lunchTime: '12:00',
    eveningTime: '18:00',
  });
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.name);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.displayName || '',
    bio: '',
  });
  
  // Email ve şifre değiştirme modalları
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectedFont, setSelectedFont] = useState('system');
  // const [notificationSound, setNotificationSound] = useState('default'); // Kaldırıldı
  // const [quietHoursEnabled, setQuietHoursEnabled] = useState(false); // Kaldırıldı
  // const [quietStartTime, setQuietStartTime] = useState('22:00'); // Kaldırıldı
  // const [quietEndTime, setQuietEndTime] = useState('08:00'); // Kaldırıldı
  // const [showSoundModal, setShowSoundModal] = useState(false); // Kaldırıldı
  // const [showQuietHoursModal, setShowQuietHoursModal] = useState(false); // Kaldırıldı
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showFocusTimeModal, setShowFocusTimeModal] = useState(false);
  
  // Custom Alert States
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    primaryButton: null as any,
    secondaryButton: null as any,
  });

  // Avatar renk fonksiyonu
  const getAvatarColor = (name: string) => {
    const colors = [
      '#3b82f6', // Mavi
      '#10b981', // Yeşil
      '#8b5cf6', // Mor
      '#f59e0b', // Sarı
      '#ef4444', // Kırmızı
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Turuncu
    ];
    
    const firstChar = name.charAt(0).toUpperCase();
    const charCode = firstChar.charCodeAt(0);
    return colors[charCode % colors.length];
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
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    languageOption: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    languageOptionSelected: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary,
    },
    languageOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    languageOptionFlag: {
      fontSize: 24,
      marginRight: 12,
    },
    languageOptionFlagSelected: {
      // Seçili durumda bayrak stili
    },
    languageOptionText: {
      flex: 1,
    },
    languageOptionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    languageOptionTitleSelected: {
      color: 'white',
    },
    languageOptionSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    languageOptionSubtitleSelected: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    // Renk Paleti Stilleri
    colorPaletteContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    colorPaletteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    colorPaletteTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    colorPaletteSubtitle: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      marginBottom: 16,
    },
    colorPaletteScroll: {
      marginHorizontal: -4,
    },
    colorPaletteContent: {
      paddingHorizontal: 4,
      gap: 12,
    },
    colorPaletteItem: {
      alignItems: 'center',
      marginRight: 12,
      padding: 8,
      borderRadius: 12,
      minWidth: 80,
    },
    colorPaletteItemSelected: {
      backgroundColor: currentTheme.colors.accent,
    },
    colorPaletteCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    colorPaletteLabel: {
      fontSize: 11,
      color: currentTheme.colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
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
      minHeight: 56,
      justifyContent: 'center',
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
    achievementDate: {
      fontSize: 10,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 4,
      fontWeight: '500',
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
      minHeight: 48,
    },
    testButtonsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
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
    // Profil Modal Styles
    profileModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileModalContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      width: '90%',
      maxHeight: '80%',
      elevation: 10,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    profileModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    profileModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    profileModalCloseButton: {
      padding: 8,
    },
    profileModalContent: {
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    inputHint: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    profileModalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    profileModalButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      marginHorizontal: 8,
    },
    profileModalButtonPrimary: {
      backgroundColor: '#3b82f6',
    },
    profileModalButtonSecondary: {
      backgroundColor: currentTheme.colors.card,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    profileModalButtonTextPrimary: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    profileModalButtonTextSecondary: {
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
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
    loadProfile();
    loadMotivationSettings();
  }, [user?.uid]);

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

  const loadMotivationSettings = async () => {
    try {
      const settings = await loadNotificationSettings();
      setMotivationSettings(settings);
    } catch (error) {
      console.error('Error loading motivation settings:', error);
    }
  };

  const saveMotivationSettings = async (newSettings: typeof motivationSettings) => {
    try {
      await saveNotificationSettings(newSettings);
      setMotivationSettings(newSettings);
      
      // Bildirimleri yeniden zamanla
      await scheduleMotivationNotifications();
      
      console.log('Motivation settings saved:', newSettings);
    } catch (error) {
      console.error('Error saving motivation settings:', error);
    }
  };

  const saveReminderTime = async (time: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await AsyncStorage.setItem('reminderTime', time);
      setReminderTime(time);
      console.log('Reminder time saved:', time);
    } catch (error) {
      console.error('Error saving reminder time:', error);
    }
  };

  const loadProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profile = await getProfile(user.uid);
      if (profile) {
        setProfileData({
          full_name: profile.full_name || user.displayName || '',
          bio: profile.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) {
      showAlert('❌ Hata', 'Kullanıcı bilgisi bulunamadı.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      console.log('💾 Saving profile for user:', user.uid);
      console.log('📝 Profile data:', profileData);
      
      // Önce profil var mı kontrol et
      const existingProfile = await getProfile(user.uid);
      console.log('🔍 Existing profile:', existingProfile);
      
      if (existingProfile) {
        // Profil güncelle
        console.log('🔄 Updating existing profile...');
        await updateProfile(user.uid, profileData);
        console.log('✅ Profile updated successfully');
      } else {
        // Yeni profil oluştur
        console.log('🆕 Creating new profile...');
        await createProfile(user.uid, profileData);
        console.log('✅ Profile created successfully');
      }
      
      setShowProfileModal(false);
      showAlert('✅ Profil Güncellendi', 'Profil bilgileriniz başarıyla kaydedildi.', 'success', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      const errorMessage = error?.message || error?.toString() || 'Bilinmeyen hata';
      showAlert('❌ Hata', `Profil kaydedilemedi: ${errorMessage}`, 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    }
  };

  const handleBackup = async () => {
    if (!user?.uid) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showAlert('📤 Yedekleme Başlatılıyor', 'Verileriniz Supabase bulutuna yedekleniyor...', 'info', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });

      const success = await backupToCloud(user.uid);
      
      if (success) {
        showAlert('✅ Yedekleme Tamamlandı', 'Verileriniz başarıyla Supabase bulutuna yedeklendi.', 'success', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
      } else {
        showAlert('❌ Yedekleme Hatası', 'Verileriniz yedeklenemedi. Lütfen tekrar deneyin.', 'error', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
      }
    } catch (error) {
      console.error('Backup error:', error);
      showAlert('❌ Yedekleme Hatası', 'Verileriniz yedeklenemedi: ' + error, 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    }
  };

  // Email değiştirme fonksiyonu
  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      showAlert('❌ Hata', 'Email adresi boş olamaz.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      showAlert('❌ Hata', 'Geçerli bir email adresi girin.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowEmailModal(false);
      
      showAlert('📧 Email Güncelleniyor', 'Email adresiniz güncelleniyor...', 'info', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });

      // Önce session'ı yenile
      const sessionRefreshed = await refreshSession();
      if (!sessionRefreshed) {
        showAlert('⚠️ Oturum Sorunu', 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.', 'error', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
        return;
      }

      await updateEmail(newEmail);
      
      showAlert('✅ Başarılı!', 'Email adresiniz başarıyla güncellendi. Yeni email adresinize doğrulama mesajı gönderildi.', 'success', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      
      setNewEmail('');
    } catch (error) {
      console.error('Email update error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showAlert('❌ Hata', 'Email güncellenirken hata oluştu: ' + errorMessage, 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    }
  };

  // Dil değiştirme fonksiyonu
  const handleLanguageChange = (newLanguage: 'tr' | 'en') => {
    setLanguage(newLanguage);
    setShowLanguageModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Şifre değiştirme fonksiyonu
  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      showAlert('❌ Hata', 'Yeni şifre boş olamaz.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert('❌ Hata', 'Şifre en az 6 karakter olmalıdır.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('❌ Hata', 'Şifreler eşleşmiyor.', 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowPasswordModal(false);
      
      showAlert('🔑 Şifre Güncelleniyor', 'Şifreniz güncelleniyor...', 'info', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });

      // Önce session'ı yenile
      const sessionRefreshed = await refreshSession();
      if (!sessionRefreshed) {
        showAlert('⚠️ Oturum Sorunu', 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.', 'error', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
        return;
      }

      await updatePassword(newPassword);
      
      showAlert('✅ Başarılı!', 'Şifreniz başarıyla güncellendi.', 'success', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showAlert('❌ Hata', 'Şifre güncellenirken hata oluştu: ' + errorMessage, 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    }
  };

  const handleDownloadData = async () => {
    if (!user?.uid) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showAlert('📥 Veri İndiriliyor', 'Verileriniz hazırlanıyor...', 'info', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });

      const userData = await downloadUserData(user.uid);
      
      if (userData) {
        showAlert('✅ Veri Hazır!', `Verileriniz JSON formatında hazırlandı.\n\nDosya boyutu: ${(userData.length / 1024).toFixed(1)} KB\n\nVerilerinizi kopyalamak için console\'u kontrol edin.`, 'success', {
          text: 'Tamam',
          onPress: () => {
            console.log('📄 USER DATA EXPORT:', userData);
            setShowCustomAlert(false);
          },
          style: 'primary'
        });
      } else {
        showAlert('❌ İndirme Hatası', 'Verileriniz indirilemedi. Lütfen tekrar deneyin.', 'error', {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      showAlert('❌ İndirme Hatası', 'Verileriniz indirilemedi: ' + error, 'error', {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      });
    }
  };

  // notificationSounds array kaldırıldı

  // playNotificationSound fonksiyonu kaldırıldı

  // saveNotificationSound fonksiyonu kaldırıldı

  // saveQuietHours fonksiyonu kaldırıldı

  // Başarıları hesapla
  const calculateAchievements = () => {
    if (entries.length === 0) return [];

    const achievements = [];
    const allInsights = getAllInsights(entries);
    
    // Başarı türündeki insights'ları filtrele
    const achievementInsights = allInsights.filter(insight => insight.type === 'achievement');
    
    // Milestone başarıları
    const milestones = [1, 10, 25, 50, 100, 200, 365];
    milestones.forEach(milestone => {
      if (entries.length >= milestone) {
        achievements.push({
          id: `milestone-${milestone}`,
          icon: milestone === 1 ? '🎉' : '🏆',
          title: milestone === 1 ? 'İlk Günlük!' : `${milestone}. Günlük!`,
          description: milestone === 1 ? 'İlk günlüğünü yazdın' : `${milestone} günlük yazdın`,
          unlocked: true,
          date: entries[entries.length - milestone]?.createdAt || undefined
        });
      }
    });

    // Streak başarıları
    const currentStreak = calculateCurrentStreak();
    if (currentStreak >= 7) {
      achievements.push({
        id: 'streak-7',
        icon: '🔥',
        title: '7 Gün Serisi',
        description: '7 gün üst üste günlük yazdın',
        unlocked: true,
        date: undefined
      });
    }

    // Kelime başarıları
    const totalWords = entries.reduce((sum, entry) => {
      const words = entry.content?.split(/\s+/).length || 0;
      return sum + words;
    }, 0);

    if (totalWords >= 1000) {
      achievements.push({
        id: 'words-1000',
        icon: '📚',
        title: 'Kelime Ustası',
        description: `${totalWords.toLocaleString('tr-TR')} kelime yazdın`,
        unlocked: true,
        date: undefined
      });
    }

    return achievements;
  };

  // Mevcut streak'i hesapla
  const calculateCurrentStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  // Haftalık rapor verilerini hesapla
  const calculateWeeklyReport = () => {
    if (entries.length === 0) {
      return {
        entriesThisWeek: 0,
        totalWords: 0,
        averageMood: 0,
        insight: 'Henüz günlük yazmadın. İlk günlüğünü yazarak başla! 🌟'
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Bu haftanın başlangıcı
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Bu haftanın sonu
    endOfWeek.setHours(23, 59, 59, 999);

    // Bu haftaki günlükleri filtrele
    const weeklyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    // İstatistikleri hesapla
    const entriesThisWeek = weeklyEntries.length;
    const totalWords = weeklyEntries.reduce((sum, entry) => {
      return sum + (entry.content?.split(/\s+/).length || 0);
    }, 0);
    
    const averageMood = weeklyEntries.length > 0 
      ? (weeklyEntries.reduce((sum, entry) => sum + entry.mood, 0) / weeklyEntries.length)
      : 0;

    // İçgörü oluştur
    let insight = '';
    if (entriesThisWeek === 0) {
      insight = 'Bu hafta henüz günlük yazmadın. Hadi başla! ✨';
    } else if (entriesThisWeek >= 5) {
      insight = 'Bu hafta çok üretkensin! Harika gidiyorsun! 🚀';
    } else if (entriesThisWeek >= 3) {
      insight = 'Bu hafta iyi gidiyorsun! Biraz daha yazabilirsin. 💪';
    } else {
      insight = 'Bu hafta az yazmışsın. Daha fazla yazmaya ne dersin? 📝';
    }

    if (averageMood >= 4) {
      insight += ' Ayrıca çok mutlu görünüyorsun! 😊';
    } else if (averageMood <= 2) {
      insight += ' Kendine iyi bak, seni düşünüyoruz! 💙';
    }

    return {
      entriesThisWeek,
      totalWords,
      averageMood: Math.round(averageMood * 10) / 10,
      insight
    };
  };

  const startFocusSession = () => {
    if (!timerState.isActive) {
      // Yeni timer başlat
      startTimer(25, 'focus', 'Odaklanma');
      setShowFocusTimeModal(false); // Modalı kapat
      showAlert(
        '🎯 Odaklanma Başladı!',
        '25 dakikalık odaklanma süreniz başladı. Sağ üstteki mini zamanlayıcıdan takip edebilirsiniz!',
        'success',
        {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
    } else if (timerState.isPaused) {
      // Duraklatılmış timer'ı devam ettir
      // Timer Context'te resumeTimer fonksiyonu var
      setShowFocusTimeModal(false);
    }
  };

  const startBreak = () => {
    startTimer(5, 'break', 'Mola');
    setShowFocusTimeModal(false);
    showAlert(
      '☕ Mola Başladı!',
      '5 dakikalık mola süreniz başladı. İyi dinlenmeler!',
      'success',
      {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      }
    );
  };

  const stopFocusSession = () => {
    stopTimer();
    showAlert(
      '⏹️ Odaklanma Durduruldu',
      'Odaklanma oturumunuz durduruldu.',
      'info',
      {
        text: 'Tamam',
        onPress: () => setShowCustomAlert(false),
        style: 'primary'
      }
    );
  };

  const resetFocusSession = () => {
    resetTimer();
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
            <View style={[
              dynamicStyles.avatar,
              { backgroundColor: getAvatarColor(user?.displayName || 'Kullanıcı') }
            ]}>
              <Text style={dynamicStyles.avatarText}>
                {(user?.displayName || 'Kullanıcı').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={dynamicStyles.userName}>{user?.displayName || 'Kullanıcı'}</Text>
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
            <ModernToggle
              value={notificationsEnabled}
              onValueChange={saveNotificationsEnabled}
              type="day"
            />
          }
        />
        
        {notificationsEnabled && (
          <>
            <View style={{ marginTop: 12 }}>
              <TimePicker />
      </View>

            {/* Sessiz saatler kaldırıldı - Sistem ayarlarından kontrol edilir */}
            
            {/* Titreşim ayarı kaldırıldı - Sistem ayarlarından kontrol edilir */}
            
            {/* Bildirim Sesi kaldırıldı - Artık tek bildirim var */}

            {/* Motivasyon Bildirimleri */}
            <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: currentTheme.colors.border }}>
              <Text style={[dynamicStyles.sectionTitle, { fontSize: 16, marginBottom: 12 }]}>💫 Motivasyon Bildirimleri</Text>
        
        <SettingItem
                icon="sunny-outline"
                title="Sabah Motivasyonu"
                subtitle={`${motivationSettings.morningTime} - Güne pozitif başlangıç`}
                rightComponent={
                  <ModernToggle
                    value={motivationSettings.morningEnabled}
                    onValueChange={(value) => saveMotivationSettings({...motivationSettings, morningEnabled: value})}
                    type="day"
                  />
                }
        />
        
        <SettingItem
                icon="partly-sunny-outline"
                title="Öğlen Motivasyonu"
                subtitle={`${motivationSettings.lunchTime} - Gün ortası enerji`}
                rightComponent={
                  <ModernToggle
                    value={motivationSettings.lunchEnabled}
                    onValueChange={(value) => saveMotivationSettings({...motivationSettings, lunchEnabled: value})}
                    type="day"
                  />
                }
              />
              
              <SettingItem
                icon="moon-outline"
                title="Akşam Motivasyonu"
                subtitle={`${motivationSettings.eveningTime} - Gün değerlendirmesi`}
                rightComponent={
                  <ModernToggle
                    value={motivationSettings.eveningEnabled}
                    onValueChange={(value) => saveMotivationSettings({...motivationSettings, eveningEnabled: value})}
                    type="night"
                  />
                }
              />
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#8b5cf6', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await sendTestNotification();
                    showAlert('✅ Test Bildirimi', 'Test bildirimi gönderildi! 2 saniye sonra gelecek.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Test Bildirimi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#10b981', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await sendTaskReminderNotification();
                    showAlert('📝 Görev Hatırlatıcısı', 'Görev hatırlatıcısı gönderildi! 2 saniye sonra gelecek.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Görev Hatırlatıcısı</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#ef4444', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await sendMissingUserNotification();
                    showAlert('😢 Özleyen Kullanıcı', 'Özleyen kullanıcı bildirimi gönderildi! 2 saniye sonra gelecek.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="heart" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Seni Özledim</Text>
                </TouchableOpacity>
              </View>

              {/* Akıllı Bildirim Testleri */}
              <Text style={dynamicStyles.sectionTitle}>🧠 Akıllı Bildirim Testleri</Text>
              <View style={dynamicStyles.testButtonsRow}>
                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#f59e0b', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await scheduleTaskReminder();
                    showAlert('⏰ Görev Hatırlatıcısı', '2 saat sonra görev hatırlatıcısı gelecek!', 'info', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="time" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>2 Saat Sonra Hatırlat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#6366f1', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await scheduleDailyTaskCheck();
                    showAlert('📝 Günlük Kontrol', 'Akşam 20:00\'de günlük görev kontrolü gelecek!', 'info', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Günlük Kontrol (20:00)</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.testButtonsRow}>
                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#ec4899', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await recordUserActivity('task_created');
                    showAlert('📝 Aktivite Kaydedildi', 'Görev oluşturma aktivitesi kaydedildi!', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Görev Aktivitesi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.testButton, { backgroundColor: '#14b8a6', flex: 1, minWidth: '48%' }]}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    await checkUserActivityAndNotify();
                    showAlert('🔍 Aktivite Kontrolü', 'Kullanıcı aktivitesi kontrol edildi!', 'info', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }}
                >
                  <Ionicons name="search" size={20} color="white" />
                  <Text style={dynamicStyles.testButtonText}>Aktivite Kontrolü</Text>
                </TouchableOpacity>
              </View>
            </View>
            
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
                    
                    // Test bildirimi gönder - background thread'e taşı
                    console.log('🎵 Test Bildirimi - Platform:', Platform.OS);
                    
                    // Haptic feedback - hemen ver
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    
                    // Notification'ı background'da gönder - UI'ı bloklamasın
                    setTimeout(async () => {
                      try {
                        await sendLocalNotification(
                          '🧪 Test Bildirimi',
                          `Platform: ${Platform.OS}`,
                          { type: 'test' },
                          'default'
                        );
                        console.log('Test notification sent!');
                      } catch (notificationError) {
                        console.error('Background notification error:', notificationError);
                      }
                    }, 100);
                    
                    // Alert'i hemen göster - notification beklemesin
                    showAlert('✅ Test Başlatıldı!', 'Test bildirimi gönderiliyor...', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
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
                  
                  // Alert'i hemen göster - işlem beklemesin
                  showAlert('📋 Planlı Bildirimler', 'Bildirimler listeleniyor...', 'info', {
                    text: 'Tamam',
                    onPress: () => setShowCustomAlert(false),
                    style: 'primary'
                  });
                  
                  // İşlemi background'da yap
                  setTimeout(async () => {
                    try {
                      console.log('Listing scheduled notifications...');
                      const notifications = await listScheduledNotifications();
                      console.log('Found notifications:', notifications);
                      
                      if (notifications && notifications.length > 0) {
                        const notificationList = notifications.map((notif, index) => 
                          `${index + 1}. ${notif.content?.title || 'Başlıksız'} - ${new Date(notif.trigger?.date || Date.now()).toLocaleString('tr-TR')}`
                        ).join('\n');
                        
                        showAlert('📋 Planlı Bildirimler', `Toplam ${notifications.length} bildirim bulundu:\n\n${notificationList}`, 'success', {
                          text: 'Tamam',
                          onPress: () => setShowCustomAlert(false),
                          style: 'primary'
                        });
                      } else {
                        showAlert('📋 Planlı Bildirimler', 'Henüz planlı bildirim bulunamadı. Önce bildirimleri planlayın.', 'info', {
                          text: 'Tamam',
                          onPress: () => setShowCustomAlert(false),
                          style: 'primary'
                        });
                      }
                    } catch (error) {
                      console.error('List notifications error:', error);
                      showAlert('❌ Hata', 'Bildirimler listelenirken hata oluştu: ' + error, 'error', {
                        text: 'Tamam',
                        onPress: () => setShowCustomAlert(false),
                        style: 'primary'
                      });
                    }
                  }, 100);
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
                  
                  // Alert'i hemen göster
                  showAlert('✅ İşlem Başlatıldı!', 'Bildirimler yeniden planlanıyor...', 'success', {
                    text: 'Tamam',
                    onPress: () => setShowCustomAlert(false),
                    style: 'primary'
                  });
                  
                  // İşlemi background'da yap
                  setTimeout(async () => {
                    try {
                      console.log('Rescheduling all notifications...');
                      await scheduleAllNotifications();
                      console.log('All notifications rescheduled!');
                    } catch (error) {
                      console.error('Reschedule error:', error);
                    }
                  }, 100);
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
                  
                  // Alert'i hemen göster
                  showAlert('✅ İşlem Başlatıldı!', 'Tüm bildirimler iptal ediliyor...', 'success', {
                    text: 'Tamam',
                    onPress: () => setShowCustomAlert(false),
                    style: 'primary'
                  });
                  
                  // İşlemi background'da yap
                  setTimeout(async () => {
                    try {
                      console.log('Cancelling all notifications...');
                      await cancelAllNotifications();
                      console.log('All notifications cancelled!');
                    } catch (error) {
                      console.error('Cancel error:', error);
                    }
                  }, 100);
                }}
              >
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Tüm Bildirimleri İptal Et</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.testButton, { backgroundColor: '#f59e0b' }]}
                activeOpacity={0.7}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  
                  if (!user?.uid) return;
                  
                  try {
                    // AsyncStorage'dan tüm diary verilerini sil
                    await AsyncStorage.removeItem(`diary_entries_${user.uid}`);
                    showAlert('✅ Temizlendi!', 'Tüm günlük verileri silindi. Uygulamayı yeniden başlatın.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  } catch (error) {
                    showAlert('❌ Hata', 'Veriler silinirken hata oluştu: ' + error, 'error', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }
                }}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={dynamicStyles.testButtonText}>Mock Data'yı Temizle</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Görünüm</Text>
        
        {/* Renk Paleti Seçici */}
        <View style={dynamicStyles.colorPaletteContainer}>
          <View style={dynamicStyles.colorPaletteHeader}>
            <Ionicons name="color-filter-outline" size={20} color={currentTheme.colors.primary} />
            <Text style={dynamicStyles.colorPaletteTitle}>Renk Paleti</Text>
          </View>
          <Text style={dynamicStyles.colorPaletteSubtitle}>Favori rengini seç</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={dynamicStyles.colorPaletteScroll}
            contentContainerStyle={dynamicStyles.colorPaletteContent}
          >
            {/* UI Temaları */}
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.name}
                style={[
                  dynamicStyles.colorPaletteItem,
                  currentTheme.name === theme.name && dynamicStyles.colorPaletteItemSelected
                ]}
                onPress={async () => {
                  await setTheme(theme.name);
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <View 
                  style={[
                    dynamicStyles.colorPaletteCircle,
                    { backgroundColor: theme.colors.primary }
                  ]}
                >
                  {currentTheme.name === theme.name && (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </View>
                <Text style={dynamicStyles.colorPaletteLabel}>{theme.label}</Text>
              </TouchableOpacity>
            ))}
            
            
          </ScrollView>
        </View>


        <SettingItem
          icon="language-outline"
          title={t('settings.language')}
          subtitle={language === 'tr' ? t('settings.turkish') : t('settings.english')}
          onPress={() => setShowLanguageModal(true)}
        />
        
        {/* Font Selection kaldırıldı */}
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
        <Text style={dynamicStyles.sectionTitle}>Veri & Yedekleme</Text>
        
        <SettingItem
          icon="cloud-upload-outline"
          title="Veri Yedekleme"
          subtitle="Günlüklerinizi Supabase bulutuna yedekleyin"
          onPress={handleBackup}
        />
        
        <SettingItem
          icon="cloud-download-outline"
          title="Veri Geri Yükleme"
          subtitle="Yedeklenen verilerinizi geri yükleyin"
          onPress={() => showAlert('📥 Veri Geri Yükleme', 'Yedeklenen verileriniz geri yükleniyor...', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Veri Temizleme"
          subtitle="Tüm verilerinizi silin"
          onPress={() => showAlert('🗑️ Veri Temizleme', 'Tüm verileriniz silinecek! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?', 'warning', {
            text: 'İptal',
            onPress: () => setShowCustomAlert(false),
            style: 'secondary'
          }, {
            text: 'Sil',
            onPress: () => {
              setShowCustomAlert(false);
              showAlert('✅ Veriler Silindi', 'Tüm verileriniz başarıyla silindi.', 'success', {
                text: 'Tamam',
                onPress: () => setShowCustomAlert(false),
                style: 'primary'
              });
            },
            style: 'destructive'
          })}
        />
      </View>


      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Hesap</Text>
        
        <SettingItem
          icon="person-outline"
          title="Profil Bilgileri"
          subtitle="Ad, email ve profil fotoğrafı"
          onPress={() => {
            setShowProfileModal(true);
            loadProfile();
          }}
        />
        
        <SettingItem
          icon="mail-outline"
          title="Email Değiştir"
          subtitle="Hesap email adresinizi değiştirin"
          onPress={() => {
            setNewEmail(user?.email || '');
            setShowEmailModal(true);
          }}
        />
        
        <SettingItem
          icon="key-outline"
          title="Şifre Değiştir"
          subtitle="Hesap şifrenizi güncelleyin"
          onPress={() => {
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordModal(true);
          }}
        />
        
        
        <SettingItem
          icon="download-outline"
          title="Verilerimi İndir"
          subtitle="Tüm günlük verilerinizi JSON formatında indirin"
          onPress={handleDownloadData}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Hesabı Sil"
          subtitle="Tüm verilerinizi kalıcı olarak silin"
          onPress={() => showAlert(
            '🗑️ Hesabı Sil',
            'Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
            'error',
            {
              text: '❌ Evet, Sil',
              onPress: async () => {
                setShowCustomAlert(false);
                if (user?.uid) {
                  const success = await clearAllData(user.uid);
                  if (success) {
                    showAlert('✅ Hesap Silindi', 'Hesabınız ve tüm verileriniz başarıyla silindi.', 'success', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  } else {
                    showAlert('❌ Hata', 'Hesap silinemedi. Lütfen tekrar deneyin.', 'error', {
                      text: 'Tamam',
                      onPress: () => setShowCustomAlert(false),
                      style: 'primary'
                    });
                  }
                }
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
        <Text style={dynamicStyles.sectionTitle}>Gizlilik & Güvenlik</Text>
        
        <SettingItem
          icon="shield-outline"
          title="Gizlilik Politikası"
          subtitle="Veri kullanımı ve gizlilik haklarınız"
          onPress={() => showAlert('🔒 Gizlilik Politikası', 'Gizlilik Politikamız:\n\n• Günlük verileriniz sadece sizin cihazınızda ve Supabase bulutunda saklanır\n• Verileriniz üçüncü taraflarla paylaşılmaz\n• Tüm verileriniz şifrelenir\n• İstediğiniz zaman verilerinizi silebilirsiniz\n• Anonim istatistikler için verileriniz anonimleştirilir\n\nDetaylı bilgi için: privacy@dailydiary.app', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="eye-outline"
          title="Veri Şeffaflığı"
          subtitle="Hangi verilerinizin nasıl kullanıldığını görün"
          onPress={() => showAlert('👁️ Veri Şeffaflığı', 'Verileriniz nasıl kullanılıyor:\n\n📝 Günlük Yazıları:\n• Sadece sizin erişiminizde\n• İstatistikler için analiz edilir\n• Anonimleştirilmiş içgörüler oluşturulur\n\n📊 Kullanım İstatistikleri:\n• Giriş yapma zamanları\n• Yazma alışkanlıkları\n• Genel uygulama kullanımı\n\n🔐 Güvenlik:\n• Tüm veriler şifrelenir\n• Supabase RLS ile korunur\n• Sadece siz erişebilirsiniz', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="download-outline"
          title="Verilerimi İndir"
          subtitle="Tüm kişisel verilerinizi JSON formatında indirin"
          onPress={handleDownloadData}
        />
        
        <SettingItem
          icon="trash-outline"
          title="Hesabımı Tamamen Sil"
          subtitle="Tüm verilerinizi kalıcı olarak silin"
          onPress={() => showAlert('⚠️ Hesap Silme', 'Bu işlem GERİ ALINAMAZ!\n\nSilinecek veriler:\n• Tüm günlük yazıları\n• Profil bilgileri\n• İstatistikler ve içgörüler\n• Kullanım geçmişi\n\nEmin misiniz?', 'error', {
            text: 'İptal',
            onPress: () => setShowCustomAlert(false),
            style: 'secondary'
          }, {
            text: 'SİL',
            onPress: async () => {
              if (!user?.uid) return;
              
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                await clearAllData(user.uid);
                
                // AsyncStorage'ı da temizle
                await AsyncStorage.clear();
                
                showAlert('✅ Silindi!', 'Tüm verileriniz kalıcı olarak silindi. Uygulama kapatılacak.', 'success', {
                  text: 'Tamam',
                  onPress: async () => {
                    setShowCustomAlert(false);
                    // Uygulamayı kapat (Expo'da çalışmaz ama deneyelim)
                    await signOut();
                  },
                  style: 'primary'
                });
              } catch (error) {
                showAlert('❌ Hata', 'Veriler silinirken hata oluştu: ' + error, 'error', {
                  text: 'Tamam',
                  onPress: () => setShowCustomAlert(false),
                  style: 'primary'
                });
              }
            },
            style: 'destructive'
          })}
        />
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Uygulama</Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="Hakkında"
          subtitle="Versiyon 1.0.0 - Daily Diary App"
          onPress={() => showAlert('ℹ️ Hakkında', 'Daily Diary App v1.0.0\n\nGünlük yazma alışkanlığı kazanmanız için tasarlanmış modern bir uygulamadır.\n\nGeliştirici: Merve Sude Borak\n© 2025', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="help-circle-outline"
          title="Yardım & Destek"
          subtitle="SSS ve teknik destek"
          onPress={() => showAlert('❓ Yardım & Destek', 'Yardım ve destek için:\n\n📧 Email: support@dailydiary.app\n📱 Telefon: +90 XXX XXX XX XX\n💬 WhatsApp: +90 XXX XXX XX XX\n\nÇalışma Saatleri:\nPazartesi - Cuma: 09:00 - 18:00', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="star-outline"
          title="Uygulamayı Değerlendir"
          subtitle="App Store'da değerlendirme yapın"
          onPress={() => showAlert('⭐ Uygulamayı Değerlendir', 'Uygulamamızı beğendiyseniz, App Store\'da 5 yıldız vererek bize destek olabilirsiniz!\n\nDeğerlendirmeniz bizim için çok değerli! 🌟', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
        />
        
        <SettingItem
          icon="share-outline"
          title="Arkadaşlarla Paylaş"
          subtitle="Uygulamayı arkadaşlarınızla paylaşın"
          onPress={() => showAlert('📤 Arkadaşlarla Paylaş', 'Daily Diary App\'i arkadaşlarınızla paylaşın!\n\nGünlük yazma alışkanlığı kazanmak için harika bir uygulama. Sen de deneyebilirsin! 🎯\n\nApp Store Linki: https://apps.apple.com/app/daily-diary', 'info', {
            text: 'Tamam',
            onPress: () => setShowCustomAlert(false),
            style: 'primary'
          })}
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
      {/* Bildirim Sesi Modal kaldırıldı */}

      {/* Sessiz Saatler Modal kaldırıldı */}

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
                {calculateAchievements().length > 0 ? (
                  calculateAchievements().map((achievement) => (
                    <View 
                      key={achievement.id} 
                      style={[
                        dynamicStyles.achievementCard,
                        achievement.unlocked && { opacity: 1 }
                      ]}
                    >
                      <Text style={dynamicStyles.achievementIcon}>{achievement.icon}</Text>
                      <Text style={dynamicStyles.achievementTitle}>{achievement.title}</Text>
                      <Text style={dynamicStyles.achievementDesc}>{achievement.description}</Text>
                      {achievement.date && (
                        <Text style={dynamicStyles.achievementDate}>
                          {new Date(achievement.date).toLocaleDateString('tr-TR')}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={dynamicStyles.achievementCard}>
                    <Text style={dynamicStyles.achievementIcon}>🎯</Text>
                    <Text style={dynamicStyles.achievementTitle}>Henüz Başarı Yok</Text>
                    <Text style={dynamicStyles.achievementDesc}>
                      İlk günlüğünü yazarak başarılarını kazanmaya başla!
                    </Text>
                  </View>
                )}
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
                    <Text style={dynamicStyles.reportNumber}>{calculateWeeklyReport().entriesThisWeek}</Text>
                    <Text style={dynamicStyles.reportLabel}>Günlük Yazıldı</Text>
                  </View>
                  <View style={dynamicStyles.reportItem}>
                    <Text style={dynamicStyles.reportNumber}>{calculateWeeklyReport().totalWords.toLocaleString('tr-TR')}</Text>
                    <Text style={dynamicStyles.reportLabel}>Toplam Kelime</Text>
                  </View>
                  <View style={dynamicStyles.reportItem}>
                    <Text style={dynamicStyles.reportNumber}>{calculateWeeklyReport().averageMood}</Text>
                    <Text style={dynamicStyles.reportLabel}>Ortalama Mood</Text>
                  </View>
                </View>
                <View style={dynamicStyles.reportInsight}>
                  <Text style={dynamicStyles.insightTitle}>💡 İçgörü</Text>
                  <Text style={dynamicStyles.insightText}>
                    {calculateWeeklyReport().insight}
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
                  {timerState.isActive ? '🔥 Aktif Odaklanma' : '🎯 Bugünkü Odaklanma'}
                </Text>
                <View style={dynamicStyles.focusTimer}>
                  <Text style={[
                    dynamicStyles.focusTime,
                    timerState.isActive && { color: '#ff6b35' }
                  ]}>
                    {formatTime(timerState.isActive ? timerState.remainingTime : 25 * 60)}
                  </Text>
                  <Text style={dynamicStyles.focusLabel}>
                    {timerState.isActive ? 'kalan süre' : 'dakika'}
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
                
                {!timerState.isActive ? (
                  <View style={dynamicStyles.focusButtonContainer}>
                    <TouchableOpacity 
                      style={dynamicStyles.startFocusButton}
                      onPress={startFocusSession}
                    >
                      <Text style={dynamicStyles.startFocusText}>
                        🚀 Odaklanma Başlat
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={dynamicStyles.focusButtonContainer}>
                    <TouchableOpacity 
                      style={[dynamicStyles.startFocusButton, { backgroundColor: '#dc2626' }]}
                      onPress={stopFocusSession}
                    >
                      <Text style={dynamicStyles.startFocusText}>⏹️ Durdur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[dynamicStyles.startFocusButton, { backgroundColor: '#6b7280', marginTop: 8 }]}
                      onPress={resetFocusSession}
                    >
                      <Text style={dynamicStyles.startFocusText}>🔄 Sıfırla</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {timerState.isActive && (
                  <Text style={dynamicStyles.focusStatus}>
                    🍅 Pomodoro tekniği aktif - Sağ üstten takip edebilirsin!
                  </Text>
                )}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert */}
      {/* Profil Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={dynamicStyles.profileModalOverlay}>
          <View style={dynamicStyles.profileModalContainer}>
            <View style={dynamicStyles.profileModalHeader}>
              <Text style={dynamicStyles.profileModalTitle}>👤 Profil Bilgileri</Text>
              <TouchableOpacity 
                style={dynamicStyles.profileModalCloseButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.profileModalContent}>
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Ad Soyad</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={profileData.full_name}
                  onChangeText={(text) => setProfileData({...profileData, full_name: text})}
                  placeholder="Adınızı girin"
                  placeholderTextColor={currentTheme.colors.secondary}
                />
              </View>
              
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Email</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { opacity: 0.6 }]}
                  value={user?.email || ''}
                  editable={false}
                  placeholderTextColor={currentTheme.colors.secondary}
                />
                <Text style={dynamicStyles.inputHint}>
                  Email değiştirmek için hesap ayarlarını kullanın
                </Text>
              </View>
              
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Hakkında</Text>
                <TextInput
                  style={[dynamicStyles.textInput, dynamicStyles.textArea]}
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({...profileData, bio: text})}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  placeholderTextColor={currentTheme.colors.secondary}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={dynamicStyles.profileModalButtonContainer}>
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonSecondary]}
                  onPress={() => setShowProfileModal(false)}
                >
                  <Text style={dynamicStyles.profileModalButtonTextSecondary}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonPrimary]}
                  onPress={saveProfile}
                >
                  <Text style={dynamicStyles.profileModalButtonTextPrimary}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Email Değiştirme Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={dynamicStyles.profileModalOverlay}>
          <View style={dynamicStyles.profileModalContainer}>
            <View style={dynamicStyles.profileModalHeader}>
              <Text style={dynamicStyles.profileModalTitle}>📧 Email Değiştir</Text>
              <TouchableOpacity 
                style={dynamicStyles.profileModalCloseButton}
                onPress={() => setShowEmailModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.profileModalContent}>
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Yeni Email Adresi</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="yeni@email.com"
                  placeholderTextColor={currentTheme.colors.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={dynamicStyles.inputHint}>
                  Yeni email adresinize doğrulama mesajı gönderilecek
                </Text>
              </View>
              
              <View style={dynamicStyles.profileModalButtonContainer}>
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonSecondary]}
                  onPress={() => setShowEmailModal(false)}
                >
                  <Text style={dynamicStyles.profileModalButtonTextSecondary}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonPrimary]}
                  onPress={handleEmailChange}
                >
                  <Text style={dynamicStyles.profileModalButtonTextPrimary}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Şifre Değiştirme Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={dynamicStyles.profileModalOverlay}>
          <View style={dynamicStyles.profileModalContainer}>
            <View style={dynamicStyles.profileModalHeader}>
              <Text style={dynamicStyles.profileModalTitle}>🔑 Şifre Değiştir</Text>
              <TouchableOpacity 
                style={dynamicStyles.profileModalCloseButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.profileModalContent}>
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Yeni Şifre</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={currentTheme.colors.secondary}
                  secureTextEntry
                />
              </View>
              
              <View style={dynamicStyles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Şifre Tekrar</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={currentTheme.colors.secondary}
                  secureTextEntry
                />
              </View>
              
              <View style={dynamicStyles.profileModalButtonContainer}>
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonSecondary]}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Text style={dynamicStyles.profileModalButtonTextSecondary}>İptal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[dynamicStyles.profileModalButton, dynamicStyles.profileModalButtonPrimary]}
                  onPress={handlePasswordChange}
                >
                  <Text style={dynamicStyles.profileModalButtonTextPrimary}>Güncelle</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Dil Seçici Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={dynamicStyles.profileModalOverlay}>
          <View style={dynamicStyles.profileModalContainer}>
            <View style={dynamicStyles.profileModalHeader}>
              <Text style={dynamicStyles.profileModalTitle}>🌐 {t('settings.language')}</Text>
              <TouchableOpacity 
                style={dynamicStyles.profileModalCloseButton}
                onPress={() => setShowLanguageModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={dynamicStyles.profileModalContent}>
              <TouchableOpacity
                style={[
                  dynamicStyles.languageOption,
                  language === 'tr' && dynamicStyles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange('tr')}
              >
                <View style={dynamicStyles.languageOptionContent}>
                  <Text style={[
                    dynamicStyles.languageOptionFlag,
                    language === 'tr' && dynamicStyles.languageOptionFlagSelected
                  ]}>🇹🇷</Text>
                  <View style={dynamicStyles.languageOptionText}>
                    <Text style={[
                      dynamicStyles.languageOptionTitle,
                      language === 'tr' && dynamicStyles.languageOptionTitleSelected
                    ]}>{t('settings.turkish')}</Text>
                    <Text style={[
                      dynamicStyles.languageOptionSubtitle,
                      language === 'tr' && dynamicStyles.languageOptionSubtitleSelected
                    ]}>Türkçe</Text>
                  </View>
                  {language === 'tr' && (
                    <Ionicons name="checkmark-circle" size={24} color={currentTheme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  dynamicStyles.languageOption,
                  language === 'en' && dynamicStyles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <View style={dynamicStyles.languageOptionContent}>
                  <Text style={[
                    dynamicStyles.languageOptionFlag,
                    language === 'en' && dynamicStyles.languageOptionFlagSelected
                  ]}>🇺🇸</Text>
                  <View style={dynamicStyles.languageOptionText}>
                    <Text style={[
                      dynamicStyles.languageOptionTitle,
                      language === 'en' && dynamicStyles.languageOptionTitleSelected
                    ]}>{t('settings.english')}</Text>
                    <Text style={[
                      dynamicStyles.languageOptionSubtitle,
                      language === 'en' && dynamicStyles.languageOptionSubtitleSelected
                    ]}>English</Text>
                  </View>
                  {language === 'en' && (
                    <Ionicons name="checkmark-circle" size={24} color={currentTheme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


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
  // Profil Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonTextSecondary: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
