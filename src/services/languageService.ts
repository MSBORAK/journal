/**
 * Çok Dilli Destek Servisi
 * Türkçe ve İngilizce dil desteği
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
];

export const defaultLanguage = 'tr';

// Dil çevirileri
export const translations = {
  tr: {
    // Genel
    appName: 'Rhythm',
    appDescription: 'Ruhsal denge ve yaşam ritmi uygulaması',
    
    // Dashboard
    welcome: 'Hoş Geldin',
    dashboard: 'Ana Sayfa',
    writeDiary: 'Günlük Yaz',
    tasks: 'Görevler',
    health: 'Sağlık',
    statistics: 'İstatistikler',
    settings: 'Ayarlar',
    
    // Mood
    mood: 'Ruh Hali',
    howAreYou: 'Nasıl hissediyorsun?',
    veryBad: 'Çok Kötü',
    bad: 'Kötü',
    neutral: 'Nötr',
    good: 'İyi',
    veryGood: 'Çok İyi',
    
    // Tasks
    tasksAndReminders: 'Görevler ve Hatırlatıcılar',
    addTask: 'Görev Ekle',
    addReminder: 'Hatırlatıcı Ekle',
    completed: 'Tamamlandı',
    pending: 'Bekliyor',
    
    // Health
    healthScore: 'Sağlık Puanı',
    wellnessTracking: 'Wellness Takibi',
    waterGlasses: 'Su Bardakları',
    exerciseMinutes: 'Egzersiz Dakikaları',
    sleepHours: 'Uyku Saatleri',
    
    // Statistics
    statistics: 'İstatistikler',
    streak: 'Seri',
    totalEntries: 'Toplam Giriş',
    averageMood: 'Ortalama Ruh Hali',
    
    // Settings
    settings: 'Ayarlar',
    accountSettings: 'Hesap Ayarları',
    notificationSettings: 'Bildirim Ayarları',
    themeSettings: 'Tema Ayarları',
    languageSettings: 'Dil Ayarları',
    
    // Common
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    done: 'Tamam',
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    error: 'Hata',
    success: 'Başarılı',
    loading: 'Yükleniyor...',
    
    // Notifications
    morningReminder: 'Sabah Hatırlatıcısı',
    eveningReminder: 'Akşam Hatırlatıcısı',
    dailySummary: 'Günlük Özet',
    
    // Themes
    cozy: 'Cozy',
    luxury: 'Luxury',
    police: 'Police Blue',
    forest: 'Forest',
    sunset: 'Sunset',
    ocean: 'Ocean',
    lavender: 'Lavender'
  },
  
  en: {
    // General
    appName: 'Rhythm',
    appDescription: 'Spiritual balance and life rhythm app',
    
    // Dashboard
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    writeDiary: 'Write Diary',
    tasks: 'Tasks',
    health: 'Health',
    statistics: 'Statistics',
    settings: 'Settings',
    
    // Mood
    mood: 'Mood',
    howAreYou: 'How are you feeling?',
    veryBad: 'Very Bad',
    bad: 'Bad',
    neutral: 'Neutral',
    good: 'Good',
    veryGood: 'Very Good',
    
    // Tasks
    tasksAndReminders: 'Tasks and Reminders',
    addTask: 'Add Task',
    addReminder: 'Add Reminder',
    completed: 'Completed',
    pending: 'Pending',
    
    // Health
    healthScore: 'Health Score',
    wellnessTracking: 'Wellness Tracking',
    waterGlasses: 'Water Glasses',
    exerciseMinutes: 'Exercise Minutes',
    sleepHours: 'Sleep Hours',
    
    // Statistics
    statistics: 'Statistics',
    streak: 'Streak',
    totalEntries: 'Total Entries',
    averageMood: 'Average Mood',
    
    // Settings
    settings: 'Settings',
    accountSettings: 'Account Settings',
    notificationSettings: 'Notification Settings',
    themeSettings: 'Theme Settings',
    languageSettings: 'Language Settings',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    
    // Notifications
    morningReminder: 'Morning Reminder',
    eveningReminder: 'Evening Reminder',
    dailySummary: 'Daily Summary',
    
    // Themes
    cozy: 'Cozy',
    luxury: 'Luxury',
    police: 'Police Blue',
    forest: 'Forest',
    sunset: 'Sunset',
    ocean: 'Ocean',
    lavender: 'Lavender'
  }
};

export const getTranslation = (key: string, language: string = 'tr'): string => {
  const lang = language as keyof typeof translations;
  return translations[lang]?.[key as keyof typeof translations[typeof lang]] || key;
};

export const getCurrentLanguage = (): string => {
  // AsyncStorage'dan dil tercihini al
  // Şimdilik default olarak 'tr' döndür
  return 'tr';
};

export const setLanguage = async (language: string): Promise<void> => {
  // AsyncStorage'a dil tercihini kaydet
  // Şimdilik sadece console.log
  console.log(`Language set to: ${language}`);
};
