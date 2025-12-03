import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Dream, Goal, Promise } from '../types';
import { isNetworkError } from '../utils/networkUtils';

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
      
      // userId varsa önce Supabase'den veri çek
      if (userId) {
        try {
          // Dreams
          const { data: supabaseDreams, error: dreamsError } = await supabase
            .from('dreams')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!dreamsError && supabaseDreams && supabaseDreams.length > 0) {
            const formattedDreams: Dream[] = supabaseDreams.map((d: any) => ({
              id: d.id,
              title: d.title,
              description: d.description || '',
              emoji: d.emoji || '🌟',
              imageUrl: d.image_url,
              category: d.category || 'personal',
              notes: d.notes,
              tags: d.tags || [],
              isArchived: d.is_archived || false,
              isFavorite: d.is_favorite || false,
              isCompleted: d.is_completed || false,
              completedAt: d.completed_at,
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }));
            setDreams(formattedDreams);
            await AsyncStorage.setItem(`${DREAMS_KEY}_${userId}`, JSON.stringify(formattedDreams));
          } else if (dreamsError && !isNetworkError(dreamsError)) {
            console.error('Supabase dreams fetch error:', dreamsError);
          }

          // Goals
          const { data: supabaseGoals, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!goalsError && supabaseGoals && supabaseGoals.length > 0) {
            const formattedGoals: Goal[] = supabaseGoals.map((g: any) => ({
              id: g.id,
              dreamId: g.dream_id,
              title: g.title,
              description: g.description || '',
              emoji: g.emoji || '🎯',
              type: g.type || 'short',
              category: g.category || 'personal',
              targetDate: g.target_date,
              progress: g.progress || 0,
              milestones: g.milestones || [],
              status: g.status || 'active',
              completedAt: g.completed_at,
              priority: g.priority || 'medium',
              notes: g.notes,
              reminder: g.reminder || false,
              why: g.why,
              createdAt: g.created_at,
              updatedAt: g.updated_at,
            }));
            setGoals(formattedGoals);
            await AsyncStorage.setItem(`${GOALS_KEY}_${userId}`, JSON.stringify(formattedGoals));
          } else if (goalsError && !isNetworkError(goalsError)) {
            console.error('Supabase goals fetch error:', goalsError);
          }

          // Promises
          const { data: supabasePromises, error: promisesError } = await supabase
            .from('promises')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!promisesError && supabasePromises && supabasePromises.length > 0) {
            const formattedPromises: Promise[] = supabasePromises.map((p: any) => ({
              id: p.id,
              text: p.text,
              emoji: p.emoji || '💝',
              isActive: p.is_active !== false,
              isCompleted: p.is_completed || false,
              completedAt: p.completed_at,
              createdAt: p.created_at,
            }));
            setPromises(formattedPromises);
            await AsyncStorage.setItem(`${PROMISES_KEY}_${userId}`, JSON.stringify(formattedPromises));
          } else if (promisesError && !isNetworkError(promisesError)) {
            console.error('Supabase promises fetch error:', promisesError);
          }

          // Supabase'den veri geldiyse AsyncStorage'dan yükleme
          if ((supabaseDreams && supabaseDreams.length > 0) || 
              (supabaseGoals && supabaseGoals.length > 0) || 
              (supabasePromises && supabasePromises.length > 0)) {
            setLoading(false);
            return;
          }
        } catch (supabaseErr) {
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error loading from Supabase, using local:', supabaseErr);
          } else {
            console.error('Supabase load error:', supabaseErr);
          }
        }
      }
      
      // Supabase'den veri gelmediyse veya userId yoksa AsyncStorage'dan yükle
      const dreamsKey = userId ? `${DREAMS_KEY}_${userId}` : DREAMS_KEY;
      const goalsKey = userId ? `${GOALS_KEY}_${userId}` : GOALS_KEY;
      const promisesKey = userId ? `${PROMISES_KEY}_${userId}` : PROMISES_KEY;
      
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

    // Supabase'e kaydet (userId varsa)
    if (userId) {
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('dreams')
          .insert({
            user_id: userId,
            title: newDream.title,
            description: newDream.description,
            emoji: newDream.emoji,
            image_url: newDream.imageUrl,
            category: newDream.category,
            notes: newDream.notes,
            tags: newDream.tags || [],
            is_archived: newDream.isArchived || false,
            is_favorite: newDream.isFavorite || false,
            is_completed: newDream.isCompleted || false,
            completed_at: newDream.completedAt,
          })
          .select()
          .single();

        if (insertError) {
          if (!isNetworkError(insertError)) {
            console.error('Supabase insert error:', insertError);
          }
        } else if (insertedData) {
          newDream.id = insertedData.id;
          newDream.createdAt = insertedData.created_at;
          newDream.updatedAt = insertedData.updated_at;
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error inserting dream, using local:', supabaseErr);
        } else {
          console.error('Supabase insert failed, using local:', supabaseErr);
        }
      }
    }

    await saveDreams([...dreams, newDream]);
    return newDream;
  };

  const updateDream = async (dreamId: string, updates: Partial<Dream>) => {
    const updatedDreams = dreams.map(d =>
      d.id === dreamId
        ? { ...d, ...updates, updatedAt: new Date().toISOString() }
        : d
    );

    // Supabase'de güncelle (userId varsa)
    if (userId) {
      try {
        const dreamToUpdate = updatedDreams.find(d => d.id === dreamId);
        if (dreamToUpdate) {
          const { error: updateError } = await supabase
            .from('dreams')
            .update({
              title: dreamToUpdate.title,
              description: dreamToUpdate.description,
              emoji: dreamToUpdate.emoji,
              image_url: dreamToUpdate.imageUrl,
              category: dreamToUpdate.category,
              notes: dreamToUpdate.notes,
              tags: dreamToUpdate.tags || [],
              is_archived: dreamToUpdate.isArchived || false,
              is_favorite: dreamToUpdate.isFavorite || false,
              is_completed: dreamToUpdate.isCompleted || false,
              completed_at: dreamToUpdate.completedAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', dreamId)
            .eq('user_id', userId);

          if (updateError && !isNetworkError(updateError)) {
            console.error('Supabase update error:', updateError);
          }
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error updating dream, using local:', supabaseErr);
        } else {
          console.error('Supabase update failed, using local:', supabaseErr);
        }
      }
    }

    await saveDreams(updatedDreams);
  };

  const deleteDream = async (dreamId: string) => {
    // Supabase'den sil (userId varsa)
    if (userId) {
      try {
        const { error: deleteError } = await supabase
          .from('dreams')
          .delete()
          .eq('id', dreamId)
          .eq('user_id', userId);

        if (deleteError && !isNetworkError(deleteError)) {
          console.error('Supabase delete error:', deleteError);
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error deleting dream, using local:', supabaseErr);
        } else {
          console.error('Supabase delete failed, using local:', supabaseErr);
        }
      }
    }

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

    // Supabase'e kaydet (userId varsa)
    if (userId) {
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            dream_id: newGoal.dreamId,
            title: newGoal.title,
            description: newGoal.description,
            emoji: newGoal.emoji,
            type: newGoal.type,
            category: newGoal.category,
            target_date: newGoal.targetDate,
            progress: newGoal.progress || 0,
            milestones: newGoal.milestones || [],
            status: newGoal.status || 'active',
            priority: newGoal.priority || 'medium',
            notes: newGoal.notes,
            reminder: newGoal.reminder || false,
            why: newGoal.why,
          })
          .select()
          .single();

        if (insertError) {
          if (!isNetworkError(insertError)) {
            console.error('Supabase insert error:', insertError);
          }
        } else if (insertedData) {
          newGoal.id = insertedData.id;
          newGoal.createdAt = insertedData.created_at;
          newGoal.updatedAt = insertedData.updated_at;
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error inserting goal, using local:', supabaseErr);
        } else {
          console.error('Supabase insert failed, using local:', supabaseErr);
        }
      }
    }

    await saveGoals([...goals, newGoal]);
    return newGoal;
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(g =>
      g.id === goalId
        ? { ...g, ...updates, updatedAt: new Date().toISOString() }
        : g
    );

    // Supabase'de güncelle (userId varsa)
    if (userId) {
      try {
        const goalToUpdate = updatedGoals.find(g => g.id === goalId);
        if (goalToUpdate) {
          const { error: updateError } = await supabase
            .from('goals')
            .update({
              dream_id: goalToUpdate.dreamId,
              title: goalToUpdate.title,
              description: goalToUpdate.description,
              emoji: goalToUpdate.emoji,
              type: goalToUpdate.type,
              category: goalToUpdate.category,
              target_date: goalToUpdate.targetDate,
              progress: goalToUpdate.progress || 0,
              milestones: goalToUpdate.milestones || [],
              status: goalToUpdate.status || 'active',
              completed_at: goalToUpdate.completedAt,
              priority: goalToUpdate.priority || 'medium',
              notes: goalToUpdate.notes,
              reminder: goalToUpdate.reminder || false,
              why: goalToUpdate.why,
              updated_at: new Date().toISOString(),
            })
            .eq('id', goalId)
            .eq('user_id', userId);

          if (updateError && !isNetworkError(updateError)) {
            console.error('Supabase update error:', updateError);
          }
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error updating goal, using local:', supabaseErr);
        } else {
          console.error('Supabase update failed, using local:', supabaseErr);
        }
      }
    }

    await saveGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    // Supabase'den sil (userId varsa)
    if (userId) {
      try {
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', userId);

        if (deleteError && !isNetworkError(deleteError)) {
          console.error('Supabase delete error:', deleteError);
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error deleting goal, using local:', supabaseErr);
        } else {
          console.error('Supabase delete failed, using local:', supabaseErr);
        }
      }
    }

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

    // Supabase'e kaydet (userId varsa)
    if (userId) {
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('promises')
          .insert({
            user_id: userId,
            text: newPromise.text,
            emoji: newPromise.emoji,
            is_active: newPromise.isActive,
            is_completed: newPromise.isCompleted || false,
            completed_at: newPromise.completedAt,
          })
          .select()
          .single();

        if (insertError) {
          if (!isNetworkError(insertError)) {
            console.error('Supabase insert error:', insertError);
          }
        } else if (insertedData) {
          newPromise.id = insertedData.id;
          newPromise.createdAt = insertedData.created_at;
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error inserting promise, using local:', supabaseErr);
        } else {
          console.error('Supabase insert failed, using local:', supabaseErr);
        }
      }
    }

    await savePromises([...promises, newPromise]);
    return newPromise;
  };

  const deletePromise = async (promiseId: string) => {
    // Supabase'den sil (userId varsa)
    if (userId) {
      try {
        const { error: deleteError } = await supabase
          .from('promises')
          .delete()
          .eq('id', promiseId)
          .eq('user_id', userId);

        if (deleteError && !isNetworkError(deleteError)) {
          console.error('Supabase delete error:', deleteError);
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error deleting promise, using local:', supabaseErr);
        } else {
          console.error('Supabase delete failed, using local:', supabaseErr);
        }
      }
    }

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

    // Supabase'de güncelle (userId varsa)
    if (userId) {
      try {
        const promiseToUpdate = updatedPromises.find(p => p.id === promiseId);
        if (promiseToUpdate) {
          const { error: updateError } = await supabase
            .from('promises')
            .update({
              text: promiseToUpdate.text,
              emoji: promiseToUpdate.emoji,
              is_active: promiseToUpdate.isActive !== false,
              is_completed: promiseToUpdate.isCompleted || false,
              completed_at: promiseToUpdate.completedAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', promiseId)
            .eq('user_id', userId);

          if (updateError && !isNetworkError(updateError)) {
            console.error('Supabase update error:', updateError);
          }
        }
      } catch (supabaseErr) {
        if (isNetworkError(supabaseErr)) {
          console.warn('⚠️ Network error updating promise, using local:', supabaseErr);
        } else {
          console.error('Supabase update failed, using local:', supabaseErr);
        }
      }
    }

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

