import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream, Goal, Promise } from '../types';

const DREAMS_KEY = '@daily_dreams';
const GOALS_KEY = '@daily_goals';
const PROMISES_KEY = '@daily_promises';

export const useDreamsGoals = (userId?: string) => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [promises, setPromises] = useState<Promise[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // userId varsa user-specific key, yoksa global key kullan
      const dreamsKey = userId ? `${DREAMS_KEY}_${userId}` : DREAMS_KEY;
      const goalsKey = userId ? `${GOALS_KEY}_${userId}` : GOALS_KEY;
      const promisesKey = userId ? `${PROMISES_KEY}_${userId}` : PROMISES_KEY;
      
      // Promise.all yerine ayrı ayrı yükleyelim
      const dreamsData = await AsyncStorage.getItem(dreamsKey);
      const goalsData = await AsyncStorage.getItem(goalsKey);
      const promisesData = await AsyncStorage.getItem(promisesKey);

      if (dreamsData) {
        try {
          setDreams(JSON.parse(dreamsData));
        } catch (parseError) {
          console.error('Error parsing dreams data:', parseError);
          setDreams([]);
        }
      } else {
        setDreams([]);
      }

      if (goalsData) {
        try {
          setGoals(JSON.parse(goalsData));
        } catch (parseError) {
          console.error('Error parsing goals data:', parseError);
          setGoals([]);
        }
      } else {
        setGoals([]);
      }

      if (promisesData) {
        try {
          setPromises(JSON.parse(promisesData));
        } catch (parseError) {
          console.error('Error parsing promises data:', parseError);
          setPromises([]);
        }
      } else {
        setPromises([]);
      }
    } catch (error) {
      console.error('Error loading dreams/goals:', error);
      // Hata durumunda boş array'ler set et
      setDreams([]);
      setGoals([]);
      setPromises([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveDreams = async (newDreams: Dream[]) => {
    try {
      // Always update state
      setDreams(newDreams);
      // Persist with user scope if available, otherwise fallback to global key
      const key = userId ? `${DREAMS_KEY}_${userId}` : DREAMS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(newDreams));
    } catch (error) {
      console.error('Error saving dreams:', error);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    try {
      setGoals(newGoals);
      const key = userId ? `${GOALS_KEY}_${userId}` : GOALS_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(newGoals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const savePromises = async (newPromises: Promise[]) => {
    try {
      setPromises(newPromises);
      const key = userId ? `${PROMISES_KEY}_${userId}` : PROMISES_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(newPromises));
    } catch (error) {
      console.error('Error saving promises:', error);
    }
  };

  // Dream CRUD operations
  const addDream = async (dream: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDream: Dream = {
      ...dream,
      id: `dream_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveDreams([...dreams, newDream]);
    return newDream;
  };

  const updateDream = async (dreamId: string, updates: Partial<Dream>) => {
    const updatedDreams = dreams.map(d =>
      d.id === dreamId
        ? { ...d, ...updates, updatedAt: new Date().toISOString() }
        : d
    );
    await saveDreams(updatedDreams);
  };

  const deleteDream = async (dreamId: string) => {
    const filteredDreams = dreams.filter(d => d.id !== dreamId);
    await saveDreams(filteredDreams);
  };

  const toggleFavoriteDream = async (dreamId: string) => {
    const dream = dreams.find(d => d.id === dreamId);
    if (dream) {
      await updateDream(dreamId, { isFavorite: !dream.isFavorite });
    }
  };

  // Goal CRUD operations
  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId
        ? { ...g, ...updates, updatedAt: new Date().toISOString() }
        : g
    );
    await saveGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await saveGoals(filteredGoals);
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId
        ? { 
            ...g, 
            progress,
            updatedAt: new Date().toISOString(),
            // Auto-complete if 100%
            ...(progress >= 100 ? {
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
            } : {})
          }
        : g
    );
    
    await saveGoals(updatedGoals);
    
    console.log(`Goal ${goalId} progress updated to ${progress}%`);
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId
        ? {
            ...m,
            isCompleted: !m.isCompleted,
            completedAt: !m.isCompleted ? new Date().toISOString() : undefined,
          }
        : m
    );

    // Calculate progress based on milestones
    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const totalCount = updatedMilestones.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    await updateGoal(goalId, {
      milestones: updatedMilestones,
      progress: newProgress,
    });
  };

  // Promise operations
  const addPromise = async (text: string, emoji: string = '💫') => {
    const newPromise: Promise = {
      id: `promise_${Date.now()}`,
      text,
      emoji,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    await savePromises([...promises, newPromise]);
    return newPromise;
  };

  const deletePromise = async (promiseId: string) => {
    const filteredPromises = promises.filter(p => p.id !== promiseId);
    await savePromises(filteredPromises);
  };

  const togglePromiseActive = async (promiseId: string) => {
    const updatedPromises = promises.map(p =>
      p.id === promiseId ? { ...p, isActive: !p.isActive } : p
    );
    await savePromises(updatedPromises);
  };

  const updatePromise = async (promiseId: string, updates: Partial<Promise>) => {
    const updatedPromises = promises.map(p =>
      p.id === promiseId ? { ...p, ...updates } : p
    );
    await savePromises(updatedPromises);
  };

  // Statistics
  const getStats = () => {
    const activeDreams = dreams.filter(d => !d.isArchived).length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;
    const activePromises = promises.filter(p => p.isActive).length;

    return {
      activeDreams,
      activeGoals,
      completedGoals,
      avgProgress,
      activePromises,
      totalGoals: goals.length,
    };
  };

  // Get goals by dream
  const getGoalsByDream = (dreamId: string) => {
    return goals.filter(g => g.dreamId === dreamId);
  };

  // Get active promises
  const getActivePromises = () => {
    return promises.filter(p => p.isActive);
  };

  // Completion functions
  const toggleDreamCompletion = async (dreamId: string) => {
    const updatedDreams = dreams.map(dream => 
      dream.id === dreamId 
        ? { 
            ...dream, 
            isCompleted: !dream.isCompleted,
            completedAt: !dream.isCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString()
          }
        : dream
    );
    await saveDreams(updatedDreams);
  };

  const togglePromiseCompletion = async (promiseId: string) => {
    const updatedPromises = promises.map(promise => 
      promise.id === promiseId 
        ? { 
            ...promise, 
            isCompleted: !promise.isCompleted,
            completedAt: !promise.isCompleted ? new Date().toISOString() : undefined
          }
        : promise
    );
    await savePromises(updatedPromises);
  };

  return {
    dreams,
    goals,
    promises,
    loading,
    addDream,
    updateDream,
    deleteDream,
    toggleFavoriteDream,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    toggleMilestone,
    addPromise,
    deletePromise,
    togglePromiseActive,
    updatePromise,
    getStats,
    getGoalsByDream,
    getActivePromises,
    toggleDreamCompletion,
    togglePromiseCompletion,
  };
};

