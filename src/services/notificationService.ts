/**
 * Bildirim Servisi
 * Yerel bildirimleri yönetir
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessageByTimeOfDay,
  getMessageByDayOfWeek,
  getRandomMessage,
  celebrationMessages,
  celebrationMessagesEN,
  missingYouMessages,
  missingYouMessagesEN,
  motivationalMessages,
  motivationalMessagesEN,
  weekendMessages,
  weekendMessagesEN,
  morningMessages,
  morningMessagesEN,
  afternoonMessages,
  afternoonMessagesEN,
  eveningMessages,
  eveningMessagesEN,
  eveningReminderMessages,
  eveningReminderMessagesEN,
  nightMessages,
  nightMessagesEN
} from '../constants/notifications';
import { getCurrentLanguage } from './languageService';
import { 
  getUserTimezone, 
  getLocalDateISO, 
  getLocalDayOfWeek, 
  isWeekendLocal, 
  getGreetingMessage, 
  getWeekendMessage 
} from '../utils/dateTimeUtils';

// Sadece sistem sesi kullan - özel ses dosyaları kaldırıldı
const getSystemSound = () => {
  return 'default'; // Tüm kanallar için sistem sesi
};

// Debug: Ses stratejisi
if (__DEV__) console.log('🎵 Sound Strategy: Using system sounds only');

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  morningEnabled: boolean;
  morningTime: string; // "09:00" formatında
  lunchEnabled?: boolean;
  lunchTime?: string; // "12:00" formatında
  eveningEnabled: boolean;
  eveningTime: string; // "21:00" formatında
  taskRemindersEnabled: boolean;
  achievementsEnabled: boolean;
  timezone: string; // "Europe/Istanbul", "America/New_York", etc.
  quietHoursEnabled?: boolean;
  quietStartTime?: string;
  quietEndTime?: string;
  weeklyMotivationEnabled?: boolean; // Hafta içi motivasyon tonu
  weekendMotivationEnabled?: boolean; // Hafta sonu motivasyon tonu
  dailySummaryEnabled?: boolean; // Günlük özet bildirimi
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningEnabled: true,
  morningTime: '09:00',
  lunchEnabled: true,
  lunchTime: '12:00',
  eveningEnabled: true,
  eveningTime: '21:00',
  taskRemindersEnabled: true,
  achievementsEnabled: true,
  timezone: getUserTimezone(), // Kullanıcının saat dilimi
  quietHoursEnabled: false,
  quietStartTime: '23:00',
  quietEndTime: '07:00',
  weeklyMotivationEnabled: true,
  weekendMotivationEnabled: true,
  dailySummaryEnabled: true,
};

/**
 * Bildirim İzni İste
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('⚠️ Simulator detected - notifications may not work properly');
    // Simulator'da da izin iste, ama uyar
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) console.log('Failed to get push token for push notification!');
    return false;
  }

  // Android için tek kanal oluştur
  if (Platform.OS === 'android') {
    // Dil kontrolü ile kanal adını ayarla
    const userLanguage = await getCurrentLanguage();
    const channelName = userLanguage === 'en' ? 'Daily Notifications' : 'Günlük Bildirimleri';
    
    await Notifications.setNotificationChannelAsync('default', {
      name: channelName,
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true, // Sistem titreşimi
      enableLights: true,
      showBadge: true,
    });
    
    if (__DEV__) console.log('Android notification channel created successfully');
  }

  return true;
};

/**
 * Ayarları Yükle
 */
export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    if (!settings) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(settings);
    // Eski kayıtlarla uyum: eksik alanları varsayılanlarla doldur
    return { ...DEFAULT_SETTINGS, ...parsed } as NotificationSettings;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Ayarları Kaydet
 */
