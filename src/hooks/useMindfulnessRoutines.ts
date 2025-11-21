import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../contexts/LanguageContext';

const MORNING_ROUTINES_KEY = '@mindfulness_morning_routines';
const EVENING_ROUTINES_KEY = '@mindfulness_evening_routines';

export interface RoutineItem {
  id: number;
  title: string;
  emoji: string;
  completed: boolean;
  completedAt?: string;
}

export const useMindfulnessRoutines = (userId?: string) => {
  const { t, currentLanguage } = useLanguage();
  const [morningRoutines, setMorningRoutines] = useState<RoutineItem[]>([]);
  const [eveningRoutines, setEveningRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize routines with translations
  const initializeRoutines = useCallback(() => {
    const morning: RoutineItem[] = [
      { id: 1, title: t('settings.gratitudePractice'), emoji: '🙏', completed: false },
      { id: 2, title: t('settings.deepBreathing'), emoji: '🌬️', completed: false },
      { id: 3, title: t('settings.intentionSetting'), emoji: '🎯', completed: false },
      { id: 4, title: t('settings.morningStretch'), emoji: '🤸‍♀️', completed: false },
    ];
    const evening: RoutineItem[] = [
      { id: 1, title: t('settings.dailyReflection'), emoji: '📝', completed: false },
      { id: 2, title: t('settings.gratitudeJournal'), emoji: '📖', completed: false },
      { id: 3, title: t('settings.mindfulBreathing'), emoji: '🕯️', completed: false },
      { id: 4, title: t('settings.digitalDetox'), emoji: '📱', completed: false },
    ];
    return { morning, evening };
  }, [t]);

  // Load routines from storage
  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const morningData = await AsyncStorage.getItem(`${MORNING_ROUTINES_KEY}_${userId}_${today}`);
      const eveningData = await AsyncStorage.getItem(`${EVENING_ROUTINES_KEY}_${userId}_${today}`);

      if (morningData) {
        setMorningRoutines(JSON.parse(morningData));
      } else {
        const { morning } = initializeRoutines();
        setMorningRoutines(morning);
      }

      if (eveningData) {
        setEveningRoutines(JSON.parse(eveningData));
      } else {
        const { evening } = initializeRoutines();
        setEveningRoutines(evening);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
      const { morning, evening } = initializeRoutines();
      setMorningRoutines(morning);
      setEveningRoutines(evening);
    } finally {
      setLoading(false);
    }
  }, [userId, initializeRoutines]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  // Update routine titles when language changes
  useEffect(() => {
    if (morningRoutines.length > 0 || eveningRoutines.length > 0) {
      const { morning, evening } = initializeRoutines();
      setMorningRoutines(prev => prev.map((r, i) => ({
        ...r,
        title: morning[i]?.title || r.title,
      })));
      setEveningRoutines(prev => prev.map((r, i) => ({
        ...r,
        title: evening[i]?.title || r.title,
      })));
    }
  }, [currentLanguage, initializeRoutines]);

  const saveRoutines = async (type: 'morning' | 'evening', routines: RoutineItem[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = type === 'morning' 
        ? `${MORNING_ROUTINES_KEY}_${userId}_${today}`
        : `${EVENING_ROUTINES_KEY}_${userId}_${today}`;
      
      await AsyncStorage.setItem(key, JSON.stringify(routines));
      
      if (type === 'morning') {
        setMorningRoutines(routines);
      } else {
        setEveningRoutines(routines);
      }
    } catch (error) {
      console.error('Error saving routines:', error);
    }
  };

  const toggleRoutine = async (type: 'morning' | 'evening', id: number) => {
    const routines = type === 'morning' ? morningRoutines : eveningRoutines;
    const updated = routines.map(r => {
      if (r.id === id) {
        return {
          ...r,
          completed: !r.completed,
          completedAt: !r.completed ? new Date().toISOString() : undefined,
        };
      }
      return r;
    });
    await saveRoutines(type, updated);
  };

  const resetDailyRoutines = async () => {
    const { morning, evening } = initializeRoutines();
    await saveRoutines('morning', morning);
    await saveRoutines('evening', evening);
  };

  return {
    morningRoutines,
    eveningRoutines,
    loading,
    toggleRoutine,
    resetDailyRoutines,
  };
};

