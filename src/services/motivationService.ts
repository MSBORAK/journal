import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';

export interface MotivationData {
  id: string;
  type: 'mood_trend' | 'goal_progress' | 'streak' | 'achievement' | 'encouragement';
  title: string;
  message: string;
  emoji: string;
  priority: 'low' | 'medium' | 'high';
  conditions: {
    minMoodTrend?: number;
    maxMoodTrend?: number;
    minGoalProgress?: number;
    maxGoalProgress?: number;
    streakDays?: number;
    lastShown?: number; // timestamp
    cooldownHours?: number;
  };
}

export const MOTIVATION_MESSAGES: MotivationData[] = [
  // Mood Trend Messages
  {
    id: 'mood_excellent_week',
    type: 'mood_trend',
    title: 'Işıl Işıl Parlıyorsun! ✨',
    message: 'Bu hafta içindeki ışık öyle güçlü ki, etrafına pozitif enerji saçıyorsun. Kendini hissettiğin gibi yaşamaya devam et!',
    emoji: '🌟',
    priority: 'high',
    conditions: {
      minMoodTrend: 4.5,
      cooldownHours: 24,
    },
  },
  {
    id: 'mood_good_week',
    type: 'mood_trend',
    title: 'Ruhun Huzurlu! 🌸',
    message: 'İçindeki o güzel enerji çok değerli. Hayatın sana sunduğu bu güzel anları doya doya yaşa!',
    emoji: '😊',
    priority: 'medium',
    conditions: {
      minMoodTrend: 3.5,
      maxMoodTrend: 4.4,
      cooldownHours: 12,
    },
  },
  {
    id: 'mood_encouragement',
    type: 'mood_trend',
    title: 'Her Gün Yeni Bir Başlangıç! 🌅',
    message: 'Bazen bulutlar güneşi örter ama güneş hep oradadır. Senin içindeki ışık da öyle. Bugün daha güzel olacak!',
    emoji: '💪',
    priority: 'high',
    conditions: {
      maxMoodTrend: 2.5,
      cooldownHours: 6,
    },
  },

  // Goal Progress Messages
  {
    id: 'goal_almost_there',
    type: 'goal_progress',
    title: 'Hayallerine Çok Yakınsın! ✨',
    message: 'Bak ne kadar yol kattettin! Her adım seni daha güçlü yapıyor. Devam et, sen harikasın!',
    emoji: '🎯',
    priority: 'high',
    conditions: {
      minGoalProgress: 80,
      cooldownHours: 8,
    },
  },
  {
    id: 'goal_good_progress',
    type: 'goal_progress',
    title: 'Yolun Yarısını Geçtin! 🌈',
    message: 'Her küçük adım büyük değişimlerin başlangıcı. Sen harika şeyler başarıyorsun!',
    emoji: '📈',
    priority: 'medium',
    conditions: {
      minGoalProgress: 50,
      maxGoalProgress: 79,
      cooldownHours: 12,
    },
  },

  // Streak Messages
  {
    id: 'streak_amazing',
    type: 'streak',
    title: 'Sen Bir Efsanesin! 🔥',
    message: 'Kendine verdiğin değere bak! Her gün kendine zaman ayırman ne kadar güzel. Gurur duymalısın!',
    emoji: '🔥',
    priority: 'high',
    conditions: {
      streakDays: 7,
      cooldownHours: 24,
    },
  },
  {
    id: 'streak_good',
    type: 'streak',
    title: 'Harika Bir Ritm! ⭐',
    message: 'Kendine düzenli zaman ayırmak en güzel hediye. Sen çok değerlisin ve bunu hak ediyorsun!',
    emoji: '⭐',
    priority: 'medium',
    conditions: {
      streakDays: 3,
      cooldownHours: 12,
    },
  },

  // General Encouragement - Pozitif & İlham Verici
  {
    id: 'general_encouragement_1',
    type: 'encouragement',
    title: 'İçindeki Işık Parlıyor! ✨',
    message: 'Kendine ayırdığın her an, ruhunu besliyor. Sen çok özelsin ve bunu unutma!',
    emoji: '✨',
    priority: 'low',
    conditions: {
      cooldownHours: 48,
    },
  },
  {
    id: 'general_encouragement_2',
    type: 'encouragement',
    title: 'Her Gün Daha Güçlüsün! 🌱',
    message: 'Bazen fark etmesen de her gün biraz daha güçleniyorsun. Kendine inan, sen muhteşemsin!',
    emoji: '🌱',
    priority: 'low',
    conditions: {
      cooldownHours: 36,
    },
  },
  {
    id: 'reflection_insight',
    type: 'encouragement',
    title: 'Duygularını Dinlemek Güzel! 🎵',
    message: 'İçindeki sese kulak vermek seni daha huzurlu yapıyor. Kendini dinlemeye devam et!',
    emoji: '🤔',
    priority: 'medium',
    conditions: {
      cooldownHours: 24,
    },
  },
  {
    id: 'gratitude_practice',
    type: 'encouragement',
    title: 'Hayat Sana Gülüyor! 🌻',
    message: 'Şükretmek kalbi ferahlatır. İşte şu an sahip olduğun her şey bir nimet. Hayattan keyif al!',
    emoji: '🙏',
    priority: 'medium',
    conditions: {
      cooldownHours: 18,
    },
  },
  {
    id: 'emotional_awareness',
    type: 'encouragement',
    title: 'Duygularına Değer Ver! 💖',
    message: 'Her duygun seni sen yapan şeylerden biri. Onları kabul et, onlarla barış. Çok güzelsin!',
    emoji: '💭',
    priority: 'medium',
    conditions: {
      cooldownHours: 20,
    },
  },
  {
    id: 'growth_mindset',
    type: 'encouragement',
    title: 'Büyüyen Bir Ruh! 🦋',
    message: 'Her yeni gün, yeni bir sen olmak için bir fırsat. Sen sürekli dönüşüyorsun ve bu çok güzel!',
    emoji: '🧠',
    priority: 'high',
    conditions: {
      cooldownHours: 16,
    },
  },
  {
    id: 'self_compassion',
    type: 'encouragement',
    title: 'Kendine Nazik Ol! 🌸',
    message: 'En sevdiğin insana davrandığın gibi kendine de davran. Sen de şefkat hak ediyorsun!',
    emoji: '💝',
    priority: 'high',
    conditions: {
      cooldownHours: 14,
    },
  },
  {
    id: 'future_planning',
    type: 'encouragement',
    title: 'Yarınların Parlak! 🌅',
    message: 'Her yeni gün yeni umutlar, yeni başlangıçlar demek. Hayallerine adım adım yaklaşıyorsun!',
    emoji: '🎯',
    priority: 'medium',
    conditions: {
      cooldownHours: 22,
    },
  },
  {
    id: 'energy_awareness',
    type: 'encouragement',
    title: 'Enerjin Çok Değerli! 💫',
    message: 'Kendini yorma, dinlenmeyi bil. Enerjini korumak seni daha mutlu yapar. Kendine iyi bak!',
    emoji: '⚡',
    priority: 'medium',
    conditions: {
      cooldownHours: 26,
    },
  },
  {
    id: 'communication_skills',
    type: 'encouragement',
    title: 'Connections Empower You! 🤝',
    message: 'The beautiful connections you build with people enrich your life. Share with love!',
    emoji: '🗣️',
    priority: 'low',
    conditions: {
      cooldownHours: 30,
    },
  },
  {
    id: 'accomplishment_celebration',
    type: 'encouragement',
    title: 'Her Başarı Kutlanmalı! 🎊',
    message: 'Küçük de olsa her adımın önemli! Kendini kutlamayı unutma, sen harikasın!',
    emoji: '🎉',
    priority: 'high',
    conditions: {
      cooldownHours: 12,
    },
  },
  {
    id: 'mindful_living',
    type: 'encouragement',
    title: 'Anı Yaşa! 🌺',
    message: 'Şu an burada olmak ne güzel değil mi? Her anın tadını çıkar, yaşamın güzelliğini hisset!',
    emoji: '🌸',
    priority: 'medium',
    conditions: {
      cooldownHours: 28,
    },
  },
  {
    id: 'peace_within',
    type: 'encouragement',
    title: 'İçsel Huzur! 🕊️',
    message: 'Huzur dışarıda değil, içinde. Kendine zaman ayırarak içindeki huzuru büyütüyorsun. Ne güzel!',
    emoji: '🕊️',
    priority: 'medium',
    conditions: {
      cooldownHours: 20,
    },
  },
  {
    id: 'self_love',
    type: 'encouragement',
    title: 'Kendini Sev! 💕',
    message: 'Sen bu dünyada bir tanesin. Kendini olduğun gibi kabul et ve sev. Çok değerlisin!',
    emoji: '💕',
    priority: 'high',
    conditions: {
      cooldownHours: 16,
    },
  },
  {
    id: 'beautiful_soul',
    type: 'encouragement',
    title: 'Güzel Bir Ruhsun! 🌟',
    message: 'İçindeki güzellik her geçen gün daha çok parlıyor. Kendini olduğun gibi yaşa!',
    emoji: '💎',
    priority: 'medium',
    conditions: {
      cooldownHours: 24,
    },
  },
  {
    id: 'breathe_relax',
    type: 'encouragement',
    title: 'Nefes Al, Rahatla! 🌬️',
    message: 'Derin bir nefes al. Omuzlarını gevşet. Her şey yoluna girecek. Sen harikasın!',
    emoji: '🧘',
    priority: 'low',
    conditions: {
      cooldownHours: 32,
    },
  },
  {
    id: 'smile_today',
    type: 'encouragement',
    title: 'Gülümse! 😊',
    message: 'Bugün mutlu olman için sana bir neden: Sen varsın! Hayatın güzel sürprizlerle dolu!',
    emoji: '😄',
    priority: 'high',
    conditions: {
      cooldownHours: 18,
    },
  },
];

