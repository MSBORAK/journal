import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationSettings {
  morningEnabled: boolean;
  lunchEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string; // "08:00"
  lunchTime: string;   // "12:00"
  eveningTime: string; // "18:00"
}

const STORAGE_KEY = 'motivation_notification_settings';

// Motivasyonel mesajlar havuzu
const MORNING_MESSAGES = [
  'Günaydın! Bugün de kendini dinlemeye hazır mısın? 🎧',
  'Yeni güne nazik başla! Sen değerlisin! 💙',
  'Bugün kendin için ne yapmak istiyorsun? 🎯',
  'Günaydın! Bugün de kendine şefkatli ol! 🤗',
  'Yeni gün, yeni şanslar! Bugün nasıl geçirmek istiyorsun? 🌅',
  'Bugün de kendini kabul et! Sen yeterlisin! ✨',
  'Günaydın! Bugün de küçük adımlarla ilerle! 👣',
  'Yeni güne güvenle başla! Sen harikasın! 💪',
  'Günaydın! Bugün de pozitif düşün! 🌈',
  'Sen muhteşemsin! Bugün de bunu hatırla! 🌟',
];

const LUNCH_MESSAGES = [
  'Günün yarısı geçti! Kendini nasıl hissediyorsun? 🤔',
  'Öğle molanda kendini dinle! İhtiyacın olan ne? 🎧',
  'Bugün kendin için ne yaptın? Küçük şeyler de değerli! 💎',
  'Gün ortasında dur! Kendini nasıl besleyeceksin? 🌱',
  'Öğlen molanda kendine nazik ol! Sen yoruldun! 😌',
  'Bugün kendinle nasıl konuşuyorsun? Sevgiyle mi? 💕',
  'Gün ortasında kendini hatırla! Sen önemlisin! 🌟',
  'Öğle molanda kendini güçlendir! Sen harikasın! ⚡',
  'Günün ortasında kendine güven! Sen başarılısın! 💪',
  'Öğlen molanda kendini sev! Sen değerlisin! 💖',
];

const EVENING_MESSAGES = [
  'Günün nasıl geçti? Kendini nasıl hissettin? 🌅',
  'Bugünü değerlendir! Kendine ne kadar nazik davrandın? 🤗',
  'Akşamda kendinle barışık ol! Sen yeterlisin! 🕊️',
  'Bugün kendin için ne yaptın? Her şey değerli! 💝',
  'Günün sonunda kendini dinle! İhtiyacın olan ne? 🎧',
  'Bugünü kabul et! Yarın daha iyi olacak! 🌅',
  'Akşamda kendine şefkat göster! Sen değerlisin! 💙',
  'Günün sonunda kendinle barışık ol! Sen harikasın! ✨',
  'Bugünü kutla! Sen başardın! 🎊',
  'Akşamda kendini ödüllendir! Sen çalıştın! 🏆',
];

// Görev hatırlatıcı mesajları
const TASK_REMINDER_MESSAGES = [
  'Bugünkü görevlerin nasıl gidiyor? 📝',
  'Görevlerini hatırla! Sen başarabilirsin! 💪',
  'Bugün hangi görevleri tamamladın? 🎯',
  'Görevler seni bekliyor! Hadi başla! 🚀',
  'Küçük adımlar büyük başarılar! 👣',
  'Görevlerin yarısını tamamladın mı? 🔥',
  'Her görev seni hedefine yaklaştırıyor! ⭐',
  'Bugün hangi görevle başlayacaksın? 🌟',
];

