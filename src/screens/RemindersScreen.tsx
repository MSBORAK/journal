import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useReminders } from '../hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import { Reminder } from '../types';
import { 
  scheduleReminderNotification, 
  cancelReminderNotification,
  requestNotificationPermissions 
} from '../services/notificationService';
import DatePicker from '../components/DatePicker';
import { CustomAlert } from '../components/CustomAlert';

interface RemindersScreenProps {
  navigation: any;
}

const RemindersScreen = React.memo(function RemindersScreen({ navigation }: RemindersScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { 
    reminders, 
    loading, 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    toggleReminder,
    getReminderStats,
    getSortedReminders
  } = useReminders(user?.uid);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'success' | 'warning' | 'error' | 'info',
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '⏰',
    time: '09:00',
    date: undefined as string | undefined,
    category: 'task' as Reminder['category'],
    priority: 'medium' as Reminder['priority'],
    repeatType: 'daily' as Reminder['repeatType'],
    reminderType: 'today' as Reminder['reminderType'],
    isActive: true,
  });

  const emojiOptions = ['⏰', '💊', '🏥', '💧', '🏃‍♀️', '📚', '🍎', '😴', '🎯', '💝', '📅', '🎂', '👥', '🍽️', '💼', '📱', '🚗', '✈️', '🎉', '💡'];
  const categoryOptions = [
    { value: 'general', label: 'Genel', emoji: '⏰' },
    { value: 'medicine', label: 'İlaç', emoji: '💊' },
    { value: 'appointment', label: 'Randevu', emoji: '📅' },
    { value: 'birthday', label: 'Doğum Günü', emoji: '🎂' },
    { value: 'meeting', label: 'Toplantı', emoji: '👥' },
    { value: 'health', label: 'Sağlık', emoji: '🏥' },
    { value: 'exercise', label: 'Egzersiz', emoji: '🏃‍♀️' },
    { value: 'meal', label: 'Yemek', emoji: '🍽️' },
    { value: 'personal', label: 'Kişisel', emoji: '👤' },
    { value: 'work', label: 'İş', emoji: '💼' },
    { value: 'study', label: 'Ders', emoji: '📚' },
    { value: 'custom', label: 'Özel', emoji: '⭐' },
  ];
  const priorityOptions = [
    { value: 'low', label: 'Düşük', color: currentTheme.colors.success },
    { value: 'medium', label: 'Orta', color: currentTheme.colors.primary },
    { value: 'high', label: 'Yüksek', color: currentTheme.colors.danger },
  ];
  const repeatOptions = [
    { value: 'once', label: 'Tek Seferlik' },
    { value: 'hourly', label: 'Saatlik' },
    { value: 'daily', label: 'Günlük' },
    { value: 'weekly', label: 'Haftalık' },
    { value: 'monthly', label: 'Aylık' },
  ];

  const reminderTypeOptions = [
    { value: 'today', label: 'Bugün İçin', emoji: '📅' },
    { value: 'scheduled', label: 'Gelecek Tarih', emoji: '🗓️' },
  ];

  const stats = getReminderStats();

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'error') => {
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
    remindersList: {
      paddingHorizontal: 20,
    },
    reminderCard: {
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
    reminderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    reminderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    reminderEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    reminderContent: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    reminderDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    reminderTime: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.primary,
    },
    reminderMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    reminderCategory: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginLeft: 4,
    },
    priorityIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    reminderActions: {
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
    // Bölüm Stilleri
    sectionContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    // Görev Stilleri
    tasksStatsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    tasksStatItem: {
      alignItems: 'center',
    },
    tasksStatNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    tasksStatLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    tasksProgressContainer: {
      marginBottom: 16,
    },
    tasksProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    tasksProgressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 4,
    },
    tasksProgressText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    tasksList: {
      gap: 8,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    taskCompleted: {
      opacity: 0.6,
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    taskEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: currentTheme.colors.secondary,
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
    tasksMoreText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    tasksEmpty: {
      alignItems: 'center',
      padding: 32,
    },
    tasksEmptyText: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      marginBottom: 16,
    },
    tasksAddButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    tasksAddButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
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
    timeInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      textAlign: 'center',
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
      emoji: '⏰',
      time: '09:00',
      date: undefined,
      category: 'general',
      priority: 'medium',
      repeatType: 'daily',
      reminderType: 'today',
      isActive: true,
    });
    setEditingReminder(null);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showAlert('Hata', 'Başlık boş olamaz', 'error');
      return;
    }

    // Eğer gelecek tarih seçilmişse tarih kontrolü yap
    if (formData.reminderType === 'scheduled' && !formData.date) {
      showAlert('Hata', 'Gelecek tarih için bir tarih seçmelisiniz', 'error');
      return;
    }

    try {
      // Bildirim izni iste
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        showAlert('Bildirim İzni', 'Hatırlatıcılar için bildirim izni gerekli', 'warning');
        return;
      }

      let savedReminder: Reminder;
      if (editingReminder) {
        // Önceki bildirimi iptal et
        await cancelReminderNotification(editingReminder.id);
        await updateReminder(editingReminder.id, formData);
        savedReminder = { ...editingReminder, ...formData };
      } else {
        savedReminder = await addReminder(formData);
      }

      // Bildirim planla (sadece aktifse)
      if (savedReminder.isActive) {
        await scheduleReminderNotification(
          savedReminder.id,
          savedReminder.emoji + ' ' + savedReminder.title,
          savedReminder.description || 'Hatırlatıcı zamanı!',
          savedReminder.time,
          savedReminder.repeatType,
          savedReminder.category,
          savedReminder.date
        );
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
      showAlert('Hata', 'Hatırlatıcı kaydedilemedi', 'error');
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      emoji: reminder.emoji,
      time: reminder.time,
      date: reminder.date,
      category: reminder.category,
      priority: reminder.priority,
      repeatType: reminder.repeatType,
      reminderType: reminder.reminderType,
      isActive: reminder.isActive,
    });
    setEditingReminder(reminder);
    setShowAddModal(true);
  };

  const handleDelete = (reminderId: string) => {
    setPendingDeleteId(reminderId);
    setAlertConfig({
      visible: true,
      title: 'Hatırlatıcıyı Sil',
      message: 'Bu hatırlatıcıyı silmek istediğinizden emin misiniz?',
      type: 'warning',
    });
  };

  const getCategoryLabel = (category: Reminder['category']) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  const getPriorityColor = (priority: Reminder['priority']) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : currentTheme.colors.muted;
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>⏰ Hatırlatıcılar</Text>
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
          <Text style={dynamicStyles.statNumber}>{stats.total}</Text>
          <Text style={dynamicStyles.statLabel}>Toplam</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{stats.active}</Text>
          <Text style={dynamicStyles.statLabel}>Aktif</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{stats.todayCount}</Text>
          <Text style={dynamicStyles.statLabel}>Bugün</Text>
        </View>
      </View>


      <ScrollView style={dynamicStyles.remindersList} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyIcon}>⏰</Text>
            <Text style={dynamicStyles.emptyTitle}>Henüz hatırlatıcı yok</Text>
            <Text style={dynamicStyles.emptyMessage}>
              İlk hatırlatıcınızı ekleyerek başlayın
            </Text>
          </View>
        ) : (
          getSortedReminders().map((reminder) => (
            <View key={reminder.id} style={dynamicStyles.reminderCard}>
              <View style={dynamicStyles.reminderHeader}>
                <View style={dynamicStyles.reminderLeft}>
                  <Text style={dynamicStyles.reminderEmoji}>{reminder.emoji}</Text>
                  <View style={dynamicStyles.reminderContent}>
                    <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                    {reminder.description && (
                      <Text style={dynamicStyles.reminderDescription}>
                        {reminder.description}
                      </Text>
                    )}
                    {reminder.reminderType === 'scheduled' && reminder.date && (
                      <Text style={[dynamicStyles.reminderDescription, { color: currentTheme.colors.primary, fontWeight: '500' }]}>
                        📅 {(() => {
                          const [year, month, day] = reminder.date.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          });
                        })()}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={dynamicStyles.reminderTime}>{reminder.time}</Text>
                  {reminder.reminderType === 'scheduled' && (
                    <Text style={[dynamicStyles.reminderDescription, { fontSize: 12, marginTop: 2 }]}>
                      🗓️ Planlı
                    </Text>
                  )}
                </View>
              </View>

              <View style={dynamicStyles.reminderMeta}>
                <View style={dynamicStyles.reminderCategory}>
                  <Text style={dynamicStyles.categoryText}>
                    {getCategoryLabel(reminder.category)}
                  </Text>
                </View>

                <View style={dynamicStyles.reminderActions}>
                  <View style={[
                    dynamicStyles.priorityIndicator,
                    { backgroundColor: getPriorityColor(reminder.priority) }
                  ]} />
                  
                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => toggleReminder(reminder.id)}
                  >
                    <Ionicons 
                      name={reminder.isActive ? "checkmark-circle" : "checkmark-circle-outline"} 
                      size={20} 
                      color={reminder.isActive ? currentTheme.colors.primary : currentTheme.colors.secondary} 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleEdit(reminder)}
                  >
                    <Ionicons name="create-outline" size={20} color={currentTheme.colors.secondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dynamicStyles.actionButton}
                    onPress={() => handleDelete(reminder.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={currentTheme.colors.danger} />
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
                {editingReminder ? 'Hatırlatıcı Düzenle' : 'Yeni Alarm'}
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
                <Text style={dynamicStyles.formLabel}>Ne Hatırlatacak? *</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Örn: İlaç iç, doktor randevusu, doğum günü..."
                  placeholderTextColor={currentTheme.colors.muted}
                />
              </View>

              {/* Description */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Detaylar (İsteğe bağlı)</Text>
                <TextInput
                  style={[dynamicStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Ek bilgiler, notlar..."
                  placeholderTextColor={currentTheme.colors.muted}
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

              {/* Reminder Type */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Hatırlatıcı Türü</Text>
                <View style={dynamicStyles.optionGrid}>
                  {reminderTypeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        dynamicStyles.optionButton,
                        formData.reminderType === option.value && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, reminderType: option.value as Reminder['reminderType'] })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.reminderType === option.value && dynamicStyles.selectedOptionText
                      ]}>
                        {option.emoji} {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Picker - Only show for scheduled reminders */}
              {formData.reminderType === 'scheduled' && (
                <DatePicker
                  selectedDate={formData.date}
                  onDateSelect={(date) => setFormData({ ...formData, date })}
                  label="Tarih"
                  placeholder="Hatırlatıcı tarihini seç"
                />
              )}

              {/* Time */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Saat</Text>
                <TextInput
                  style={dynamicStyles.timeInput}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder="HH:MM"
                  placeholderTextColor={currentTheme.colors.muted}
                />
              </View>

              {/* Category */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Kategori</Text>
                <View style={dynamicStyles.optionGrid}>
                  {categoryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        dynamicStyles.optionButton,
                        formData.category === option.value && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, category: option.value as Reminder['category'] })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.category === option.value && dynamicStyles.selectedOptionText
                      ]}>
                        {option.emoji} {option.label}
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
                      onPress={() => setFormData({ ...formData, priority: option.value as Reminder['priority'] })}
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

              {/* Repeat Type */}
              <View style={dynamicStyles.formGroup}>
                <Text style={dynamicStyles.formLabel}>Tekrar</Text>
                <View style={dynamicStyles.optionGrid}>
                  {repeatOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        dynamicStyles.optionButton,
                        formData.repeatType === option.value && dynamicStyles.selectedOptionButton
                      ]}
                      onPress={() => setFormData({ ...formData, repeatType: option.value as Reminder['repeatType'] })}
                    >
                      <Text style={[
                        dynamicStyles.optionText,
                        formData.repeatType === option.value && dynamicStyles.selectedOptionText
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                  {editingReminder ? 'Güncelle' : 'Kaydet'}
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
        primaryButton={
          alertConfig.type === 'warning' && pendingDeleteId
            ? {
                text: 'Sil',
                onPress: () => {
                  if (pendingDeleteId) {
                    deleteReminder(pendingDeleteId);
                    setPendingDeleteId(null);
                  }
                  hideAlert();
                },
                style: 'danger',
              }
            : {
                text: 'Tamam',
                onPress: hideAlert,
                style: alertConfig.type === 'error' ? 'danger' : 'primary',
              }
        }
        secondaryButton={
          alertConfig.type === 'warning' && pendingDeleteId
            ? {
                text: 'İptal',
                onPress: () => {
                  setPendingDeleteId(null);
                  hideAlert();
                },
                style: 'secondary',
              }
            : undefined
        }
        onClose={hideAlert}
      />
    </View>
  );
});

export default RemindersScreen;