export const saveNotificationSettings = async (settings: NotificationSettings, userId?: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    // Ayarlar değiştiğinde bildirimleri yeniden planla
    await scheduleAllNotifications(userId);
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

// isQuietHours fonksiyonu kaldırıldı

/**
 * Yerel Bildirim Gönder
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  channelId: string = 'default',
  skipChecks: boolean = false // Test bildirimleri için kontrolleri atla
): Promise<void> => {
  const settings = await loadNotificationSettings();

  // Test bildirimi değilse normal kontrolleri yap
  if (!skipChecks) {
    if (!settings.enabled) {
      if (__DEV__) console.log('Notifications disabled');
      return;
    }

    // Quiet hours check
    if (settings.quietHoursEnabled) {
      try {
        const now = new Date();
        const [qsH, qsM] = (settings.quietStartTime || '23:00').split(':').map(Number);
        const [qeH, qeM] = (settings.quietEndTime || '07:00').split(':').map(Number);
        const start = new Date(now); start.setHours(qsH, qsM, 0, 0);
        const end = new Date(now); end.setHours(qeH, qeM, 0, 0);
        const inQuiet = start <= end ? (now >= start && now <= end) : (now >= start || now <= end);
        if (inQuiet) {
          if (__DEV__) console.log('🔕 Quiet hours active: suppressing local notification');
          return;
        }
      } catch {}
    }
  }

  // Sadece sistem sesi kullan
  const selectedSound = getSystemSound();
  if (__DEV__) console.log('🎵 Sending notification:', { title, body, channelId, sound: selectedSound, platform: Platform.OS });

  // Sistem titreşimi kullan
  if (__DEV__) console.log('📳 Using system vibration');

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: selectedSound, // Sistem sesi kullan
      priority: Notifications.AndroidNotificationPriority.MAX, // MAX priority
      ...(Platform.OS === 'android' && { 
        channelId: 'default',
      }),
    },
    trigger: null, // Hemen gönder
  });
  
  if (__DEV__) console.log('Notification sent successfully');
};

/**
 * Planlı Bildirim Oluştur
 */
export const scheduleNotification = async (
  identifier: string,
  title: string,
  body: string,
  hour: number,
  minute: number,
  repeats: boolean = true,
  channelId: string = 'default'
): Promise<string> => {
  // ⚠️ ÖNEMLİ: CalendarTriggerInput timezone parametresi YOK
  // Bu yüzden cihazın YEREL SAATİNE göre çalışır
  // Türkiye'deki cihaz → Türkiye saatine göre (hour: 21 = Türkiye saati 21:00)
  // Amerika'daki cihaz → Amerika saatine göre (hour: 21 = Amerika saati 21:00)
  // Bu tam istediğimiz şey! ✅
  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour,
    minute,
    repeats,
    // ⚠️ timezone parametresi YOK - cihazın yerel saatine göre çalışır
  };

  // Sadece sistem sesi kullan
  const selectedSound = getSystemSound();
  if (__DEV__) console.log('🎵 Scheduling notification:', { identifier, title, hour, minute, channelId, sound: selectedSound, platform: Platform.OS });

  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: selectedSound, // String path kullan
      priority: Notifications.AndroidNotificationPriority.HIGH, // HIGH priority
        ...(Platform.OS === 'android' && { 
          channelId,
        }),
    },
    trigger,
  });
};

/**
 * Sabah Bildirimi Planla
 */