export interface UserStats {
  moodTrend: number; // Average mood of last 7 days
  goalProgress: number; // Average progress of active goals
  streakDays: number; // Daily writing streak
  lastDiaryDate?: string; // Last diary date
}

export class MotivationService {
  private static instance: MotivationService;
  private lastShownKey = 'motivation_last_shown';

  private constructor() {}

  public static getInstance(): MotivationService {
    if (!MotivationService.instance) {
      MotivationService.instance = new MotivationService();
    }
    return MotivationService.instance;
  }

  public async getUserStats(userId?: string): Promise<UserStats> {
    try {
      // Get diary data for last 7 days
      const diaryEntries = await this.getDiaryEntries(userId);
      const recentEntries = diaryEntries.slice(-7);
      
      // Calculate mood trend
      const moodTrend = this.calculateMoodTrend(recentEntries);
      
      // Calculate goal progress (simple value for now)
      const goalProgress = 65; // TODO: Calculate from real goal data
      
      // Calculate streak
      const streakDays = this.calculateStreak(diaryEntries);
      
      return {
        moodTrend,
        goalProgress,
        streakDays,
        lastDiaryDate: recentEntries[recentEntries.length - 1]?.date,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        moodTrend: 3,
        goalProgress: 50,
        streakDays: 0,
      };
    }
  }

