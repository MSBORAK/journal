import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { DailyTask, TaskProgress, TaskCategory, TaskAchievement } from '../types';
import { isNetworkError, getNetworkErrorMessage } from '../utils/networkUtils';

const TASKS_STORAGE_KEY = '@daily_tasks';
const PROGRESS_STORAGE_KEY = '@task_progress';
const CATEGORIES_STORAGE_KEY = '@task_categories';
const ACHIEVEMENTS_STORAGE_KEY = '@task_achievements';

export const useTasks = (userId?: string) => {
  const { currentLanguage, t } = useLanguage();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [progress, setProgress] = useState<TaskProgress[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [achievements, setAchievements] = useState<TaskAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories with translations
  const defaultCategories: TaskCategory[] = useMemo(() => [
    { id: 'health', name: t('tasks.categoryHealth'), emoji: '🏥', color: '#ef4444', description: t('tasks.categoryHealthDesc') },
    { id: 'personal', name: t('tasks.categoryPersonal'), emoji: '🌱', color: '#10b981', description: t('tasks.categoryPersonalDesc') },
    { id: 'work', name: t('tasks.categoryWork'), emoji: '💼', color: '#3b82f6', description: t('tasks.categoryWorkDesc') },
    { id: 'hobby', name: t('tasks.categoryHobby'), emoji: '🎨', color: '#8b5cf6', description: t('tasks.categoryHobbyDesc') },
    { id: 'custom', name: t('tasks.categoryCustom'), emoji: '⭐', color: '#f59e0b', description: t('tasks.categoryCustomDesc') },
  ], [t]);

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      console.log('🔄 useTasks: loadData başladı, userId:', userId);
      setLoading(true);
      
      // userId varsa önce Supabase'den tasks çek
      if (userId) {
        try {
          const { data: supabaseTasks, error: supabaseError } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (supabaseError) {
            console.error('Supabase fetch error:', supabaseError);
            // Network hatası ise logla (error state yok bu hook'ta)
            if (isNetworkError(supabaseError)) {
              console.warn('⚠️ Network error, using local data:', getNetworkErrorMessage(supabaseError));
            }
            // Hata olsa bile loading'i false yap ve local data'yı yükle
            setLoading(false);
          } else if (supabaseTasks) {
            // Supabase'den veri geldi (boş array de olabilir), formatla
            const formattedTasks: DailyTask[] = supabaseTasks.length > 0 
              ? supabaseTasks.map((task: any) => ({
                  id: task.id,
                  title: task.title,
                  description: task.description || '',
                  category: task.category || 'custom',
                  emoji: task.emoji || '📝',
                  isCompleted: task.is_completed || false,
                  completedAt: task.completed_at || undefined,
                  priority: task.priority || 'medium',
                  estimatedTime: task.estimated_time || undefined,
                  date: task.date || new Date(task.created_at).toISOString().split('T')[0],
                  createdAt: task.created_at,
                  updatedAt: task.updated_at,
                }))
              : [];
            
            setTasks(formattedTasks);
            // AsyncStorage'a da kaydet (offline için)
            await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(formattedTasks));
            console.log('✅ Loaded tasks from Supabase:', formattedTasks.length);
            
            // Load progress, categories, achievements
            const progressData = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
            if (progressData) {
              setProgress(JSON.parse(progressData));
            }

            const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
            if (categoriesData) {
              setCategories(JSON.parse(categoriesData));
            } else {
              // defaultCategories'i hook'un üst seviyesinden al (closure)
              const defaultCats = [
                { id: 'health', name: t('tasks.categoryHealth'), emoji: '🏥', color: '#ef4444', description: t('tasks.categoryHealthDesc') },
                { id: 'personal', name: t('tasks.categoryPersonal'), emoji: '🌱', color: '#10b981', description: t('tasks.categoryPersonalDesc') },
                { id: 'work', name: t('tasks.categoryWork'), emoji: '💼', color: '#3b82f6', description: t('tasks.categoryWorkDesc') },
                { id: 'hobby', name: t('tasks.categoryHobby'), emoji: '🎨', color: '#8b5cf6', description: t('tasks.categoryHobbyDesc') },
                { id: 'custom', name: t('tasks.categoryCustom'), emoji: '⭐', color: '#f59e0b', description: t('tasks.categoryCustomDesc') },
              ];
              setCategories(defaultCats);
              await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCats));
            }

            const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
            if (achievementsData) {
              setAchievements(JSON.parse(achievementsData));
            }
            
            setLoading(false);
            return;
          }
        } catch (supabaseErr) {
          console.error('Supabase connection error:', supabaseErr);
          // Network hatası ise logla
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error, using local data:', getNetworkErrorMessage(supabaseErr));
          }
          // Hata olsa bile loading'i false yap, local data'yı yükle
          // Loading state'i finally bloğunda da false yapılacak ama burada da yapalım
        }
      }

      // Supabase'den veri gelmediyse veya userId yoksa AsyncStorage'dan yükle
      const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksData) {
        const parsedTasks = JSON.parse(tasksData);
        setTasks(parsedTasks);
        console.log('📦 Loaded tasks from AsyncStorage:', parsedTasks.length);
      } else {
        setTasks([]);
        console.log('🆕 First time - starting with empty tasks');
      }

      // Load progress (local only for now)
      const progressData = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (progressData) {
        setProgress(JSON.parse(progressData));
      }

      // Load categories
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesData) {
        setCategories(JSON.parse(categoriesData));
      } else {
        // defaultCategories'i hook'un üst seviyesinden al (closure)
        const defaultCats = [
          { id: 'health', name: t('tasks.categoryHealth'), emoji: '🏥', color: '#ef4444', description: t('tasks.categoryHealthDesc') },
          { id: 'personal', name: t('tasks.categoryPersonal'), emoji: '🌱', color: '#10b981', description: t('tasks.categoryPersonalDesc') },
          { id: 'work', name: t('tasks.categoryWork'), emoji: '💼', color: '#3b82f6', description: t('tasks.categoryWorkDesc') },
          { id: 'hobby', name: t('tasks.categoryHobby'), emoji: '🎨', color: '#8b5cf6', description: t('tasks.categoryHobbyDesc') },
          { id: 'custom', name: t('tasks.categoryCustom'), emoji: '⭐', color: '#f59e0b', description: t('tasks.categoryCustomDesc') },
        ];
        setCategories(defaultCats);
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCats));
      }

      // Load achievements
      const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }

    } catch (error) {
      console.error('❌ Error loading tasks data:', error);
    } finally {
      console.log('✅ useTasks: loadData tamamlandı, loading false yapılıyor');
      setLoading(false);
    }
  }, [userId]); // defaultCategories'i dependency'den çıkar - içinde doğrudan oluşturuluyor

  useEffect(() => {
    console.log('🔄 useTasks: useEffect çalıştı, userId:', userId);
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const load = async () => {
      if (!isMounted) {
        console.log('⚠️ useTasks: Component unmounted, loadData iptal edildi');
        return;
      }
      
      // Timeout ekle - 10 saniye içinde tamamlanmazsa loading'i false yap
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ useTasks: loadData timeout (10 saniye), loading false yapılıyor');
          setLoading(false);
        }
      }, 10000);
      
      try {
        await loadData();
      } catch (error) {
        console.error('❌ useTasks: loadData hatası:', error);
        if (isMounted) {
          setLoading(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
    
    load();
    
    return () => {
      console.log('🔄 useTasks: useEffect cleanup');
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Sadece userId değiştiğinde çalışsın - loadData'yı dependency'den çıkar

  // Save tasks to storage
  const saveTasks = async (newTasks: DailyTask[]) => {
    try {
      console.log('saveTasks called with:', newTasks.length, 'tasks');
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
      console.log('Tasks saved to AsyncStorage');
      setTasks(newTasks);
      console.log('Tasks state updated');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Save progress to storage
  const saveProgress = async (newProgress: TaskProgress[]) => {
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Add new task
  const addTask = async (task: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => {
    console.log('addTask called with:', task);
    
    let newTask: DailyTask;
    
    // Supabase'e kaydet (sadece userId varsa)
    if (userId) {
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('daily_tasks')
          .insert({
            user_id: userId,
          title: task.title,
          description: task.description || null,
          category: task.category || 'custom',
          emoji: task.emoji || '📝',
          priority: task.priority || 'medium',
          estimated_time: task.estimatedTime || null,
          date: task.date || new Date().toISOString().split('T')[0],
          is_completed: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      newTask = {
        id: insertedData.id,
        title: insertedData.title,
        description: insertedData.description || '',
        category: insertedData.category || 'custom',
        emoji: insertedData.emoji || '📝',
        isCompleted: insertedData.is_completed || false,
        completedAt: insertedData.completed_at || undefined,
        priority: insertedData.priority || 'medium',
        estimatedTime: insertedData.estimated_time || undefined,
        date: insertedData.date,
        createdAt: insertedData.created_at,
        updatedAt: insertedData.updated_at,
      };
      
        console.log('✅ Task saved to Supabase:', newTask.id);
      } catch (supabaseErr) {
        console.error('Supabase insert failed, using local ID:', supabaseErr);
        // Supabase başarısız olursa local ID ile kaydet
        newTask = {
          ...task,
          id: Date.now().toString(),
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      // Anonymous user - sadece local ID ile kaydet
      newTask = {
        ...task,
        id: Date.now().toString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('📝 Task saved locally (anonymous user):', newTask.id);
    }
    
    const newTasks = [...tasks, newTask];
    await saveTasks(newTasks);
    console.log('💾 Tasks saved to AsyncStorage');
    
    return newTask;
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<DailyTask>) => {
    const existingTask = tasks.find(t => t.id === taskId);
    if (!existingTask) throw new Error('Task not found');

    // Supabase'de güncelle (sadece userId varsa)
    if (userId) {
      try {
        const { data: updatedData, error: updateError } = await supabase
          .from('daily_tasks')
          .update({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description || null }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.emoji !== undefined && { emoji: updates.emoji }),
          ...(updates.priority !== undefined && { priority: updates.priority }),
          ...(updates.estimatedTime !== undefined && { estimated_time: updates.estimatedTime }),
          ...(updates.date !== undefined && { date: updates.date }),
          ...(updates.isCompleted !== undefined && { 
            is_completed: updates.isCompleted,
            completed_at: updates.isCompleted ? (updates.completedAt || new Date().toISOString()) : null,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

        console.log('✅ Task updated in Supabase:', taskId);
      } catch (supabaseErr) {
        console.error('Supabase update failed, updating locally:', supabaseErr);
      }
    } else {
      console.log('📝 Task updated locally (anonymous user):', taskId);
    }

    // Local state'i güncelle
    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    await saveTasks(newTasks);
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    // Supabase'den sil (sadece userId varsa)
    if (userId) {
      try {
        const { error: deleteError } = await supabase
          .from('daily_tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
        } else {
          console.log('✅ Task deleted from Supabase:', taskId);
        }
      } catch (supabaseErr) {
        console.error('Supabase delete failed, deleting locally:', supabaseErr);
      }
    } else {
      console.log('📝 Task deleted locally (anonymous user):', taskId);
    }

    // Local state'i güncelle
    const newTasks = tasks.filter(task => task.id !== taskId);
    await saveTasks(newTasks);
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates: Partial<DailyTask> = {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    };

    await updateTask(taskId, updates);
    await updateDailyProgress();
  };

  // CRITICAL FIX: Memoize helper functions to prevent re-render storms
  // Get today's tasks - memoized with useCallback
  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      // Use task.date if available, otherwise use createdAt date
      const taskDate = task.date || new Date(task.createdAt).toISOString().split('T')[0];
      return taskDate === today;
    });
  }, [tasks]); // Only recreate when tasks array changes

  // Get completed tasks count for today - memoized with useCallback
  const getTodayCompletedCount = useCallback(() => {
    const todayTasks = getTodayTasks();
    return todayTasks.filter(task => task.isCompleted).length;
  }, [getTodayTasks]); // Depend on memoized getTodayTasks

  // Get today's completion rate
  const getTodayCompletionRate = () => {
    const todayTasks = getTodayTasks();
    if (todayTasks.length === 0) return 0;
    return Math.round((getTodayCompletedCount() / todayTasks.length) * 100);
  };

  // Update daily progress
  const updateDailyProgress = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = getTodayTasks();
    const completedCount = getTodayCompletedCount();
    
    const todayProgress: TaskProgress = {
      date: today,
      totalTasks: todayTasks.length,
      completedTasks: completedCount,
      completionRate: todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0,
    };

    const newProgress = progress.filter(p => p.date !== today);
    newProgress.push(todayProgress);
    
    await saveProgress(newProgress);
  };

  // Get weekly progress
  const getWeeklyProgress = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayProgress = progress.find(p => p.date === dateStr);
      last7Days.push({
        date: dateStr,
        completionRate: dayProgress?.completionRate || 0,
        completedTasks: dayProgress?.completedTasks || 0,
        totalTasks: dayProgress?.totalTasks || 0,
        day: date.toLocaleDateString((currentLanguage === 'tr' ? 'tr-TR' : 'en-US'), { weekday: 'short' })
      });
    }
    
    return last7Days;
  };

  // Get tasks by category
  const getTasksByCategory = (categoryId: string) => {
    return tasks.filter(task => task.category === categoryId);
  };

  // Get category by id
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Get task streak (consecutive days with completed tasks)
  const getTaskStreak = () => {
    const sortedProgress = [...progress].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    
    for (const dayProgress of sortedProgress) {
      if (dayProgress.completedTasks > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get achievements
  const getAchievements = () => {
    return achievements;
  };

  // Check and unlock new achievements
  const checkAchievements = async () => {
    const currentStreak = getTaskStreak();
    const totalCompleted = progress.reduce((sum, p) => sum + p.completedTasks, 0);
    const avgCompletionRate = progress.length > 0 
      ? progress.reduce((sum, p) => sum + p.completionRate, 0) / progress.length 
      : 0;

    const newAchievements: TaskAchievement[] = [];

    // Streak achievements
    if (currentStreak >= 7 && !achievements.find(a => a.id === 'streak_7')) {
      newAchievements.push({
        id: 'streak_7',
        title: 'Haftalık Şampiyon',
        description: '7 gün üst üste görev tamamladın!',
        icon: '🔥',
        category: 'streak',
        unlockedAt: new Date().toISOString(),
        requirement: { type: 'streak', value: 7 }
      });
    }

    // Completion achievements
    if (totalCompleted >= 50 && !achievements.find(a => a.id === 'total_50')) {
      newAchievements.push({
        id: 'total_50',
        title: 'Görev Ustası',
        description: 'Toplam 50 görev tamamladın!',
        icon: '🏆',
        category: 'completion',
        unlockedAt: new Date().toISOString(),
        requirement: { type: 'total', value: 50 }
      });
    }

    // Consistency achievements
    if (avgCompletionRate >= 80 && progress.length >= 7 && !achievements.find(a => a.id === 'consistent_80')) {
      newAchievements.push({
        id: 'consistent_80',
        title: 'Tutarlı Performans',
        description: '7 gün boyunca %80+ tamamlama oranı!',
        icon: '📈',
        category: 'consistency',
        unlockedAt: new Date().toISOString(),
        requirement: { type: 'percentage', value: 80, period: 'weekly' }
      });
    }

    if (newAchievements.length > 0) {
      const updatedAchievements = [...achievements, ...newAchievements];
      try {
        await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedAchievements));
        setAchievements(updatedAchievements);
      } catch (error) {
        console.error('Error saving achievements:', error);
      }
    }

    return newAchievements;
  };

  return {
    // Data
    tasks,
    progress,
    categories,
    achievements,
    loading,
    
    // Actions
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    
    // Getters
    getTodayTasks,
    getTodayCompletedCount,
    getTodayCompletionRate,
    getWeeklyProgress,
    getTasksByCategory,
    getCategoryById,
    getTaskStreak,
    getAchievements,
    
    // Utility
    checkAchievements,
    updateDailyProgress,
    
    // CRITICAL FIX: Don't compute these on every render - let components memoize them
    // Removed todayTasks and todayCompletedCount from return to prevent recalculation
    // Components should use getTodayTasks() and getTodayCompletedCount() with useMemo
    getTasksByDateRange: useCallback((startDate: string, endDate: string) => {
      return tasks.filter(task => task.date >= startDate && task.date <= endDate);
    }, [tasks]),
  };
};
