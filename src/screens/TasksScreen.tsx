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
import { useTasks } from '../hooks/useTasks';
import { Ionicons } from '@expo/vector-icons';
import { DailyTask } from '../types';
import { recordUserActivity } from '../services/userActivityService';
import { scheduleTaskReminder } from '../services/motivationNotificationService';

interface TasksScreenProps {
  navigation: any;
}

export default function TasksScreen({ navigation }: TasksScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '📝',
    category: 'personal' as DailyTask['category'],
    priority: 'medium' as DailyTask['priority'],
    estimatedTime: '',
  });

  const emojiOptions = ['📝', '🏥', '💧', '🏃‍♀️', '📚', '🍎', '😴', '🎯', '💝', '⚡', '🌱', '💼'];
  const priorityOptions = [
    { value: 'low', label: 'Düşük', color: '#10b981' },
    { value: 'medium', label: 'Orta', color: '#f59e0b' },
    { value: 'high', label: 'Yüksek', color: '#ef4444' },
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

  const filteredTasks = selectedCategory === 'all' 
    ? todayTasks 
    : todayTasks.filter(task => task.category === selectedCategory);

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
      color: 'white',
    },
    categoryCount: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    selectedCategoryCount: {
      color: 'white',
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
      color: 'white',
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
    });
    setEditingTask(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Başlık boş olamaz');
      return;
    }

    try {
      const taskData = {
        ...formData,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
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
      Alert.alert('Hata', 'Görev kaydedilemedi');
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
    });
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleDelete = (taskId: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => deleteTask(taskId)
        },
      ]
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
    return option ? option.color : '#6b7280';
  };


  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Günlük Görevler</Text>
        <TouchableOpacity 
          style={dynamicStyles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{todayTasks.length}</Text>
          <Text style={dynamicStyles.statLabel}>Toplam</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{completedCount}</Text>
          <Text style={dynamicStyles.statLabel}>Tamamlanan</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{completionRate}%</Text>
          <Text style={dynamicStyles.statLabel}>Oran</Text>
        </View>
      </View>

      {/* Progress Card */}
      <View style={dynamicStyles.progressCard}>
        <View style={dynamicStyles.progressHeader}>
          <Text style={dynamicStyles.progressTitle}>📊 Bugünkü İlerleme</Text>
          <Text style={dynamicStyles.progressText}>
            {completedCount}/{todayTasks.length}
          </Text>
        </View>
        
        <View style={dynamicStyles.progressBar}>
          <View 
            style={[
              dynamicStyles.progressFill, 
              { width: `${completionRate}%` }
            ]} 
          />
        </View>
        
        {streak > 0 && (
          <View style={dynamicStyles.streakContainer}>
            <Text style={dynamicStyles.streakIcon}>🔥</Text>
            <Text style={dynamicStyles.streakText}>
              {streak} gün üst üste tamamlama
            </Text>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <View style={dynamicStyles.categoryFilter}>
        <View style={dynamicStyles.categoryGrid}>
          <TouchableOpacity
            style={[
              dynamicStyles.categoryCard,
              selectedCategory === 'all' && dynamicStyles.selectedCategoryCard
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={dynamicStyles.categoryIcon}>📋</Text>
            <Text style={[
              dynamicStyles.categoryName,
              selectedCategory === 'all' && dynamicStyles.selectedCategoryName
            ]}>
              Tümü
            </Text>
            <Text style={[
              dynamicStyles.categoryCount,
              selectedCategory === 'all' && dynamicStyles.selectedCategoryCount
            ]}>
              {tasks.length}
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => {
            const categoryTasks = tasks.filter(task => task.category === category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  dynamicStyles.categoryCard,
                  selectedCategory === category.id && dynamicStyles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={dynamicStyles.categoryIcon}>{category.emoji}</Text>
                <Text style={[
                  dynamicStyles.categoryName,
                  selectedCategory === category.id && dynamicStyles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
                <Text style={[
                  dynamicStyles.categoryCount,
                  selectedCategory === category.id && dynamicStyles.selectedCategoryCount
                ]}>
                  {categoryTasks.length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView style={dynamicStyles.tasksList} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyIcon}>📝</Text>
            <Text style={dynamicStyles.emptyTitle}>
              {selectedCategory === 'all' ? 'Henüz görev yok' : 'Bu kategoride görev yok'}
            </Text>
            <Text style={dynamicStyles.emptyMessage}>
              {selectedCategory === 'all' 
                ? 'İlk görevinizi ekleyerek başlayın'
                : 'Bu kategori için görev ekleyin'
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
                    <Ionicons name="checkmark" size={16} color="white" />
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
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
                {editingTask ? 'Görev Düzenle' : 'Yeni Görev'}
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
            >
              {/* Title */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Başlık *</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Görev başlığı"
                  placeholderTextColor={currentTheme.colors.secondary}
                />
              </View>

              {/* Description */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Açıklama</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="İsteğe bağlı açıklama"
                  placeholderTextColor={currentTheme.colors.secondary}
                  multiline
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

              {/* Estimated Time */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Tahmini Süre (dakika)</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={formData.estimatedTime}
                  onChangeText={(text) => setFormData({ ...formData, estimatedTime: text })}
                  placeholder="30"
                  placeholderTextColor={currentTheme.colors.secondary}
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
                  {editingTask ? 'Güncelle' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
