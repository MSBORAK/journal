import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types';
import { sendAchievementNotification } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';

const ACHIEVEMENTS_STORAGE_KEY = '@daily_achievements';
const USER_STATS_STORAGE_KEY = '@daily_user_stats';

export interface UserStats {
  // Günlük yazma istatistikleri
  totalDiaryEntries: number;
  currentStreak: number;
  longestStreak: number;
  lastDiaryDate?: string;
  
  // Görev istatistikleri
  totalTasksCompleted: number;
  tasksCompletedThisWeek: number;
  
  // Sağlık istatistikleri
  healthTrackingDays: number;
  lastHealthDate?: string;
  
  // Hatırlatıcı istatistikleri
  totalReminders: number;
  activeReminders: number;
  
  // Genel istatistikler
  appUsageDays: number;
  firstAppUseDate?: string;
  
  // Wellness puanı sistemi
  wellnessScore: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: Achievement['category'];
  requirement: {
    type: 'streak' | 'total' | 'consecutive' | 'milestone';
    value: number;
    period?: 'daily' | 'weekly' | 'monthly';
  };
  reward?: {
    points: number;
    special?: string;
  };
}

// Wellness puanı hesaplama fonksiyonu
const calculateWellnessScore = (stats: UserStats): number => {
  let score = 0;
  
  // Günlük yazma puanı (0-30)
  const diaryScore = Math.min(stats.currentStreak * 2, 30);
  score += diaryScore;
  
  // Toplam günlük puanı (0-20)
  const totalDiaryScore = Math.min(Math.floor(stats.totalDiaryEntries / 5), 20);
  score += totalDiaryScore;
  
  // Görev tamamlama puanı (0-25)
  const taskScore = Math.min(Math.floor(stats.totalTasksCompleted / 2), 25);
  score += taskScore;
  
  // Sağlık takibi puanı (0-15)
  const healthScore = Math.min(stats.healthTrackingDays, 15);
  score += healthScore;
  
  // Uygulama kullanım puanı (0-10)
  const usageScore = Math.min(Math.floor(stats.appUsageDays / 7), 10);
  score += usageScore;
  
  return Math.min(score, 100); // Maksimum 100
};

// Seviye hesaplama fonksiyonu
const calculateLevel = (wellnessScore: number): { level: number; experience: number; nextLevelExp: number } => {
  if (wellnessScore < 10) {
    return { level: 1, experience: wellnessScore, nextLevelExp: 10 };
  } else if (wellnessScore < 25) {
    return { level: 2, experience: wellnessScore - 10, nextLevelExp: 25 };
  } else if (wellnessScore < 45) {
    return { level: 3, experience: wellnessScore - 25, nextLevelExp: 45 };
  } else if (wellnessScore < 70) {
    return { level: 4, experience: wellnessScore - 45, nextLevelExp: 70 };
  } else if (wellnessScore < 100) {
    return { level: 5, experience: wellnessScore - 70, nextLevelExp: 100 };
  } else {
    return { level: 5, experience: 100, nextLevelExp: 100 };
  }
};