export const scheduleMorningNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.morningEnabled) return;

  const [hour, minute] = settings.morningTime.split(':').map(Number);
  
  // Kullanıcının timezone'unu al
  const userTimezone = settings.timezone || getUserTimezone();
  
  // Sabah saatleri kontrolü (05:00 - 11:00)
  if (hour < 5 || hour >= 11) {
    if (__DEV__) console.warn(`⚠️ Morning notification scheduled for ${hour}:${minute} (not morning hours 5-11!)`);
  }
  
  if (__DEV__) {
    console.log(`🌍 Scheduling morning notification for timezone: ${userTimezone}, hour: ${hour}:${minute}`);
  }
  
  // Hafta içi/sonu kontrolü - bildirimler her gün tekrar ediyor, bu yüzden
  // Hafta içi ve hafta sonu için ayrı bildirimler planlamalıyız
  // Şimdilik hafta içi mesajı kullan (her gün gönderilecek)
  
  // Hafta içi bildirimi (Pazartesi-Cuma)
  if (settings.weeklyMotivationEnabled) {
    // Dil kontrolü ile mesaj seç
    const userLanguage = await getCurrentLanguage();
    // Güvenlik kontrolü: mesaj setlerinin varlığını kontrol et
    const messagesToUse = userLanguage === 'en' 
      ? (morningMessagesEN && morningMessagesEN.length > 0 ? morningMessagesEN : morningMessages)
      : (morningMessages && morningMessages.length > 0 ? morningMessages : morningMessagesEN || []);
    const weekdayMessage = getRandomMessage(messagesToUse);
    
    // Hafta içi günler için bildirim planla (Pazartesi=2, Cuma=6)
    // ⚠️ ÖNEMLİ: CalendarTriggerInput timezone parametresi YOK
    // Bu yüzden cihazın YEREL SAATİNE göre çalışır
    // Türkiye'deki cihaz → Türkiye saatine göre
    // Amerika'daki cihaz → Amerika saatine göre
    // Bu tam istediğimiz şey! ✅
    for (let weekday = 2; weekday <= 6; weekday++) {
      await Notifications.scheduleNotificationAsync({
        identifier: `morning-reminder-weekday-${weekday}`,
        content: {
          title: weekdayMessage.title,
          body: weekdayMessage.body,
          sound: getSystemSound(),
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            action: 'openMindfulness',
            type: 'morning',
            screen: 'Mindfulness'
          },
          ...(Platform.OS === 'android' && { channelId: 'default' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday,
          hour,
          minute,
          repeats: true,
          // ⚠️ timezone parametresi YOK - cihazın yerel saatine göre çalışır
        },
      });
    }
    
    if (__DEV__) console.log(`✅ Morning weekday notifications scheduled for ${hour}:${minute} (Monday-Friday)`);
  }
  
  // Hafta sonu bildirimi (Cumartesi-Pazar)
  if (settings.weekendMotivationEnabled) {
    // Dil kontrolü ile mesaj seç
    const userLanguageWeekend = await getCurrentLanguage();
    // Güvenlik kontrolü: mesaj setlerinin varlığını kontrol et
    const weekendMessagesToUse = userLanguageWeekend === 'en'
      ? (weekendMessagesEN && weekendMessagesEN.length > 0 ? weekendMessagesEN : weekendMessages)
      : (weekendMessages && weekendMessages.length > 0 ? weekendMessages : weekendMessagesEN || []);
    const weekendMessage = getRandomMessage(weekendMessagesToUse);
    
    // Hafta sonu günler için bildirim planla (Cumartesi=7, Pazar=1)
    for (let weekday of [1, 7]) {
      await Notifications.scheduleNotificationAsync({
        identifier: `morning-reminder-weekend-${weekday}`,
        content: {
          title: weekendMessage.title,
          body: weekendMessage.body,
          sound: getSystemSound(),
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            action: 'openMindfulness',
            type: 'morning',
            screen: 'Mindfulness'
          },
          ...(Platform.OS === 'android' && { channelId: 'default' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday,
          hour,
          minute,
          repeats: true,
        },
      });
    }
    
    if (__DEV__) console.log(`✅ Morning weekend notifications scheduled for ${hour}:${minute} (Saturday-Sunday)`);
  }

  if (__DEV__) console.log(`✅ Morning notifications scheduled for ${hour}:${minute}`);
};

/**
 * Öğlen Bildirimi Planla
 */
export const scheduleLunchNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || settings.lunchEnabled === false) return;

  const [hour, minute] = (settings.lunchTime || '12:00').split(':').map(Number);

  // Kullanıcının timezone'unu al
  const userTimezone = settings.timezone || getUserTimezone();

  // Öğlen bildirimi için saat kontrolü ile doğru mesaj seç
  // Öğlen saatleri: 11:00 - 15:59 arası
  // Dil kontrolü ile mesaj seç
  const userLanguage = await getCurrentLanguage();
  
  if (__DEV__) {
    console.log(`🌍 Scheduling lunch notification for timezone: ${userTimezone}, hour: ${hour}:${minute}`);
  }
  // Güvenlik kontrolü: mesaj setlerinin varlığını kontrol et
  const afternoonMessagesToUse = userLanguage === 'en'
    ? (afternoonMessagesEN && afternoonMessagesEN.length > 0 ? afternoonMessagesEN : afternoonMessages)
    : (afternoonMessages && afternoonMessages.length > 0 ? afternoonMessages : afternoonMessagesEN || []);
  let message;
  if (hour >= 11 && hour < 16) {
    // Öğlen bildirimi için öğlen mesajları kullan
    message = getRandomMessage(afternoonMessagesToUse);
    if (__DEV__) console.log(`✅ Afternoon message selected for ${hour}:${minute} (afternoon hours, language: ${userLanguage})`);
  } else {
    // Yanlış zamanlama - uyarı ver ama öğlen mesajı kullan
    if (__DEV__) console.warn(`⚠️ Lunch notification scheduled for ${hour}:${minute} (not afternoon hours!), using afternoon message anyway`);
    message = getRandomMessage(afternoonMessagesToUse);
  }

  await scheduleNotification(
    'lunch-reminder',
    message.title,
    message.body,
    hour,
    minute,
    true,
    'default'
  );

  if (__DEV__) console.log(`Lunch notification scheduled for ${hour}:${minute}`);
};

/**
 * Bugün günlük yazılıp yazılmadığını kontrol et (timezone-aware)
 */
const checkTodayDiaryWritten = async (userId?: string, timezone?: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Kullanıcının timezone'una göre bugünün tarihini al
    const userTimezone = timezone || getUserTimezone();
    const today = getLocalDateISO(userTimezone);
    
    const DIARY_STORAGE_KEY = 'diary_entries';
    const storedEntries = await AsyncStorage.getItem(`${DIARY_STORAGE_KEY}_${userId}`);
    
    if (!storedEntries) return false;
    
    const entries = JSON.parse(storedEntries);
    const todayEntry = entries.find((entry: any) => entry.date === today);
    
    return !!todayEntry;
  } catch (error) {
    console.error('Error checking today diary:', error);
    return false;
  }
};