  public async getReflectionInsights(userId?: string): Promise<{
    gratitudeLevel: number;
    emotionalDepth: number;
    selfAwareness: number;
    futureOrientation: number;
    energyTracking: number;
  }> {
    try {
      const diaryEntries = await this.getDiaryEntries(userId);
      const recentEntries = diaryEntries.slice(-7);
      
      if (recentEntries.length === 0) {
        return {
          gratitudeLevel: 0,
          emotionalDepth: 0,
          selfAwareness: 0,
          futureOrientation: 0,
          energyTracking: 0,
        };
      }

      // Minnettarlık seviyesi (gratitude cevaplarına göre)
      const gratitudeLevel = this.calculateGratitudeLevel(recentEntries);
      
      // Duygusal derinlik (emotion cevaplarına göre)
      const emotionalDepth = this.calculateEmotionalDepth(recentEntries);
      
      // Öz-farkındalık (growth ve self-reflection cevaplarına göre)
      const selfAwareness = this.calculateSelfAwareness(recentEntries);
      
      // Gelecek odaklılık (tomorrow cevaplarına göre)
      const futureOrientation = this.calculateFutureOrientation(recentEntries);
      
      // Enerji takibi (energy cevaplarına göre)
      const energyTracking = this.calculateEnergyTracking(recentEntries);
      
      return {
        gratitudeLevel,
        emotionalDepth,
        selfAwareness,
        futureOrientation,
        energyTracking,
      };
    } catch (error) {
      console.error('Error getting reflection insights:', error);
      return {
        gratitudeLevel: 0,
        emotionalDepth: 0,
        selfAwareness: 0,
        futureOrientation: 0,
        energyTracking: 0,
      };
    }
  }

