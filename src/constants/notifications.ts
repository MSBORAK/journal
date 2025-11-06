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

// AKŞAM MESAJLARI (16:00 - 21:00) - Günlük yazılmışsa
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

// AKŞAM MESAJLARI (Günlük yazılmamışsa) - Bağlılık artırıcı mesajlar
export const eveningReminderMessages: NotificationMessage[] = [
  // Türkçe
  {
    title: "Neden yazmadın? 😔",
    body: "Bugünü yazmayı unuttun mu? Beni unuttun mu?",
    emoji: "😔"
  },
  {
    title: "Beni unuttun mu? 💔",
    body: "Bugün hiç yazmadın, seni özledim. Bir şeyler paylaşır mısın?",
    emoji: "💔"
  },
  {
    title: "Neredesin? 🤔",
    body: "Bugün hiç görünmedin. Her şey yolunda mı? Yazmak istersen buradayım",
    emoji: "🤔"
  },
  {
    title: "Bugünü unutma! 📝",
    body: "Bugün hiç yazmadın. Birkaç kelime bile olsa yazsan olmaz mı?",
    emoji: "📝"
  },
  {
    title: "Seni özledim 💙",
    body: "Bugün yazmamışsın. Her şey yolunda mı? Ben buradayım",
    emoji: "💙"
  },
  {
    title: "Uzun zamandır yoktun ⏰",
    body: "Bugün hiç yazmadın. Ben seni bekliyorum, gel yazalım",
    emoji: "⏰"
  },
  {
    title: "Seni bekliyorum 🌻",
    body: "Bugün hiç görünmedin. Yazmak istersen kapım açık",
    emoji: "🌻"
  },
  {
    title: "Bir şeyler yazalım mı? ✍️",
    body: "Bugün hiç yazmadın. Birlikte bir şeyler yazalım mı?",
    emoji: "✍️"
  },
  {
    title: "Neden gelmiyorsun? 😢",
    body: "Bugün hiç yazmadın. Beni unuttun mu? Hadi gel, yazalım",
    emoji: "😢"
  },
  {
    title: "Yazmak ister misin? 💭",
    body: "Bugün hiç yazmadın. Yazmak istersen buradayım, seni bekliyorum",
    emoji: "💭"
  }
];

// AKŞAM MESAJLARI (Günlük yazılmamışsa) - Bağlılık artırıcı mesajlar (İngilizce)
export const eveningReminderMessagesEN: NotificationMessage[] = [
  {
    title: "Why didn't you write? 😔",
    body: "Did you forget to write today? Did you forget me?",
    emoji: "😔"
  },
  {
    title: "Did you forget me? 💔",
    body: "You didn't write at all today, I missed you. Would you like to share something?",
    emoji: "💔"
  },
  {
    title: "Where are you? 🤔",
    body: "I haven't seen you today. Is everything okay? I'm here if you want to write",
    emoji: "🤔"
  },
  {
    title: "Don't forget today! 📝",
    body: "You didn't write today. Could you write a few words at least?",
    emoji: "📝"
  },
  {
    title: "I missed you 💙",
    body: "You didn't write today. Is everything okay? I'm here",
    emoji: "💙"
  },
  {
    title: "You've been gone for a while ⏰",
    body: "You didn't write today. I'm waiting for you, come let's write",
    emoji: "⏰"
  },
  {
    title: "I'm waiting for you 🌻",
    body: "I haven't seen you today. My door is open if you want to write",
    emoji: "🌻"
  },
  {
    title: "Want to write something? ✍️",
    body: "You didn't write today. Want to write something together?",
    emoji: "✍️"
  },
  {
    title: "Why aren't you coming? 😢",
    body: "You didn't write today. Did you forget me? Come on, let's write",
    emoji: "😢"
  },
  {
    title: "Do you want to write? 💭",
    body: "You didn't write today. I'm here if you want to write, I'm waiting for you",
    emoji: "💭"
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
    title: "Rahat uyu zzz",
    body: "Bugünü yazdıysan, rahat uyu. Yazmadıysan yarın başla!",
    emoji: "💤"
  }
];