export const useAchievements = (userId?: string) => {
  const { t, currentLanguage } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalDiaryEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    tasksCompletedThisWeek: 0,
    healthTrackingDays: 0,
    totalReminders: 0,
    activeReminders: 0,
    appUsageDays: 0,
    wellnessScore: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 10,
  });
  const [loading, setLoading] = useState(true);

  // Başarı tanımları - currentLanguage değiştiğinde yeniden oluştur
  const achievementDefinitions: AchievementDefinition[] = useMemo(() => [
    // Streak Başarıları
    {
      id: 'first_streak_3',
      title: currentLanguage === 'en' ? 'Beginning' : 'Başlangıç',
      description: currentLanguage === 'en' ? 'You wrote a diary for 3 consecutive days!' : '3 gün üst üste günlük yazdın!',
      icon: '🔥',
      category: 'streak',
      requirement: { type: 'streak', value: 3 },
      reward: { points: 10 }
    },
    {
      id: 'streak_7',
      title: currentLanguage === 'en' ? 'Weekly Master' : 'Haftalık Usta',
      description: currentLanguage === 'en' ? 'You wrote a diary for 7 consecutive days!' : '7 gün üst üste günlük yazdın!',
      icon: '⭐',
      category: 'streak',
      requirement: { type: 'streak', value: 7 },
      reward: { points: 25 }
    },
    {
      id: 'streak_14',
      title: currentLanguage === 'en' ? 'Two-Week Hero' : 'İki Hafta Kahramanı',
      description: currentLanguage === 'en' ? 'You wrote a diary for 14 consecutive days!' : '14 gün üst üste günlük yazdın!',
      icon: '🏆',
      category: 'streak',
      requirement: { type: 'streak', value: 14 },
      reward: { points: 50 }
    },
    {
      id: 'streak_30',
      title: currentLanguage === 'en' ? 'Monthly Legend' : 'Aylık Efsane',
      description: currentLanguage === 'en' ? 'You wrote a diary for 30 consecutive days!' : '30 gün üst üste günlük yazdın!',
      icon: '👑',
      category: 'streak',
      requirement: { type: 'streak', value: 30 },
      reward: { points: 100 }
    },
    {
      id: 'streak_100',
      title: currentLanguage === 'en' ? 'Hundred Day Legend' : 'Yüz Gün Efsanesi',
      description: currentLanguage === 'en' ? 'You wrote a diary for 100 consecutive days!' : '100 gün üst üste günlük yazdın!',
      icon: '💎',
      category: 'streak',
      requirement: { type: 'streak', value: 100 },
      reward: { points: 500 }
    },
    
    // Yazma Başarıları
    {
      id: 'first_entry',
      title: currentLanguage === 'en' ? 'First Step' : 'İlk Adım',
      description: currentLanguage === 'en' ? 'You wrote your first diary entry!' : 'İlk günlük yazını yazdın!',
      icon: '📝',
      category: 'writing',
      requirement: { type: 'total', value: 1 },
      reward: { points: 5 }
    },
    {
      id: 'writer_10',
      title: currentLanguage === 'en' ? 'Writer' : 'Yazıcı',
      description: currentLanguage === 'en' ? 'You wrote 10 diary entries!' : '10 günlük yazısı yazdın!',
      icon: '✍️',
      category: 'writing',
      requirement: { type: 'total', value: 10 },
      reward: { points: 20 }
    },
    {
      id: 'diarist_50',
      title: currentLanguage === 'en' ? 'Diary Keeper' : 'Günlük Tutucu',
      description: currentLanguage === 'en' ? 'You wrote 50 diary entries!' : '50 günlük yazısı yazdın!',
      icon: '📖',
      category: 'writing',
      requirement: { type: 'total', value: 50 },
      reward: { points: 75 }
    },
    {
      id: 'master_writer_100',
      title: currentLanguage === 'en' ? 'Author' : 'Yazar',
      description: currentLanguage === 'en' ? 'You wrote 100 diary entries!' : '100 günlük yazısı yazdın!',
      icon: '📚',
      category: 'writing',
      requirement: { type: 'total', value: 100 },
      reward: { points: 200 }
    },
    
    // Görev Başarıları
    {
      id: 'first_task',
      title: currentLanguage === 'en' ? 'Task Master' : 'Görevci',
      description: currentLanguage === 'en' ? 'You completed your first task!' : 'İlk görevini tamamladın!',
      icon: '✅',
      category: 'goals',
      requirement: { type: 'total', value: 1 },
      reward: { points: 10 }
    },
    {
      id: 'productive_10',
      title: currentLanguage === 'en' ? 'Productive' : 'Üretken',
      description: currentLanguage === 'en' ? 'You completed 10 tasks!' : '10 görev tamamladın!',
      icon: '🎯',
      category: 'goals',
      requirement: { type: 'total', value: 10 },
      reward: { points: 30 }
    },
    {
      id: 'achiever_50',
      title: currentLanguage === 'en' ? 'Successful' : 'Başarılı',
      description: currentLanguage === 'en' ? 'You completed 50 tasks!' : '50 görev tamamladın!',
      icon: '🏅',
      category: 'goals',
      requirement: { type: 'total', value: 50 },
      reward: { points: 100 }
    },
    
    // Sağlık Başarıları
    {
      id: 'health_tracker_7',
      title: currentLanguage === 'en' ? 'Healthy' : 'Sağlıklı',
      description: currentLanguage === 'en' ? 'You tracked health for 7 consecutive days!' : '7 gün üst üste sağlık takibi yaptın!',
      icon: '💪',
      category: 'mood',
      requirement: { type: 'consecutive', value: 7 },
      reward: { points: 40 }
    },
    {
      id: 'wellness_master_30',
      title: currentLanguage === 'en' ? 'Wellness Master' : 'Wellness Ustası',
      description: currentLanguage === 'en' ? 'You tracked health for 30 consecutive days!' : '30 gün üst üste sağlık takibi yaptın!',
      icon: '🌱',
      category: 'mood',
      requirement: { type: 'consecutive', value: 30 },
      reward: { points: 150 }
    },
    
    // Hatırlatıcı Başarıları
    {
      id: 'reminder_master',
      title: currentLanguage === 'en' ? 'Reminder Master' : 'Hatırlatıcı Ustası',
      description: currentLanguage === 'en' ? 'You created 10 reminders!' : '10 hatırlatıcı oluşturdun!',
      icon: '🔔',
      category: 'goals',
      requirement: { type: 'total', value: 10 },
      reward: { points: 25 }
    },
    
    // Alışkanlık Başarıları
    {
      id: 'habit_starter',
      title: currentLanguage === 'en' ? 'Habit Beginner' : 'Alışkanlık Başlangıcı',
      description: currentLanguage === 'en' ? 'You completed your first habit!' : 'İlk alışkanlığını tamamladın!',
      icon: '🌟',
      category: 'goals',
      requirement: { type: 'total', value: 1 },
      reward: { points: 10 }
    },
    {
      id: 'habit_streak_7',
      title: currentLanguage === 'en' ? 'Weekly Habit' : 'Haftalık Alışkanlık',
      description: currentLanguage === 'en' ? 'You completed a habit for 7 consecutive days!' : 'Bir alışkanlığı 7 gün üst üste tamamladın!',
      icon: '🔥',
      category: 'streak',
      requirement: { type: 'streak', value: 7 },
      reward: { points: 50 }
    },
    {
      id: 'habit_streak_30',
      title: currentLanguage === 'en' ? 'Monthly Habit Master' : 'Aylık Alışkanlık Ustası',
      description: currentLanguage === 'en' ? 'You completed a habit for 30 consecutive days!' : 'Bir alışkanlığı 30 gün üst üste tamamladın!',
      icon: '👑',
      category: 'streak',
      requirement: { type: 'streak', value: 30 },
      reward: { points: 200 }
    },
    {
      id: 'habit_master_100',
      title: currentLanguage === 'en' ? 'Habit Legend' : 'Alışkanlık Efsanesi',
      description: currentLanguage === 'en' ? 'You completed 100 habits!' : '100 alışkanlık tamamladın!',
      icon: '🏆',
      category: 'goals',
      requirement: { type: 'total', value: 100 },
      reward: { points: 300 }
    },
    {
      id: 'habit_perfect_week',
      title: currentLanguage === 'en' ? 'Perfect Week' : 'Mükemmel Hafta',
      description: currentLanguage === 'en' ? 'You completed all your habits for a week!' : 'Bir hafta boyunca tüm alışkanlıklarını tamamladın!',
      icon: '⭐',
      category: 'goals',
      requirement: { type: 'milestone', value: 7 },
      reward: { points: 100 }
    },
    
    // Özel Başarılar
    {
      id: 'app_lover_30',
      title: currentLanguage === 'en' ? 'App Lover' : 'Uygulama Sevgilisi',
      description: currentLanguage === 'en' ? 'You used the app for 30 days!' : '30 gün uygulamayı kullandın!',
      icon: '💖',
      category: 'streak',
      requirement: { type: 'consecutive', value: 30 },
      reward: { points: 100 }
    }
  ], [currentLanguage]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Başarıları yükle
      const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }
      
      // Kullanıcı istatistiklerini yükle
      const statsData = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY);
      if (statsData) {
        setUserStats(JSON.parse(statsData));
      }
    } catch (error) {
      console.error('Error loading achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      const achievementsJson = JSON.stringify(newAchievements);
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, achievementsJson);
      setAchievements(newAchievements);
      console.log(`💾 Achievements saved to AsyncStorage: ${newAchievements.length} achievements`);
      
      // Doğrulama: AsyncStorage'dan oku ve kontrol et
      const verifyData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (verifyData) {
        const verified = JSON.parse(verifyData);
        console.log(`✅ Verification: ${verified.length} achievements in AsyncStorage`);
      }
    } catch (error) {
      console.error('❌ Error saving achievements:', error);
      throw error;
    }
  };

  const saveUserStats = async (newStats: UserStats) => {
    try {
      await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(newStats));
      setUserStats(newStats);
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  };

  // Başarı kontrolü
  const checkAchievements = async (stats: Partial<UserStats>) => {
    console.log('🔍 checkAchievements called with stats:', stats);
    
    // Önce mevcut userStats'ı yeniden yükle (AsyncStorage'dan)
    const currentStatsData = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY);
    let currentUserStats: UserStats = userStats;
    if (currentStatsData) {
      currentUserStats = JSON.parse(currentStatsData);
      console.log('📦 Loaded stats from AsyncStorage:', currentUserStats);
    } else {
      console.log('📦 No stats in AsyncStorage, using default:', currentUserStats);
    }
    
    // Yeni stats ile mevcut stats'ı birleştir
    // Önemli: stats içindeki değerler mevcut stats'ı override etmeli
    const newStats: UserStats = { 
      ...currentUserStats, 
      ...stats,
      // Eğer stats içinde totalDiaryEntries varsa, onu kullan
      totalDiaryEntries: stats.totalDiaryEntries !== undefined ? stats.totalDiaryEntries : currentUserStats.totalDiaryEntries,
    };
    
    console.log('📊 Merged stats:', {
      oldStats: currentUserStats,
      incomingStats: stats,
      mergedStats: newStats,
      totalDiaryEntries: newStats.totalDiaryEntries,
      currentStreak: newStats.currentStreak,
      'totalDiaryEntries source': stats.totalDiaryEntries !== undefined ? 'from incoming stats' : 'from old stats'
    });
    
    const newAchievements: Achievement[] = [];
    
    // Önce mevcut achievements'ı yeniden yükle
    const currentAchievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    let currentAchievements = achievements;
    if (currentAchievementsData) {
      currentAchievements = JSON.parse(currentAchievementsData);
      console.log('🏆 Loaded achievements from AsyncStorage:', currentAchievements.length, 'achievements');
    } else {
      console.log('🏆 No achievements in AsyncStorage');
    }
    
    console.log(`🔍 Checking ${achievementDefinitions.length} achievement definitions...`);
    
    for (const definition of achievementDefinitions) {
      // Zaten kazanılmış mı kontrol et
      const alreadyEarned = currentAchievements.find(a => a.id === definition.id);
      if (alreadyEarned) {
        console.log(`⏭️ Achievement ${definition.id} already earned, skipping`);
        continue;
      }
      
      console.log(`🔎 Checking achievement: ${definition.id} (${definition.title})`);
      
      let isEarned = false;
      
      switch (definition.requirement.type) {
        case 'streak':
          if (newStats.currentStreak >= definition.requirement.value) {
            isEarned = true;
            console.log(`✅ Streak achievement ${definition.id} earned: ${newStats.currentStreak} >= ${definition.requirement.value}`);
          }
          break;
          
        case 'total':
          // Günlük yazma başarıları için kontrol
          if (definition.id.includes('entry') || definition.id.includes('writer') || definition.id.includes('diarist') || definition.id.includes('master_writer')) {
            const totalDiaryEntries = newStats.totalDiaryEntries ?? 0;
            console.log(`📝 Checking diary achievement ${definition.id}: totalDiaryEntries=${totalDiaryEntries}, required=${definition.requirement.value}, newStats:`, newStats);
            
            // Özellikle first_entry için detaylı log
            if (definition.id === 'first_entry') {
              console.log(`🎯 FIRST_ENTRY CHECK: totalDiaryEntries=${totalDiaryEntries}, required=1, condition=${totalDiaryEntries >= 1}`);
            }
            
            if (totalDiaryEntries >= definition.requirement.value) {
              isEarned = true;
              console.log(`✅ Total diary achievement ${definition.id} EARNED: ${totalDiaryEntries} >= ${definition.requirement.value}`);
            } else {
              console.log(`❌ Total diary achievement ${definition.id} NOT earned: ${totalDiaryEntries} < ${definition.requirement.value}`);
            }
          } else if (definition.id.includes('task') || definition.id.includes('productive') || definition.id.includes('achiever')) {
            if ((newStats.totalTasksCompleted ?? 0) >= definition.requirement.value) {
              isEarned = true;
              console.log(`✅ Task achievement ${definition.id} earned: ${newStats.totalTasksCompleted} >= ${definition.requirement.value}`);
            }
          } else if (definition.id.includes('reminder')) {
            if ((newStats.totalReminders ?? 0) >= definition.requirement.value) {
              isEarned = true;
              console.log(`✅ Reminder achievement ${definition.id} earned: ${newStats.totalReminders} >= ${definition.requirement.value}`);
            }
          }
          break;
          
        case 'consecutive':
          if (definition.id.includes('health')) {
            if (newStats.healthTrackingDays >= definition.requirement.value) {
              isEarned = true;
              console.log(`✅ Health achievement ${definition.id} earned: ${newStats.healthTrackingDays} >= ${definition.requirement.value}`);
            }
          } else if (definition.id.includes('app_lover')) {
            if (newStats.appUsageDays >= definition.requirement.value) {
              isEarned = true;
              console.log(`✅ App usage achievement ${definition.id} earned: ${newStats.appUsageDays} >= ${definition.requirement.value}`);
            }
          }
          break;
      }
      
      if (isEarned) {
        const achievement: Achievement = {
          id: definition.id,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          unlockedAt: new Date().toISOString(),
          category: definition.category,
        };
        
        newAchievements.push(achievement);
        console.log(`🎉 Achievement unlocked: ${achievement.title}`);
        
        // Başarı bildirimi gönder
        try {
          await sendAchievementNotification(
            definition.title,
            definition.description
          );
        } catch (error) {
          console.error('Error sending achievement notification:', error);
        }
      }
    }
    
    if (newAchievements.length > 0) {
      const updatedAchievements = [...currentAchievements, ...newAchievements];
      console.log(`💾 Saving ${newAchievements.length} new achievements:`, newAchievements.map(a => a.id));
      await saveAchievements(updatedAchievements);
      setAchievements(updatedAchievements);
      console.log(`✅ Achievements saved and state updated. Total achievements: ${updatedAchievements.length}`);
    } else {
      console.log('ℹ️ No new achievements to save');
    }
    
    // Stats'ı her zaman kaydet (başarı kazanılsa da kazanılmasa da)
    await saveUserStats(newStats);
    setUserStats(newStats);
    console.log(`💾 Updated user stats:`, {
      totalDiaryEntries: newStats.totalDiaryEntries,
      currentStreak: newStats.currentStreak,
      longestStreak: newStats.longestStreak
    });
    
    return newAchievements;
  };

  // Günlük yazma başarısı kontrolü
  const checkDiaryAchievements = async (entryCount: number, currentStreak: number) => {
    console.log('🎯 checkDiaryAchievements called:', { entryCount, currentStreak, userStatsLongestStreak: userStats.longestStreak });
    
    const statsToCheck = {
      totalDiaryEntries: entryCount,
      currentStreak: currentStreak,
      longestStreak: Math.max(userStats.longestStreak || 0, currentStreak),
      lastDiaryDate: new Date().toISOString().split('T')[0],
    };
    
    console.log('📤 Calling checkAchievements with:', statsToCheck);
    
    try {
      const result = await checkAchievements(statsToCheck);
      console.log('✅ checkDiaryAchievements completed, result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in checkDiaryAchievements:', error);
      throw error;
    }
  };

  // Görev başarısı kontrolü
  const checkTaskAchievements = async (completedTasks: number) => {
    return await checkAchievements({
      totalTasksCompleted: completedTasks,
      tasksCompletedThisWeek: userStats.tasksCompletedThisWeek + 1,
    });
  };

  // Sağlık takibi başarısı kontrolü
  const checkHealthAchievements = async (healthDays: number) => {
    return await checkAchievements({
      healthTrackingDays: healthDays,
      lastHealthDate: new Date().toISOString().split('T')[0],
    });
  };

  // Hatırlatıcı başarısı kontrolü
  const checkReminderAchievements = async (reminderCount: number, activeCount: number) => {
    return await checkAchievements({
      totalReminders: reminderCount,
      activeReminders: activeCount,
    });
  };

  // Kategorilere göre başarıları getir
  const getAchievementsByCategory = (category: Achievement['category']) => {
    return achievements.filter(a => a.category === category);
  };

  // Kazanılmamış başarıları getir
  const getUnlockedAchievements = () => {
    return achievementDefinitions.filter(def => 
      !achievements.find(a => a.id === def.id)
    );
  };

  // İlerleme bilgisi
  const getAchievementProgress = async (achievementId: string) => {
    const definition = achievementDefinitions.find(d => d.id === achievementId);
    if (!definition) return null;
    
    // AsyncStorage'dan güncel achievements'ı yükle
    const currentAchievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    let currentAchievements = achievements;
    if (currentAchievementsData) {
      currentAchievements = JSON.parse(currentAchievementsData);
    }
    
    const alreadyEarned = currentAchievements.find(a => a.id === achievementId);
    if (alreadyEarned) {
      return { progress: 100, current: definition.requirement.value, required: definition.requirement.value };
    }
    
    // AsyncStorage'dan güncel stats'ı yükle
    const currentStatsData = await AsyncStorage.getItem(USER_STATS_STORAGE_KEY);
    let currentStats = userStats;
    if (currentStatsData) {
      currentStats = JSON.parse(currentStatsData);
    }
    
    let current = 0;
    
    switch (definition.requirement.type) {
      case 'streak':
        // Günlük yazma streak'i için gerçek verileri hesapla
        if (achievementId.includes('streak') || achievementId.includes('first_streak')) {
          try {
            // AsyncStorage'dan güncel günlük verilerini oku
            const DIARY_STORAGE_KEY = 'diary_entries';
            const diaryData = await AsyncStorage.getItem(`${DIARY_STORAGE_KEY}_${userId}`);
            if (diaryData) {
              const entries = JSON.parse(diaryData);
              // Streak hesapla
              if (entries.length > 0) {
                const sortedEntries = [...entries].sort((a: any, b: any) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );
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
                current = streak;
              } else {
                current = 0;
              }
            } else {
              current = currentStats.currentStreak || 0;
            }
          } catch (error) {
            console.error('Error calculating streak from diary entries:', error);
            current = currentStats.currentStreak || 0;
          }
        } else {
          current = currentStats.currentStreak || 0;
        }
        break;
      case 'total':
        if (achievementId.includes('entry') || achievementId.includes('writer') || achievementId.includes('diarist') || achievementId.includes('master_writer')) {
          // Günlük yazma sayısı için gerçek verileri hesapla
          try {
            const DIARY_STORAGE_KEY = 'diary_entries';
            const diaryData = await AsyncStorage.getItem(`${DIARY_STORAGE_KEY}_${userId}`);
            if (diaryData) {
              const entries = JSON.parse(diaryData);
              current = entries.length || 0;
            } else {
              current = currentStats.totalDiaryEntries || 0;
            }
          } catch (error) {
            console.error('Error calculating total diary entries:', error);
            current = currentStats.totalDiaryEntries || 0;
          }
        } else if (achievementId.includes('task') || achievementId.includes('productive') || achievementId.includes('achiever')) {
          current = currentStats.totalTasksCompleted || 0;
        } else if (achievementId.includes('reminder')) {
          current = currentStats.totalReminders || 0;
        }
        break;
      case 'consecutive':
        if (achievementId.includes('health')) {
          current = currentStats.healthTrackingDays || 0;
        } else if (achievementId.includes('app_lover')) {
          current = currentStats.appUsageDays || 0;
        }
        break;
    }
    
    const required = definition.requirement.value;
    const progress = Math.min((current / required) * 100, 100);
    
    return { progress, current, required };
  };

  // Başarı istatistikleri
  const getAchievementStats = () => {
    const total = achievementDefinitions.length;
    const unlocked = achievements.length;
    const byCategory = achievementDefinitions.reduce((acc, def) => {
      acc[def.category] = (acc[def.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const unlockedByCategory = achievements.reduce((acc, ach) => {
      acc[ach.category] = (acc[ach.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      unlocked,
      locked: total - unlocked,
      byCategory,
      unlockedByCategory,
      completionRate: total > 0 ? (unlocked / total) * 100 : 0,
    };
  };

  // loadData'yı export et ki AchievementsScreen'den çağırabilelim
  const refreshData = async () => {
    // Eğer zaten yükleniyorsa, tekrar yükleme
    if (loading) {
      console.log('⚠️ Already loading, skipping refreshData');
      return;
    }
    await loadData();
  };

  return {
    // Data
    achievements,
    userStats,
    loading,
    achievementDefinitions,
    
    // Actions
    checkAchievements,
    checkDiaryAchievements,
    checkTaskAchievements,
    checkHealthAchievements,
    checkReminderAchievements,
    refreshData,
    checkHabitAchievements: async (totalCompletions: number, longestStreak: number, perfectWeeks: number = 0) => {
      const newAchievements: Achievement[] = [];
      
      // İlk alışkanlık tamamlama
      if (totalCompletions >= 1 && !achievements.find(a => a.id === 'habit_starter')) {
        const achievement: Achievement = {
          id: 'habit_starter',
          title: 'Alışkanlık Başlangıcı',
          description: 'İlk alışkanlığını tamamladın!',
          icon: '🌟',
          category: 'goals',
          unlockedAt: new Date().toISOString(),
        };
        newAchievements.push(achievement);
        await sendAchievementNotification(achievement.title, achievement.description);
      }
      
      // 7 günlük streak
      if (longestStreak >= 7 && !achievements.find(a => a.id === 'habit_streak_7')) {
        const achievement: Achievement = {
          id: 'habit_streak_7',
          title: 'Haftalık Alışkanlık',
          description: 'Bir alışkanlığı 7 gün üst üste tamamladın!',
          icon: '🔥',
          category: 'streak',
          unlockedAt: new Date().toISOString(),
        };
        newAchievements.push(achievement);
        await sendAchievementNotification(achievement.title, achievement.description);
      }
      
      // 30 günlük streak
      if (longestStreak >= 30 && !achievements.find(a => a.id === 'habit_streak_30')) {
        const achievement: Achievement = {
          id: 'habit_streak_30',
          title: 'Aylık Alışkanlık Ustası',
          description: 'Bir alışkanlığı 30 gün üst üste tamamladın!',
          icon: '👑',
          category: 'streak',
          unlockedAt: new Date().toISOString(),
        };
        newAchievements.push(achievement);
        await sendAchievementNotification(achievement.title, achievement.description);
      }
      
      // 100 alışkanlık tamamlama
      if (totalCompletions >= 100 && !achievements.find(a => a.id === 'habit_master_100')) {
        const achievement: Achievement = {
          id: 'habit_master_100',
          title: 'Alışkanlık Efsanesi',
          description: '100 alışkanlık tamamladın!',
          icon: '🏆',
          category: 'goals',
          unlockedAt: new Date().toISOString(),
        };
        newAchievements.push(achievement);
        await sendAchievementNotification(achievement.title, achievement.description);
      }
      
      // Mükemmel hafta
      if (perfectWeeks >= 1 && !achievements.find(a => a.id === 'habit_perfect_week')) {
        const achievement: Achievement = {
          id: 'habit_perfect_week',
          title: 'Mükemmel Hafta',
          description: 'Bir hafta boyunca tüm alışkanlıklarını tamamladın!',
          icon: '⭐',
          category: 'goals',
          unlockedAt: new Date().toISOString(),
        };
        newAchievements.push(achievement);
        await sendAchievementNotification(achievement.title, achievement.description);
      }
      
      if (newAchievements.length > 0) {
        const updated = [...achievements, ...newAchievements];
        setAchievements(updated);
        await saveAchievements(updated);
      }
      
      return newAchievements;
    },
    
    // Getters
    getAchievementsByCategory,
    getUnlockedAchievements,
    getAchievementProgress,
    getAchievementStats,
    
    // Wellness puanı fonksiyonları
    getWellnessScore: () => calculateWellnessScore(userStats),
    getLevelInfo: () => calculateLevel(calculateWellnessScore(userStats)),
    updateWellnessScore: async () => {
      const newWellnessScore = calculateWellnessScore(userStats);
      const levelInfo = calculateLevel(newWellnessScore);
      
      const updatedStats = {
        ...userStats,
        wellnessScore: newWellnessScore,
        level: levelInfo.level,
        experience: levelInfo.experience,
        nextLevelExp: levelInfo.nextLevelExp,
      };
      
      setUserStats(updatedStats);
      await AsyncStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(updatedStats));
    },
  };
};
