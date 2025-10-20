import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugStorage } from '../utils/debugStorage';

export const useMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { user } = useAuth();

  const migrateData = async () => {
    console.log('=== MIGRATION START ===');
    console.log('User:', user);
    
    if (!user || !user.uid) {
      console.error('No user or user ID found');
      return { success: false, error: 'Lütfen önce giriş yapın' };
    }

    // Debug storage first
    await debugStorage();

    setIsMigrating(true);
    try {
      // 1. Tasks migration
      const tasksData = await AsyncStorage.getItem('daily_tasks');
      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        if (tasks.length > 0) {
          const tasksToInsert = tasks.map((task: any) => ({
            user_id: user.uid,
            title: task.title,
            description: task.description || null,
            category: task.category || null,
            frequency: task.frequency || 'daily',
            priority: task.priority || 'medium',
            estimated_time: task.estimatedTime || null,
            date: task.date || null,
            is_completed: task.isCompleted || false,
          }));

          const { error: tasksError } = await supabase
            .from('tasks')
            .upsert(tasksToInsert, { 
              onConflict: 'id' 
            });

          if (tasksError) {
            console.error('Tasks migration error:', tasksError);
          } else {
            console.log('Tasks migrated successfully:', tasksToInsert.length);
          }
        }
      }

      // 2. Reminders migration
      const remindersData = await AsyncStorage.getItem('daily_reminders');
      if (remindersData) {
        const reminders = JSON.parse(remindersData);
        if (reminders.length > 0) {
          const remindersToInsert = reminders.map((reminder: any) => ({
            user_id: user.uid,
            title: reminder.title,
            description: reminder.description || null,
            frequency: reminder.frequency || 'daily',
            remind_date: reminder.date || null,
            remind_time: reminder.time || null,
            emoji: reminder.emoji || null,
            is_active: reminder.isActive !== false,
          }));

          const { error: remindersError } = await supabase
            .from('reminders')
            .upsert(remindersToInsert, { 
              onConflict: 'id' 
            });

          if (remindersError) {
            console.error('Reminders migration error:', remindersError);
          } else {
            console.log('Reminders migrated successfully:', remindersToInsert.length);
          }
        }
      }

      // 3. Settings migration
      const theme = await AsyncStorage.getItem('selected_theme');
      const language = await AsyncStorage.getItem('selected_language');
      const notifications = await AsyncStorage.getItem('notifications_enabled');
      const reminderTime = await AsyncStorage.getItem('reminder_time');

      const settingsToInsert = {
        user_id: user.uid,
        theme: theme || null,
        language: language || 'tr',
        notifications_enabled: notifications !== 'false',
        reminder_time: reminderTime || null,
      };

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert(settingsToInsert, { 
          onConflict: 'user_id' 
        });

      if (settingsError) {
        console.error('Settings migration error:', settingsError);
      } else {
        console.log('Settings migrated successfully');
      }

      // 4. Mark as migrated
      await AsyncStorage.setItem('data_migrated_to_cloud', 'true');

      return { success: true };
    } catch (error) {
      console.error('Migration error:', error);
      return { success: false, error };
    } finally {
      setIsMigrating(false);
    }
  };

  const checkMigrationStatus = async () => {
    const migrated = await AsyncStorage.getItem('data_migrated_to_cloud');
    return migrated === 'true';
  };

  return {
    migrateData,
    checkMigrationStatus,
    isMigrating,
  };
};
