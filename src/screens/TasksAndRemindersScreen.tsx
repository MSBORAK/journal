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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';

const { width: screenWidth } = Dimensions.get('window');

interface TasksAndRemindersScreenProps {
  navigation: any;
}

export default function TasksAndRemindersScreen({ navigation }: TasksAndRemindersScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
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
    getTodayReminders,
  } = useReminders(user?.uid);

  // State
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [showReminders, setShowReminders] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

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
    navigation.navigate('Tasks');
  };

  const handleAddReminder = () => {
    navigation.navigate('Reminders');
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'daily':
        return todayTasks;
      case 'weekly':
        // TODO: Implement weekly tasks
        return [];
      case 'monthly':
        // TODO: Implement monthly tasks
        return [];
      case 'all':
        return tasks;
      default:
        return todayTasks;
    }
  };

  const filteredTasks = getFilteredTasks();

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
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
      fontFamily: 'Poppins_600SemiBold',
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
      color: currentTheme.colors.muted,
      fontFamily: 'Poppins_500Medium',
    },
    activeTabText: {
      color: 'white',
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
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    taskLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
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
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.success,
      borderRadius: 3,
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
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={{ width: 24 }} />
        <Text style={dynamicStyles.headerTitle}>Görevler & Hatırlatıcılar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={dynamicStyles.container} 
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gün Özeti Kartı */}
        <View style={dynamicStyles.summaryCard}>
          <Text style={dynamicStyles.summaryTitle}>🎯 Bugün</Text>
          
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>Tamamlanan: {completedCount}/{todayTasks.length}</Text>
              <Text style={dynamicStyles.statLabel}>Görevler</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>Pomodoro: 2/4</Text>
              <Text style={dynamicStyles.statLabel}>Oturum</Text>
            </View>
            <View style={dynamicStyles.statItem}>
              <Text style={dynamicStyles.statNumber}>Toplam Süre: 2s 15dk</Text>
              <Text style={dynamicStyles.statLabel}>Çalışma</Text>
            </View>
          </View>

          <View style={dynamicStyles.buttonsRow}>
            <TouchableOpacity 
              style={dynamicStyles.actionButton}
              onPress={handleAddTask}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={dynamicStyles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={dynamicStyles.actionButtonText}>+ Görev Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={dynamicStyles.actionButton}
              onPress={handleAddReminder}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A90E2', '#357ABD']}
                style={dynamicStyles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={dynamicStyles.actionButtonText}>+ Hatırlatıcı Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Görevler Bölümü */}
        <View style={dynamicStyles.tasksSection}>
          <Text style={dynamicStyles.sectionTitle}>📋 Görevlerim</Text>
          
          <View style={dynamicStyles.tabContainer}>
            {[
              { key: 'daily', label: 'Günlük', emoji: '📅' },
              { key: 'weekly', label: 'Haftalık', emoji: '📆' },
              { key: 'monthly', label: 'Aylık', emoji: '🗓️' },
              { key: 'all', label: 'Tümü', emoji: '📝' },
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
                <Text style={dynamicStyles.emptyTitle}>Henüz görev yok</Text>
                <Text style={dynamicStyles.emptyMessage}>
                  {activeTab === 'daily' ? 'Bugün için görev ekleyin' : 
                   activeTab === 'weekly' ? 'Haftalık görevlerinizi planlayın' :
                   activeTab === 'monthly' ? 'Aylık hedeflerinizi belirleyin' :
                   'İlk görevinizi ekleyerek başlayın'}
                </Text>
              </View>
            ) : (
              <>
                {filteredTasks.map((task) => (
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
                      <Ionicons name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* İlerleme Barı */}
                <View style={dynamicStyles.progressBar}>
                  <View style={[dynamicStyles.progressFill, { width: `${completionRate}%` }]} />
                </View>
              </>
            )}
          </Animated.View>
        </View>

        {/* Hatırlatıcılar Bölümü */}
        <View style={dynamicStyles.remindersSection}>
          <View style={dynamicStyles.remindersHeader}>
            <Text style={dynamicStyles.sectionTitle}>🔔 Yaklaşan Hatırlatıcılar</Text>
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
                  <Text style={dynamicStyles.emptyTitle}>Henüz hatırlatıcı yok</Text>
                  <Text style={dynamicStyles.emptyMessage}>Hatırlatıcı ekleyerek başlayın</Text>
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
    </SafeAreaView>
  );
}
