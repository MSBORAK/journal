import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DataSyncService } from '../services/dataSyncService';

export interface CloudTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  frequency: string;
  priority: string;
  estimated_time?: number;
  date?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useCloudTasks = () => {
  const [tasks, setTasks] = useState<CloudTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load tasks from cache
  const loadTasks = async () => {
    if (!user?.uid) return;

    try {
      const cachedTasks = await DataSyncService.getCachedData('tasks');
      setTasks(cachedTasks);
    } catch (err) {
      console.error('Error loading cached tasks:', err);
    }
  };

  // Add new task
  const addTask = async (taskData: Partial<CloudTask>) => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const newTask = {
        user_id: user.uid,
        title: taskData.title || '',
        description: taskData.description || null,
        category: taskData.category || null,
        frequency: taskData.frequency || 'daily',
        priority: taskData.priority || 'medium',
        estimated_time: taskData.estimated_time || null,
        date: taskData.date || null,
        is_completed: taskData.is_completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return null;
      }

      // Update local cache
      const updatedTasks = [...tasks, data];
      setTasks(updatedTasks);
      await DataSyncService.cacheData('tasks', updatedTasks);

      return data;
    } catch (err) {
      setError('Failed to add task');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update task
  const updateTask = async (taskId: string, updates: Partial<CloudTask>) => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', user.uid)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return null;
      }

      // Update local cache
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? data : task
      );
      setTasks(updatedTasks);
      await DataSyncService.cacheData('tasks', updatedTasks);

      return data;
    } catch (err) {
      setError('Failed to update task');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.uid);

      if (error) {
        setError(error.message);
        return false;
      }

      // Update local cache
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await DataSyncService.cacheData('tasks', updatedTasks);

      return true;
    } catch (err) {
      setError('Failed to delete task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    return await updateTask(taskId, { 
      is_completed: !task.is_completed 
    });
  };

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [user?.uid]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    loadTasks,
    isLoading,
    error,
  };
};
