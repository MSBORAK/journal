/**
 * Nazik Hatırlatma Mesajları
 * Kullanıcıya yumuşak, destekleyici ve motive edici mesajlar
 */

export interface NotificationMessage {
  title: string;
  body: string;
  emoji: string;
  mood?: 'positive' | 'neutral' | 'low'; // Mood kategorisi
}

// MOOD BAZLI MESAJLAR
// Pozitif ruh hali için mesajlar (mood >= 4)
export const positiveMoodMessages: NotificationMessage[] = [
  {
    title: "Harikasın! 🌟",
    body: "Bu enerjiyi koru! Bugün neler başardın?",
    emoji: "🌟",
    mood: 'positive'
  },
  {
    title: "Muhteşem gidiyorsun! 🚀",
    body: "Bu pozitif enerjiyi paylaş, başkalarına ilham ol!",
    emoji: "🚀",
    mood: 'positive'
  },
  {
    title: "Bugün senin günün! ✨",
    body: "Bu mutluluğu kal ıcı kılmak için yaz!",
    emoji: "✨",
    mood: 'positive'
  },
  {
    title: "İnanılmazsın! 💪",
    body: "Bu başarıyı kutlamak için bir şeyler yaz!",
    emoji: "💪",
    mood: 'positive'
  },
];

// Nötr ruh hali için mesajlar (mood = 3)
export const neutralMoodMessages: NotificationMessage[] = [
  {
    title: "Merhaba 🌿",
    body: "Bugün nasıl hissediyorsun? Kendini dinle",
    emoji: "🌿",
    mood: 'neutral'
  },
  {
    title: "Bir mola ver 🧘",
    body: "Dinlenmek de bir ihtiyaç. Kendine zaman ayır",
    emoji: "🧘",
    mood: 'neutral'
  },
  {
    title: "Sakin ol 🌊",
    body: "Bugün sadece var olmak bile yeter",
    emoji: "🌊",
    mood: 'neutral'
  },
  {
    title: "Kendini dinle 🎧",
    body: "İhtiyacın olan şey ne? Yaz ve keşfet",
    emoji: "🎧",
    mood: 'neutral'
  },
];

// Düşük ruh hali için mesajlar (mood <= 2)
export const lowMoodMessages: NotificationMessage[] = [
  {
    title: "Yanındayım 💙",
    body: "Zor zamanlar geçici. Sen kalıcısın",
    emoji: "💙",
    mood: 'low'
  },
  {
    title: "Kendine şefkatli ol 🤗",
    body: "Bugün küçük adımlar atsan da yeter",
    emoji: "🤗",
    mood: 'low'
  },
  {
    title: "Sen değerlisin 💎",
    body: "Modun nasıl olursa olsun, sen özelsin",
    emoji: "💎",
    mood: 'low'
  },
  {
    title: "Nefes al 🌬️",
    body: "Bugün sadece nefes almak bile bir başarı",
    emoji: "🌬️",
    mood: 'low'
  },
  {
    title: "Yalnız değilsin 🫂",
    body: "Duygularını yazmak seni rahatlatabilir",
    emoji: "🫂",
    mood: 'low'
  },
];

// SABAH MESAJLARI (07:00 - 11:00)
export const morningMessages: NotificationMessage[] = [
  {
    title: "Günaydın ☀️",
    body: "Yeni bir gün, yeni bir sayfa. Bugün nasıl hissediyorsun?",
    emoji: "☀️"
  },
  {
    title: "Güzel bir sabah 🌅",
    body: "Kendine bir kahve al ve düşüncelerini paylaş",
    emoji: "🌅"
  },
  {
    title: "Hoş geldin 💙",
    body: "Bugün seni neler bekliyor? Yazarak keşfet",
    emoji: "💙"
  },
  {
    title: "Sabah enerjisi ✨",
    body: "En güzel fikirler sabahları gelir. Sen de yaz!",
    emoji: "✨"
  },
  {
    title: "Yeni bir başlangıç 🌸",
    body: "Bugün kendine ne kadar zaman ayıracaksın?",
    emoji: "🌸"
  },
  {
    title: "Günaydın güzellik 🌻",
    body: "Bugünkü ruh halini kaydetmek ister misin?",
    emoji: "🌻"
  },
  {
    title: "Sabahın sihri 🪄",
    body: "5 dakika kendine ayır, gününü planla",
    emoji: "🪄"
  },
  {
    title: "Huzurlu bir gün 🕊️",
    body: "Derin bir nefes al ve bugüne başla",
    emoji: "🕊️"
  },
  {
    title: "Merhaba güzel insan 💚",
    body: "Sabah saatlerinde yazmak seni daha mutlu ediyor",
    emoji: "💚"
  },
  {
    title: "Şükür zamanı 🙏",
    body: "Bugün neye şükrediyorsun? Yaz ve hatırla",
    emoji: "🙏"
  }
];

