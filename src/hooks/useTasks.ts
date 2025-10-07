import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTask, TaskProgress, TaskCategory, TaskAchievement } from '../types';

const TASKS_STORAGE_KEY = '@daily_tasks';
const PROGRESS_STORAGE_KEY = '@task_progress';
const CATEGORIES_STORAGE_KEY = '@task_categories';
const ACHIEVEMENTS_STORAGE_KEY = '@task_achievements';

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [progress, setProgress] = useState<TaskProgress[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [achievements, setAchievements] = useState<TaskAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories
  const defaultCategories: TaskCategory[] = [
    { id: 'health', name: 'Sağlık', emoji: '🏥', color: '#ef4444', description: 'Sağlık ile ilgili görevler' },
    { id: 'personal', name: 'Kişisel Gelişim', emoji: '🌱', color: '#10b981', description: 'Kişisel gelişim görevleri' },
    { id: 'work', name: 'İş', emoji: '💼', color: '#3b82f6', description: 'İş ile ilgili görevler' },
    { id: 'hobby', name: 'Hobi', emoji: '🎨', color: '#8b5cf6', description: 'Hobi ve eğlence görevleri' },
    { id: 'custom', name: 'Özel', emoji: '⭐', color: '#f59e0b', description: 'Özel görevler' },
  ];

  // Load data from storage
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }

      // Load progress
      const progressData = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (progressData) {
        setProgress(JSON.parse(progressData));
      }

      // Load categories
      const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesData) {
        setCategories(JSON.parse(categoriesData));
      } else {
        setCategories(defaultCategories);
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCategories));
      }

      // Load achievements
      const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }

    } catch (error) {
      console.error('Error loading tasks data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save tasks to storage
  const saveTasks = async (newTasks: DailyTask[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
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
    const newTask: DailyTask = {
      ...task,
      id: Date.now().toString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newTasks = [...tasks, newTask];
    await saveTasks(newTasks);
    return newTask;
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<DailyTask>) => {
    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    await saveTasks(newTasks);
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
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

  // Get today's tasks
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
      return taskDate === today;
    });
  };

  // Get completed tasks count for today
  const getTodayCompletedCount = () => {
    const todayTasks = getTodayTasks();
    return todayTasks.filter(task => task.isCompleted).length;
  };

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
        day: date.toLocaleDateString('tr-TR', { weekday: 'short' })
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
  };
};
