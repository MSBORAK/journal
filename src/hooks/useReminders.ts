import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Reminder } from '../types';
import { 
  scheduleReminderNotification, 
  cancelReminderNotification 
} from '../services/notificationService';
import { isNetworkError } from '../utils/networkUtils';

const REMINDERS_STORAGE_KEY = '@daily_reminders';

export const useReminders = (userId?: string) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reminders from storage
  const loadReminders = useCallback(async (): Promise<Reminder[]> => {
    try {
      setLoading(true);
      
      // userId varsa önce Supabase'den reminders çek
      if (userId) {
        try {
          const { data: supabaseReminders, error: supabaseError } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (supabaseError) {
            console.error('Supabase fetch error:', supabaseError);
            if (isNetworkError(supabaseError)) {
              console.warn('⚠️ Network error, using local data');
            }
          } else if (supabaseReminders && supabaseReminders.length > 0) {
            // Supabase'den veri geldi, formatla
            const formattedReminders: Reminder[] = supabaseReminders.map((reminder: any) => ({
              id: reminder.id,
              title: reminder.title,
              description: reminder.description || undefined,
              emoji: reminder.emoji || '🔔',
              time: reminder.time,
              date: reminder.date || undefined,
              isActive: reminder.is_active !== false,
              repeatType: reminder.repeat_type || 'daily',
              repeatDays: reminder.repeat_days || undefined,
              category: reminder.category || 'general',
              priority: reminder.priority || 'medium',
              reminderType: reminder.reminder_type || 'today',
              createdAt: reminder.created_at,
              updatedAt: reminder.updated_at,
              lastTriggered: reminder.last_triggered || undefined,
              linkedTaskId: reminder.linked_task_id || undefined,
              isTaskReminder: reminder.is_task_reminder || false,
            }));
            
            setReminders(formattedReminders);
            // AsyncStorage'a da kaydet (offline için)
            await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(formattedReminders));
            console.log('✅ Loaded reminders from Supabase:', formattedReminders.length);
            setLoading(false);
            return formattedReminders;
          }
        } catch (supabaseErr) {
          console.error('Supabase connection error:', supabaseErr);
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error, using local data');
          }
        }
      }

      // Supabase'den veri gelmediyse veya userId yoksa AsyncStorage'dan yükle
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        const parsed = JSON.parse(remindersData);
        setReminders(parsed);
        console.log('📥 Loaded reminders from storage:', parsed.length);
        setLoading(false);
        return parsed;
      }
      console.log('📭 No reminders found');
      setReminders([]);
      setLoading(false);
      return [];
    } catch (error) {
      console.error('❌ Error loading reminders:', error);
      setReminders([]);
      setLoading(false);
      return [];
    }
  }, [userId]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // Hatırlatıcılar yüklendiğinde aktif olanlar için bildirimleri planla
  useEffect(() => {
    const scheduleActiveReminders = async () => {
      if (reminders.length === 0 || loading) return;
      
      try {
        // Aktif hatırlatıcılar için bildirimleri planla
        const activeReminders = reminders.filter(r => r.isActive);
        
        for (const reminder of activeReminders) {
          try {
            await scheduleReminderNotification(
              reminder.id,
              reminder.emoji + ' ' + reminder.title,
              reminder.description || 'Hatırlatıcı zamanı!',
              reminder.time,
              reminder.repeatType,
              reminder.category,
              reminder.date,
              reminder.repeatDays
            );
            if (__DEV__) {
              console.log('✅ Reminder notification scheduled on load:', reminder.id);
            }
          } catch (error) {
            console.error(`Error scheduling notification for reminder ${reminder.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error scheduling reminder notifications on load:', error);
      }
    };

    scheduleActiveReminders();
  }, [reminders.length, loading]); // Sadece reminders yüklendiğinde çalış

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
    
    let newReminder: Reminder;
    
    // Supabase'e kaydet (sadece userId varsa)
    if (userId) {
      try {
        // CRITICAL FIX: Map category to database allowed values
        // Database schema allows: 'task', 'medicine', 'health', 'personal', 'custom'
        // Map 'general' and other values to 'personal'
        const mapCategoryToDb = (cat: string | undefined): 'task' | 'medicine' | 'health' | 'personal' | 'custom' => {
          if (!cat) return 'personal';
          const categoryMap: Record<string, 'task' | 'medicine' | 'health' | 'personal' | 'custom'> = {
            'general': 'personal',
            'appointment': 'personal',
            'birthday': 'personal',
            'meeting': 'personal',
            'exercise': 'health',
            'meal': 'health',
            'work': 'personal',
            'study': 'personal',
            'task': 'task',
            'medicine': 'medicine',
            'health': 'health',
            'personal': 'personal',
            'custom': 'custom',
          };
          return categoryMap[cat.toLowerCase()] || 'personal';
        };
        
        const dbCategory = mapCategoryToDb(reminder.category);
        
        let insertedData: any;
        const { data, error: insertError } = await supabase
          .from('reminders')
          .insert({
            user_id: userId,
          title: reminder.title,
          description: reminder.description || null,
          emoji: reminder.emoji || '🔔',
          time: reminder.time,
          date: reminder.date || null,
          is_active: reminder.isActive !== false,
          repeat_type: reminder.repeatType || 'daily',
          repeat_days: reminder.repeatDays || null,
          category: dbCategory,
          priority: reminder.priority || 'medium',
          reminder_type: reminder.reminderType || 'today',
          linked_task_id: reminder.linkedTaskId || null,
          is_task_reminder: reminder.isTaskReminder || false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        
        // CRITICAL FIX: If category column doesn't exist, try insert without it
        if (insertError.code === 'PGRST204' && insertError.message?.includes('category')) {
          console.warn('⚠️ Category column not found, retrying without category field');
          const { data: retryData, error: retryError } = await supabase
            .from('reminders')
            .insert({
              user_id: userId,
              title: reminder.title,
              description: reminder.description || null,
              emoji: reminder.emoji || '🔔',
              time: reminder.time,
              date: reminder.date || null,
              is_active: reminder.isActive !== false,
              repeat_type: reminder.repeatType || 'daily',
              repeat_days: reminder.repeatDays || null,
              // category field removed - column doesn't exist in database
              priority: reminder.priority || 'medium',
              reminder_type: reminder.reminderType || 'today',
              linked_task_id: reminder.linkedTaskId || null,
              is_task_reminder: reminder.isTaskReminder || false,
            })
            .select()
            .single();
            
          if (retryError) {
            console.error('Retry insert also failed:', retryError);
            throw retryError;
          }
          
          // Use retry data instead
          insertedData = retryData;
        } else {
          throw insertError;
        }
      } else {
        insertedData = data;
      }

      newReminder = {
        id: insertedData.id,
        title: insertedData.title,
        description: insertedData.description || undefined,
        emoji: insertedData.emoji || '🔔',
        time: insertedData.time,
        date: insertedData.date || undefined,
        isActive: insertedData.is_active !== false,
        repeatType: insertedData.repeat_type || 'daily',
        repeatDays: insertedData.repeat_days || undefined,
        category: insertedData.category || 'general',
        priority: insertedData.priority || 'medium',
        reminderType: insertedData.reminder_type || 'today',
        createdAt: insertedData.created_at,
        updatedAt: insertedData.updated_at,
        lastTriggered: insertedData.last_triggered || undefined,
        linkedTaskId: insertedData.linked_task_id || undefined,
        isTaskReminder: insertedData.is_task_reminder || false,
      };
      
        console.log('✅ Reminder saved to Supabase:', newReminder.id);
      } catch (supabaseErr) {
        console.error('Supabase insert failed, using local ID:', supabaseErr);
        // Supabase başarısız olursa local ID ile kaydet
        newReminder = {
          ...reminder,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reminderType: reminder.reminderType || 'today',
        };
      }
    } else {
      // Anonymous user - sadece local ID ile kaydet
      newReminder = {
        ...reminder,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderType: reminder.reminderType || 'today',
      };
      console.log('📝 Reminder saved locally (anonymous user):', newReminder.id);
    }
    
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
    // Mevcut hatırlatıcıları AsyncStorage'dan direkt oku
    let currentReminders: Reminder[] = [];
    try {
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        currentReminders = JSON.parse(remindersData);
      }
    } catch (error) {
      currentReminders = reminders;
    }
    
    const existingReminder = currentReminders.find(r => r.id === reminderId);
    if (!existingReminder) throw new Error('Reminder not found');

    // Supabase'de güncelle (sadece userId varsa VE reminderId UUID formatındaysa)
    if (userId && isValidUUID(reminderId)) {
      try {
        const { data: updatedData, error: updateError } = await supabase
          .from('reminders')
          .update({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description || null }),
          ...(updates.emoji !== undefined && { emoji: updates.emoji }),
          ...(updates.time !== undefined && { time: updates.time }),
          ...(updates.date !== undefined && { date: updates.date || null }),
          ...(updates.isActive !== undefined && { is_active: updates.isActive }),
          ...(updates.repeatType !== undefined && { repeat_type: updates.repeatType }),
          ...(updates.repeatDays !== undefined && { repeat_days: updates.repeatDays || null }),
          ...(updates.category !== undefined && { 
            category: (() => {
              // Map category to database allowed values
              const categoryMap: Record<string, 'task' | 'medicine' | 'health' | 'personal' | 'custom'> = {
                'general': 'personal',
                'appointment': 'personal',
                'birthday': 'personal',
                'meeting': 'personal',
                'exercise': 'health',
                'meal': 'health',
                'work': 'personal',
                'study': 'personal',
                'task': 'task',
                'medicine': 'medicine',
                'health': 'health',
                'personal': 'personal',
                'custom': 'custom',
              };
              return categoryMap[updates.category] || 'personal';
            })()
          }),
          ...(updates.priority !== undefined && { priority: updates.priority }),
          ...(updates.reminderType !== undefined && { reminder_type: updates.reminderType }),
          ...(updates.lastTriggered !== undefined && { last_triggered: updates.lastTriggered || null }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        if (!isNetworkError(updateError)) {
          throw updateError;
        }
        } else if (updatedData) {
          console.log('✅ Reminder updated in Supabase:', reminderId);
        }
      } catch (supabaseErr) {
        console.error('Supabase update failed, using local update:', supabaseErr);
      }
    } else {
      if (!userId) {
        console.log('📝 Reminder updated locally (anonymous user):', reminderId);
      } else {
        console.log('📝 Reminder updated locally (local ID, not in Supabase):', reminderId);
      }
    }
    
    // Local state'i güncelle
    const updatedReminder = {
      ...existingReminder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const newReminders = currentReminders.map(reminder => 
      reminder.id === reminderId ? updatedReminder : reminder
    );
    await saveReminders(newReminders);
  };

  // Delete reminder
  // UUID formatını kontrol et (Supabase UUID formatı: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const deleteReminder = async (reminderId: string) => {
    // Önce bildirimi iptal et
    try {
      await cancelReminderNotification(reminderId);
    } catch (error) {
      console.error('Error cancelling reminder notification:', error);
    }
    
    // Supabase'den sil (sadece userId varsa VE reminderId UUID formatındaysa)
    if (userId && isValidUUID(reminderId)) {
      try {
        const { error: deleteError } = await supabase
          .from('reminders')
          .delete()
          .eq('id', reminderId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Supabase delete error:', deleteError);
          if (!isNetworkError(deleteError)) {
            throw deleteError;
          }
        } else {
          console.log('✅ Reminder deleted from Supabase:', reminderId);
        }
      } catch (supabaseErr) {
        console.error('Supabase delete failed, using local delete:', supabaseErr);
      }
    } else {
      if (!userId) {
        console.log('📝 Reminder deleted locally (anonymous user):', reminderId);
      } else {
        console.log('📝 Reminder deleted locally (local ID, not in Supabase):', reminderId);
      }
    }
    
    // Mevcut hatırlatıcıları AsyncStorage'dan direkt oku
    let currentReminders: Reminder[] = [];
    try {
      const remindersData = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (remindersData) {
        currentReminders = JSON.parse(remindersData);
      }
    } catch (error) {
      currentReminders = reminders;
    }
    
    const newReminders = currentReminders.filter(reminder => reminder.id !== reminderId);
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
