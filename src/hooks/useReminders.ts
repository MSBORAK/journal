import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';

const REMINDERS_STORAGE_KEY = '@daily_reminders';

export const useReminders = (userId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reminders from storage
  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        setReminders(JSON.parse(remindersData));
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save reminders to storage
  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  // Add new reminder
  const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newReminders = [...reminders, newReminder];
    await saveReminders(newReminders);
    return newReminder;
  };

  // Update reminder
  const updateReminder = async (reminderId: string, updates: Partial<Reminder>) => {
    const newReminders = reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, ...updates, updatedAt: new Date().toISOString() }
        : reminder
    );
    await saveReminders(newReminders);
  };

  // Delete reminder
  const deleteReminder = async (reminderId: string) => {
    const newReminders = reminders.filter(reminder => reminder.id !== reminderId);
    await saveReminders(newReminders);
  };

  // Toggle reminder active status
  const toggleReminder = async (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    await updateReminder(reminderId, { isActive: !reminder.isActive });
  };

  // Get active reminders
  const getActiveReminders = () => {
    return reminders.filter(reminder => reminder.isActive);
  };

  // Get reminders by category
  const getRemindersByCategory = (category: Reminder['category']) => {
    return reminders.filter(reminder => reminder.category === category);
  };

  // Get upcoming reminders (next 24 hours)
  const getUpcomingReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      const reminderTime = new Date();
      const [hours, minutes] = reminder.time.split(':').map(Number);
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // Check if reminder is within next 24 hours
      return reminderTime >= now && reminderTime <= tomorrow;
    }).sort((a, b) => {
      const timeA = new Date();
      const [hoursA, minutesA] = a.time.split(':').map(Number);
      timeA.setHours(hoursA, minutesA, 0, 0);
      
      const timeB = new Date();
      const [hoursB, minutesB] = b.time.split(':').map(Number);
      timeB.setHours(hoursB, minutesB, 0, 0);
      
      return timeA.getTime() - timeB.getTime();
    });
  };

  // Get reminders for today
  const getTodayReminders = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      switch (reminder.repeatType) {
        case 'daily':
          return true;
        case 'weekly':
          return reminder.repeatDays?.includes(dayOfWeek) || false;
        case 'monthly':
          // For monthly, we could check if it's the same day of month
          return true; // Simplified for now
        case 'once':
          // Check if it's today and not yet triggered
          const reminderDate = new Date(reminder.createdAt);
          return reminderDate.toDateString() === today.toDateString() && !reminder.lastTriggered;
        default:
          return false;
      }
    });
  };

  // Mark reminder as triggered
  const markReminderTriggered = async (reminderId: string) => {
    await updateReminder(reminderId, { lastTriggered: new Date().toISOString() });
  };

  // Get reminder statistics
  const getReminderStats = () => {
    const total = reminders.length;
    const active = reminders.filter(r => r.isActive).length;
    const todayCount = getTodayReminders().length;
    
    return {
      total,
      active,
      inactive: total - active,
      todayCount,
    };
  };

  // Get category statistics
  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    
    reminders.forEach(reminder => {
      if (!stats[reminder.category]) {
        stats[reminder.category] = 0;
      }
      stats[reminder.category]++;
    });
    
    return stats;
  };

  // Get priority statistics
  const getPriorityStats = () => {
    const stats = {
      low: 0,
      medium: 0,
      high: 0,
    };
    
    reminders.forEach(reminder => {
      if (reminder.isActive) {
        stats[reminder.priority]++;
      }
    });
    
    return stats;
  };

  return {
    // Data
    reminders,
    loading,
    
    // Actions
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    markReminderTriggered,
    
    // Getters
    getActiveReminders,
    getRemindersByCategory,
    getUpcomingReminders,
    getTodayReminders,
    
    // Statistics
    getReminderStats,
    getCategoryStats,
    getPriorityStats,
  };
};
