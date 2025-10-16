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
    title: 'Harika Hafta! 🌟',
    message: 'Bu hafta çok pozitif bir enerjin var! Bu güzel ruh halini korumaya devam et.',
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
    title: 'Güzel Günler! 😊',
    message: 'Son günlerde ruh halin oldukça iyi. Bu pozitif enerjiyi sürdürmeye devam et!',
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
    title: 'Sen Güçlüsün! 💪',
    message: 'Zor günler geçiriyorsun ama unutma, her zorluk seni daha güçlü yapar. Pes etme!',
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
    title: 'Neredeyse Bitti! 🎯',
    message: 'Hedefine çok yaklaştın! Son spurtla bitirebilirsin, hadi!',
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
    title: 'İyi Gidiyor! 📈',
    message: 'Hedeflerinde güzel ilerleme kaydediyorsun. Bu tempoyu koru!',
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
    title: 'Muhteşem Streak! 🔥',
    message: 'Günlük yazma serin inanılmaz! Bu disiplini korumaya devam et!',
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
    title: 'Güzel Alışkanlık! ⭐',
    message: 'Düzenli günlük yazma alışkanlığın gelişiyor. Harika!',
    emoji: '⭐',
    priority: 'medium',
    conditions: {
      streakDays: 3,
      cooldownHours: 12,
    },
  },

  // General Encouragement
  {
    id: 'general_encouragement_1',
    type: 'encouragement',
    title: 'Sen Harikasın! ✨',
    message: 'Kendine zaman ayırdığın için teşekkürler. Bu öz bakımın çok değerli!',
    emoji: '✨',
    priority: 'low',
    conditions: {
      cooldownHours: 48,
    },
  },
  {
    id: 'general_encouragement_2',
    type: 'encouragement',
    title: 'Büyüme Zamanı! 🌱',
    message: 'Her gün biraz daha iyi versiyonun oluyorsun. Bu yolculuk çok güzel!',
    emoji: '🌱',
    priority: 'low',
    conditions: {
      cooldownHours: 36,
    },
  },
];

export interface UserStats {
  moodTrend: number; // Son 7 günün ortalama mood'u
  goalProgress: number; // Aktif hedeflerin ortalama ilerlemesi
  streakDays: number; // Günlük yazma serisi
  lastDiaryDate?: string; // Son günlük tarihi
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
      // Son 7 günün günlük verilerini al
      const diaryEntries = await this.getDiaryEntries(userId);
      const recentEntries = diaryEntries.slice(-7);
      
      // Mood trend hesapla
      const moodTrend = this.calculateMoodTrend(recentEntries);
      
      // Goal progress hesapla (şimdilik basit bir değer)
      const goalProgress = 65; // TODO: Gerçek hedef verilerinden hesapla
      
      // Streak hesapla
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

  public async getPersonalizedMotivation(userId?: string): Promise<MotivationData | null> {
    try {
      const userStats = await this.getUserStats(userId);
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