// ÖĞLEN MESAJLARI (11:00 - 16:00)
export const afternoonMessages: NotificationMessage[] = [
  {
    title: "Merhaba 🌼",
    body: "Gününün ortasındasın. Nasıl gidiyor?",
    emoji: "🌼"
  },
  {
    title: "Küçük bir mola 🌿",
    body: "Kendine biraz zaman ayır, düşüncelerini yaz",
    emoji: "🌿"
  },
  {
    title: "Öğlen molası ☕",
    body: "Bir nefes al, gününü düşün, paylaş",
    emoji: "☕"
  },
  {
    title: "Ara ver 💭",
    body: "İçinden geçenleri yazmak için harika bir zaman",
    emoji: "💭"
  },
  {
    title: "Kendine dön 🧘",
    body: "Koşturmaca arasında kendine 5 dakika ayır",
    emoji: "🧘"
  },
  {
    title: "Gün yarıda 🌞",
    body: "Sabah nasıl geçti? Anılarını kaydet",
    emoji: "🌞"
  },
  {
    title: "Dinlenme zamanı 🪴",
    body: "Zihnini rahatlatmak için bir şeyler yaz",
    emoji: "🪴"
  },
  {
    title: "İçin rahat mı? 💚",
    body: "Duyguların hakkında konuşmak ister misin?",
    emoji: "💚"
  }
];

// AKŞAM MESAJLARI (16:00 - 21:00)
export const eveningMessages: NotificationMessage[] = [
  {
    title: "Akşam oldu 🌙",
    body: "Gün nasıl geçti? Paylaşmak ister misin?",
    emoji: "🌙"
  },
  {
    title: "Günün sonu 🌆",
    body: "Bugünkü düşüncelerini yazmak için harika bir zaman",
    emoji: "🌆"
  },
  {
    title: "Huzur zamanı ✨",
    body: "Günü bitirmeden önce kendine gel",
    emoji: "✨"
  },
  {
    title: "İyi akşamlar 💜",
    body: "Bugün yaşadıklarını kaydetmek ister misin?",
    emoji: "💜"
  },
  {
    title: "Akşam refleksiyonu 🌠",
    body: "Bugün seni mutlu eden ne oldu?",
    emoji: "🌠"
  },
  {
    title: "Günü kapat 📔",
    body: "Yazmak zihnini rahatlatacak",
    emoji: "📔"
  },
  {
    title: "Sakin bir akşam 🕯️",
    body: "Kendine iyi bak, bugünü not et",
    emoji: "🕯️"
  },
  {
    title: "Gece yarısı olmadan 🌃",
    body: "Bugünkü hislerini kaydetmeyi unutma",
    emoji: "🌃"
  },
  {
    title: "Yatmadan önce 💙",
    body: "Son bir düşünce, son bir not",
    emoji: "💙"
  },
  {
    title: "Günün özeti 📝",
    body: "3 cümleyle bugünü anlat",
    emoji: "📝"
  }
];

// GECE MESAJLARI (21:00 - 23:00) - Sessiz saatlerden önce
export const nightMessages: NotificationMessage[] = [
  {
    title: "İyi geceler 🌙",
    body: "Yatmadan önce bugünü not etmek ister misin?",
    emoji: "🌙"
  },
  {
    title: "Son hatırlatma ✨",
    body: "Bugün yazamadıysan yarın yine buradayım",
    emoji: "✨"
  },
  {
    title: "Gece sessizliği 🌌",
    body: "En derin düşünceler gece gelir",
    emoji: "🌌"
  },
  {
    title: "Uyku zamanı 😴",
    body: "Huzurlu bir uyku için zihnini boşalt",
    emoji: "😴"
  },
  {
    title: "Rahat uyu 💤",
    body: "Bugünü yazdıysan, rahat uyu. Yazmadıysan yarın başla!",
    emoji: "💤"
  }
];

