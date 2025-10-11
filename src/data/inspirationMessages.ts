// Günün İlhamı Mesajları
// Kategorili ve ruh haline göre özelleştirilmiş

export type MoodType = 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful' | 'tired';

export type InspirationCategory = 'motivation' | 'gratitude' | 'growth' | 'peace' | 'courage' | 'love' | 'dreams';

export interface InspirationMessage {
  id: string;
  text: string;
  author?: string;
  category: InspirationCategory;
  mood?: MoodType[]; // Bu mesaj hangi ruh hallerine uygun
  emoji: string;
}

export const inspirationMessages: InspirationMessage[] = [
  // Motivasyon Mesajları
  {
    id: 'mot_001',
    text: 'Bugün yaptığın küçük adımlar, yarının büyük başarılarının temeli.',
    category: 'motivation',
    mood: ['neutral', 'tired'],
    emoji: '🌟'
  },
  {
    id: 'mot_002',
    text: 'Her yeni gün, yeni bir başlangıç yapma fırsatıdır. Bugün neyi farklı yapacaksın?',
    category: 'motivation',
    mood: ['neutral', 'anxious'],
    emoji: '🌅'
  },
  {
    id: 'mot_003',
    text: 'Başarı, küçük çabaların günlük tekrarının toplamıdır.',
    category: 'motivation',
    mood: ['neutral', 'tired'],
    emoji: '💪'
  },
  {
    id: 'mot_004',
    text: 'Hayallerine doğru atılan her adım, seni daha güçlü kılar.',
    category: 'motivation',
    mood: ['excited', 'happy'],
    emoji: '🚀'
  },
  {
    id: 'mot_005',
    text: 'Bugün kendine bir hediye ver: ilerleme. Ne kadar küçük olursa olsun.',
    category: 'motivation',
    mood: ['neutral', 'tired'],
    emoji: '🎁'
  },

  // Minnettarlık Mesajları
  {
    id: 'grt_001',
    text: 'Bugün için minnettarım. Şu an buradayım, nefes alıyorum ve büyüyorum.',
    category: 'gratitude',
    mood: ['grateful', 'happy', 'neutral'],
    emoji: '🙏'
  },
  {
    id: 'grt_002',
    text: 'Hayatındaki küçük mucizeler için durakla ve teşekkür et.',
    category: 'gratitude',
    mood: ['grateful', 'happy', 'neutral'],
    emoji: '✨'
  },
  {
    id: 'grt_003',
    text: 'Minnettarlık, sıradan anları sihirli hale getirir.',
    category: 'gratitude',
    mood: ['grateful', 'neutral'],
    emoji: '💫'
  },
  {
    id: 'grt_004',
    text: 'Bugün neye sahip olduğunu gör, neyin eksik olduğunu değil.',
    category: 'gratitude',
    mood: ['sad', 'anxious', 'grateful'],
    emoji: '🌸'
  },
  {
    id: 'grt_005',
    text: 'Şükretmek, bolluk çekmenin en güçlü yoludur.',
    category: 'gratitude',
    mood: ['grateful', 'happy'],
    emoji: '🌺'
  },

  // Kişisel Gelişim
  {
    id: 'grw_001',
    text: 'Dünkü senin rakibin değil, öğretmenin. Her gün biraz daha iyi olmak için büyü.',
    category: 'growth',
    mood: ['neutral', 'anxious'],
    emoji: '🌱'
  },
  {
    id: 'grw_002',
    text: 'Değişim acı verebilir, ama geride kalmak daha acı verir. Bugün bir adım at.',
    category: 'growth',
    mood: ['anxious', 'sad', 'neutral'],
    emoji: '🦋'
  },
  {
    id: 'grw_003',
    text: 'En büyük gelişim, konfor alanının dışında başlar. Cesaretini topla!',
    category: 'growth',
    mood: ['anxious', 'excited'],
    emoji: '🌟'
  },
  {
    id: 'grw_004',
    text: 'Hatalar, büyümenin merdiven basamaklarıdır. Bugün bir şey öğrendin mi?',
    category: 'growth',
    mood: ['sad', 'anxious', 'neutral'],
    emoji: '📚'
  },
  {
    id: 'grw_005',
    text: 'Kendine yatırım yaptığın her an, geleceğine hediye veriyorsun.',
    category: 'growth',
    mood: ['neutral', 'excited', 'happy'],
    emoji: '💎'
  },

  // İç Huzur
  {
    id: 'pea_001',
    text: 'Derin bir nefes al. Şu an, şu anda ol. Her şey yolunda.',
    category: 'peace',
    mood: ['anxious', 'tired', 'sad'],
    emoji: '🕊️'
  },
  {
    id: 'pea_002',
    text: 'Huzur, dışarıda aranmaz, içeride inşa edilir.',
    category: 'peace',
    mood: ['anxious', 'neutral'],
    emoji: '🧘'
  },
  {
    id: 'pea_003',
    text: 'Bugün sadece bu ana odaklan. Geçmiş geride, gelecek henüz gelmedi.',
    category: 'peace',
    mood: ['anxious', 'sad'],
    emoji: '🌿'
  },
  {
    id: 'pea_004',
    text: 'Sakinlik, fırtınanın yokluğu değil, fırtına içinde huzur bulabilmektir.',
    category: 'peace',
    mood: ['anxious', 'tired'],
    emoji: '☮️'
  },
  {
    id: 'pea_005',
    text: 'İçsel huzurun için, dışsal kaostan bağımsız ol.',
    category: 'peace',
    mood: ['anxious', 'sad', 'neutral'],
    emoji: '🌊'
  },

  // Cesaret
  {
    id: 'cur_001',
    text: 'Cesaret, korkunun olmaması değil, korkuya rağmen ilerlemeye devam etmektir.',
    category: 'courage',
    mood: ['anxious', 'sad'],
    emoji: '🦁'
  },
  {
    id: 'cur_002',
    text: 'Bugün kendine inan. Sen düşündüğünden çok daha güçlüsün.',
    category: 'courage',
    mood: ['anxious', 'sad', 'neutral'],
    emoji: '💪'
  },
  {
    id: 'cur_003',
    text: 'Büyük hayaller, büyük cesaret ister. Bugün hangi hayaline adım atacaksın?',
    category: 'courage',
    mood: ['neutral', 'excited', 'anxious'],
    emoji: '🎯'
  },
  {
    id: 'cur_004',
    text: 'Korkularının karşısında durduğun her an, içindeki kahramanı beslersin.',
    category: 'courage',
    mood: ['anxious', 'neutral'],
    emoji: '⚡'
  },
  {
    id: 'cur_005',
    text: 'Senin hikayeni sen yazıyorsun. Bugün hangi sayfayı yazacaksın?',
    category: 'courage',
    mood: ['neutral', 'excited', 'happy'],
    emoji: '✍️'
  },

  // Sevgi & Öz-Sevgi
  {
    id: 'lov_001',
    text: 'Kendine karşı nazik ol. Sen her gün elinden gelenin en iyisini yapıyorsun.',
    category: 'love',
    mood: ['sad', 'anxious', 'tired'],
    emoji: '💕'
  },
  {
    id: 'lov_002',
    text: 'Kendinle barışık olmak, en büyük başarıdır.',
    category: 'love',
    mood: ['sad', 'neutral', 'grateful'],
    emoji: '🌹'
  },
  {
    id: 'lov_003',
    text: 'Bugün kendine söyle: "Yeterince iyiyim, yeterince değerliyim."',
    category: 'love',
    mood: ['sad', 'anxious'],
    emoji: '💖'
  },
  {
    id: 'lov_004',
    text: 'Sevgi, önce içeriden başlar. Kendini sev, sonra dünyayı.',
    category: 'love',
    mood: ['sad', 'neutral', 'grateful'],
    emoji: '❤️'
  },
  {
    id: 'lov_005',
    text: 'Mükemmel olmana gerek yok, sadece sen olmana. Ve bu harika!',
    category: 'love',
    mood: ['sad', 'anxious', 'happy'],
    emoji: '🌈'
  },

  // Hayaller & Hedefler
  {
    id: 'drm_001',
    text: 'Hayallerin için bugün ne yaptın? Her küçük adım, büyük rüyalara ulaştırır.',
    category: 'dreams',
    mood: ['excited', 'happy', 'neutral'],
    emoji: '🌠'
  },
  {
    id: 'drm_002',
    text: 'Büyük hayaller kurmaktan korkma. Sen bunlara layıksın!',
    category: 'dreams',
    mood: ['excited', 'happy', 'anxious'],
    emoji: '✨'
  },
  {
    id: 'drm_003',
    text: 'Hedeflerine giden yolda, her gün biraz daha yaklaşıyorsun.',
    category: 'dreams',
    mood: ['neutral', 'excited'],
    emoji: '🎯'
  },
  {
    id: 'drm_004',
    text: 'Rüyaların gerçek olabilir. İlk adım: onlara inanmak.',
    category: 'dreams',
    mood: ['excited', 'happy', 'neutral'],
    emoji: '🌟'
  },
  {
    id: 'drm_005',
    text: 'Bugün bir hayalini kağıda dök. İlk adımı atmış olursun!',
    category: 'dreams',
    mood: ['excited', 'neutral', 'happy'],
    emoji: '📝'
  },

  // Mutluluk İçin Özel
  {
    id: 'hap_001',
    text: 'Bu mutluluğu içine çek ve bugüne yay. Sen harikasın!',
    category: 'motivation',
    mood: ['happy', 'excited', 'grateful'],
    emoji: '🎉'
  },
  {
    id: 'hap_002',
    text: 'Mutluluğun bu enerjisini dünyaya saç. Pozitiflik bulaşıcıdır!',
    category: 'love',
    mood: ['happy', 'excited'],
    emoji: '☀️'
  },
  {
    id: 'hap_003',
    text: 'Bu anı yaşa, bu mutluluğu hisset. Bugün senin günün!',
    category: 'gratitude',
    mood: ['happy', 'excited'],
    emoji: '🌟'
  },

  // Üzgün Haller İçin Özel
  {
    id: 'sad_001',
    text: 'Bu da geçecek. Fırtınadan sonra her zaman gökkuşağı çıkar.',
    category: 'courage',
    mood: ['sad', 'anxious'],
    emoji: '🌈'
  },
  {
    id: 'sad_002',
    text: 'Üzgün olmana izin ver. Duygular geçicidir, ama sen güçlüsün.',
    category: 'love',
    mood: ['sad'],
    emoji: '🤗'
  },
  {
    id: 'sad_003',
    text: 'Bugün zor bir gün olabilir, ama yarın yeni umutlar getirecek.',
    category: 'peace',
    mood: ['sad', 'tired'],
    emoji: '🌙'
  },
];

// Ruh haline göre mesaj seçme fonksiyonu
export const getInspirationByMood = (mood?: MoodType): InspirationMessage => {
  if (!mood || mood === 'neutral') {
    // Neutral veya ruh hali yoksa, rastgele genel bir mesaj
    const neutralMessages = inspirationMessages.filter(
      m => !m.mood || m.mood.includes('neutral')
    );
    return neutralMessages[Math.floor(Math.random() * neutralMessages.length)];
  }

  // Ruh haline uygun mesajlar
  const matchingMessages = inspirationMessages.filter(
    m => m.mood && m.mood.includes(mood)
  );

  if (matchingMessages.length > 0) {
    return matchingMessages[Math.floor(Math.random() * matchingMessages.length)];
  }

  // Eğer ruh haline uygun mesaj yoksa, neutral mesaj döndür
  return getInspirationByMood('neutral');
};

// Kategoriye göre mesaj seçme
export const getInspirationByCategory = (category: InspirationCategory): InspirationMessage => {
  const categoryMessages = inspirationMessages.filter(m => m.category === category);
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
};

// Rastgele mesaj
export const getRandomInspiration = (): InspirationMessage => {
  return inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
};

