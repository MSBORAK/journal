import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reminder } from '../types';
import { 
  scheduleReminderNotification, 
  cancelReminderNotification 
} from '../services/notificationService';

const REMINDERS_STORAGE_KEY = '@daily_reminders';

export const useReminders = (userId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reminders from storage
  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async (): Promise<Reminder[]> => {
    try {
      setLoading(true);
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        const parsed = JSON.parse(remindersData);
        setReminders(parsed);
        console.log('📥 Loaded reminders from storage:', parsed.length);
        return parsed;
      }
      console.log('📭 No reminders found in storage');
      return [];
    } catch (error) {
      console.error('❌ Error loading reminders:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Save reminders to storage
  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      console.log('💾 saveReminders called with:', newReminders.length, 'reminders');
      console.log('💾 Reminders to save:', newReminders.map(r => ({ id: r.id, title: r.title })));
      
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      console.log('✅ Reminders saved to AsyncStorage');
      
      // State'i güncelle - React'in state güncellemesini tetiklemek için
      setReminders(newReminders);
      console.log('✅ Reminders state updated, new count:', newReminders.length);
      
      // State'in gerçekten güncellendiğini doğrula
      setTimeout(() => {
        console.log('🔍 State verification - reminders count should be:', newReminders.length);
      }, 100);
    } catch (error) {
      console.error('❌ Error saving reminders:', error);
      throw error; // Hata durumunda throw et ki üst seviyede yakalanabilsin
    }
  };

  // Add new reminder
  const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('📝 addReminder called with:', reminder);
    
    // Mevcut hatırlatıcıları AsyncStorage'dan direkt oku (stale closure sorununu önlemek için)
    let currentReminders: Reminder[] = [];
    try {
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        currentReminders = JSON.parse(remindersData);
      }
    } catch (error) {
      console.error('❌ Error reading reminders from storage:', error);
      currentReminders = reminders; // Fallback to state
    }
    
    console.log('📋 Current reminders count:', currentReminders.length);
    
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Eğer reminderType belirtilmemişse varsayılan değer
      reminderType: reminder.reminderType || 'today',
    };
    
    console.log('✅ New reminder created:', newReminder);
    
    // Mevcut hatırlatıcılar + yeni hatırlatıcı
    const newReminders = [...currentReminders, newReminder];
    console.log('📦 New reminders array length:', newReminders.length);
    
    await saveReminders(newReminders);
    console.log('💾 Reminders saved to storage and state updated');
    
    // Bildirim planlama RemindersScreen.tsx'de yapılıyor (daha iyi hata yönetimi için)
    
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
    // Önce bildirimi iptal et
    try {
      await cancelReminderNotification(reminderId);
    } catch (error) {
      console.error('Error cancelling reminder notification:', error);
    }
    
    const newReminders = reminders.filter(reminder => reminder.id !== reminderId);
    await saveReminders(newReminders);
  };

  // Toggle reminder active status
  const toggleReminder = async (reminderId: string) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const newActiveStatus = !reminder.isActive;
    await updateReminder(reminderId, { isActive: newActiveStatus });

    // Bildirim yönetimi
    try {
      if (newActiveStatus) {
        // Hatırlatıcı aktif edildi - bildirim planla
        await scheduleReminderNotification(
          reminder.id,
          reminder.emoji + ' ' + reminder.title,
          reminder.description || 'Hatırlatıcı zamanı!',
          reminder.time,
          reminder.repeatType,
          reminder.category,
          reminder.date, // Gelecek tarih için
          reminder.repeatDays // Haftalık hatırlatıcılar için günler
        );
      } else {
        // Hatırlatıcı pasif edildi - bildirimi iptal et
        await cancelReminderNotification(reminder.id);
      }
    } catch (error) {
      console.error('Error managing reminder notification:', error);
    }
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
      
      let reminderDateTime = new Date();
      
      if (reminder.reminderType === 'scheduled' && reminder.date) {
        // Planlı hatırlatıcı için belirtilen tarih ve saat
        const [year, month, day] = reminder.date.split('-').map(Number);
        const [hours, minutes] = reminder.time.split(':').map(Number);
        reminderDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        // Bugün için hatırlatıcı
        const [hours, minutes] = reminder.time.split(':').map(Number);
        reminderDateTime.setHours(hours, minutes, 0, 0);
        
        // Eğer saat geçmişse yarına al
        if (reminderDateTime < now) {
          reminderDateTime.setDate(reminderDateTime.getDate() + 1);
        }
      }
      
      // Check if reminder is within next 24 hours
      return reminderDateTime >= now && reminderDateTime <= tomorrow;
    }).sort((a, b) => {
      let timeA = new Date();
      let timeB = new Date();
      
      if (a.reminderType === 'scheduled' && a.date) {
        const [year, month, day] = a.date.split('-').map(Number);
        const [hours, minutes] = a.time.split(':').map(Number);
        timeA = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        const [hours, minutes] = a.time.split(':').map(Number);
        timeA.setHours(hours, minutes, 0, 0);
      }
      
      if (b.reminderType === 'scheduled' && b.date) {
        const [year, month, day] = b.date.split('-').map(Number);
        const [hours, minutes] = b.time.split(':').map(Number);
        timeB = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        const [hours, minutes] = b.time.split(':').map(Number);
        timeB.setHours(hours, minutes, 0, 0);
      }
      
      return timeA.getTime() - timeB.getTime();
    });
  };

  // Get reminders for today
  const getTodayReminders = () => {
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayString = `${todayUTC.getFullYear()}-${String(todayUTC.getMonth() + 1).padStart(2, '0')}-${String(todayUTC.getDate()).padStart(2, '0')}`;
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return reminders.filter(reminder => {
      if (!reminder.isActive) return false;
      
      // Tarih aralığı hatırlatıcıları kontrol et (description'da "Bitiş: YYYY-MM-DD" formatı)
      if (reminder.description && reminder.description.startsWith('Bitiş: ')) {
        const endDateStr = reminder.description.replace('Bitiş: ', '');
        const startDateStr = reminder.date || todayString;
        
        // Bugün başlangıç ve bitiş tarihleri arasında mı?
        if (todayString >= startDateStr && todayString <= endDateStr) {
          return true;
        }
        return false;
      }
      
      // Eğer planlı hatırlatıcı ise ve bugün için değilse dahil etme
      if (reminder.reminderType === 'scheduled' && reminder.date) {
        return reminder.date === todayString;
      }
      
      switch (reminder.repeatType) {
        case 'daily':
          // Günlük hatırlatıcı - her zaman true
          return true;
        case 'weekly':
          return reminder.repeatDays?.includes(dayOfWeek) || false;
        case 'monthly':
          // For monthly, we could check if it's the same day of month
          return true; // Simplified for now
        case 'once':
          // Check if it's today and not yet triggered
          const reminderDate = new Date(reminder.createdAt);
          const reminderDateUTC = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
          const todayDateUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return reminderDateUTC.getTime() === todayDateUTC.getTime() && !reminder.lastTriggered;
        default:
          return false;
      }
    });
  };

  // Get all reminders sorted by date and time
  const getSortedReminders = () => {
    return [...reminders].sort((a, b) => {
      let timeA = new Date();
      let timeB = new Date();
      
      if (a.reminderType === 'scheduled' && a.date) {
        const [year, month, day] = a.date.split('-').map(Number);
        const [hours, minutes] = a.time.split(':').map(Number);
        timeA = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        const [hours, minutes] = a.time.split(':').map(Number);
        timeA.setHours(hours, minutes, 0, 0);
        // Bugün için hatırlatıcılar en üstte
        if (timeA < new Date()) {
          timeA.setDate(timeA.getDate() + 1);
        }
      }
      
      if (b.reminderType === 'scheduled' && b.date) {
        const [year, month, day] = b.date.split('-').map(Number);
        const [hours, minutes] = b.time.split(':').map(Number);
        timeB = new Date(year, month - 1, day, hours, minutes, 0, 0);
      } else {
        const [hours, minutes] = b.time.split(':').map(Number);
        timeB.setHours(hours, minutes, 0, 0);
        // Bugün için hatırlatıcılar en üstte
        if (timeB < new Date()) {
          timeB.setDate(timeB.getDate() + 1);
        }
      }
      
      return timeA.getTime() - timeB.getTime();
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
    getSortedReminders,
    
    // Statistics
    getReminderStats,
    getCategoryStats,
    getPriorityStats,
  };
};