// ÖZLEME MESAJLARI (3+ gün yazmamışsa)
export const missingYouMessages: NotificationMessage[] = [
  {
    title: "Seni özledim 💙",
    body: "Her şey yolunda mı? Kapımız her zaman açık",
    emoji: "💙"
  },
  {
    title: "Naber? 🌸",
    body: "Bir süredir görüşemedik. Umarım iyisindir",
    emoji: "🌸"
  },
  {
    title: "Buradayım 💚",
    body: "Ne zaman istersen gel, yargılamadan dinlerim",
    emoji: "💚"
  },
  {
    title: "Merak ettim 🌿",
    body: "Uzun zamandır yazmıyorsun. Her şey yolunda mı?",
    emoji: "🌿"
  },
  {
    title: "Gel konuşalım ☕",
    body: "Zor bir dönem mi geçiriyorsun? Paylaş, rahatla",
    emoji: "☕"
  },
  {
    title: "Hazır ol 💪",
    body: "Ara verse de sorun değil. Ne zaman hazır hissedersen gel",
    emoji: "💪"
  },
  {
    title: "Bekliyorum 🌻",
    body: "Kapın hep açık, istediğin zaman dönebilirsin",
    emoji: "🌻"
  },
  {
    title: "Geri dön 🏡",
    body: "Yolculuğuna kaldığın yerden devam edebilirsin",
    emoji: "🏡"
  }
];

// TEBRİK MESAJLARI (Streak başarıları)
export const celebrationMessages: NotificationMessage[] = [
  {
    title: "Harikasın! 🎉",
    body: "3 günlük streak! Devam et böyle",
    emoji: "🎉"
  },
  {
    title: "İnanılmaz! 🔥",
    body: "7 günlük streak! Kendine hayranım",
    emoji: "🔥"
  },
  {
    title: "Efsanesin! 💎",
    body: "14 günlük streak! Bu bir yaşam biçimi artık",
    emoji: "💎"
  },
  {
    title: "Gurur duyuyorum! 👑",
    body: "30 günlük streak! Alışkanlık haline getirmişsin",
    emoji: "👑"
  },
  {
    title: "Olağanüstü! 🌟",
    body: "Bu hafta her gün yazdın! Tebrikler",
    emoji: "🌟"
  },
  {
    title: "Süper! ⭐",
    body: "10. günlüğünü yazdın! Devam et",
    emoji: "⭐"
  },
  {
    title: "Mükemmel! 🎊",
    body: "50 günlük yazı! Bu bir başarı hikayesi",
    emoji: "🎊"
  },
  {
    title: "Efsane! 🏆",
    body: "100 günlük yazı! Bir efsane oldun",
    emoji: "🏆"
  }
];

// MOTİVASYON MESAJLARI (Motivasyonu düşükse)
export const motivationalMessages: NotificationMessage[] = [
  {
    title: "Kendine iyi bak 💚",
    body: "Zor günler geçici, sen kalıcısın",
    emoji: "💚"
  },
  {
    title: "Yalnız değilsin 🤗",
    body: "Duygularını paylaşmak güçlülük işaretidir",
    emoji: "🤗"
  },
  {
    title: "Bugün yeterince iyisin 💙",
    body: "Mükemmel olmak zorunda değilsin",
    emoji: "💙"
  },
  {
    title: "Nefes al 🌬️",
    body: "Derin bir nefes al, her şey düzelecek",
    emoji: "🌬️"
  },
  {
    title: "Küçük adımlar 👣",
    body: "Her küçük adım bir ilerleme sayılır",
    emoji: "👣"
  },
  {
    title: "Sen değerlisin 💎",
    body: "Varlığın bile yeterli bir hediye",
    emoji: "💎"
  },
  {
    title: "Zamanla her şey 🌱",
    body: "İyileşme doğrusal değildir, sabırlı ol",
    emoji: "🌱"
  },
  {
    title: "Gücünü hatırla 💪",
    body: "Buraya kadar geldiysen, daha da ileriye gidebilirsin",
    emoji: "💪"
  }
];

// HAFTA SONU MESAJLARI
export const weekendMessages: NotificationMessage[] = [
  {
    title: "Hafta sonu! 🎉",
    body: "Kendine zaman ayırmak için harika bir gün",
    emoji: "🎉"
  },
  {
    title: "Dinlenme günü 🛋️",
    body: "Haftanı düşün, gelecek haftayı planla",
    emoji: "🛋️"
  },
  {
    title: "Hafta sonu huzuru ☕",
    body: "Acele yok, rahatça düşüncelerini yaz",
    emoji: "☕"
  },
  {
    title: "Pazar keyfi 🌸",
    body: "Haftanın özetini yapmak ister misin?",
    emoji: "🌸"
  },
  {
    title: "Cumartesi refleksiyonu 🌅",
    body: "Bu hafta neler yaşadın? Kaydet!",
    emoji: "🌅"
  }
];

// ÖZEL GÜN MESAJLARI (Doğum günü, yeni yıl vb.)
export const specialDayMessages: NotificationMessage[] = [
  {
    title: "Özel bir gün! 🎂",
    body: "Bugün sana özel, düşüncelerini kaydetmeyi unutma",
    emoji: "🎂"
  },
  {
    title: "Yeni başlangıçlar 🎊",
    body: "Yeni bir yıl, yeni hedefler. Yaz ve gerçekleştir!",
    emoji: "🎊"
  },
  {
    title: "Kutlama zamanı 🥳",
    body: "Bu özel günü anılarınla taçlandır",
    emoji: "🥳"
  }
];

