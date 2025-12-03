import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import { useAchievements } from '../hooks/useAchievements';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';
import { useTimer } from '../contexts/TimerContext';
import FocusMode from '../components/FocusMode';
import { useAppTour } from '../hooks/useAppTour';
import AppTour from '../components/AppTour';
import { getButtonTextColor } from '../utils/colorUtils';

const { width: screenWidth } = Dimensions.get('window');

interface TasksAndRemindersScreenProps {
  navigation: any;
}

export default function TasksAndRemindersScreen({ navigation }: TasksAndRemindersScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  // App Tour
  const tour = useAppTour(navigation, 'Tasks');
  const { 
    tasks,
    loading: tasksLoading, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion,
    getTodayTasks,
    getTodayCompletedCount,
  } = useTasks(user?.uid);
  
  const { 
    reminders,
    loading: remindersLoading,
    addReminder,
    getTodayReminders,
    deleteReminder,
  } = useReminders(user?.uid);
  
  const { checkTaskAchievements } = useAchievements(user?.uid);

  // State
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'future' | 'all'>('daily');
  const [showReminders, setShowReminders] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [toggleAnim] = useState(new Animated.Value(0)); // Toggle animation
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { 
    setShowFocusMode, 
    showFocusMode, 
    isActive, 
    isPaused, 
    timeLeft, 
    selectedDuration,
    totalFocusTime,
    totalWorkTime,
    progressAnim, 
    scaleAnim 
  } = useTimer();
  
  // Modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  
  // Task form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('personal');
  const [taskFrequency, setTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [taskEstimatedTime, setTaskEstimatedTime] = useState('15');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('09:00');
  const [taskHasReminder, setTaskHasReminder] = useState(false); // Görev için hatırlatıcı ekle
  
  // Toggle animasyonunu taskHasReminder'a göre güncelle
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: taskHasReminder ? 1 : 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
    // toggleAnim is stable, don't include it in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskHasReminder]);
  
  // Reminder form states
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderType, setReminderType] = useState<'daily' | 'dateRange'>('daily'); // Günlük veya tarih aralığı
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderStartDate, setReminderStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderEndDate, setReminderEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Computed values - MEMOIZED to prevent recalculation on every render
  const todayTasks = useMemo(() => getTodayTasks(), [tasks]);
  const completedCount = useMemo(() => getTodayCompletedCount(), [tasks]);
  const completionRate = useMemo(() => {
    return todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;
  }, [todayTasks.length, completedCount]);
  const todayReminders = useMemo(() => getTodayReminders(), [reminders]);
  // Hatırlatıcılar kısmında sadece gerçek hatırlatıcıları göster (görev hatırlatıcıları hariç)
  const upcomingReminders = useMemo(() => {
    return reminders.filter(r => r.isActive && !r.isTaskReminder);
  }, [reminders]);

  // Animation for tab switching
  const animateTabSwitch = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab: 'daily' | 'weekly' | 'monthly' | 'future' | 'all') => {
    animateTabSwitch();
    setActiveTab(tab);
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      // Görevle bağlantılı hatırlatıcıyı bul ve iptal et
      const linkedReminder = reminders.find(r => r.linkedTaskId === taskId);
      if (linkedReminder) {
        try {
          await deleteReminder(linkedReminder.id);
          console.log('✅ Görev hatırlatıcısı iptal edildi:', linkedReminder.id);
        } catch (reminderError) {
          console.error('Hatırlatıcı iptal edilirken hata:', reminderError);
        }
      }
      
      await toggleTaskCompletion(taskId);
      
      // Başarıları kontrol et
      try {
        // Toggle işleminden sonra güncel task listesini al
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        const completedTasksCount = updatedTasks.filter(t => t.isCompleted).length;
        const newAchievements = await checkTaskAchievements(completedTasksCount);
        
        if (newAchievements && newAchievements.length > 0) {
          console.log('🎉 New achievements unlocked:', newAchievements.length);
        }
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError);
        // Başarı kontrolü hatası görev tamamlamayı engellemesin
      }
      
      await soundService.playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleAddTask = () => {
    setTaskHasReminder(false);
    toggleAnim.setValue(0);
    setShowAddTaskModal(true);
  };

  const handleAddReminder = () => {
    // FocusMode açıksa önce kapat
    if (showFocusMode) {
      setShowFocusMode(false);
      // Kısa bir gecikme ile modal'ı aç (modal kapanma animasyonu için)
      setTimeout(() => {
        setShowAddReminderModal(true);
      }, 300);
    } else {
      setShowAddReminderModal(true);
    }
  };

  const handleSaveTask = async () => {
    // Basit validation - sadece boş kontrolü
    const trimmedTitle = taskTitle.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      console.log('Task title is empty');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Mantık: Tarih gelecekse tek seferlik, bugün/geçmişse sıklık seçimi geçerli
    let taskDateValue = taskDate;
    let dueDate: string | undefined = undefined;
    let dueTime: string | undefined = undefined;
    let frequency: 'daily' | 'weekly' | 'monthly' | 'once' = 'once';
    
    // Gelecek bir tarih girildiyse → Tek seferlik görev
    if (taskDate > today) {
      dueDate = taskDate;
      dueTime = taskTime;
      taskDateValue = taskDate;
      frequency = 'once'; // Gelecek tarihli görevler her zaman tek seferlik
    } 
    // Bugün veya geçmiş tarih → Sıklık seçimine göre
    else {
      taskDateValue = today; // Bugünden itibaren başlat
      frequency = taskFrequency; // Kullanıcının seçtiği sıklık
    }
    
    console.log('Saving task:', {
      title: trimmedTitle,
      category: taskCategory,
      estimatedTime: parseInt(taskEstimatedTime),
      emoji: '📝',
      date: taskDateValue,
      priority: 'medium',
      frequency: frequency,
      dueDate: dueDate,
      dueTime: dueTime,
    });
    
    try {
      const newTask = await addTask({
        title: trimmedTitle,
        category: taskCategory as 'health' | 'personal' | 'work' | 'custom' | 'hobby',
        estimatedTime: parseInt(taskEstimatedTime),
        emoji: '📝',
        date: taskDateValue,
        priority: 'medium',
        frequency: frequency,
        dueDate: dueDate,
        dueTime: dueTime,
      });
      
      console.log('Task saved successfully:', newTask);
      
      // Eğer hatırlatıcı seçildiyse, görev için hatırlatıcı oluştur
      if (taskHasReminder && newTask) {
        try {
          // Hatırlatıcı mesajı - daha duygusal ve kişisel
          const reminderMessages = [
            `Biraz vakit ayırmaya ne dersin? 🌸`,
            `Zaman geldi — "${taskTitle.trim()}" seni bekliyor. 💫`,
            `Kendin için bir an ayır — "${taskTitle.trim()}" hazır! ✨`,
            `Hatırlatıcı: "${taskTitle.trim()}" için zamanı geldi. 🌟`,
            `Seni güçlendirecek bir şey var: "${taskTitle.trim()}" 💪`,
          ];
          const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
          
          let reminderDateValue: string | undefined = undefined;
          let reminderType: 'today' | 'scheduled' = 'today';
          
          // Görev gelecek tarihli ise hatırlatıcı da gelecek tarihli olsun
          if (dueDate && dueDate > today) {
            reminderDateValue = dueDate;
            reminderType = 'scheduled';
          }
          
          // Hatırlatıcı sıklığı görev sıklığına göre belirle
          let reminderRepeatType: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';
          let reminderRepeatDays: number[] | undefined = undefined;
          
          // Görev tarihine göre haftanın gününü belirle
          const taskDateObj = new Date(dueDate || taskDateValue);
          const dayOfWeek = taskDateObj.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
          
          if (frequency === 'weekly') {
            reminderRepeatType = 'weekly';
            reminderRepeatDays = [dayOfWeek];
          } else if (frequency === 'monthly') {
            reminderRepeatType = 'monthly';
          } else if (frequency === 'daily') {
            reminderRepeatType = 'daily';
          } else {
            reminderRepeatType = 'once';
          }
          
          // Hatırlatıcıyı oluştur
          const reminder = await addReminder({
            title: trimmedTitle,
            description: randomMessage,
            time: dueTime || taskTime,
            date: reminderDateValue,
            emoji: '📝',
            isActive: true,
            category: 'work',
            priority: 'medium',
            repeatType: reminderRepeatType,
            repeatDays: reminderRepeatDays,
            reminderType: reminderType,
            linkedTaskId: newTask.id,
            isTaskReminder: true,
          });
          
          console.log('✅ Görev hatırlatıcısı oluşturuldu:', reminder);
          
          // Bildirim planla
          try {
            const { scheduleReminderNotification } = await import('../services/notificationService');
            await scheduleReminderNotification(
              reminder.id,
              reminder.emoji + ' ' + reminder.title,
              reminder.description || 'Görev zamanı!',
              reminder.time,
              reminder.repeatType,
              reminder.category,
              reminder.date,
              reminder.repeatDays
            );
            console.log('✅ Görev hatırlatıcı bildirimi planlandı');
          } catch (notifError) {
            console.error('Görev hatırlatıcı bildirimi planlanırken hata:', notifError);
            // Bildirim planlanamasa bile hatırlatıcı oluşturuldu
          }
        } catch (reminderError) {
          console.error('Görev hatırlatıcısı oluşturulurken hata:', reminderError);
          // Hatırlatıcı oluşturulamasa bile görev kaydedildi
        }
      }
      
      // Reset form
      setTaskTitle('');
      setTaskCategory('personal');
      setTaskFrequency('daily');
      setTaskEstimatedTime('15');
      setTaskDate(new Date().toISOString().split('T')[0]);
      setTaskTime('09:00');
      setTaskHasReminder(false);
      setShowAddTaskModal(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleSaveReminder = async () => {
    if (!reminderTitle.trim()) {
      console.log('Reminder title is empty');
      return;
    }
    
    // FocusMode açıksa önce kapat
    if (showFocusMode) {
      setShowFocusMode(false);
      // Kısa bir gecikme ile devam et (modal kapanma animasyonu için)
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Basit mantık: Günlük veya Tarih aralığı
    let reminderTypeValue: 'today' | 'scheduled' = 'today';
    let repeatType: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily';
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;
    
    if (reminderType === 'daily') {
      // Günlük hatırlatıcı - her gün aynı saatte
      reminderTypeValue = 'today';
      repeatType = 'daily';
      startDate = undefined; // Başlangıç yok, sürekli
      endDate = undefined; // Bitiş yok, sürekli
    } else if (reminderType === 'dateRange') {
      // Tarih aralığı hatırlatıcı - başlangıç ve bitiş tarihi arasında her gün
      if (!reminderStartDate || !reminderEndDate) {
        console.error('Başlangıç ve bitiş tarihi gerekli');
        return;
      }
      if (reminderEndDate < reminderStartDate) {
        console.error('Bitiş tarihi başlangıç tarihinden önce olamaz');
        return;
      }
      
      reminderTypeValue = reminderStartDate > today ? 'scheduled' : 'today';
      repeatType = 'daily';
      startDate = reminderStartDate;
      endDate = reminderEndDate;
    }
    
    console.log('Saving reminder:', {
      title: reminderTitle.trim(),
      time: reminderTime,
      reminderType: reminderType,
      startDate: startDate,
      endDate: endDate,
      repeatType: repeatType,
    });
    
    try {
      const newReminder = await addReminder({
        title: reminderTitle.trim(),
        time: reminderTime,
        date: startDate, // Başlangıç tarihi (tarih aralığı için)
        emoji: '🔔',
        isActive: true,
        category: 'general',
        priority: 'medium',
        repeatType: repeatType,
        reminderType: reminderTypeValue,
        // Tarih aralığı için bitiş tarihini description'a veya custom field'a kaydedebiliriz
        description: endDate ? `Bitiş: ${endDate}` : undefined,
      });
      
      console.log('Reminder saved successfully:', newReminder);
      
      // Bildirim planla (sadece aktifse)
      if (newReminder.isActive) {
        try {
          const { scheduleReminderNotification } = await import('../services/notificationService');
          await scheduleReminderNotification(
            newReminder.id,
            newReminder.emoji + ' ' + newReminder.title,
            newReminder.description || 'Hatırlatıcı zamanı!',
            newReminder.time,
            newReminder.repeatType,
            newReminder.category,
            newReminder.date,
            newReminder.repeatDays
          );
          console.log('✅ Reminder notification scheduled');
        } catch (notifError) {
          console.error('Error scheduling reminder notification:', notifError);
          // Bildirim planlanamasa bile hatırlatıcı kaydedildi
        }
      }
      
      // Reset form
      setReminderTitle('');
      setReminderType('daily');
      setReminderTime('09:00');
      setReminderStartDate(new Date().toISOString().split('T')[0]);
      setReminderEndDate(new Date().toISOString().split('T')[0]);
      setShowAddReminderModal(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding reminder:', error);
      // Hata durumunda modal'ı kapatma, kullanıcı tekrar deneyebilsin
    }
  };

  // Memoize getFilteredTasks function to prevent recreation on every render
  const getFilteredTasks = useCallback(() => {
    switch (activeTab) {
      case 'daily':
        return todayTasks;
      case 'weekly':
        // Haftalık görevler - bu hafta içindeki görevler
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
      case 'monthly':
        // Aylık görevler - bu ay içindeki görevler
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });
      case 'future':
        // Gelecek görevler - date veya dueDate alanı bugünden sonra olan ve tamamlanmamış görevler
        const todayStr = new Date().toISOString().split('T')[0];
        return tasks.filter(task => {
          const taskDate = task.dueDate || task.date || task.createdAt?.split('T')[0] || '';
          return taskDate > todayStr && !task.isCompleted;
        });
      case 'all':
        return tasks;
      default:
        return todayTasks;
    }
  }, [activeTab, tasks, todayTasks]);

  // Calculate work time (bugünkü toplam + aktif timer'ın geçen süresi) - MEMOIZED
  const getWorkTime = useCallback(() => {
    let displayTime = totalWorkTime; // Bugünkü toplam çalışma süresi
    
    // Eğer timer aktifse, geçen süreyi de ekle
    if (isActive && selectedDuration > 0) {
      const totalSeconds = selectedDuration * 60;
      const elapsedSeconds = totalSeconds - timeLeft;
      const elapsedMinutes = elapsedSeconds / 60;
      displayTime = totalWorkTime + elapsedMinutes;
    }
    
    // Formatı göster
    if (displayTime > 0) {
      if (displayTime < 1) {
        // 1 dakikadan az ise saniye olarak göster
        const seconds = Math.floor(displayTime * 60);
        return `${seconds}s`;
      } else {
        // 1 dakika ve üzeri ise dakika olarak göster
        const minutes = Math.floor(displayTime);
        const remainingSeconds = Math.floor((displayTime - minutes) * 60);
        if (remainingSeconds > 0) {
          return `${minutes}dk ${remainingSeconds}s`;
        } else {
          return `${minutes}dk`;
        }
      }
    }
    return '0dk';
  }, [totalWorkTime, isActive, selectedDuration, timeLeft]);

  // Get total focus time - MEMOIZED
  const getTotalFocusTime = useCallback(() => {
    if (totalFocusTime > 0) {
      if (totalFocusTime < 1) {
        // 1 dakikadan az ise saniye olarak göster
        const seconds = Math.floor(totalFocusTime * 60);
        return `${seconds}s`;
      } else {
        // 1 dakika ve üzeri ise dakika olarak göster
        const minutes = Math.floor(totalFocusTime);
        const remainingSeconds = Math.floor((totalFocusTime - minutes) * 60);
        if (remainingSeconds > 0) {
          return `${minutes}dk ${remainingSeconds}s`;
        } else {
          return `${minutes}dk`;
        }
      }
    }
    return '0s';
  }, [totalFocusTime]);

  // Memoize the computed work time and focus time values
  const workTimeDisplay = useMemo(() => getWorkTime(), [getWorkTime]);
  const focusTimeDisplay = useMemo(() => getTotalFocusTime(), [getTotalFocusTime]);

  // Memoize filtered tasks to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    return getFilteredTasks();
  }, [getFilteredTasks]); // Depend on the memoized function instead of individual values
  
  const pendingTasks = useMemo(() => {
    return filteredTasks.filter(task => !task.isCompleted);
  }, [filteredTasks]);
  
  const completedTasks = useMemo(() => {
    return filteredTasks.filter(task => task.isCompleted);
  }, [filteredTasks]);

  // CRITICAL FIX: Memoize StyleSheet.create to prevent recreation on every render
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    scrollContent: {
      paddingBottom: 100,
    },
    
    // Gün Özeti Kartı
    summaryCard: {
      margin: 20,
      borderRadius: 20,
      padding: 24,
      backgroundColor: currentTheme.colors.card,
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 8,
    },
    summaryTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 20,
      fontFamily: 'Poppins_700Bold',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.primary,
      fontFamily: 'Poppins_700Bold',
    },
    statLabel: {
      fontSize: 14,
      color: currentTheme.colors.muted,
      marginTop: 4,
      fontFamily: 'Poppins_400Regular',
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.background,
      fontFamily: 'Poppins_700Bold',
    },

    // Görevler Bölümü
    tasksSection: {
      margin: 20,
      marginTop: 0,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
      fontFamily: 'Poppins_700Bold',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 3,
      paddingHorizontal: 2,
      marginBottom: 20,
      alignItems: 'center',
    },
    tab: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      minWidth: 0,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_500Medium',
      textAlign: 'center',
    },
    activeTabText: {
      color: currentTheme.colors.background,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    taskCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    taskEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
      fontFamily: 'Poppins_600SemiBold',
    },
    taskDetails: {
      fontSize: 14,
      color: currentTheme.colors.muted,
      fontFamily: 'Poppins_400Regular',
    },
    taskTime: {
      fontSize: 12,
      color: currentTheme.colors.muted,
      marginTop: 4,
      fontFamily: 'Poppins_400Regular',
    },
    completeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      height: 6,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 3,
      marginTop: 16,
    },

    // Hatırlatıcılar Bölümü
    remindersSection: {
      margin: 20,
      marginTop: 0,
    },
    remindersHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    toggleButton: {
      padding: 8,
    },
    reminderCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    reminderEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    reminderContent: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_600SemiBold',
    },
    reminderTime: {
      fontSize: 12,
      color: currentTheme.colors.muted,
      marginTop: 2,
      fontFamily: 'Poppins_400Regular',
    },

    // Empty States
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      fontFamily: 'Poppins_600SemiBold',
    },
    emptyMessage: {
      fontSize: 14,
      color: currentTheme.colors.muted,
      textAlign: 'center',
      fontFamily: 'Poppins_400Regular',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      width: '95%',
      maxHeight: '85%',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: 'Poppins_700Bold',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      fontFamily: 'Poppins_600SemiBold',
    },
    textInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      fontFamily: 'Poppins_400Regular',
    },
    frequencyContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    frequencyButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      backgroundColor: 'transparent',
      minHeight: 60,
    },
    frequencyButtonActive: {
      backgroundColor: currentTheme.colors.primary + '15',
      borderColor: currentTheme.colors.primary,
    },
    frequencyButtonText: {
      fontSize: 11,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_500Medium',
      textAlign: 'center',
      lineHeight: 14,
      marginTop: 4,
    },
    frequencyButtonTextActive: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    frequencyButtonEmoji: {
      fontSize: 20,
      marginBottom: 2,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
    },
    modalButtonSecondary: {
      backgroundColor: 'transparent',
      borderColor: currentTheme.colors.border,
    },
    modalButtonPrimary: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    modalButtonText: {
      fontSize: 15,
      fontWeight: '500',
      fontFamily: 'Poppins_500Medium',
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.text,
    },
    modalButtonTextPrimary: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    floatingTimerButton: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: currentTheme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      zIndex: 1000,
      borderWidth: 3,
      borderColor: currentTheme.colors.background,
    },
    timerButtonContent: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerDisplay: {
      position: 'relative',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerText: {
      fontSize: 10,
      fontWeight: '700',
      color: currentTheme.colors.background,
      fontFamily: 'Poppins_700Bold',
      zIndex: 2,
    },
    progressRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressFill: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: currentTheme.colors.background,
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      transform: [{ rotate: '-90deg' }],
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginTop: 20,
      marginBottom: 12,
      marginLeft: 4,
      fontFamily: 'Poppins_600SemiBold',
    },
    completedTaskCard: {
      opacity: 0.8,
      backgroundColor: currentTheme.colors.card + '60',
    },
    completedTaskTitle: {
      textDecorationLine: 'line-through',
      color: currentTheme.colors.secondary,
    },
    completedTaskDetails: {
      color: currentTheme.colors.secondary,
    },
    completedTaskTime: {
      color: currentTheme.colors.secondary,
    },
    completedButton: {
      backgroundColor: currentTheme.colors.success || '#4CAF50',
    },
  }), [currentTheme]); // Memoize styles based on theme

  // Loading timeout - eğer 5 saniye içinde loading false olmazsa force false yap
  useEffect(() => {
    if (tasksLoading || remindersLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ TasksAndRemindersScreen: Loading timeout (5 saniye), force false yapılıyor');
        // Loading state'ini force false yapamayız çünkü hook'tan geliyor
        // Ama en azından log'layalım
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [tasksLoading, remindersLoading]);

  // Debug: Loading state'ini log'la
  useEffect(() => {
    console.log('🔄 TasksAndRemindersScreen: Loading state - tasks:', tasksLoading, 'reminders:', remindersLoading);
  }, [tasksLoading, remindersLoading]);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={{ width: 24 }} />
        <Text style={dynamicStyles.headerTitle}>
          {t('tasks.tasksAndReminders')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={dynamicStyles.container} 
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gün Özeti Kartı */}
        <View style={dynamicStyles.summaryCard}>
          <Text style={dynamicStyles.summaryTitle}>
            🎯 {t('dashboard.today')}
          </Text>
          
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>{completedCount}/{todayTasks.length}</Text>
              <Text style={dynamicStyles.statLabel}>
                {t('navigation.tasks')}
              </Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>{focusTimeDisplay}</Text>
              <Text style={dynamicStyles.statLabel}>
                {t('health.focus')}
              </Text>
            </View>
          </View>

          <View style={dynamicStyles.buttonsRow}>
            <TouchableOpacity 
              style={[dynamicStyles.actionButton, { backgroundColor: currentTheme.colors.primary }]}
              onPress={handleAddTask}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>
                + {t('tasks.addTask')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
              onPress={handleAddReminder}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>+ {t('reminders.addReminder')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Görevler Bölümü */}
        <View style={dynamicStyles.tasksSection}>
          <Text style={dynamicStyles.sectionTitle}>
            📋 {t('navigation.tasks')}
          </Text>
          
          <View style={dynamicStyles.tabContainer}>
            {[
              { key: 'daily', label: t('tasks.daily'), emoji: '📅' },
              { key: 'weekly', label: t('tasks.weekly'), emoji: '📆' },
              { key: 'monthly', label: t('tasks.monthly'), emoji: '🗓️' },
              { key: 'future', label: t('tasks.future'), emoji: '🎯' },
              { key: 'all', label: t('tasks.all'), emoji: '' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[dynamicStyles.tab, activeTab === tab.key && dynamicStyles.activeTab]}
                onPress={() => handleTabChange(tab.key as any)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    dynamicStyles.tabText, 
                    activeTab === tab.key && dynamicStyles.activeTabText
                  ]} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {tab.emoji ? `${tab.emoji} ` : ''}{tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredTasks.length === 0 ? (
              <View style={dynamicStyles.emptyState}>
                <Text style={dynamicStyles.emptyIcon}>📝</Text>
                <Text style={dynamicStyles.emptyTitle}>
                  {t('tasks.noTasks')}
                </Text>
                <Text style={dynamicStyles.emptyMessage}>
                  {t('tasks.addFirstTask')}
                </Text>
              </View>
            ) : (
              <>
                {/* Bekleyen Görevler */}
                {pendingTasks.filter(t => t.title && t.title.trim().length > 0).length > 0 && (
                  <View>
                    <Text style={dynamicStyles.subsectionTitle}>🔄 Bekleyen Görevler</Text>
                    {pendingTasks.filter(t => t.title && t.title.trim().length > 0).map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={[
                          dynamicStyles.taskCard,
                          selectedTaskId === task.id && {
                            borderWidth: 3,
                            borderColor: currentTheme.colors.primary,
                            backgroundColor: currentTheme.colors.primary + '15',
                            shadowColor: currentTheme.colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6,
                          }
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          const newSelectedId = selectedTaskId === task.id ? null : task.id;
                          setSelectedTaskId(newSelectedId);
                          console.log('📌 Görev seçildi:', newSelectedId ? task.title : 'Seçim kaldırıldı');
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={dynamicStyles.taskLeft}>
                          <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                          <View style={dynamicStyles.taskContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={dynamicStyles.taskTitle}>
                                {task.title?.trim() || 'İsimsiz Görev'}
                              </Text>
                              {selectedTaskId === task.id && (
                                <View style={{
                                  backgroundColor: currentTheme.colors.primary,
                                  borderRadius: 10,
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                }}>
                                  <Text style={{
                                    color: currentTheme.colors.background,
                                    fontSize: 10,
                                    fontWeight: '700',
                                  }}>
                                    🎯
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={dynamicStyles.taskDetails}>
                              {task.category} • {task.estimatedTime || '15 dk'}
                            </Text>
                            <Text style={dynamicStyles.taskTime}>⏰ {task.estimatedTime || '08:00'}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={dynamicStyles.completeButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleTaskComplete(task.id);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="checkmark" size={20} color={currentTheme.colors.background} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Tamamlanan Görevler */}
                {completedTasks.filter(t => t.title && t.title.trim().length > 0).length > 0 && (
                  <View>
                    <Text style={dynamicStyles.subsectionTitle}>✅ {t('settings.completedTasks')}</Text>
                    {completedTasks.filter(t => t.title && t.title.trim().length > 0).map((task) => (
                      <View key={task.id} style={[dynamicStyles.taskCard, dynamicStyles.completedTaskCard]}>
                        <View style={dynamicStyles.taskLeft}>
                          <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                          <View style={dynamicStyles.taskContent}>
                            <Text style={[dynamicStyles.taskTitle, dynamicStyles.completedTaskTitle]}>
                              {task.title?.trim() || 'İsimsiz Görev'}
                            </Text>
                            <Text style={[dynamicStyles.taskDetails, dynamicStyles.completedTaskDetails]}>
                              {task.category} • {task.estimatedTime || '15 dk'}
                            </Text>
                            <Text style={[dynamicStyles.taskTime, dynamicStyles.completedTaskTime]}>⏰ {task.estimatedTime || '08:00'}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[dynamicStyles.completeButton, dynamicStyles.completedButton]}
                          onPress={() => handleTaskComplete(task.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="checkmark" size={20} color={currentTheme.colors.background} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

              </>
            )}
          </Animated.View>
        </View>

        {/* Hatırlatıcılar Bölümü */}
        <View style={dynamicStyles.remindersSection}>
          <View style={dynamicStyles.remindersHeader}>
            <Text style={dynamicStyles.sectionTitle}>🔔 {t('reminders.reminders')}</Text>
            <TouchableOpacity
              style={dynamicStyles.toggleButton}
              onPress={() => setShowReminders(!showReminders)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showReminders ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={currentTheme.colors.muted} 
              />
            </TouchableOpacity>
          </View>

          {showReminders && (
            <Animated.View>
              {upcomingReminders.length === 0 ? (
                <View style={dynamicStyles.emptyState}>
                  <Text style={dynamicStyles.emptyIcon}>🔔</Text>
                  <Text style={dynamicStyles.emptyTitle}>{t('reminders.noReminders')}</Text>
                  <Text style={dynamicStyles.emptyMessage}>{t('reminders.addFirstReminder')}</Text>
                </View>
              ) : (
                upcomingReminders.slice(0, 3).map((reminder) => (
                  <View key={reminder.id} style={dynamicStyles.reminderCard}>
                    <Text style={dynamicStyles.reminderEmoji}>{reminder.emoji || '🔔'}</Text>
                    <View style={dynamicStyles.reminderContent}>
                      <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                      <Text style={dynamicStyles.reminderTime}>
                        {reminder.time || '15 dk kaldı'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Animated.View>
          )}
        </View>

      </ScrollView>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal && !showFocusMode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>📝 {t('tasks.addTask')}</Text>
            
            <ScrollView
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('tasks.taskTitle')}</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder={t('tasks.enterTaskTitle')}
                placeholderTextColor={currentTheme.colors.muted}
                autoCorrect={false}
                autoCapitalize="sentences"
                textContentType="none"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('tasks.duration')}</Text>
              <Text style={{ fontSize: 12, color: currentTheme.colors.muted, marginBottom: 4 }}>
                Görevi tamamlamak için tahmini süre (dakika)
              </Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskEstimatedTime}
                onChangeText={setTaskEstimatedTime}
                placeholder="15"
                placeholderTextColor={currentTheme.colors.muted}
                keyboardType="numeric"
                autoCorrect={false}
                textContentType="none"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('tasks.dueDate')}</Text>
              <Text style={{ fontSize: 12, color: currentTheme.colors.muted, marginBottom: 4 }}>
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  return taskDate > today 
                    ? 'Gelecek tarih seçtiniz → Tek seferlik görev olacak' 
                    : 'Bugün veya geçmiş tarih → Sıklık seçebilirsiniz';
                })()}
              </Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskDate}
                onChangeText={setTaskDate}
                placeholder={t('tasks.dateFormatPlaceholder')}
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('tasks.dueTime')}</Text>
              <Text style={{ fontSize: 12, color: currentTheme.colors.muted, marginBottom: 4 }}>
                {t('tasks.dueTimeDescription')}
              </Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskTime}
                onChangeText={setTaskTime}
                placeholder="09:00"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            {/* Sıklık seçimi - sadece bugün/geçmiş tarih için aktif */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              return taskDate <= today;
            })() && (
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t('tasks.frequency')}</Text>
                <Text style={{ fontSize: 12, color: currentTheme.colors.muted, marginBottom: 8 }}>
                  Görev ne sıklıkla tekrarlansın?
                </Text>
                <View style={dynamicStyles.frequencyContainer}>
                  {[
                    { key: 'daily', label: t('tasks.daily'), emoji: '📅', description: 'Her gün' },
                    { key: 'weekly', label: t('tasks.weekly'), emoji: '📆', description: 'Her hafta' },
                    { key: 'monthly', label: t('tasks.monthly'), emoji: '🗓️', description: 'Her ay' },
                  ].map((freq) => (
                    <TouchableOpacity
                      key={freq.key}
                      style={[
                        dynamicStyles.frequencyButton,
                        taskFrequency === freq.key && dynamicStyles.frequencyButtonActive
                      ]}
                      onPress={() => setTaskFrequency(freq.key as any)}
                    >
                      <Text style={dynamicStyles.frequencyButtonEmoji}>
                        {freq.emoji}
                      </Text>
                      <Text style={[
                        dynamicStyles.frequencyButtonText,
                        taskFrequency === freq.key && dynamicStyles.frequencyButtonTextActive
                      ]}>
                        {freq.label}
                      </Text>
                      <Text style={{
                        fontSize: 10,
                        color: currentTheme.colors.muted,
                        marginTop: 2,
                        opacity: taskFrequency === freq.key ? 1 : 0.6
                      }}>
                        {freq.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Gelecek tarih uyarısı */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              return taskDate > today;
            })() && (
              <View style={{
                backgroundColor: currentTheme.colors.primary + '15',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                borderLeftWidth: 3,
                borderLeftColor: currentTheme.colors.primary,
              }}>
                <Text style={{
                  color: currentTheme.colors.primary,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  ℹ️ Gelecek tarih seçtiniz
                </Text>
                <Text style={{
                  color: currentTheme.colors.muted,
                  fontSize: 12,
                  marginTop: 4,
                }}>
                  Bu görev tek seferlik olacak (sadece seçilen tarihte)
                </Text>
              </View>
            )}

            {/* Hatırlatıcı Ekle Toggle */}
            <View style={dynamicStyles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={dynamicStyles.inputLabel}>Hatırlatıcı Ekle</Text>
                  <Text style={{ fontSize: 12, color: currentTheme.colors.muted, marginTop: 4 }}>
                    Görev için otomatik hatırlatıcı oluştur
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: taskHasReminder ? currentTheme.colors.primary : currentTheme.colors.border,
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                  }}
                  onPress={() => {
                    setTaskHasReminder(!taskHasReminder);
                    Animated.spring(toggleAnim, {
                      toValue: !taskHasReminder ? 1 : 0,
                      useNativeDriver: true,
                      tension: 150,
                      friction: 8,
                    }).start();
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: 'white',
                      transform: [
                        {
                          translateX: toggleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 20],
                          }),
                        },
                      ],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            </ScrollView>
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleSaveTask}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddReminderModal && !showFocusMode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddReminderModal(false)}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>🔔 {t('reminders.addReminder')}</Text>
            
            <ScrollView
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('reminders.reminderTitle')}</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={reminderTitle}
                onChangeText={setReminderTitle}
                placeholder={t('reminders.reminderTitle')}
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Hatırlatıcı Tipi</Text>
              <View style={dynamicStyles.frequencyContainer}>
                {[
                  { key: 'daily', label: 'Günlük', emoji: '📅', description: 'Her gün aynı saatte' },
                  { key: 'dateRange', label: 'Tarih Aralığı', emoji: '📆', description: 'İki tarih arasında her gün' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      dynamicStyles.frequencyButton,
                      reminderType === type.key && dynamicStyles.frequencyButtonActive
                    ]}
                    onPress={() => setReminderType(type.key as any)}
                  >
                    <Text style={dynamicStyles.frequencyButtonEmoji}>
                      {type.emoji}
                    </Text>
                    <Text style={[
                      dynamicStyles.frequencyButtonText,
                      reminderType === type.key && dynamicStyles.frequencyButtonTextActive
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={[
                      dynamicStyles.frequencyButtonText,
                      { fontSize: 9, marginTop: 2, opacity: 0.7 }
                    ]}>
                      {type.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('reminders.reminderTime')}</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            {reminderType === 'dateRange' && (
              <>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.inputLabel}>Başlangıç Tarihi</Text>
                  <TextInput
                    style={dynamicStyles.textInput}
                    value={reminderStartDate}
                    onChangeText={setReminderStartDate}
                    placeholder={t('tasks.dateFormatPlaceholder')}
                    placeholderTextColor={currentTheme.colors.muted}
                  />
                </View>

                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.inputLabel}>Bitiş Tarihi</Text>
                  <TextInput
                    style={dynamicStyles.textInput}
                    value={reminderEndDate}
                    onChangeText={setReminderEndDate}
                    placeholder={t('tasks.dateFormatPlaceholder')}
                    placeholderTextColor={currentTheme.colors.muted}
                  />
                </View>
              </>
            )}
            </ScrollView>
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowAddReminderModal(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleSaveReminder}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Timer Button - Only on Tasks Screen */}
      <TouchableOpacity
        style={dynamicStyles.floatingTimerButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (selectedTaskId) {
            const selectedTask = tasks.find(t => t.id === selectedTaskId);
            console.log('🎯 Pomodoro başlatılıyor, seçili görev:', selectedTask?.title);
          } else {
            console.log('⏰ Pomodoro başlatılıyor (görev seçili değil)');
          }
          setShowFocusMode(true);
        }}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            dynamicStyles.timerButtonContent,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {isActive ? (
            <View style={dynamicStyles.timerDisplay}>
              <Text style={dynamicStyles.timerText}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Text>
              <View style={dynamicStyles.progressRing}>
                <Animated.View
                  style={[
                    dynamicStyles.progressFill,
                    {
                      transform: [
                        {
                          rotate: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <Ionicons 
              name="timer-outline" 
              size={24} 
              color={currentTheme.colors.background} 
            />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Focus Mode Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFocusMode}
        onRequestClose={() => {
          setShowFocusMode(false);
          setSelectedTaskId(null);
        }}
        presentationStyle="overFullScreen"
      >
        <FocusMode
          visible={showFocusMode}
          onClose={() => {
            setShowFocusMode(false);
            setSelectedTaskId(null);
          }}
          selectedTaskTitle={(() => {
            if (selectedTaskId) {
              const task = tasks.find(t => t.id === selectedTaskId);
              console.log('🔍 Seçili görev bulundu:', task?.title, 'ID:', selectedTaskId);
              return task?.title;
            }
            console.log('⚠️ Seçili görev yok');
            return undefined;
          })()}
        />
      </Modal>

      {/* App Tour */}
      {tour.currentStep && (
        <AppTour
          visible={tour.tourVisible}
          currentStep={tour.currentTourStep}
          totalSteps={tour.totalSteps}
          step={tour.currentStep}
          onNext={tour.handleNext}
          onSkip={tour.handleSkip}
          onComplete={tour.handleComplete}
        />
      )}
    </SafeAreaView>
  );
}
