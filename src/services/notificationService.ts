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
  motivationalMessages,
  weekendMessages
} from '../constants/notifications';
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
  channelId: string = 'default',
  skipChecks: boolean = false // Test bildirimleri için kontrolleri atla
): Promise<void> => {
  const settings = await loadNotificationSettings();

  // Test bildirimi değilse normal kontrolleri yap
  if (!skipChecks) {
    if (!settings.enabled) {
      console.log('Notifications disabled');
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
          console.log('🔕 Quiet hours active: suppressing local notification');
          return;
        }
      } catch {}
    }
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
  
  // Hafta içi/sonu kontrolü
  const isWeekend = isWeekendLocal(settings.timezone);
  console.log('🔍 Morning notification check:', {
    isWeekend,
    weekendMotivationEnabled: settings.weekendMotivationEnabled,
    weeklyMotivationEnabled: settings.weeklyMotivationEnabled,
    timezone: settings.timezone
  });
  
  if (isWeekend && !settings.weekendMotivationEnabled) {
    console.log('❌ Weekend motivation disabled, skipping morning notification');
    return;
  }
  if (!isWeekend && !settings.weeklyMotivationEnabled) {
    console.log('❌ Weekly motivation disabled, skipping morning notification');
    return;
  }

  // Hafta içi/sonu mesaj kontrolü - ekstra güvenlik
  const isWeekendForMessage = isWeekendLocal(settings.timezone);
  let message;
  
  if (isWeekendForMessage) {
    // Hafta sonu mesajları sadece hafta sonu gösterilsin
    message = getRandomMessage(weekendMessages);
    console.log('✅ Weekend message selected for weekend day');
  } else {
    // Hafta içi mesajları sadece hafta içi gösterilsin
    message = getMessageByTimeOfDay(undefined, settings.timezone);
    console.log('✅ Weekday message selected for weekday');
  }

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
  
  // Hafta içi/sonu kontrolü
  const isWeekend = isWeekendLocal(settings.timezone);
  console.log('🔍 Evening notification check:', {
    isWeekend,
    weekendMotivationEnabled: settings.weekendMotivationEnabled,
    weeklyMotivationEnabled: settings.weeklyMotivationEnabled,
    timezone: settings.timezone
  });
  
  if (isWeekend && !settings.weekendMotivationEnabled) {
    console.log('❌ Weekend motivation disabled, skipping evening notification');
    return;
  }
  if (!isWeekend && !settings.weeklyMotivationEnabled) {
    console.log('❌ Weekly motivation disabled, skipping evening notification');
    return;
  }

  // Hafta içi/sonu mesaj kontrolü - ekstra güvenlik
  const isWeekendForMessage = isWeekendLocal(settings.timezone);
  let message;
  
  console.log('🔍 Evening notification message selection:', {
    isWeekendForMessage,
    timezone: settings.timezone,
    currentTime: new Date().toLocaleString()
  });
  
  if (isWeekendForMessage) {
    // Hafta sonu mesajları sadece hafta sonu gösterilsin
    message = getRandomMessage(weekendMessages);
    console.log('✅ Weekend message selected for weekend day (evening)');
  } else {
    // Hafta içi mesajları sadece hafta içi gösterilsin
    message = getMessageByTimeOfDay(undefined, settings.timezone);
    console.log('✅ Weekday message selected for weekday (evening)');
  }
  
  console.log('📱 Selected message:', message);

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
 * Günlük Özet Bildirimi Planla
 */
export const scheduleDailySummaryNotification = async (): Promise<void> => {
  const settings = await loadNotificationSettings();

  if (!settings.enabled || !settings.dailySummaryEnabled) return;

  // Gün sonu özeti için saat 22:00
  const hour = 22;
  const minute = 0;

  await Notifications.cancelScheduledNotificationAsync('daily-summary');
  await scheduleNotification(
    'daily-summary',
    '📊 Günlük Özet',
    'Bugünün özetine göz at! Hedeflerine ne kadar yaklaştın?',
    hour,
    minute,
    true,
    'default'
  );

  console.log(`Daily summary notification scheduled for ${hour}:${minute}`);
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
  await scheduleDailySummaryNotification();

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
 * Hatırlatıcı Bildirimi Planla
 */
export const scheduleReminderNotification = async (
  reminderId: string,
  title: string,
  body: string,
  time: string, // "HH:MM" formatında
  repeatType: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly',
  category: string = 'default',
  date?: string // "YYYY-MM-DD" formatında - gelecek tarih için
): Promise<string> => {
  const [hour, minute] = time.split(':').map(Number);
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
      // Her hafta (Pazartesi)
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: 1, // Pazartesi
        hour,
        minute,
        repeats: true,
      };
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

  const selectedSound = getSystemSound();
  console.log('🎵 Scheduling reminder notification:', { 
    reminderId, title, time, repeatType, channelId: category, sound: selectedSound 
  });

  return await Notifications.scheduleNotificationAsync({
    identifier: `reminder-${reminderId}`,
    content: {
      title,
      body,
      sound: selectedSound,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { type: 'reminder', reminderId, category },
      ...(Platform.OS === 'android' && { channelId: category }),
    },
    trigger,
  });
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
  const reminderNotifications = notifications.filter(n => 
    n.identifier.startsWith('reminder-')
  );
  
  for (const notification of reminderNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
  
  console.log(`Cancelled ${reminderNotifications.length} reminder notifications`);
};

/**
 * Planlı Bildirimleri Listele (Debug için)
 */
export const listScheduledNotifications = async (): Promise<any[]> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  console.log('Scheduled notifications:', notifications);
  return notifications;
};

