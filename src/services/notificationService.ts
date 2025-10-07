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
  missingYouMessages,
  motivationalMessages
} from '../constants/notifications';

// Sadece sistem sesi kullan - özel ses dosyaları kaldırıldı
const getSystemSound = () => {
  return 'default'; // Tüm kanallar için sistem sesi
};

// Debug: Ses stratejisi
console.log('🎵 Sound Strategy: Using system sounds only');

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
  eveningEnabled: boolean;
  eveningTime: string; // "21:00" formatında
  taskRemindersEnabled: boolean;
  achievementsEnabled: boolean;
  // quietHoursEnabled: boolean; // Kaldırıldı
  // quietStartTime: string; // Kaldırıldı
  // quietEndTime: string; // Kaldırıldı
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  morningEnabled: true,
  morningTime: '09:00',
  eveningEnabled: true,
  eveningTime: '21:00',
  taskRemindersEnabled: true,
  achievementsEnabled: true,
  // quietHoursEnabled: true, // Kaldırıldı
  // quietStartTime: '23:00', // Kaldırıldı
  // quietEndTime: '07:00', // Kaldırıldı
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
    console.log('Failed to get push token for push notification!');
    return false;
  }

  // Android için tek kanal oluştur
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Günlük Bildirimleri',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true, // Sistem titreşimi
      enableLights: true,
      showBadge: true,
    });
    
    console.log('Android notification channel created successfully');
  }

  return true;
};

/**
 * Ayarları Yükle
 */
export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Ayarları Kaydet
 */
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    // Ayarlar değiştiğinde bildirimleri yeniden planla
    await scheduleAllNotifications();
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
  channelId: string = 'default'
): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled) {
    console.log('Notifications disabled');
    return;
  }

  // Sadece sistem sesi kullan
  const selectedSound = getSystemSound();
  console.log('🎵 Sending notification:', { title, body, channelId, sound: selectedSound, platform: Platform.OS });

  // Sistem titreşimi kullan
  console.log('📳 Using system vibration');

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
  
  console.log('Notification sent successfully');
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
  const trigger: Notifications.CalendarTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    hour,
    minute,
    repeats,
  };

  // Sadece sistem sesi kullan
  const selectedSound = getSystemSound();
  console.log('🎵 Scheduling notification:', { identifier, title, hour, minute, channelId, sound: selectedSound, platform: Platform.OS });

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
  const message = getMessageByDayOfWeek();

  await Notifications.cancelScheduledNotificationAsync('morning-reminder');
  await scheduleNotification(
    'morning-reminder',
    message.title,
    message.body,
    hour,
    minute,
    true,
    'default'
  );

  console.log(`Morning notification scheduled for ${hour}:${minute}`);
};

/**
 * Akşam Bildirimi Planla
 */
export const scheduleEveningNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.eveningEnabled) return;

  const [hour, minute] = settings.eveningTime.split(':').map(Number);
  const message = getMessageByTimeOfDay();

  await Notifications.cancelScheduledNotificationAsync('evening-reminder');
  await scheduleNotification(
    'evening-reminder',
    message.title,
    message.body,
    hour,
    minute,
    true,
    'default'
  );

  console.log(`Evening notification scheduled for ${hour}:${minute}`);
};

/**
 * Tüm Bildirimleri Planla
 */
export const scheduleAllNotifications = async (): Promise<void> => {
  // Önce tüm mevcut bildirimleri iptal et
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Yeni bildirimleri planla
  await scheduleMorningNotification();
  await scheduleEveningNotification();

  console.log('All notifications scheduled');
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

  const notificationTime = new Date(taskTime.getTime() - minutesBefore * 60 * 1000);
  
  // Geçmiş bir zaman ise bildirimi gönderme
  if (notificationTime < new Date()) {
    return '';
  }

  const identifier = `task-${taskTitle}-${taskTime.getTime()}`;

  return await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: '✅ Görev Hatırlatması',
      body: `${minutesBefore} dakika sonra: ${taskTitle}`,
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

  const message = getRandomMessage(celebrationMessages);

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

  const message = getRandomMessage(missingYouMessages);

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

  const message = getRandomMessage(motivationalMessages);

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

  let title = '';
  let body = '';

  if (days === 3) {
    title = 'Harikasın! 🎉';
    body = '3 günlük streak! Devam et böyle';
  } else if (days === 7) {
    title = 'İnanılmaz! 🔥';
    body = '7 günlük streak! Kendine hayranım';
  } else if (days === 14) {
    title = 'Efsanesin! 💎';
    body = '14 günlük streak! Bu bir yaşam biçimi artık';
  } else if (days === 30) {
    title = 'Gurur duyuyorum! 👑';
    body = '30 günlük streak! Alışkanlık haline getirmişsin';
  } else if (days % 10 === 0) {
    title = `${days} Gün! 🌟`;
    body = `${days} günlük streak! Muhteşemsin!`;
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
 * Planlı Bildirimleri Listele (Debug için)
 */
export const listScheduledNotifications = async (): Promise<any[]> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
  return notifications;
};