// Uzun süre gelmeyen kullanıcılar için
const MISSING_USER_MESSAGES = [
  'Neredesin? Seni özledim! 😢',
  'Bak küsüyorum! Gel artık! 😤',
  'Seni çok özledim! Hadi gel! 💕',
  'Nerede kaldın? Seni bekliyorum! 🤗',
  'Özledim seni! Hadi bir şeyler yazalım! ✍️',
  'Çok özledim! Gel konuşalım! 💬',
  'Seni özledim! Hadi günlük yazalım! 📖',
  'Neredesin canım? Seni bekliyorum! 💙',
  'Özledim! Hadi bugün ne yaptığını anlat! 🗣️',
  'Seni özledim! Hadi birlikte vakit geçirelim! ⏰',
  'Çok özledim! Hadi günlük yazalım! 📝',
  'Nerede kaldın? Seni çok özledim! 😘',
  'Özledim! Hadi bugün nasıl geçti? 🌅',
  'Seni özledim! Hadi konuşalım! 💭',
  'Çok özledim! Hadi günlük yazalım! ✨',
  
  // "Bugün göremedim seni" tarzı mesajlar
  'Bugün göremedim seni! Neredesin? 😔',
  'Bugün hiç gelmedin! Seni bekliyorum! 💔',
  'Bugün göremeyince üzüldüm! Hadi gel! 😢',
  'Bugün seni göremiyorum! Nerede kaldın? 🤔',
  'Bugün hiç yoktun! Seni özledim! 💕',
  'Bugün göremedim! Hadi bir şeyler yazalım! ✍️',
  'Bugün hiç gelmedin! Seni bekliyorum! 🕐',
  'Bugün göremeyince merak ettim! Neredesin? 😟',
  'Bugün hiç yoktun! Hadi konuşalım! 💬',
  'Bugün göremedim seni! Seni özledim! 😭',
  'Bugün hiç gelmedin! Seni bekliyorum! 💙',
  'Bugün göremeyince üzüldüm! Hadi gel! 🌹',
  'Bugün hiç yoktun! Seni özledim! 💖',
  'Bugün göremedim! Hadi günlük yazalım! 📖',
  'Bugün hiç gelmedin! Seni bekliyorum! ⭐',
  'Bugün göremeyince merak ettim! Neredesin? 🔍',
  'Bugün hiç yoktun! Hadi bir şeyler yazalım! 📝',
  'Bugün göremedim seni! Seni özledim! 💫',
  'Bugün hiç gelmedin! Seni bekliyorum! 🌟',
  'Bugün göremeyince üzüldüm! Hadi gel! 💝',
  
  // Daha tatlı ve sevimli mesajlar
  'Bugün seni göremeyince çok üzüldüm! 😔',
  'Bugün hiç yoktun! Seni çok özledim! 💕',
  'Bugün göremedim! Hadi gel konuşalım! 💬',
  'Bugün hiç gelmedin! Seni bekliyorum! 🕰️',
  'Bugün göremeyince merak ettim! Neredesin? 🤗',
  'Bugün hiç yoktun! Seni özledim! 😘',
  'Bugün göremedim! Hadi günlük yazalım! ✍️',
  'Bugün hiç gelmedin! Seni bekliyorum! 💙',
  'Bugün göremeyince çok üzüldüm! Hadi gel! 🌸',
  'Bugün hiç yoktun! Seni çok özledim! 💖',
];

// Rastgele mesaj seç
const getRandomMessage = (messages: string[]): string => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// Saat string'ini Date'e çevir
const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // Her zaman bugün için ayarla (repeats: true olduğu için otomatik tekrar edecek)
  return date;
};

// Bildirim izni iste
export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Bildirim ayarlarını kaydet
export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Bildirim ayarları kaydedilemedi:', error);
  }
};

// Bildirim ayarlarını yükle
export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Bildirim ayarları yüklenemedi:', error);
  }
  
  // Varsayılan ayarlar
  return {
    morningEnabled: true,
    lunchEnabled: true,
    eveningEnabled: true,
    morningTime: '08:00',
    lunchTime: '12:00',
    eveningTime: '18:00',
  };
};

// Bildirimleri zamanla
export const scheduleMotivationNotifications = async (): Promise<void> => {
  try {
    // Önceki bildirimleri iptal et
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const settings = await loadNotificationSettings();
    
    // Sabah bildirimi
    if (settings.morningEnabled) {
      const morningTime = parseTime(settings.morningTime);
      console.log(`🌅 Sabah bildirimi zamanlanıyor: ${morningTime.getHours()}:${morningTime.getMinutes()}`);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Günaydın!',
          body: getRandomMessage(MORNING_MESSAGES),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: morningTime.getHours(),
          minute: morningTime.getMinutes(),
          repeats: true,
        },
      });
    }
    
    // Öğlen bildirimi
    if (settings.lunchEnabled) {
      const lunchTime = parseTime(settings.lunchTime);
      console.log(`☀️ Öğlen bildirimi zamanlanıyor: ${lunchTime.getHours()}:${lunchTime.getMinutes()}`);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Öğle Molası!',
          body: getRandomMessage(LUNCH_MESSAGES),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: lunchTime.getHours(),
          minute: lunchTime.getMinutes(),
          repeats: true,
        },
      });
    }
    
    // Akşam bildirimi
    if (settings.eveningEnabled) {
      const eveningTime = parseTime(settings.eveningTime);
      console.log(`🌙 Akşam bildirimi zamanlanıyor: ${eveningTime.getHours()}:${eveningTime.getMinutes()}`);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 İyi Akşamlar!',
          body: getRandomMessage(EVENING_MESSAGES),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: eveningTime.getHours(),
          minute: eveningTime.getMinutes(),
          repeats: true,
        },
      });
    }
    
    console.log('✅ Motivasyon bildirimleri zamanlandı!');
  } catch (error) {
    console.error('❌ Bildirimler zamanlanamadı:', error);
  }
};