/**
 * Akşam Bildirimi Planla
 */
export const scheduleEveningNotification = async (userId?: string): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.eveningEnabled) return;

  const [hour, minute] = settings.eveningTime.split(':').map(Number);
  
  // CRITICAL FIX: Validate evening notification time - should be between 16:00-23:59
  // If user has set an invalid time (like 10:15 AM), don't schedule night messages
  if (hour < 16 || hour >= 24) {
    console.warn(`⚠️ Evening notification time ${hour}:${minute} is invalid. Evening notifications should be scheduled between 16:00-23:59. Skipping scheduling.`);
    return; // Don't schedule if time is invalid
  }
  
  // Kullanıcının timezone'unu al
  const userTimezone = settings.timezone || getUserTimezone();
  
  // Saat kontrolü ile doğru mesaj tipini belirle (timezone-aware)
  // Not: Expo Notifications CalendarTriggerInput zaten cihazın yerel saatine göre çalışır
  // Bu yüzden hour ve minute değerleri kullanıcının timezone'una göre yorumlanmalı
  let messageType: 'night' | 'evening' = 'evening';
  if (hour >= 21 && hour < 24) {
    messageType = 'night';
  } else {
    // 16:00-20:59 arası akşam mesajları
    messageType = 'evening';
  }
  
  if (__DEV__) {
    console.log(`🌍 Scheduling evening notification for timezone: ${userTimezone}, hour: ${hour}:${minute}, messageType: ${messageType}`);
  }
  
  // Hafta içi bildirimi (Pazartesi-Cuma)
  if (settings.weeklyMotivationEnabled) {
    let weekdayMessage;
    
    // Dil kontrolü
    const userLanguage = await getCurrentLanguage();
    
    if (messageType === 'night') {
      // Gece mesajları (21:00+)
      const nightMessagesToUse = userLanguage === 'en'
        ? (nightMessagesEN && nightMessagesEN.length > 0 ? nightMessagesEN : nightMessages)
        : (nightMessages && nightMessages.length > 0 ? nightMessages : nightMessagesEN || []);
      weekdayMessage = getRandomMessage(nightMessagesToUse);
      if (__DEV__) console.log(`✅ Night message selected for ${hour}:${minute} (night hours, language: ${userLanguage})`);
    } else if (messageType === 'evening') {
      // Akşam mesajları - her zaman normal akşam mesajlarını kullan
      // (checkTodayDiaryWritten kontrolü kaldırıldı çünkü bildirim zamanlanırken kontrol ediliyor, tetiklendiğinde değil)
      const eveningMessagesToUse = userLanguage === 'en'
        ? (eveningMessagesEN && eveningMessagesEN.length > 0 ? eveningMessagesEN : eveningMessages)
        : (eveningMessages && eveningMessages.length > 0 ? eveningMessages : eveningMessagesEN || []);
      weekdayMessage = getRandomMessage(eveningMessagesToUse);
      if (__DEV__) console.log(`✅ Evening message selected for ${hour}:${minute} (evening hours, language: ${userLanguage})`);
    } else if (messageType === 'afternoon') {
      const afternoonMessagesToUse = userLanguage === 'en'
        ? (afternoonMessagesEN && afternoonMessagesEN.length > 0 ? afternoonMessagesEN : afternoonMessages)
        : (afternoonMessages && afternoonMessages.length > 0 ? afternoonMessages : afternoonMessagesEN || []);
      weekdayMessage = getRandomMessage(afternoonMessagesToUse);
    } else {
      const morningMessagesToUse = userLanguage === 'en'
        ? (morningMessagesEN && morningMessagesEN.length > 0 ? morningMessagesEN : morningMessages)
        : (morningMessages && morningMessages.length > 0 ? morningMessages : morningMessagesEN || []);
      weekdayMessage = getRandomMessage(morningMessagesToUse);
    }
    
    // Hafta içi günler için bildirim planla (Pazartesi=2, Cuma=6)
    // ⚠️ ÖNEMLİ: CalendarTriggerInput timezone parametresi YOK
    // Bu yüzden cihazın YEREL SAATİNE göre çalışır
    // Türkiye'deki cihaz → Türkiye saatine göre
    // Amerika'daki cihaz → Amerika saatine göre
    // Bu tam istediğimiz şey! ✅
    for (let weekday = 2; weekday <= 6; weekday++) {
      await Notifications.scheduleNotificationAsync({
        identifier: `evening-reminder-weekday-${weekday}`,
        content: {
          title: weekdayMessage.title,
          body: weekdayMessage.body,
          sound: getSystemSound(),
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            action: 'openBreathing',
            type: 'evening',
            screen: 'Mindfulness'
          },
          ...(Platform.OS === 'android' && { channelId: 'default' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday,
          hour,
          minute,
          repeats: true,
          // ⚠️ timezone parametresi YOK - cihazın yerel saatine göre çalışır
        },
      });
    }
    
    if (__DEV__) console.log(`✅ Evening weekday notifications scheduled for ${hour}:${minute} (Monday-Friday, type: ${messageType})`);
  }
  
  // Hafta sonu bildirimi (Cumartesi-Pazar)
  if (settings.weekendMotivationEnabled) {
    let weekendMessage;
    
    // Dil kontrolü
    const userLanguageWeekend = await getCurrentLanguage();
    
    // Hafta içi ile aynı mantık: mesaj tipine göre mesaj seç
    if (messageType === 'night') {
      // Gece mesajları (21:00+)
      const nightMessagesToUse = userLanguageWeekend === 'en'
        ? (nightMessagesEN && nightMessagesEN.length > 0 ? nightMessagesEN : nightMessages)
        : (nightMessages && nightMessages.length > 0 ? nightMessages : nightMessagesEN || []);
      weekendMessage = getRandomMessage(nightMessagesToUse);
      if (__DEV__) console.log(`✅ Night message selected for ${hour}:${minute} (night hours, language: ${userLanguageWeekend})`);
    } else if (messageType === 'evening') {
      // Akşam mesajları - her zaman normal akşam mesajlarını kullan
      // (checkTodayDiaryWritten kontrolü kaldırıldı çünkü bildirim zamanlanırken kontrol ediliyor, tetiklendiğinde değil)
      const eveningMessagesToUse = userLanguageWeekend === 'en'
        ? (eveningMessagesEN && eveningMessagesEN.length > 0 ? eveningMessagesEN : eveningMessages)
        : (eveningMessages && eveningMessages.length > 0 ? eveningMessages : eveningMessagesEN || []);
      weekendMessage = getRandomMessage(eveningMessagesToUse);
      if (__DEV__) console.log(`✅ Evening message selected for ${hour}:${minute} (evening hours, language: ${userLanguageWeekend})`);
    } else if (messageType === 'afternoon') {
      const afternoonMessagesToUse = userLanguageWeekend === 'en'
        ? (afternoonMessagesEN && afternoonMessagesEN.length > 0 ? afternoonMessagesEN : afternoonMessages)
        : (afternoonMessages && afternoonMessages.length > 0 ? afternoonMessages : afternoonMessagesEN || []);
      weekendMessage = getRandomMessage(afternoonMessagesToUse);
    } else {
      // Varsayılan olarak weekend mesajları kullan
      const weekendMessagesToUse = userLanguageWeekend === 'en'
        ? (weekendMessagesEN && weekendMessagesEN.length > 0 ? weekendMessagesEN : weekendMessages)
        : (weekendMessages && weekendMessages.length > 0 ? weekendMessages : weekendMessagesEN || []);
      weekendMessage = getRandomMessage(weekendMessagesToUse);
    }
    
    // Hafta sonu günler için bildirim planla (Cumartesi=7, Pazar=1)
    for (let weekday of [1, 7]) {
      await Notifications.scheduleNotificationAsync({
        identifier: `evening-reminder-weekend-${weekday}`,
        content: {
          title: weekendMessage.title,
          body: weekendMessage.body,
          sound: getSystemSound(),
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            action: 'openBreathing',
            type: 'evening',
            screen: 'Mindfulness'
          },
          ...(Platform.OS === 'android' && { channelId: 'default' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday,
          hour,
          minute,
          repeats: true,
        },
      });
    }
    
    if (__DEV__) console.log(`✅ Evening weekend notifications scheduled for ${hour}:${minute} (Saturday-Sunday, type: ${messageType})`);
  }

  if (__DEV__) console.log(`✅ Evening notifications scheduled for ${hour}:${minute}`);
};

/**
 * Günlük Özet Bildirimi Planla
 */
export const scheduleDailySummaryNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.dailySummaryEnabled) return;

  // Kullanıcının timezone'unu al
  const userTimezone = settings.timezone || getUserTimezone();

  // Gün sonu özeti için saat 22:00
  const hour = 22;
  const minute = 0;

  // Dil kontrolü ile mesaj seç
  const userLanguage = await getCurrentLanguage();
  
  if (__DEV__) {
    console.log(`🌍 Scheduling daily summary notification for timezone: ${userTimezone}, hour: ${hour}:${minute}`);
  }
  
  const title = userLanguage === 'en' ? '📊 Daily Summary' : '📊 Günlük Özet';
  const body = userLanguage === 'en' 
    ? 'Check out today\'s summary! How close are you to your goals?'
    : 'Bugünün özetine göz at! Hedeflerine ne kadar yaklaştın?';

  await scheduleNotification(
    'daily-summary',
    title,
    body,
    hour,
    minute,
    true,
    'default'
  );

  if (__DEV__) console.log(`Daily summary notification scheduled for ${hour}:${minute} (language: ${userLanguage})`);
};

