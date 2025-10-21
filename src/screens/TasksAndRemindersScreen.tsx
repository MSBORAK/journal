import React, { useState, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';
import { useTimer } from '../contexts/TimerContext';
import FocusMode from '../components/FocusMode';

const { width: screenWidth } = Dimensions.get('window');

interface TasksAndRemindersScreenProps {
  navigation: any;
}

export default function TasksAndRemindersScreen({ navigation }: TasksAndRemindersScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
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
  } = useReminders(user?.uid);

  // State
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [showReminders, setShowReminders] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const { 
    setShowFocusMode, 
    showFocusMode, 
    isActive, 
    isPaused, 
    timeLeft, 
    selectedDuration,
    totalFocusTime,
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
  
  // Reminder form states
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);

  // Computed values
  const todayTasks = getTodayTasks();
  const completedCount = getTodayCompletedCount();
  const completionRate = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;
  const todayReminders = getTodayReminders();
  const upcomingReminders = reminders.filter(r => r.isActive);

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

  const handleTabChange = (tab: 'daily' | 'weekly' | 'monthly' | 'all') => {
    animateTabSwitch();
    setActiveTab(tab);
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
      await soundService.playSuccess();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // TODO: Add confetti animation
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleAddTask = () => {
    setShowAddTaskModal(true);
  };

  const handleAddReminder = () => {
    setShowAddReminderModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      console.log('Task title is empty');
      return;
    }
    
    console.log('Saving task:', {
      title: taskTitle.trim(),
      category: taskCategory,
      estimatedTime: parseInt(taskEstimatedTime),
      emoji: '📝',
      date: taskDate,
      priority: 'medium',
    });
    
    try {
      const newTask = await addTask({
        title: taskTitle.trim(),
        category: taskCategory as 'health' | 'personal' | 'work' | 'custom' | 'hobby',
        estimatedTime: parseInt(taskEstimatedTime),
        emoji: '📝',
        date: taskDate,
        priority: 'medium',
      });
      
      console.log('Task saved successfully:', newTask);
      
      // Reset form
      setTaskTitle('');
      setTaskCategory('personal');
      setTaskFrequency('daily');
      setTaskEstimatedTime('15');
      setTaskDate(new Date().toISOString().split('T')[0]);
      setTaskTime('09:00');
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
    
    console.log('Saving reminder:', {
      title: reminderTitle.trim(),
      frequency: reminderFrequency,
      time: reminderTime,
      date: reminderDate,
    });
    
    try {
      const newReminder = await addReminder({
        title: reminderTitle.trim(),
        time: reminderTime,
        date: reminderDate,
        emoji: '🔔',
        isActive: true,
        category: 'general',
        priority: 'medium',
        repeatType: 'once',
        reminderType: 'scheduled',
      });
      
      console.log('Reminder saved successfully:', newReminder);
      
      // Reset form
      setReminderTitle('');
      setReminderFrequency('daily');
      setReminderTime('09:00');
      setReminderDate(new Date().toISOString().split('T')[0]);
      setShowAddReminderModal(false);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const getFilteredTasks = () => {
    console.log('getFilteredTasks called with activeTab:', activeTab);
    console.log('Total tasks:', tasks.length);
    
    switch (activeTab) {
      case 'daily':
        console.log('Returning daily tasks:', todayTasks.length);
        return todayTasks;
      case 'weekly':
        // Haftalık görevler - bu hafta içindeki görevler
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const weeklyTasks = tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
        console.log('Returning weekly tasks:', weeklyTasks.length);
        return weeklyTasks;
      case 'monthly':
        // Aylık görevler - bu ay içindeki görevler
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTasks = tasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });
        console.log('Returning monthly tasks:', monthlyTasks.length);
        console.log('Monthly tasks:', monthlyTasks);
        return monthlyTasks;
      case 'all':
        console.log('Returning all tasks:', tasks.length);
        return tasks;
      default:
        console.log('Returning default daily tasks:', todayTasks.length);
        return todayTasks;
    }
  };

  // Calculate work time from timer
  const getWorkTime = () => {
    if (isActive && selectedDuration > 0) {
      const totalSeconds = selectedDuration * 60;
      const elapsedSeconds = totalSeconds - timeLeft;
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      
      if (minutes > 0) {
        return `${minutes}dk`;
      } else if (seconds > 0) {
        return `${seconds}s`;
      }
    }
    return '0dk';
  };

  // Get total focus time
  const getTotalFocusTime = () => {
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
  };

  const filteredTasks = getFilteredTasks();
  const pendingTasks = filteredTasks.filter(task => !task.isCompleted);
  const completedTasks = filteredTasks.filter(task => task.isCompleted);

  const dynamicStyles = StyleSheet.create({
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
      padding: 4,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_500Medium',
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
      color: currentTheme.colors.background,
    },
    floatingTimerButton: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: currentTheme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
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
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={{ width: 24 }} />
        <Text style={dynamicStyles.headerTitle}>
          {t('welcome') === 'Welcome' ? 'Tasks & Reminders' : 'Görevler & Hatırlatıcılar'}
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
            🎯 {t('welcome') === 'Welcome' ? 'Today' : 'Bugün'}
          </Text>
          
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>{completedCount}/{todayTasks.length}</Text>
              <Text style={dynamicStyles.statLabel}>
                {t('welcome') === 'Welcome' ? 'Tasks' : 'Görevler'}
              </Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>{getTotalFocusTime()}</Text>
              <Text style={dynamicStyles.statLabel}>
                {t('welcome') === 'Welcome' ? 'Focus' : 'Odaklanma'}
              </Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>{getWorkTime()}</Text>
              <Text style={dynamicStyles.statLabel}>
                {t('welcome') === 'Welcome' ? 'Work' : 'Çalışma'}
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
                + {t('welcome') === 'Welcome' ? 'Add Task' : 'Görev Ekle'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[dynamicStyles.actionButton, { backgroundColor: currentTheme.colors.accent }]}
              onPress={handleAddReminder}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>+ {t('welcome') === 'Welcome' ? 'Add Reminder' : 'Hatırlatıcı Ekle'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Görevler Bölümü */}
        <View style={dynamicStyles.tasksSection}>
          <Text style={dynamicStyles.sectionTitle}>
            📋 {t('welcome') === 'Welcome' ? 'My Tasks' : 'Görevlerim'}
          </Text>
          
          <View style={dynamicStyles.tabContainer}>
            {[
              { key: 'daily', label: t('welcome') === 'Welcome' ? 'Daily' : 'Günlük', emoji: '📅' },
              { key: 'weekly', label: t('welcome') === 'Welcome' ? 'Weekly' : 'Haftalık', emoji: '📆' },
              { key: 'monthly', label: t('welcome') === 'Welcome' ? 'Monthly' : 'Aylık', emoji: '🗓️' },
              { key: 'all', label: t('welcome') === 'Welcome' ? 'All' : 'Tümü', emoji: '📝' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[dynamicStyles.tab, activeTab === tab.key && dynamicStyles.activeTab]}
                onPress={() => handleTabChange(tab.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  dynamicStyles.tabText, 
                  activeTab === tab.key && dynamicStyles.activeTabText
                ]}>
                  {tab.emoji} {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredTasks.length === 0 ? (
              <View style={dynamicStyles.emptyState}>
                <Text style={dynamicStyles.emptyIcon}>📝</Text>
                <Text style={dynamicStyles.emptyTitle}>
                  {t('welcome') === 'Welcome' ? 'No tasks yet' : 'Henüz görev yok'}
                </Text>
                <Text style={dynamicStyles.emptyMessage}>
                  {t('welcome') === 'Welcome' 
                    ? (activeTab === 'daily' ? 'Add a task for today' : 
                       activeTab === 'weekly' ? 'Plan your weekly tasks' :
                       activeTab === 'monthly' ? 'Set your monthly goals' :
                       'Start by adding your first task')
                    : (activeTab === 'daily' ? 'Bugün için görev ekleyin' : 
                       activeTab === 'weekly' ? 'Haftalık görevlerinizi planlayın' :
                       activeTab === 'monthly' ? 'Aylık hedeflerinizi belirleyin' :
                       'İlk görevinizi ekleyerek başlayın')
                  }
                </Text>
              </View>
            ) : (
              <>
                {/* Bekleyen Görevler */}
                {pendingTasks.length > 0 && (
                  <View>
                    <Text style={dynamicStyles.subsectionTitle}>🔄 Bekleyen Görevler</Text>
                    {pendingTasks.map((task) => (
                      <View key={task.id} style={dynamicStyles.taskCard}>
                        <View style={dynamicStyles.taskLeft}>
                          <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                          <View style={dynamicStyles.taskContent}>
                            <Text style={dynamicStyles.taskTitle}>{task.title}</Text>
                            <Text style={dynamicStyles.taskDetails}>
                              {task.category} • {task.estimatedTime || '15 dk'}
                            </Text>
                            <Text style={dynamicStyles.taskTime}>⏰ {task.estimatedTime || '08:00'}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={dynamicStyles.completeButton}
                          onPress={() => handleTaskComplete(task.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="checkmark" size={20} color={currentTheme.colors.background} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Tamamlanan Görevler */}
                {completedTasks.length > 0 && (
                  <View>
                    <Text style={dynamicStyles.subsectionTitle}>✅ Tamamlanan Görevler</Text>
                    {completedTasks.map((task) => (
                      <View key={task.id} style={[dynamicStyles.taskCard, dynamicStyles.completedTaskCard]}>
                        <View style={dynamicStyles.taskLeft}>
                          <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                          <View style={dynamicStyles.taskContent}>
                            <Text style={[dynamicStyles.taskTitle, dynamicStyles.completedTaskTitle]}>{task.title}</Text>
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
            <Text style={dynamicStyles.sectionTitle}>🔔 {t('welcome') === 'Welcome' ? 'Upcoming Reminders' : 'Yaklaşan Hatırlatıcılar'}</Text>
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
                  <Text style={dynamicStyles.emptyTitle}>{t('welcome') === 'Welcome' ? 'No reminders yet' : 'Henüz hatırlatıcı yok'}</Text>
                  <Text style={dynamicStyles.emptyMessage}>{t('welcome') === 'Welcome' ? 'Start by adding a reminder' : 'Hatırlatıcı ekleyerek başlayın'}</Text>
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
        visible={showAddTaskModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>📝 {t('welcome') === 'Welcome' ? 'Add New Task' : 'Yeni Görev Ekle'}</Text>
            
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('welcome') === 'Welcome' ? 'Task Title' : 'Görev Başlığı'}</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder={t('welcome') === 'Welcome' ? 'Enter task title...' : 'Görev başlığını yazın...'}
                placeholderTextColor={currentTheme.colors.muted}
                autoCorrect={false}
                autoCapitalize="sentences"
                textContentType="none"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Süre (dakika)</Text>
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
              <Text style={dynamicStyles.inputLabel}>Tarih</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskDate}
                onChangeText={setTaskDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Saat</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={taskTime}
                onChangeText={setTaskTime}
                placeholder="09:00"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Sıklık</Text>
              <View style={dynamicStyles.frequencyContainer}>
                {[
                  { key: 'daily', label: t('welcome') === 'Welcome' ? 'Daily' : 'Günlük', emoji: '📅' },
                  { key: 'weekly', label: 'Haftalık', emoji: '📆' },
                  { key: 'monthly', label: 'Aylık', emoji: '🗓️' },
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
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowAddTaskModal(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleSaveTask}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddReminderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddReminderModal(false)}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>🔔 {t('welcome') === 'Welcome' ? 'Add New Reminder' : 'Yeni Hatırlatıcı Ekle'}</Text>
            
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>{t('welcome') === 'Welcome' ? 'Reminder Title' : 'Hatırlatıcı Başlığı'}</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={reminderTitle}
                onChangeText={setReminderTitle}
                placeholder={t('welcome') === 'Welcome' ? 'Enter reminder title...' : 'Hatırlatıcı başlığını yazın...'}
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Tarih</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={reminderDate}
                onChangeText={setReminderDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Saat</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                placeholderTextColor={currentTheme.colors.muted}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.inputLabel}>Sıklık</Text>
              <View style={dynamicStyles.frequencyContainer}>
                {[
                  { key: 'daily', label: t('welcome') === 'Welcome' ? 'Daily' : 'Günlük', emoji: '📅' },
                  { key: 'weekly', label: 'Haftalık', emoji: '📆' },
                  { key: 'monthly', label: 'Aylık', emoji: '🗓️' },
                ].map((freq) => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      dynamicStyles.frequencyButton,
                      reminderFrequency === freq.key && dynamicStyles.frequencyButtonActive
                    ]}
                    onPress={() => setReminderFrequency(freq.key as any)}
                  >
                    <Text style={dynamicStyles.frequencyButtonEmoji}>
                      {freq.emoji}
                    </Text>
                    <Text style={[
                      dynamicStyles.frequencyButtonText,
                      reminderFrequency === freq.key && dynamicStyles.frequencyButtonTextActive
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowAddReminderModal(false)}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleSaveReminder}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  Kaydet
                </Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Timer Button - Only on Tasks Screen */}
      <TouchableOpacity
        style={dynamicStyles.floatingTimerButton}
        onPress={() => setShowFocusMode(true)}
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
        onRequestClose={() => setShowFocusMode(false)}
        presentationStyle="overFullScreen"
      >
        <FocusMode
          visible={showFocusMode}
          onClose={() => setShowFocusMode(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}