// Bildirimleri iptal et
export const cancelMotivationNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Tüm bildirimler iptal edildi!');
  } catch (error) {
    console.error('❌ Bildirimler iptal edilemedi:', error);
  }
};

// Görev hatırlatıcı bildirimi gönder
export const sendTaskReminderNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Görev Hatırlatıcısı',
        body: getRandomMessage(TASK_REMINDER_MESSAGES),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log('✅ Görev hatırlatıcısı gönderildi!');
  } catch (error) {
    console.error('❌ Görev hatırlatıcısı gönderilemedi:', error);
  }
};

// Uzun süre gelmeyen kullanıcı için bildirim gönder
export const sendMissingUserNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '😢 Seni Özledim!',
        body: getRandomMessage(MISSING_USER_MESSAGES),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log('✅ Özleyen kullanıcı bildirimi gönderildi!');
  } catch (error) {
    console.error('❌ Özleyen kullanıcı bildirimi gönderilemedi:', error);
  }
};

// Zamanlanmış görev hatırlatıcısı (2 saat sonra)
export const scheduleTaskReminder = async (): Promise<void> => {
  try {
    // Bildirim izni kontrolü
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.warn('⚠️ Notification permission not granted, skipping task reminder');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Görev Hatırlatıcısı',
        body: getRandomMessage(TASK_REMINDER_MESSAGES),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2 * 60 * 60, // 2 saat
      },
    });
    if (__DEV__) console.log('✅ Görev hatırlatıcısı 2 saat sonra için zamanlandı!');
  } catch (error: any) {
    console.error('❌ Görev hatırlatıcısı zamanlanamadı:', error);
    // Hata durumunda sessizce devam et - görev kaydedildi ama bildirim planlanamadı
    // Hata mesajını throw etme, sadece log'la
  }
};

// Günlük görev kontrolü (akşam 20:00)
export const scheduleDailyTaskCheck = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📝 Günlük Görev Kontrolü',
        body: 'Bugünkü görevlerin nasıl gidiyor? Hadi kontrol edelim! 🎯',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
    console.log('✅ Günlük görev kontrolü zamanlandı (20:00)!');
  } catch (error) {
    console.error('❌ Günlük görev kontrolü zamanlanamadı:', error);
  }
};

// Kullanıcı aktivite kontrolü (günde 1 kez)
export const scheduleUserActivityCheck = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '😢 Seni Özledim!',
        body: getRandomMessage(MISSING_USER_MESSAGES),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 22,
        minute: 0,
        repeats: true,
      },
    });
    console.log('✅ Kullanıcı aktivite kontrolü zamanlandı (22:00)!');
  } catch (error) {
    console.error('❌ Kullanıcı aktivite kontrolü zamanlanamadı:', error);
  }
};

// Tüm akıllı bildirimleri zamanla
export const scheduleSmartNotifications = async (): Promise<void> => {
  try {
    await scheduleDailyTaskCheck();
    await scheduleUserActivityCheck();
    console.log('✅ Akıllı bildirimler zamanlandı!');
  } catch (error) {
    console.error('❌ Akıllı bildirimler zamanlanamadı:', error);
  }
};

// Test bildirimi gönder
export const sendTestNotification = async (): Promise<void> => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    let testMessage = '';
    let testTitle = '';
    
    console.log(`🧪 Test notification - Current hour: ${currentHour}`);
    
    // Saate göre mesaj seç - daha net aralıklar
    if (currentHour >= 5 && currentHour < 11) {
      testTitle = '🌅 Test - Günaydın!';
      testMessage = getRandomMessage(MORNING_MESSAGES);
      console.log('🌅 Using morning message for test');
    } else if (currentHour >= 11 && currentHour < 16) {
      testTitle = '☀️ Test - Öğle Molası!';
      testMessage = getRandomMessage(LUNCH_MESSAGES);
      console.log('☀️ Using lunch message for test');
    } else if (currentHour >= 16 && currentHour < 21) {
      testTitle = '🌆 Test - İyi Akşamlar!';
      testMessage = getRandomMessage(EVENING_MESSAGES);
      console.log('🌆 Using evening message for test');
    } else {
      testTitle = '🌙 Test - İyi Geceler!';
      testMessage = getRandomMessage(EVENING_MESSAGES); // Gece için akşam mesajları kullan
      console.log('🌙 Using evening message for night test');
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: testTitle,
        body: testMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log(`✅ Test bildirimi gönderildi! (Saat: ${currentHour}:${now.getMinutes()}) - Title: ${testTitle}`);
  } catch (error) {
    console.error('❌ Test bildirimi gönderilemedi:', error);
  }
};