/**
 * Günlük Görev Kontrolü Bildirimi (20:00)
 */
export const scheduleDailyTaskCheck = async (): Promise<void> => {
  const settings = await loadNotificationSettings();
  
  if (!settings.enabled || !settings.taskRemindersEnabled) return;

  // Kullanıcının timezone'unu al
  const userTimezone = settings.timezone || getUserTimezone();

  // Dil kontrolü ile mesaj seç
  const userLanguage = await getCurrentLanguage();
  
  if (__DEV__) {
    console.log(`🌍 Scheduling daily task check notification for timezone: ${userTimezone}, hour: 20:00`);
  }
  const title = userLanguage === 'en' ? '📝 Daily Task Check' : '📝 Günlük Görev Kontrolü';
  const body = userLanguage === 'en'
    ? 'How are your tasks going today? Let\'s check! 🎯'
    : 'Bugünkü görevlerin nasıl gidiyor? Hadi kontrol edelim! 🎯';

  await scheduleNotification(
    'daily-task-check',
    title,
    body,
    20,
    0,
    true,
    'default'
  );

  if (__DEV__) console.log(`Daily task check notification scheduled for 20:00 (language: ${userLanguage})`);
};

/**
 * Kullanıcı Aktivite Kontrolü Bildirimi (22:00)
 * Eğer kullanıcı uzun süre yazmamışsa
 */