// MORNING MESSAGES (07:00 - 11:00) - English
export const morningMessagesEN: NotificationMessage[] = [
  {
    title: "Good Morning ☀️",
    body: "A new day, a new page. How are you feeling today?",
    emoji: "☀️"
  },
  {
    title: "Beautiful morning 🌅",
    body: "Grab yourself a coffee and share your thoughts",
    emoji: "🌅"
  },
  {
    title: "Welcome 💙",
    body: "What awaits you today? Discover by writing",
    emoji: "💙"
  },
  {
    title: "Morning energy ✨",
    body: "The best ideas come in the morning. Write yours!",
    emoji: "✨"
  },
  {
    title: "A new beginning 🌸",
    body: "How much time will you set aside for yourself today?",
    emoji: "🌸"
  },
  {
    title: "Good morning beautiful 🌻",
    body: "Would you like to record your mood today?",
    emoji: "🌻"
  },
  {
    title: "Morning magic 🪄",
    body: "Take 5 minutes for yourself, plan your day",
    emoji: "🪄"
  },
  {
    title: "A peaceful day 🕊️",
    body: "Take a deep breath and start today",
    emoji: "🕊️"
  },
  {
    title: "Hello beautiful person 💚",
    body: "Writing in the morning makes you happier",
    emoji: "💚"
  },
  {
    title: "Time for gratitude 🙏",
    body: "What are you grateful for today? Write and remember",
    emoji: "🙏"
  }
];

// AFTERNOON MESSAGES (11:00 - 16:00) - English
export const afternoonMessagesEN: NotificationMessage[] = [
  {
    title: "Hello 🌼",
    body: "You're in the middle of your day. How's it going?",
    emoji: "🌼"
  },
  {
    title: "A little break 🌿",
    body: "Take some time for yourself, write your thoughts",
    emoji: "🌿"
  },
  {
    title: "Lunch break ☕",
    body: "Take a breath, think about your day, share",
    emoji: "☕"
  },
  {
    title: "Take a break 💭",
    body: "A great time to write what's on your mind",
    emoji: "💭"
  },
  {
    title: "Return to yourself 🧘",
    body: "Take 5 minutes for yourself in the hustle and bustle",
    emoji: "🧘"
  },
  {
    title: "Midday 🌞",
    body: "How did the morning go? Record your memories",
    emoji: "🌞"
  },
  {
    title: "Time to rest 🪴",
    body: "Write something to relax your mind",
    emoji: "🪴"
  },
  {
    title: "Are you at ease? 💚",
    body: "Would you like to talk about your feelings?",
    emoji: "💚"
  }
];

// EVENING MESSAGES (16:00 - 21:00) - When diary is written - English
export const eveningMessagesEN: NotificationMessage[] = [
  {
    title: "Evening has come 🌙",
    body: "How was your day? Would you like to share?",
    emoji: "🌙"
  },
  {
    title: "End of the day 🌆",
    body: "A great time to write your thoughts for today",
    emoji: "🌆"
  },
  {
    title: "Time for peace ✨",
    body: "Come back to yourself before ending the day",
    emoji: "✨"
  },
  {
    title: "Good evening 💜",
    body: "Would you like to record what you experienced today?",
    emoji: "💜"
  },
  {
    title: "Evening reflection 🌠",
    body: "What made you happy today?",
    emoji: "🌠"
  },
  {
    title: "Close the day 📔",
    body: "Writing will relax your mind",
    emoji: "📔"
  },
  {
    title: "A calm evening 🕯️",
    body: "Take care of yourself, note today",
    emoji: "🕯️"
  },
  {
    title: "Before midnight 🌃",
    body: "Don't forget to record your feelings today",
    emoji: "🌃"
  },
  {
    title: "Before bed 💙",
    body: "One last thought, one last note",
    emoji: "💙"
  },
  {
    title: "Daily summary 📝",
    body: "Tell today in 3 sentences",
    emoji: "📝"
  }
];