// HAVA DURUMU BAZLI MESAJLAR (opsiyonel - hava API'si ile kullanılabilir)
export const weatherMessages = {
  sunny: {
    title: "Güneşli bir gün ☀️",
    body: "Dışarı çık, güneşin tadını çıkar, sonra yaz!",
    emoji: "☀️"
  },
  rainy: {
    title: "Yağmurlu gün 🌧️",
    body: "İçeride dinlenmek ve yazmak için mükemmel",
    emoji: "🌧️"
  },
  cloudy: {
    title: "Bulutlu gün ☁️",
    body: "Huzurlu bir gün, düşüncelere dalmak için ideal",
    emoji: "☁️"
  },
  snowy: {
    title: "Karlı gün ❄️",
    body: "Sıcacık içerde, düşüncelerini paylaş",
    emoji: "❄️"
  }
};

/**
 * Rastgele mesaj seçici fonksiyonlar
 */
export const getRandomMessage = (messages: NotificationMessage[]): NotificationMessage => {
  return messages[Math.floor(Math.random() * messages.length)];
};

// Mood bazlı mesaj seç
export const getMessageByMood = (moodValue: number): NotificationMessage => {
  console.log(`😊 Mood value: ${moodValue}`);
  
  if (moodValue >= 4) {
    // Pozitif ruh hali
    console.log('✨ Using positive mood messages');
    return getRandomMessage(positiveMoodMessages);
  } else if (moodValue === 3) {
    // Nötr ruh hali
    console.log('🌿 Using neutral mood messages');
    return getRandomMessage(neutralMoodMessages);
  } else {
    // Düşük ruh hali
    console.log('💙 Using low mood messages');
    return getRandomMessage(lowMoodMessages);
  }
};

export const getMessageByTimeOfDay = (moodValue?: number, timezone?: string): NotificationMessage => {
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const hour = parseInt(now.toLocaleString('en-US', {
    timeZone: userTimezone,
    hour: 'numeric',
    hour12: false
  }));
  
  console.log(`🕐 Current hour in ${userTimezone}: ${hour}`);
  
  // Eğer mood değeri verilmişse, mood bazlı mesaj seç
  if (moodValue !== undefined && moodValue !== null) {
    return getMessageByMood(moodValue);
  }
  
  // Aksi halde zaman bazlı mesaj seç
  if (hour >= 5 && hour < 11) {
    console.log('🌅 Using morning messages');
    return getRandomMessage(morningMessages);
  } else if (hour >= 11 && hour < 16) {
    console.log('☀️ Using afternoon messages');
    return getRandomMessage(afternoonMessages);
  } else if (hour >= 16 && hour < 21) {
    console.log('🌆 Using evening messages');
    return getRandomMessage(eveningMessages);
  } else if (hour >= 21 && hour < 23) {
    console.log('🌙 Using night messages');
    return getRandomMessage(nightMessages);
  } else {
    // Sessiz saatler (23:00 - 05:00) - mesaj gönderilmemeli
    console.log('💤 Silent hours - no message');
    return {
      title: "Sessiz Saatler",
      body: "Rahat uyu 💤",
      emoji: "💤"
    };
  }
};

export const getMessageByDayOfWeek = (timezone?: string): NotificationMessage => {
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  try {
    // Belirtilen timezone'a göre günü al
    const dayOfWeek = now.toLocaleDateString('en-US', {
      timeZone: userTimezone,
      weekday: 'long' // Monday, Tuesday, etc.
    });
    
    console.log(`Current time in ${userTimezone}: ${now.toLocaleString()}, Day: ${dayOfWeek}`);
    
    // Hafta sonu kontrolü
    if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
      console.log('📅 Weekend detected, showing weekend message');
      return getRandomMessage(weekendMessages);
    } else {
      console.log('📅 Weekday detected, showing time-based message');
      return getMessageByTimeOfDay(undefined, userTimezone);
    }
  } catch (error) {
    console.error('Error in getMessageByDayOfWeek:', error);
    // Fallback: UTC tabanlı kontrol
    const dayNumber = now.getUTCDay(); // 0=Sunday, 6=Saturday
    if (dayNumber === 6 || dayNumber === 0) {
      console.log('Weekend detected (UTC fallback), showing weekend message');
      return getRandomMessage(weekendMessages);
    } else {
      console.log('Weekday detected (UTC fallback), showing time-based message');
      return getMessageByTimeOfDay(undefined, userTimezone);
    }
  }
};