export const scheduleUserActivityCheck = async (): Promise<void> => {
  const settings = await loadNotificationSettings();
  
  if (!settings.enabled) return;

  // Bu bildirim günlük yazım kontrolü yapıyor, o yüzden akşam bildirimine entegre edildi
  // Ayrı bir bildirim olarak tutuyoruz ama şimdilik kullanmıyoruz
  console.log('User activity check is handled by evening notification');
};

/**
 * Tüm Bildirimleri Planla (Tek Merkezi Scheduler)
 */
export const scheduleAllNotifications = async (userId?: string): Promise<void> => {
  try {
    // Önce tüm mevcut bildirimleri iptal et
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) console.log('✅ Tüm eski bildirimler iptal edildi');

    // CRITICAL FIX: Validate and fix evening notification time if invalid
    // This prevents "Sleep tight zzz" notifications at wrong times (like 10:15 AM)
    const settings = await loadNotificationSettings();
    if (settings.eveningEnabled) {
      const [hour] = settings.eveningTime.split(':').map(Number);
      if (hour < 16 || hour >= 24) {
        console.warn(`⚠️ Invalid evening notification time detected: ${settings.eveningTime}. Resetting to default 21:00.`);
        // Reset to default evening time
        settings.eveningTime = '21:00';
        await saveNotificationSettings(settings, userId);
      }
    }

    // Yeni bildirimleri planla - her birini ayrı try-catch ile yakala
    try {
      await scheduleMorningNotification();
    } catch (error) {
      console.error('❌ Sabah bildirimi planlanırken hata:', error);
    }
    
    try {
      await scheduleLunchNotification();
    } catch (error) {
      console.error('❌ Öğlen bildirimi planlanırken hata:', error);
    }
    
    try {
      await scheduleEveningNotification(userId);
    } catch (error) {
      console.error('❌ Akşam bildirimi planlanırken hata:', error);
    }
    
    try {
      await scheduleDailySummaryNotification();
    } catch (error) {
      console.error('❌ Günlük özet bildirimi planlanırken hata:', error);
    }
    
    try {
      await scheduleDailyTaskCheck();
    } catch (error) {
      console.error('❌ Görev kontrolü bildirimi planlanırken hata:', error);
    }

    if (__DEV__) console.log('✅ Tüm bildirimler başarıyla zamanlandı');
  } catch (error) {
    console.error('❌ Bildirimler zamanlanırken genel hata:', error);
    // Hatanın detaylarını logla
    if (error instanceof Error) {
      console.error('❌ Hata mesajı:', error.message);
      console.error('❌ Hata stack:', error.stack);
    }
  }
};

/**
 * Belirli Bir Bildirimi İptal Et
 */