  private calculateGratitudeLevel(entries: DiaryEntry[]): number {
    let gratitudeCount = 0;
    entries.forEach(entry => {
      if (entry.answers?.gratitude && entry.answers.gratitude.trim().length > 10) {
        gratitudeCount++;
      }
    });
    return (gratitudeCount / entries.length) * 100;
  }

  private calculateEmotionalDepth(entries: DiaryEntry[]): number {
    let emotionalCount = 0;
    entries.forEach(entry => {
      if (entry.answers?.emotion && entry.answers.emotion.trim().length > 15) {
        emotionalCount++;
      }
    });
    return (emotionalCount / entries.length) * 100;
  }

  private calculateSelfAwareness(entries: DiaryEntry[]): number {
    let awarenessCount = 0;
    entries.forEach(entry => {
      if ((entry.answers?.growth && entry.answers.growth.trim().length > 10) ||
          (entry.answers?.lesson && entry.answers.lesson.trim().length > 10)) {
        awarenessCount++;
      }
    });
    return (awarenessCount / entries.length) * 100;
  }

  private calculateFutureOrientation(entries: DiaryEntry[]): number {
    let futureCount = 0;
    entries.forEach(entry => {
      if (entry.answers?.tomorrow && entry.answers.tomorrow.trim().length > 10) {
        futureCount++;
      }
    });
    return (futureCount / entries.length) * 100;
  }

  private calculateEnergyTracking(entries: DiaryEntry[]): number {
    let energyCount = 0;
    entries.forEach(entry => {
      if (entry.answers?.energy && entry.answers.energy.trim().length > 8) {
        energyCount++;
      }
    });
    return (energyCount / entries.length) * 100;
  }

