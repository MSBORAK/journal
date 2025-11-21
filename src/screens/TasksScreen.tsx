import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTasks } from '../hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import { DailyTask } from '../types';
import { recordUserActivity } from '../services/userActivityService';
import { scheduleTaskReminder } from '../services/motivationNotificationService';
import { CustomAlert } from '../components/CustomAlert';
import PomodoroTimer from '../components/PomodoroTimer';
import { getButtonTextColor } from '../utils/colorUtils';

interface TasksScreenProps {
  navigation: any;
}

export default function TasksScreen({ navigation }: TasksScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { 
    tasks,
    categories,
    loading, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion,
    getTodayTasks,
    getTodayCompletedCount,
    getTodayCompletionRate,
    getTaskStreak,
    getCategoryById
  } = useTasks(user?.uid);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'future'>('daily');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '📝',
    category: 'personal' as DailyTask['category'],
    priority: 'medium' as DailyTask['priority'],
    estimatedTime: '',
    taskType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'future',
    selectedDate: '',
    selectedWeek: '',
    selectedMonth: '',
  });

  const emojiOptions = ['📝', '🏥', '💧', '🏃‍♀️', '📚', '🍎', '😴', '🎯', '💝', '⚡', '🌱', '💼'];
  const priorityOptions = [
    { value: 'low', label: t('common.low'), color: currentTheme.colors.success },
    { value: 'medium', label: t('common.medium'), color: currentTheme.colors.primary },
    { value: 'high', label: t('common.high'), color: currentTheme.colors.danger },
  ];

  const todayTasks = getTodayTasks();
  const completedCount = getTodayCompletedCount();
  const completionRate = getTodayCompletionRate();
  const streak = getTaskStreak();

  // Debug: Task state değişikliklerini logla
  useEffect(() => {
    console.log('TasksScreen - Tasks updated:', {
      totalTasks: todayTasks.length,
      completedCount: completedCount,
      completionRate: completionRate,
      tasks: todayTasks.map(t => ({ id: t.id, title: t.title, isCompleted: t.isCompleted }))
    });
  }, [todayTasks, completedCount, completionRate]);

  // Get tasks filtered by activeTab (daily, weekly, monthly, future)
  const getFilteredTasksByTab = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today);
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - todayDate.getDay()); // Pazar günü
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEnd = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    let tabFilteredTasks = tasks;
    
    switch (activeTab) {
      case 'daily':
        // Bugünün görevleri - date alanı bugün olan görevler
        tabFilteredTasks = tasks.filter(task => task.date === today);
        break;
      case 'weekly':
        // Bu haftanın görevleri - date alanı bu hafta içinde olan görevler
        tabFilteredTasks = tasks.filter(task => {
          const taskDate = task.date || task.createdAt?.split('T')[0] || '';
          return taskDate >= weekStartStr && taskDate <= weekEndStr;
        });
        break;
      case 'monthly':
        // Bu ayın görevleri - date alanı bu ay içinde olan görevler
        tabFilteredTasks = tasks.filter(task => {
          const taskDate = task.date || task.createdAt?.split('T')[0] || '';
          return taskDate >= monthStartStr && taskDate <= monthEndStr;
        });
        break;
      case 'future':
        // Gelecek görevler - date veya dueDate alanı bugünden sonra olan ve tamamlanmamış görevler
        tabFilteredTasks = tasks.filter(task => {
          const taskDate = task.dueDate || task.date || task.createdAt?.split('T')[0] || '';
          return taskDate > today && !task.isCompleted;
        });
        break;
      default:
        tabFilteredTasks = tasks.filter(task => task.date === today);
    }
    
    return tabFilteredTasks;
  };

  const tabFilteredTasks = getFilteredTasksByTab();
  const filteredTasks = selectedCategory === 'all' 
    ? tabFilteredTasks 
    : tabFilteredTasks.filter(task => task.category === selectedCategory);

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
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    addButton: {
      backgroundColor: currentTheme.colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginVertical: 10,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: currentTheme.colors.muted,
      textAlign: 'center',
    },
    activeTabText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontWeight: '600',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 4,
    },
    progressCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    progressBar: {
      height: 12,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 6,
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 6,
    },
    progressText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    streakIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    streakText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '500',
    },
    categoryFilter: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    categoryCard: {
      flex: 1,
      minWidth: 80,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    selectedCategoryCard: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary,
      shadowColor: currentTheme.colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      transform: [{ scale: 1.05 }],
    },
    categoryIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.text,
      textAlign: 'center',
    },
    selectedCategoryName: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    categoryCount: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    selectedCategoryCount: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    tasksList: {
      paddingHorizontal: 20,
    },
    taskCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
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
    },
    taskCompleted: {
      textDecorationLine: 'line-through',
      color: currentTheme.colors.secondary,
    },
    taskDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    taskCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskCheckboxCompleted: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    taskCategory: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginLeft: 4,
    },
    priorityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    priorityIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    taskActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    closeButton: {
      padding: 8,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    emojiButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    selectedEmojiButton: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    selectedOptionButton: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: currentTheme.colors.text,
    },
    selectedOptionText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButton: {
      flex: 1,
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.colors.text,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      emoji: '📝',
      category: 'personal',
      priority: 'medium',
      estimatedTime: '',
      taskType: 'daily',
      selectedDate: '',
      selectedWeek: '',
      selectedMonth: '',
    });
    setEditingTask(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showAlert(t('common.error'), t('tasks.titleCannotBeEmpty'), 'error');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Determine the task date based on taskType and selectedDate
      let taskDate = today; // Default to today
      let dueDate: string | undefined = undefined;
      let dueTime: string | undefined = undefined;
      let frequency: 'daily' | 'weekly' | 'monthly' | 'once' = 'once';

      if (formData.taskType === 'future' && formData.selectedDate) {
        // Future task - use selectedDate as dueDate
        dueDate = formData.selectedDate;
        taskDate = formData.selectedDate;
        if (formData.selectedWeek) {
          // If there's a selected time, parse it
          const [hours, minutes] = formData.selectedWeek.split(':');
          if (hours && minutes) {
            dueTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          }
        }
      } else if (formData.taskType === 'weekly' && formData.selectedWeek) {
        // Weekly task - use selectedWeek as the start of the week
        // For weekly, we'll use today's date but mark frequency as weekly
        frequency = 'weekly';
        taskDate = today;
      } else if (formData.taskType === 'monthly' && formData.selectedMonth) {
        // Monthly task - use selectedMonth
        frequency = 'monthly';
        taskDate = today;
      } else if (formData.taskType === 'daily') {
        // Daily task
        frequency = 'daily';
        taskDate = today;
      }

      const taskData = {
        ...formData,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
        date: taskDate,
        frequency: frequency,
        dueDate: dueDate,
        dueTime: dueTime,
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
        // Yeni görev eklendiğinde hatırlatıcı zamanla
        await recordUserActivity('task_created');
        await scheduleTaskReminder();
        console.log('✅ Görev eklendi ve hatırlatıcı zamanlandı!');
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      showAlert(t('common.error'), t('tasks.taskNotSaved'), 'error');
    }
  };

  const handleEdit = (task: DailyTask) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      emoji: task.emoji,
      category: task.category,
      priority: task.priority,
      estimatedTime: task.estimatedTime?.toString() || '',
      taskType: 'daily',
      selectedDate: '',
      selectedWeek: '',
      selectedMonth: '',
    });
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleDelete = (taskId: string) => {
    showAlert(
      t('tasks.deleteTask'),
      t('tasks.confirmDeleteTask'),
      'warning'
    );
  };

  const getCategoryLabel = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryEmoji = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category ? category.emoji : '⭐';
  };

  const getPriorityColor = (priority: DailyTask['priority']) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : currentTheme.colors.muted;
  };


  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Görevler</Text>
        <TouchableOpacity 
          style={dynamicStyles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={currentTheme.colors.background} />
        </TouchableOpacity>
      </View>


      {/* Tab Navigation */}
      <View style={dynamicStyles.tabContainer}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'daily' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'daily' && dynamicStyles.activeTabText]}>
            📅 Günlük
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'weekly' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'weekly' && dynamicStyles.activeTabText]}>
            📆 Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'monthly' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'monthly' && dynamicStyles.activeTabText]}>
            🗓️ Aylık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'future' && dynamicStyles.activeTab]}
          onPress={() => setActiveTab('future')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'future' && dynamicStyles.activeTabText]}>
            🎯 Gelecek
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{tabFilteredTasks.length}</Text>
          <Text style={dynamicStyles.statLabel}>Toplam</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>
            {tabFilteredTasks.filter(t => t.isCompleted).length}
          </Text>
          <Text style={dynamicStyles.statLabel}>Tamamlanan</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>
            {tabFilteredTasks.length > 0 
              ? Math.round((tabFilteredTasks.filter(t => t.isCompleted).length / tabFilteredTasks.length) * 100)
              : 0}%
          </Text>
          <Text style={dynamicStyles.statLabel}>Oran</Text>
        </View>
      </View>



      {/* Tasks List */}
      <View style={dynamicStyles.tasksList}>
        {filteredTasks.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyIcon}>📝</Text>
            <Text style={dynamicStyles.emptyTitle}>
              {selectedCategory === 'all' ? t('tasks.noTasks') : t('tasks.noTasksInCategory')}
            </Text>
            <Text style={dynamicStyles.emptyMessage}>
              {selectedCategory === 'all' 
                ? t('tasks.addFirstTask')
                : t('tasks.addTaskForCategory')
              }
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task.id} style={dynamicStyles.taskCard}>
              <View style={dynamicStyles.taskHeader}>
                <View style={dynamicStyles.taskLeft}>
                  <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                  <View style={dynamicStyles.taskContent}>
                    <Text style={[
                      dynamicStyles.taskTitle,
                      task.isCompleted && dynamicStyles.taskCompleted
                    ]}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={dynamicStyles.taskDescription}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    dynamicStyles.taskCheckbox,
                    task.isCompleted && dynamicStyles.taskCheckboxCompleted
                  ]}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  {task.isCompleted && (
                    <Ionicons name="checkmark" size={16} color={currentTheme.colors.background} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.taskMeta}>
                <View style={dynamicStyles.taskCategory}>
                  <Text style={dynamicStyles.categoryText}>
                    {getCategoryEmoji(task.category)} {getCategoryLabel(task.category)}
                  </Text>
                  {task.estimatedTime && (
                    <Text style={[dynamicStyles.categoryText, { marginLeft: 8 }]}>
                      • {task.estimatedTime} dk
                    </Text>
                  )}
                </View>

                <View style={dynamicStyles.taskActions}>
                  <View style={dynamicStyles.priorityContainer}>
                    <View style={[
                      dynamicStyles.priorityIndicator,
                      { backgroundColor: getPriorityColor(task.priority) }
                    ]} />
                    <Text style={dynamicStyles.priorityText}>
                      {priorityOptions.find(p => p.value === task.priority)?.label || 'Orta'}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleEdit(task)}
                  >
                    <Ionicons name="create-outline" size={20} color={currentTheme.colors.secondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleDelete(task.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={currentTheme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          style={dynamicStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {editingTask ? t('tasks.editTask') : t('tasks.newTask')}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              removeClippedSubviews={true}
              keyboardDismissMode="interactive"
            >
              {/* Title */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Başlık *</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder={t('tasks.taskTitlePlaceholder')}
                  placeholderTextColor={currentTheme.colors.muted}
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  textContentType="none"
                  autoComplete="off"
                  returnKeyType="next"
                />
              </View>

              {/* Description */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Açıklama</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder={t('tasks.taskDescriptionPlaceholder')}
                  placeholderTextColor={currentTheme.colors.muted}
                  multiline
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  textContentType="none"
                  autoComplete="off"
                  returnKeyType="default"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={false}
                />
              </View>

              {/* Emoji */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Emoji</Text>
                <View style={dynamicStyles.emojiGrid}>
                  {emojiOptions.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        dynamicStyles.emojiButton,
                        formData.emoji === emoji && dynamicStyles.selectedEmojiButton
                      ]}
                      onPress={() => setFormData({ ...formData, emoji })}
                    >
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Kategori</Text>
                <View style={dynamicStyles.optionGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        dynamicStyles.optionButton,
                        formData.category === category.id && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, category: category.id as DailyTask['category'] })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.category === category.id && dynamicStyles.selectedOptionText
                      ]}>
                        {category.emoji} {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Öncelik</Text>
                <View style={dynamicStyles.optionGrid}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        dynamicStyles.optionButton,
                        formData.priority === option.value && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, priority: option.value as DailyTask['priority'] })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.priority === option.value && dynamicStyles.selectedOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Task Type */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Görev Tipi</Text>
                <View style={dynamicStyles.optionGrid}>
                  {[
                    { value: 'daily', label: t('tasks.daily') || 'Günlük' },
                    { value: 'weekly', label: t('tasks.weekly') || 'Haftalık' },
                    { value: 'monthly', label: t('tasks.monthly') || 'Aylık' },
                    { value: 'future', label: t('tasks.future') || 'Gelecek' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        dynamicStyles.optionButton,
                        formData.taskType === option.value && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, taskType: option.value as any })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.taskType === option.value && dynamicStyles.selectedOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due Date - For future tasks */}
              {formData.taskType === 'future' && (
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Bitiş Tarihi</Text>
                  <TextInput
                    style={dynamicStyles.textInput}
                    value={formData.selectedDate}
                    onChangeText={(text) => setFormData({ ...formData, selectedDate: text })}
                    placeholder="YYYY-MM-DD (örn: 2024-12-25)"
                    placeholderTextColor={currentTheme.colors.muted}
                  />
                </View>
              )}

              {/* Due Time - For future tasks */}
              {formData.taskType === 'future' && (
                <View style={dynamicStyles.formGroup}>
                  <Text style={dynamicStyles.formLabel}>Bitiş Saati (opsiyonel)</Text>
                  <TextInput
                    style={dynamicStyles.textInput}
                    value={formData.selectedWeek}
                    onChangeText={(text) => setFormData({ ...formData, selectedWeek: text })}
                    placeholder="HH:MM (örn: 14:30)"
                    placeholderTextColor={currentTheme.colors.muted}
                  />
                </View>
              )}

              {/* Estimated Time */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Tahmini Süre (dakika)</Text>
                <Text style={[dynamicStyles.formLabel, { fontSize: 12, marginTop: -4, marginBottom: 4, opacity: 0.7 }]}>
                  Bu görevi tamamlamak için ne kadar süre gerekiyor?
                </Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={formData.estimatedTime}
                  onChangeText={(text) => setFormData({ ...formData, estimatedTime: text })}
                  placeholder="30"
                  placeholderTextColor={currentTheme.colors.muted}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity
                style={dynamicStyles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamicStyles.saveButton}
                onPress={handleSave}
              >
                <Text style={dynamicStyles.saveButtonText}>
                  {editingTask ? t('common.update') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={{
          text: t('common.ok'),
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </ScrollView>
  );
}