export const cancelNotification = async (identifier: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

/**
 * Tüm Bildirimleri İptal Et
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
};

/**
 * Görev Hatırlatması Gönder
 */
export const sendTaskReminder = async (
  taskTitle: string,
  taskTime: Date,
  minutesBefore: number = 60
): Promise<string> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.taskRemindersEnabled) {
    return '';
  }

  // Dil kontrolü yap
  const userLanguage = await getCurrentLanguage();

  const notificationTime = new Date(taskTime.getTime() - minutesBefore * 60 * 1000);
  
  // Geçmiş bir zaman ise bildirimi gönderme
  if (notificationTime < new Date()) {
    return '';
  }

  const identifier = `task-${taskTitle}-${taskTime.getTime()}`;

  // Dil kontrolü ile title ve body ayarla
  const title = userLanguage === 'en' ? '✅ Task Reminder' : '✅ Görev Hatırlatması';
  const body = userLanguage === 'en' 
    ? `In ${minutesBefore} minutes: ${taskTitle}`
    : `${minutesBefore} dakika sonra: ${taskTitle}`;

  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' && { channelId: 'task-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationTime,
    },
  });
};

/**
 * Başarı Bildirimi Gönder
 */
export const sendAchievementNotification = async (
  achievement: string,
  description: string
): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.achievementsEnabled) return;

  // Dil kontrolü yap ve uygun mesajları kullan
  const userLanguage = await getCurrentLanguage();
  const messagesToUse = userLanguage === 'en' ? celebrationMessagesEN : celebrationMessages;
  const message = getRandomMessage(messagesToUse);

  await sendLocalNotification(
    message.title,
    `${achievement}! ${description}`,
    { type: 'achievement' },
    'achievements'
  );
};

/**
 * Özleme Bildirimi Gönder (3+ gün yazmamışsa)
 */
export const sendMissingYouNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled) return;

  // Dil kontrolü yap ve uygun mesajları kullan
  const userLanguage = await getCurrentLanguage();
  const messagesToUse = userLanguage === 'en' ? missingYouMessagesEN : missingYouMessages;
  const message = getRandomMessage(messagesToUse);

  await sendLocalNotification(
    message.title,
    message.body,
    { type: 'missing' },
    'default'
  );
};

/**
 * Motivasyon Bildirimi Gönder
 */
export const sendMotivationalNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled) return;

  // Dil kontrolü yap ve uygun mesajları kullan
  const userLanguage = await getCurrentLanguage();
  const messagesToUse = userLanguage === 'en' ? motivationalMessagesEN : motivationalMessages;
  const message = getRandomMessage(messagesToUse);

  await sendLocalNotification(
    message.title,
    message.body,
    { type: 'motivation' },
    'default'
  );
};

/**
 * Streak Bildirimi Gönder
 */
export const sendStreakNotification = async (days: number): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.achievementsEnabled) return;

  // Dil kontrolü yap
  const userLanguage = await getCurrentLanguage();
  
  let title = '';
  let body = '';

  if (days === 3) {
    title = userLanguage === 'en' ? 'Amazing! 🎉' : 'Harikasın! 🎉';
    body = userLanguage === 'en' ? '3 day streak! Keep it up' : '3 günlük streak! Devam et böyle';
  } else if (days === 7) {
    title = userLanguage === 'en' ? 'Incredible! 🔥' : 'İnanılmaz! 🔥';
    body = userLanguage === 'en' ? '7 day streak! I\'m proud of you' : '7 günlük streak! Kendine hayranım';
  } else if (days === 14) {
    title = userLanguage === 'en' ? 'Legendary! 💎' : 'Efsanesin! 💎';
    body = userLanguage === 'en' ? '14 day streak! This is a lifestyle now' : '14 günlük streak! Bu bir yaşam biçimi artık';
  } else if (days === 30) {
    title = userLanguage === 'en' ? 'Proud! 👑' : 'Gurur duyuyorum! 👑';
    body = userLanguage === 'en' ? '30 day streak! You\'ve made it a habit' : '30 günlük streak! Alışkanlık haline getirmişsin';
  } else if (days % 10 === 0) {
    title = `${days} ${userLanguage === 'en' ? 'Days!' : 'Gün!'} 🌟`;
    body = userLanguage === 'en' 
      ? `${days} day streak! Amazing!` 
      : `${days} günlük streak! Muhteşemsin!`;
  }

  if (title) {
    await sendLocalNotification(
      title,
      body,
      { type: 'streak', days },
      'achievements'
    );
  }
};

/**
 * Hatırlatıcı Bildirimi Planla
 */