  public async getPersonalizedMotivation(userId?: string): Promise<MotivationData | null> {
    try {
      const userStats = await this.getUserStats(userId);
      const reflectionInsights = await this.getReflectionInsights(userId);
      const lastShown = await this.getLastShownMessages(userId);
      
      // Uygun mesajları filtrele
      const availableMessages = MOTIVATION_MESSAGES.filter(message => {
        // Koşulları kontrol et
        if (message.conditions.minMoodTrend && userStats.moodTrend < message.conditions.minMoodTrend) {
          return false;
        }
        if (message.conditions.maxMoodTrend && userStats.moodTrend > message.conditions.maxMoodTrend) {
          return false;
        }
        if (message.conditions.minGoalProgress && userStats.goalProgress < message.conditions.minGoalProgress) {
          return false;
        }
        if (message.conditions.streakDays && userStats.streakDays < message.conditions.streakDays) {
          return false;
        }
        
        // Reflection insights'a göre mesajları filtrele
        if (message.type === 'encouragement') {
          // Minnettarlık seviyesi yüksekse gratitude mesajlarını göster
          if (message.id === 'gratitude_practice' && reflectionInsights.gratitudeLevel < 50) {
            return false;
          }
          // Duygusal derinlik yüksekse emotion mesajlarını göster
          if (message.id === 'emotional_awareness' && reflectionInsights.emotionalDepth < 40) {
            return false;
          }
          // Öz-farkındalık yüksekse growth mesajlarını göster
          if (message.id === 'growth_mindset' && reflectionInsights.selfAwareness < 60) {
            return false;
          }
          // Gelecek odaklılık yüksekse planning mesajlarını göster
          if (message.id === 'future_planning' && reflectionInsights.futureOrientation < 30) {
            return false;
          }
          // Enerji takibi yüksekse energy mesajlarını göster
          if (message.id === 'energy_awareness' && reflectionInsights.energyTracking < 35) {
            return false;
          }
        }
        
        // Cooldown kontrolü
        const lastShownTime = lastShown[message.id];
        if (lastShownTime && message.conditions.cooldownHours) {
          const hoursSinceLastShown = (Date.now() - lastShownTime) / (1000 * 60 * 60);
          if (hoursSinceLastShown < message.conditions.cooldownHours) {
            return false;
          }
        }
        
        return true;
      });

      if (availableMessages.length === 0) {
        return null;
      }

      // Priority'ye göre sırala ve en yüksek priority'yi seç
      availableMessages.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const selectedMessage = availableMessages[0];
      
      // Mesajı gösterildi olarak işaretle
      await this.markMessageAsShown(selectedMessage.id, userId);
      
      return selectedMessage;
    } catch (error) {
      console.error('Error getting personalized motivation:', error);
      return null;
    }
  }

  private async getDiaryEntries(userId?: string): Promise<DiaryEntry[]> {
    try {
      const key = userId ? `diary_entries_${userId}` : 'diary_entries';
      const entriesJson = await AsyncStorage.getItem(key);
      if (entriesJson) {
        return JSON.parse(entriesJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting diary entries:', error);
      return [];
    }
  }

  private calculateMoodTrend(entries: DiaryEntry[]): number {
    if (entries.length === 0) return 3;
    
    const moodSum = entries.reduce((sum, entry) => sum + (entry.mood || 3), 0);
    return moodSum / entries.length;
  }

  private calculateStreak(entries: DiaryEntry[]): number {
    if (entries.length === 0) return 0;
    
    // Son 30 günü kontrol et
    const sortedEntries = entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private async getLastShownMessages(userId?: string): Promise<{ [messageId: string]: number }> {
    try {
      const key = userId ? `${this.lastShownKey}_${userId}` : this.lastShownKey;
      const messagesJson = await AsyncStorage.getItem(key);
      return messagesJson ? JSON.parse(messagesJson) : {};
    } catch (error) {
      console.error('Error getting last shown messages:', error);
      return {};
    }
  }

  private async markMessageAsShown(messageId: string, userId?: string): Promise<void> {
    try {
      const lastShown = await this.getLastShownMessages(userId);
      lastShown[messageId] = Date.now();
      
      const key = userId ? `${this.lastShownKey}_${userId}` : this.lastShownKey;
      await AsyncStorage.setItem(key, JSON.stringify(lastShown));
    } catch (error) {
      console.error('Error marking message as shown:', error);
    }
  }

  public async resetMotivationHistory(userId?: string): Promise<void> {
    try {
      const key = userId ? `${this.lastShownKey}_${userId}` : this.lastShownKey;
      await AsyncStorage.removeItem(key);
      console.log('Motivation history reset for user:', userId || 'anonymous');
    } catch (error) {
      console.error('Error resetting motivation history:', error);
    }
  }
}

export const motivationService = MotivationService.getInstance();
