import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitEntry, HabitStreak } from '../types';

const HABITS_STORAGE_KEY = '@daily_habits';
const HABIT_ENTRIES_STORAGE_KEY = '@daily_habit_entries';

export const useHabits = (userId?: string) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Popüler alışkanlık şablonları
  const defaultHabits: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'Su İç',
      description: 'Günde 8 bardak su iç',
      icon: '💧',
      color: '#3B82F6',
      category: 'health',
      frequency: 'daily',
      target: 8,
      unit: 'glasses',
      isActive: true,
    },
    {
      title: 'Egzersiz Yap',
      description: 'Günde 30 dakika egzersiz',
      icon: '🏃‍♂️',
      color: '#10B981',
      category: 'health',
      frequency: 'daily',
      target: 30,
      unit: 'minutes',
      isActive: true,
    },
    {
      title: 'Kitap Oku',
      description: 'Günde 20 dakika kitap oku',
      icon: '📚',
      color: '#8B5CF6',
      category: 'learning',
      frequency: 'daily',
      target: 20,
      unit: 'minutes',
      isActive: true,
    },
    {
      title: 'Meditasyon',
      description: 'Günde 10 dakika meditasyon',
      icon: '🧘‍♂️',
      color: '#F59E0B',
      category: 'mindfulness',
      frequency: 'daily',
      target: 10,
      unit: 'minutes',
      isActive: true,
    },
    {
      title: 'Erken Yat',
      description: '23:00\'dan önce yat',
      icon: '😴',
      color: '#6B7280',
      category: 'health',
      frequency: 'daily',
      target: 1,
      unit: 'times',
      isActive: true,
    },
    {
      title: 'Sağlıklı Beslen',
      description: 'Günde 3 ana öğün',
      icon: '🥗',
      color: '#EF4444',
      category: 'health',
      frequency: 'daily',
      target: 3,
      unit: 'times',
      isActive: true,
    },
    {
      title: 'Yeni Şey Öğren',
      description: 'Günde 15 dakika yeni bilgi',
      icon: '🎓',
      color: '#EC4899',
      category: 'learning',
      frequency: 'daily',
      target: 15,
      unit: 'minutes',
      isActive: true,
    },
    {
      title: 'Telefon Kullanımı',
      description: 'Günde 4 saatten az telefon kullan',
      icon: '📱',
      color: '#14B8A6',
      category: 'productivity',
      frequency: 'daily',
      target: 4,
      unit: 'hours',
      isActive: true,
    },
  ];

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Alışkanlıkları yükle
      const habitsData = await AsyncStorage.getItem(`${HABITS_STORAGE_KEY}_${userId}`);
      if (habitsData) {
        setHabits(JSON.parse(habitsData));
      } else {
        // İlk kullanımda varsayılan alışkanlıkları ekle
        const initialHabits: Habit[] = defaultHabits.map(habit => ({
          ...habit,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setHabits(initialHabits);
        await saveHabits(initialHabits);
      }
      
      // Alışkanlık girişlerini yükle
      const entriesData = await AsyncStorage.getItem(`${HABIT_ENTRIES_STORAGE_KEY}_${userId}`);
      if (entriesData) {
        setHabitEntries(JSON.parse(entriesData));
      }
    } catch (error) {
      console.error('Error loading habits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem(`${HABITS_STORAGE_KEY}_${userId}`, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const saveHabitEntries = async (newEntries: HabitEntry[]) => {
    try {
      await AsyncStorage.setItem(`${HABIT_ENTRIES_STORAGE_KEY}_${userId}`, JSON.stringify(newEntries));
      setHabitEntries(newEntries);
    } catch (error) {
      console.error('Error saving habit entries:', error);
    }
  };

  // Alışkanlık ekleme
  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedHabits = [...habits, newHabit];
    await saveHabits(updatedHabits);
    return newHabit;
  };

  // Alışkanlık güncelleme
  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map(habit => 
      habit.id === id 
        ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
        : habit
    );
    await saveHabits(updatedHabits);
  };

  // Alışkanlık silme
  const deleteHabit = async (id: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== id);
    await saveHabits(updatedHabits);
    
    // İlgili girişleri de sil
    const updatedEntries = habitEntries.filter(entry => entry.habitId !== id);
    await saveHabitEntries(updatedEntries);
  };

  // Alışkanlık tamamlama
  const completeHabit = async (habitId: string, value: number = 1, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Bugün için zaten giriş var mı kontrol et
    const existingEntry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === today
    );

    let updatedEntries;
    if (existingEntry) {
      // Mevcut girişi güncelle
      updatedEntries = habitEntries.map(entry =>
        entry.id === existingEntry.id
          ? { ...entry, completed: true, value, notes }
          : entry
      );
    } else {
      // Yeni giriş oluştur
      const newEntry: HabitEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        habitId,
        date: today,
        completed: true,
        value,
        notes,
        createdAt: new Date().toISOString(),
      };
      updatedEntries = [...habitEntries, newEntry];
    }

    await saveHabitEntries(updatedEntries);
    
    // Başarı kontrolü yap
    try {
      const { useAchievements } = await import('./useAchievements');
      const streaks = getHabitStreaks();
      const totalCompletions = updatedEntries.filter(e => e.completed).length;
      const longestStreak = Math.max(...streaks.map(s => s.longestStreak), 0);
      
      await useAchievements(userId).checkHabitAchievements(totalCompletions, longestStreak);
    } catch (error) {
      console.error('Error checking habit achievements:', error);
    }
  };

  // Alışkanlık iptal etme
  const uncompleteHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedEntries = habitEntries.map(entry =>
      entry.habitId === habitId && entry.date === today
        ? { ...entry, completed: false, value: 0 }
        : entry
    );
    await saveHabitEntries(updatedEntries);
  };

  // Bugünkü alışkanlıklar
  const getTodayHabits = () => {
    const today = new Date().toISOString().split('T')[0];
    return habits.map(habit => {
      const todayEntry = habitEntries.find(
        entry => entry.habitId === habit.id && entry.date === today
      );
      return {
        ...habit,
        todayCompleted: todayEntry?.completed || false,
        todayValue: todayEntry?.value || 0,
      };
    });
  };

  // Alışkanlık streak'leri hesapla
  const getHabitStreaks = (): HabitStreak[] => {
    return habits.map(habit => {
      const habitEntriesList = habitEntries
        .filter(entry => entry.habitId === habit.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let totalCompletions = 0;

      // Bugünden geriye doğru streak hesapla
      const today = new Date();
      for (let i = 0; i < 365; i++) { // Son 1 yıl
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const entry = habitEntriesList.find(e => e.date === dateStr);
        const completed = entry?.completed || false;
        
        if (completed) {
          if (i === 0) currentStreak = 1;
          else if (currentStreak === i) currentStreak++;
          
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
          totalCompletions++;
        } else {
          tempStreak = 0;
        }
      }

      const completionRate = habitEntriesList.length > 0 
        ? (totalCompletions / habitEntriesList.length) * 100 
        : 0;

      return {
        habitId: habit.id,
        currentStreak,
        longestStreak,
        lastCompletedDate: habitEntriesList[0]?.date,
        totalCompletions,
        completionRate,
      };
    });
  };

  // Kategoriye göre alışkanlıklar
  const getHabitsByCategory = (category: Habit['category']) => {
    return habits.filter(habit => habit.category === category);
  };

  // Aktif alışkanlıklar
  const getActiveHabits = () => {
    return habits.filter(habit => habit.isActive);
  };

  // Haftalık istatistikler
  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStart = weekAgo.toISOString().split('T')[0];
    
    const weeklyEntries = habitEntries.filter(entry => entry.date >= weekStart);
    const totalPossible = habits.filter(h => h.isActive).length * 7;
    const totalCompleted = weeklyEntries.filter(entry => entry.completed).length;
    
    return {
      totalHabits: habits.filter(h => h.isActive).length,
      totalCompletions: totalCompleted,
      completionRate: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0,
      weeklyEntries,
    };
  };

  return {
    // Data
    habits,
    habitEntries,
    loading,
    
    // Actions
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    uncompleteHabit,
    
    // Getters
    getTodayHabits,
    getHabitStreaks,
    getHabitsByCategory,
    getActiveHabits,
    getWeeklyStats,
    
    // Utils
    saveHabits,
    saveHabitEntries,
  };
};