export const scheduleReminderNotification = async (
  reminderId: string,
  title: string,
  body: string,
  time: string, // "HH:MM" formatında
  repeatType: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly',
  category: string = 'default',
  date?: string, // "YYYY-MM-DD" formatında - gelecek tarih için
  repeatDays?: number[] // 0-6 (Pazar-Pazartesi) - haftalık hatırlatıcılar için
): Promise<string> => {
  // Saat ve dakikayı parse et ve integer'a çevir
  const timeParts = time.split(':');
  if (timeParts.length !== 2) {
    throw new Error(`Invalid time format: ${time}. Expected format: HH:MM`);
  }
  
  const hour = Math.floor(Number(timeParts[0]));
  const minute = Math.floor(Number(timeParts[1]));
  
  // Validasyon
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Invalid time values: hour=${hour}, minute=${minute}. Must be hour: 0-23, minute: 0-59`);
  }
  
  let trigger: Notifications.CalendarTriggerInput;

  // Tekrar türüne göre trigger oluştur
  switch (repeatType) {
    case 'once':
      // Tek seferlik - belirtilen tarih ve saatte
      let targetDate = new Date();
      
      if (date) {
        // Gelecek tarih belirtilmişse
        const [year, month, day] = date.split('-').map(Number);
        targetDate = new Date(year, month - 1, day, hour, minute, 0, 0);
        
        // Geçmiş bir tarih ise uyarı ver ama planla
        if (targetDate < new Date()) {
          console.warn('⚠️ Scheduling reminder for past date:', targetDate);
        }
      } else {
        // Bugün belirtilen saatte
        targetDate.setHours(hour, minute, 0, 0);
        // Eğer saat geçmişse yarına al
        if (targetDate < new Date()) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
      }
      
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      } as any;
      break;
    
    case 'hourly':
      // Her saat
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };
      break;
    
    case 'daily':
      // Her gün
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };
      break;
    
    case 'weekly':
      // Her hafta - repeatDays varsa belirtilen günlerde, yoksa Pazartesi
      if (repeatDays && Array.isArray(repeatDays) && repeatDays.length > 0) {
        // Her gün için ayrı bildirim planla (haftalık tekrar için)
        // İlk günü al ve o günde planla (tekrarlar her hafta aynı günde olur)
        const firstDay = repeatDays[0];
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: firstDay + 1, // 0=Pazar için 1, 1=Pazartesi için 2, ... 6=Cumartesi için 7
          hour,
          minute,
          repeats: true,
        };
      } else {
        // Varsayılan: Pazartesi
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: 2, // Pazartesi (1=Monday -> 2 in CalendarTriggerInput)
          hour,
          minute,
          repeats: true,
        };
      }
      break;
    
    case 'monthly':
      // Her ay (1. gün)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        day: 1,
        hour,
        minute,
        repeats: true,
      };
      break;
    
    default:
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };
  }

  try {
    const selectedSound = getSystemSound();
    
    if (__DEV__) {
      console.log('🎵 Scheduling reminder notification (iOS):', { 
        reminderId, 
        title, 
        body,
        time, 
        repeatType, 
        date,
        trigger: JSON.stringify(trigger),
        sound: selectedSound 
      });
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: `reminder-${reminderId}`,
      content: {
        title,
        body,
        sound: selectedSound,
        ...(Platform.OS === 'android' && { 
          priority: Notifications.AndroidNotificationPriority.HIGH 
        }),
        data: { type: 'reminder', reminderId, category },
      },
      trigger,
    });

    if (__DEV__) {
      console.log('✅ Reminder notification scheduled successfully:', notificationId);
      console.log('📅 Trigger details:', {
        type: trigger.type,
        date: (trigger as any).date,
        hour: (trigger as any).hour,
        minute: (trigger as any).minute,
        repeats: (trigger as any).repeats,
      });
    }
    
    return notificationId;
  } catch (error: any) {
    console.error('❌ Error scheduling reminder notification:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    throw new Error(error?.message || 'Failed to schedule reminder notification');
  }
};

/**
 * Hatırlatıcı Bildirimini İptal Et
 */
export const cancelReminderNotification = async (reminderId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(`reminder-${reminderId}`);
  console.log(`Reminder notification cancelled: ${reminderId}`);
};

/**
 * Tüm Hatırlatıcı Bildirimlerini İptal Et
 */
export const cancelAllReminderNotifications = async (): Promise<void> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const reminderNotifications = notifications ? notifications.filter(n => 
    n.identifier.startsWith('reminder-')
  ) : [];
  
  for (const notification of reminderNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
  
  if (__DEV__) console.log(`Cancelled ${reminderNotifications.length} reminder notifications`);
};

/**
 * Planlı Bildirimleri Listele (Debug için)
 */
export const listScheduledNotifications = async (): Promise<any[]> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
  return notifications;
};

