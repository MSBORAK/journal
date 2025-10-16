/**
 * Global Saat Dilimi ve Tarih Utilities
 * Her kullanıcı kendi saat dilimini kullanır
 */

/**
 * Kullanıcının saat dilimini otomatik algılar
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Belirtilen saat dilimine göre bugünün tarihini döndürür
 */
export const getLocalDate = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  return now.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Belirtilen saat dilimine göre bugünün tarihini ISO formatında döndürür (YYYY-MM-DD)
 */
export const getLocalDateISO = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  return localDate.toISOString().split('T')[0];
};

/**
 * Belirtilen saat dilimine göre şu anki saati döndürür
 */
export const getLocalTime = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  return now.toLocaleTimeString('en-US', {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Belirtilen saat dilimine göre haftanın gününü döndürür
 */
export const getLocalDayOfWeek = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  return now.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    weekday: 'long'
  });
};

/**
 * Belirtilen saat dilimine göre haftanın gününü kısa formatta döndürür
 */
export const getLocalDayOfWeekShort = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  return now.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    weekday: 'short'
  });
};

/**
 * Belirtilen saat dilimine göre tam tarih ve saat bilgisini döndürür
 */
export const getLocalDateTime = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  return now.toLocaleString('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Belirtilen saat dilimine göre ISO string döndürür
 */
export const getLocalISOString = (timezone?: string): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
  return localDate.toISOString();
};

/**
 * Hafta sonu kontrolü (belirtilen saat dilimine göre)
 */
export const isWeekendLocal = (timezone?: string): boolean => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  
  try {
    // Saat dilimi güvenli hafta sonu kontrolü
    const dayOfWeek = now.toLocaleDateString('en-US', {
      timeZone: userTimezone,
      weekday: 'long'
    });
    
  // Debug için log ekleyelim
  // console.log('Current day of week:', dayOfWeek, 'Timezone:', userTimezone);
    
    return dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
  } catch (error) {
    console.error('Error in isWeekendLocal:', error);
    // Fallback: UTC tabanlı kontrol
    const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    return utcDay === 0 || utcDay === 6;
  }
};

/**
 * Günün saatine göre selamlama mesajı (çok dilli)
 */
export const getGreetingMessage = (timezone?: string, language: 'tr' | 'en' = 'tr'): string => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  const hour = now.toLocaleString('en-US', {
    timeZone: userTimezone,
    hour: 'numeric',
    hour12: false
  });
  
  const hourNum = parseInt(hour);
  
  if (language === 'tr') {
    if (hourNum >= 5 && hourNum < 12) {
      return 'Günaydın! ☀️';
    } else if (hourNum >= 12 && hourNum < 17) {
      return 'İyi günler! 🌤️';
    } else if (hourNum >= 17 && hourNum < 21) {
      return 'İyi akşamlar! 🌅';
    } else {
      return 'İyi geceler! 🌙';
    }
  } else {
    if (hourNum >= 5 && hourNum < 12) {
      return 'Good Morning! ☀️';
    } else if (hourNum >= 12 && hourNum < 17) {
      return 'Good Afternoon! 🌤️';
    } else if (hourNum >= 17 && hourNum < 21) {
      return 'Good Evening! 🌅';
    } else {
      return 'Good Night! 🌙';
    }
  }
};

/**
 * Hafta sonu mesajı (çok dilli)
 */
export const getWeekendMessage = (timezone?: string, language: 'tr' | 'en' = 'tr'): string => {
  const dayOfWeek = getLocalDayOfWeek(timezone);
  
  if (language === 'tr') {
    if (dayOfWeek === 'Saturday') {
      return 'Hafta sonun nasıl geçiyor? 🎉';
    } else if (dayOfWeek === 'Sunday') {
      return 'Pazar günün nasıl? 🛋️';
    }
  } else {
    if (dayOfWeek === 'Saturday') {
      return 'How is your weekend going? 🎉';
    } else if (dayOfWeek === 'Sunday') {
      return 'How is your Sunday? 🛋️';
    }
  }
  
  return '';
};

/**
 * Saat dilimi bilgisi ve ülke adı
 */
export const getTimezoneInfo = (timezone?: string): { timezone: string; country: string; city: string } => {
  const userTimezone = timezone || getUserTimezone();
  
  // Saat diliminden ülke ve şehir bilgisini çıkar
  const parts = userTimezone.split('/');
  const country = parts[0] || 'Unknown';
  const city = parts[1] ? parts[1].replace('_', ' ') : 'Unknown';
  
  return {
    timezone: userTimezone,
    country,
    city
  };
};