// NIGHT MESSAGES (21:00 - 23:00) - Before quiet hours - English
export const nightMessagesEN: NotificationMessage[] = [
  {
    title: "Good night 🌙",
    body: "Would you like to note today before bed?",
    emoji: "🌙"
  },
  {
    title: "Last reminder ✨",
    body: "If you couldn't write today, I'll be here tomorrow",
    emoji: "✨"
  },
  {
    title: "Night silence 🌌",
    body: "The deepest thoughts come at night",
    emoji: "🌌"
  },
  {
    title: "Time to sleep 😴",
    body: "Clear your mind for a peaceful sleep",
    emoji: "😴"
  },
  {
    title: "Sleep well zzz",
    body: "If you wrote today, sleep well. If not, start tomorrow!",
    emoji: "💤"
  }
];

// WEEKEND MESSAGES - English
export const weekendMessagesEN: NotificationMessage[] = [
  {
    title: "Weekend! 🎉",
    body: "A great day to take time for yourself",
    emoji: "🎉"
  },
  {
    title: "Rest day 🛋️",
    body: "Think about your week, plan next week",
    emoji: "🛋️"
  },
  {
    title: "Weekend peace ☕",
    body: "No rush, write your thoughts comfortably",
    emoji: "☕"
  },
  {
    title: "Sunday vibes 🌸",
    body: "Would you like to summarize your week?",
    emoji: "🌸"
  },
  {
    title: "Saturday reflection 🌅",
    body: "What did you experience this week? Record it!",
    emoji: "🌅"
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

// MISSING YOU MESSAGES (3+ days without writing) - English
export const missingYouMessagesEN: NotificationMessage[] = [
  {
    title: "I miss you 💙",
    body: "Is everything okay? We're always here for you",
    emoji: "💙"
  },
  {
    title: "How are you? 🌸",
    body: "We haven't talked in a while. I hope you're doing well",
    emoji: "🌸"
  },
  {
    title: "I'm here 💚",
    body: "Come whenever you want, I'll listen without judgment",
    emoji: "💚"
  },
  {
    title: "I'm curious 🌿",
    body: "You haven't written in a while. Is everything okay?",
    emoji: "🌿"
  },
  {
    title: "Let's talk ☕",
    body: "Are you going through a tough time? Share, relax",
    emoji: "☕"
  },
  {
    title: "When you're ready 💪",
    body: "It's okay if you're away. Come back when you feel ready",
    emoji: "💪"
  },
  {
    title: "I'm waiting 🌻",
    body: "The door is always open, you can come back anytime",
    emoji: "🌻"
  },
  {
    title: "Come back 🏡",
    body: "You can continue your journey from where you left off",
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

// CELEBRATION MESSAGES (Achievement notifications) - English
export const celebrationMessagesEN: NotificationMessage[] = [
  {
    title: "Amazing! 🎉",
    body: "3 day streak! Keep it up",
    emoji: "🎉"
  },
  {
    title: "Incredible! 🔥",
    body: "7 day streak! I'm proud of you",
    emoji: "🔥"
  },
  {
    title: "Legendary! 💎",
    body: "14 day streak! This is a lifestyle now",
    emoji: "💎"
  },
  {
    title: "Proud! 👑",
    body: "30 day streak! You've made it a habit",
    emoji: "👑"
  },
  {
    title: "Extraordinary! 🌟",
    body: "You wrote every day this week! Congratulations",
    emoji: "🌟"
  },
  {
    title: "Super! ⭐",
    body: "You wrote your 10th entry! Keep going",
    emoji: "⭐"
  },
  {
    title: "Perfect! 🎊",
    body: "50 days of writing! This is a success story",
    emoji: "🎊"
  },
  {
    title: "Legend! 🏆",
    body: "100 days of writing! You've become a legend",
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

// MOTIVATIONAL MESSAGES (When motivation is low) - English
export const motivationalMessagesEN: NotificationMessage[] = [
  {
    title: "Take care of yourself 💚",
    body: "Tough days are temporary, you are permanent",
    emoji: "💚"
  },
  {
    title: "You're not alone 🤗",
    body: "Sharing your feelings is a sign of strength",
    emoji: "🤗"
  },
  {
    title: "You're enough today 💙",
    body: "You don't have to be perfect",
    emoji: "💙"
  },
  {
    title: "Take a breath 🌬️",
    body: "Take a deep breath, everything will be okay",
    emoji: "🌬️"
  },
  {
    title: "Small steps 👣",
    body: "Every small step counts as progress",
    emoji: "👣"
  },
  {
    title: "You're valuable 💎",
    body: "Your existence alone is a sufficient gift",
    emoji: "💎"
  },
  {
    title: "Everything takes time 🌱",
    body: "Healing is not linear, be patient",
    emoji: "🌱"
  },
  {
    title: "Remember your strength 💪",
    body: "If you've come this far, you can go even further",
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
  // Güvenlik kontrolü: messages undefined veya boş ise fallback mesaj döndür
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    console.warn('⚠️ getRandomMessage: messages array is empty or undefined, using fallback');
    return {
      title: 'Hello 👋',
      body: 'Have a great day!',
      emoji: '👋'
    };
  }
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
  
  // Daha güvenli zaman dilimi kontrolü
  let hour;
  try {
    hour = parseInt(now.toLocaleString('en-US', {
      timeZone: userTimezone,
      hour: 'numeric',
      hour12: false
    }));
  } catch (error) {
    console.error('❌ Timezone error, using local time:', error);
    hour = now.getHours();
  }
  
  console.log(`🕐 Current hour in ${userTimezone}: ${hour}`);
  console.log(`🕐 Current time: ${now.toLocaleString()}`);
  console.log(`🕐 Timezone: ${userTimezone}`);
  console.log(`🕐 Local hour: ${now.getHours()}`);
  
  // Eğer mood değeri verilmişse, mood bazlı mesaj seç
  if (moodValue !== undefined && moodValue !== null) {
    console.log('😊 Using mood-based message');
    return getMessageByMood(moodValue);
  }
  
  // Aksi halde zaman bazlı mesaj seç - daha sıkı kontrol
  if (hour >= 5 && hour < 11) {
    console.log('🌅 Using morning messages (5-11)');
    return getRandomMessage(morningMessages);
  } else if (hour >= 11 && hour < 16) {
    console.log('☀️ Using afternoon messages (11-16)');
    return getRandomMessage(afternoonMessages);
  } else if (hour >= 16 && hour < 21) {
    console.log('🌆 Using evening messages (16-21)');
    return getRandomMessage(eveningMessages);
  } else if (hour >= 21 && hour < 23) {
    console.log('🌙 Using night messages (21-23)');
    return getRandomMessage(nightMessages);
  } else {
    // Sessiz saatler (23:00 - 05:00) - mesaj gönderilmemeli
    console.log('💤 Silent hours (23-5) - no message');
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
    
    console.log(`📅 Current time in ${userTimezone}: ${now.toLocaleString()}, Day: ${dayOfWeek}`);
    
    // Hafta sonu kontrolü
    if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
      console.log('📅 Weekend detected, showing weekend message');
      return getRandomMessage(weekendMessages);
    } else {
      console.log('📅 Weekday detected, showing time-based message');
      return getMessageByTimeOfDay(undefined, userTimezone);
    }
  } catch (error) {
    console.error('❌ Error in getMessageByDayOfWeek:', error);
    // Fallback: UTC tabanlı kontrol
    const dayNumber = now.getUTCDay(); // 0=Sunday, 6=Saturday
    if (dayNumber === 6 || dayNumber === 0) {
      console.log('📅 Weekend detected (UTC fallback), showing weekend message');
      return getRandomMessage(weekendMessages);
    } else {
      console.log('📅 Weekday detected (UTC fallback), showing time-based message');
      return getMessageByTimeOfDay(undefined, userTimezone);
    }
  }
};

