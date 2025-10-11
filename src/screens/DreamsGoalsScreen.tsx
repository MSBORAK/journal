import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDreamsGoals } from '../hooks/useDreamsGoals';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Dream, Goal } from '../types';

interface DreamsGoalsScreenProps {
  navigation: any;
}

export default function DreamsGoalsScreen({ navigation }: DreamsGoalsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const {
    dreams,
    goals,
    promises,
    loading,
    addDream,
    addGoal,
    addPromise,
    toggleFavoriteDream,
    updateGoalProgress,
    getStats,
    getActivePromises,
    toggleDreamCompletion,
    togglePromiseCompletion,
  } = useDreamsGoals(user?.uid);

  const [activeTab, setActiveTab] = useState<'dreams' | 'goals' | 'promise'>('dreams');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    onConfirm: () => {},
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'dream' | 'goal' | 'promise'>('dream');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '',
    category: 'personal' as Dream['category'],
    notes: '',
    tags: '',
    goalType: 'short' as Goal['type'],
    promiseText: '',
  });
  
  const stats = getStats();

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info', onConfirm?: () => void) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setShowCustomAlert(false)),
    });
    setShowCustomAlert(true);
  };

  const handleTabChange = (tab: 'dreams' | 'goals' | 'promise') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      emoji: '',
      category: 'personal' as Dream['category'],
      notes: '',
      tags: '',
      goalType: 'short' as Goal['type'],
      promiseText: '',
    });
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'dreams') {
        if (!formData.title.trim() || !formData.emoji) {
          showAlert('Eksik Bilgi', 'Lütfen en azından bir başlık ve emoji ekleyin.', 'error');
          return;
        }
        await addDream({
          title: formData.title,
          description: formData.description,
          emoji: formData.emoji,
          category: formData.category as Dream['category'],
          notes: formData.notes,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert('✨ Harika!', 'Hayalin eklendi! Şimdi onu gerçeğe dönüştürme zamanı.', 'success', () => {
          setShowCustomAlert(false);
          setShowAddModal(false);
          resetForm();
        });
      } else if (activeTab === 'goals') {
        if (!formData.title.trim() || !formData.emoji) {
          showAlert('Eksik Bilgi', 'Lütfen en azından bir başlık ve emoji ekleyin.', 'error');
          return;
        }
        await addGoal({
          title: formData.title,
          description: formData.description,
          emoji: formData.emoji,
          type: formData.goalType,
          category: formData.category as Goal['category'],
          progress: 0,
          milestones: [],
          status: 'active',
          priority: 'medium',
          notes: formData.notes,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert('🎯 Tebrikler!', 'Hedefin oluşturuldu! Her adım seni hedefe yaklaştırıyor.', 'success', () => {
          setShowCustomAlert(false);
          setShowAddModal(false);
          resetForm();
        });
      } else if (activeTab === 'promise') {
        if (!formData.promiseText.trim()) {
          showAlert('Eksik Bilgi', 'Lütfen bir söz metni yazın.', 'error');
          return;
        }
        await addPromise(formData.promiseText, formData.emoji || '💫');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert('💫 Harika!', 'Kendine verdiğin sözü unutma!', 'success', () => {
          setShowCustomAlert(false);
          setShowAddModal(false);
          resetForm();
        });
      }
    } catch (err) {
      console.error('Error saving:', err);
      showAlert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 4,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    activeTabText: {
      color: 'white',
    },
    content: {
      flex: 1,
    },
    cardsGrid: {
      paddingHorizontal: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    cardsList: {
      paddingHorizontal: 20,
    },
    // Dream Card Styles
    dreamCard: {
      width: '48%',
      marginBottom: 16,
      borderRadius: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '20',
    },
    dreamCardGradient: {
      borderRadius: 24,
      padding: 20,
      minHeight: 160,
      alignItems: 'center',
      borderWidth: 1,
    },
    dreamCardHeader: {
      alignItems: 'center',
      marginBottom: 12,
    },
    dreamEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    dreamTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 4,
    },
    dreamDescription: {
      fontSize: 12,
      color: '#FFFFFF',
      textAlign: 'center',
      opacity: 0.9,
      lineHeight: 16,
    },
    // Goal Card Styles
    goalCard: {
      marginBottom: 16,
      borderRadius: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    goalCardGradient: {
      borderRadius: 20,
      padding: 20,
      minHeight: 120,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    goalContent: {
      flex: 1,
    },
    goalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    goalDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 8,
    },
    goalProgress: {
      marginTop: 8,
    },
    goalProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border + '40',
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 6,
    },
    goalProgressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: currentTheme.colors.primary,
    },
    goalProgressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    // Promise Card
    promiseCard: {
      marginBottom: 16,
      borderRadius: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '20',
    },
    promiseCardGradient: {
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
    },
    promiseEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    promiseText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 26,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      marginBottom: 12,
    },
    promiseDate: {
      fontSize: 13,
      color: '#FFFFFF',
      fontStyle: 'italic',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    // Add New Button
    addNewButton: {
      backgroundColor: currentTheme.colors.primary + '15',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '40',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    addNewButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
    },
    // Empty State
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 80,
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    addButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    addButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  // Dream Card Renderer
  const renderDreamCard = (dream: Dream) => {
    const categoryColors: Record<string, string[]> = {
      personal: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF'],
      career: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'DD', currentTheme.colors.card + 'FF'],
      health: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'BB', currentTheme.colors.card + 'FF'],
      spiritual: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'DD', currentTheme.colors.card + 'FF'],
      relationship: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF'],
      travel: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'EE', currentTheme.colors.card + 'FF'],
      learning: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'DD', currentTheme.colors.card + 'FF'],
      creative: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF'],
      financial: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF'],
      custom: [currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF'],
    };

    const colors = categoryColors[dream.category] || categoryColors.custom;

    return (
      <TouchableOpacity
        key={dream.id}
        style={dynamicStyles.dreamCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedItem(dream);
          setSelectedItemType('dream');
          setShowDetailModal(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors as any}
          style={dynamicStyles.dreamCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={dynamicStyles.dreamCardHeader}>
            <Text style={dynamicStyles.dreamEmoji}>{dream.emoji}</Text>
            <Text style={dynamicStyles.dreamTitle}>{dream.title}</Text>
            {dream.description && (
              <Text style={dynamicStyles.dreamDescription}>{dream.description}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Goal Card Renderer
  const renderGoalCard = (goal: Goal) => {
    const progressPercentage = Math.min((goal.progress / 100) * 100, 100);
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={dynamicStyles.goalCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedItem(goal);
          setSelectedItemType('goal');
          setShowDetailModal(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[currentTheme.colors.card + 'FF', currentTheme.colors.card + 'F8']}
          style={dynamicStyles.goalCardGradient}
        >
          <View style={dynamicStyles.goalHeader}>
            <Text style={dynamicStyles.goalIcon}>{goal.emoji}</Text>
            <View style={dynamicStyles.goalContent}>
              <Text style={dynamicStyles.goalTitle}>{goal.title}</Text>
              {goal.description && (
                <Text style={dynamicStyles.goalDescription}>{goal.description}</Text>
              )}
            </View>
          </View>
          
          <View style={dynamicStyles.goalProgress}>
            <View style={dynamicStyles.goalProgressBar}>
              <View 
                style={[
                  dynamicStyles.goalProgressFill,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={dynamicStyles.goalProgressText}>
              {goal.progress}% tamamlandı
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Promise Card Renderer
  const renderPromiseCard = (promise: typeof promises[0]) => {
    return (
      <TouchableOpacity 
        key={promise.id} 
        style={dynamicStyles.promiseCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedItem(promise);
          setSelectedItemType('promise');
          setShowDetailModal(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[currentTheme.colors.primary + 'FF', currentTheme.colors.accent + 'CC', currentTheme.colors.card + 'FF']}
          style={dynamicStyles.promiseCardGradient}
        >
          <Text style={dynamicStyles.promiseEmoji}>{promise.emoji}</Text>
          <Text style={dynamicStyles.promiseText}>{promise.text}</Text>
          <Text style={dynamicStyles.promiseDate}>
            {new Date(promise.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const content = {
      dreams: {
        emoji: '🌠',
        title: 'Hayallerine Hayat Ver',
        message: 'Hayallerini buraya ekle ve onları gerçeğe dönüştür. Her hayal, bir yolculuğun başlangıcıdır.',
        buttonText: 'İlk Hayalini Ekle',
      },
      goals: {
        emoji: '🎯',
        title: 'Hedeflerini Belirle',
        message: 'Kısa, orta ve uzun vadeli hedeflerini oluştur. Her hedef, hayallerine bir adım daha yaklaştırır.',
        buttonText: 'İlk Hedefini Ekle',
      },
      promise: {
        emoji: '💫',
        title: 'Kendine Söz Ver',
        message: 'Kendine verdiğin sözler, en değerli taahhütlerdir. İç sesinle bağlantı kur.',
        buttonText: 'Söz Ver',
      },
    };

    const current = content[activeTab];

    return (
      <View style={dynamicStyles.emptyState}>
        <Text style={dynamicStyles.emptyIcon}>{current.emoji}</Text>
        <Text style={dynamicStyles.emptyTitle}>{current.title}</Text>
        <Text style={dynamicStyles.emptyMessage}>{current.message}</Text>
        <TouchableOpacity
          style={dynamicStyles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAddModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={dynamicStyles.addButtonText}>{current.buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>✨ Hayaller & Hedefler</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          Geleceğine yön ver, hayallerini gerçeğe dönüştür
        </Text>
      </View>

      {/* Tab Bar */}
      <View style={dynamicStyles.tabBar}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'dreams' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('dreams')}
          activeOpacity={0.7}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'dreams' && dynamicStyles.activeTabText]}>
            🌠 Hayaller
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'goals' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('goals')}
          activeOpacity={0.7}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'goals' && dynamicStyles.activeTabText]}>
            🎯 Hedefler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'promise' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('promise')}
          activeOpacity={0.7}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'promise' && dynamicStyles.activeTabText]}>
            💫 Söz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={dynamicStyles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'dreams' && (
          <>
            {dreams.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={dynamicStyles.cardsGrid}>
                  {dreams.filter(d => !d.isArchived).map(renderDreamCard)}
                </View>
                {/* Add New Button */}
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={28} color={currentTheme.colors.primary} />
                  <Text style={dynamicStyles.addNewButtonText}>Yeni Hayal Ekle</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {activeTab === 'goals' && (
          <>
            {goals.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={dynamicStyles.cardsList}>
                  {goals.filter(g => g.status !== 'cancelled').map(renderGoalCard)}
                </View>
                {/* Add New Button */}
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={28} color={currentTheme.colors.primary} />
                  <Text style={dynamicStyles.addNewButtonText}>Yeni Hedef Ekle</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {activeTab === 'promise' && (
          <>
            {getActivePromises().length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={dynamicStyles.cardsList}>
                  {getActivePromises().map(renderPromiseCard)}
                </View>
                {/* Add New Button */}
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={28} color={currentTheme.colors.primary} />
                  <Text style={dynamicStyles.addNewButtonText}>Yeni Söz Ver</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Modern Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'flex-end',
          }}>
            <LinearGradient
              colors={[
                currentTheme.colors.primary + 'FF',
                currentTheme.colors.accent + 'F0',
                currentTheme.colors.card + 'FF'
              ]}
              style={{
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                paddingTop: 20,
                maxHeight: '80%',
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 20,
                borderWidth: 2,
                borderColor: currentTheme.colors.primary + '20',
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Modal Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 28,
                paddingBottom: 24,
                backgroundColor: currentTheme.colors.primary + '20',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.colors.primary + '30',
              }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    {activeTab === 'dreams' ? '🌟 Hayalini Hayata Geçir' : 
                     activeTab === 'goals' ? '🎯 Hedefini Gerçekleştir' : 
                     '💫 İç Sesinle Bağlantı Kur'}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginTop: 4,
                    opacity: 0.9,
                  }}>
                    {activeTab === 'dreams' ? 'Hayallerin gerçeğe dönüşsün' : 
                     activeTab === 'goals' ? 'Hedeflerine ulaş' : 
                     'Kendine verdiğin sözleri tut'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 16,
                  }}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <View style={{ padding: 32, backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {activeTab === 'promise' ? (
                    // Promise Form
                    <View style={{ gap: 20 }}>
                      <View style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '25',
                        shadowColor: currentTheme.colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                      }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: currentTheme.colors.text, marginBottom: 12, textAlign: 'center' }}>
                          Kendine bir söz ver
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderRadius: 16,
                            padding: 16,
                            fontSize: 16,
                            color: currentTheme.colors.text,
                            minHeight: 120,
                            textAlignVertical: 'top',
                            borderWidth: 1,
                            borderColor: currentTheme.colors.border,
                          }}
                          placeholder="Örnek: Her gün 10 dakika meditasyon yapacağım..."
                          placeholderTextColor={currentTheme.colors.secondary}
                          value={formData.promiseText}
                          onChangeText={(text) => setFormData({ ...formData, promiseText: text })}
                          multiline
                        />
                      </View>
                    </View>
                  ) : (
                    // Dreams & Goals Form
                    <View style={{ gap: 20 }}>
                      <View style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '25',
                        shadowColor: currentTheme.colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                      }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: currentTheme.colors.text, marginBottom: 12 }}>
                          Başlık *
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderRadius: 16,
                            padding: 16,
                            fontSize: 16,
                            color: currentTheme.colors.text,
                            borderWidth: 1,
                            borderColor: currentTheme.colors.border,
                          }}
                          placeholder={activeTab === 'dreams' ? "Hayalim..." : "Hedefim..."}
                          placeholderTextColor={currentTheme.colors.secondary}
                          value={formData.title}
                          onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                      </View>

                      <View style={{
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        borderRadius: 24,
                        padding: 24,
                        borderWidth: 2,
                        borderColor: currentTheme.colors.primary + '25',
                        shadowColor: currentTheme.colors.primary,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                      }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: currentTheme.colors.text, marginBottom: 12 }}>
                          Açıklama
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderRadius: 16,
                            padding: 16,
                            fontSize: 16,
                            color: currentTheme.colors.text,
                            minHeight: 100,
                            textAlignVertical: 'top',
                            borderWidth: 1,
                            borderColor: currentTheme.colors.border,
                          }}
                          placeholder={activeTab === 'dreams' ? "Hayalini detaylandır..." : "Hedefini detaylandır..."}
                          placeholderTextColor={currentTheme.colors.secondary}
                          value={formData.description}
                          onChangeText={(text) => setFormData({ ...formData, description: text })}
                          multiline
                        />
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Modal Footer */}
              <View style={{
                flexDirection: 'row',
                gap: 16,
                paddingHorizontal: 32,
                paddingBottom: 32,
                backgroundColor: 'rgba(255,255,255,0.95)',
              }}>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: 20,
                    paddingVertical: 18,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: currentTheme.colors.primary + '25',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{
                    color: currentTheme.colors.primary,
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    ❌ İptal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.primary,
                    borderRadius: 20,
                    paddingVertical: 18,
                    alignItems: 'center',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                    borderWidth: 2,
                    borderColor: currentTheme.colors.accent,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                    textShadowColor: 'rgba(0,0,0,0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    ✨ Kaydet
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: currentTheme.colors.card,
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxHeight: '80%',
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: currentTheme.colors.text,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              {selectedItem?.title || selectedItem?.text}
            </Text>
            
            {selectedItem?.description && (
              <Text style={{
                fontSize: 16,
                color: currentTheme.colors.secondary,
                marginBottom: 20,
                lineHeight: 24,
              }}>
                {selectedItem.description}
              </Text>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {selectedItemType === 'dream' && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleDreamCompletion(selectedItem.id);
                    setShowDetailModal(false);
                  }}
                  style={{
                    backgroundColor: selectedItem.isCompleted ? '#F59E0B' : '#FFD700',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    shadowColor: selectedItem.isCompleted ? '#F59E0B' : '#FFD700',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    {selectedItem.isCompleted ? '🔄 Gerçekleşmedi İşaretle' : '⭐ Gerçekleşti İşaretle'}
                  </Text>
                </TouchableOpacity>
              )}

              {selectedItemType === 'goal' && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // TODO: Toggle goal completion
                    setShowDetailModal(false);
                  }}
                  style={{
                    backgroundColor: selectedItem.status === 'completed' ? '#F59E0B' : '#FFD700',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    shadowColor: selectedItem.status === 'completed' ? '#F59E0B' : '#FFD700',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    {selectedItem.status === 'completed' ? '🔄 Aktif Yap' : '⭐ Tamamla'}
                  </Text>
                </TouchableOpacity>
              )}

              {selectedItemType === 'promise' && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    togglePromiseCompletion(selectedItem.id);
                    setShowDetailModal(false);
                  }}
                  style={{
                    backgroundColor: selectedItem.isCompleted ? '#F59E0B' : '#FFD700',
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: 'center',
                    shadowColor: selectedItem.isCompleted ? '#F59E0B' : '#FFD700',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    {selectedItem.isCompleted ? '🔄 Söz Tutulmadı İşaretle' : '⭐ Söz Tutuldu İşaretle'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={{
                  backgroundColor: currentTheme.colors.primary + '15',
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: currentTheme.colors.primary + '30',
                }}
              >
                <Text style={{
                  color: currentTheme.colors.primary,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  ✨ Tamam
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal
        visible={showCustomAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomAlert(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: currentTheme.colors.card,
            borderRadius: 28,
            padding: 28,
            width: '100%',
            maxWidth: 350,
            shadowColor: currentTheme.colors.primary,
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 20,
            borderWidth: 2,
            borderColor: currentTheme.colors.primary + '20',
          }}>
            {/* Header */}
            <View style={{
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: alertConfig.type === 'error' ? '#FF6B6B' + '20' :
                               alertConfig.type === 'success' ? '#4ECDC4' + '20' :
                               alertConfig.type === 'warning' ? '#FFD93D' + '20' :
                               currentTheme.colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 32 }}>
                  {alertConfig.type === 'error' ? '❌' :
                   alertConfig.type === 'success' ? '✅' :
                   alertConfig.type === 'warning' ? '⚠️' : 'ℹ️'}
                </Text>
              </View>
              
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.colors.text,
                textAlign: 'center',
                marginBottom: 8,
              }}>
                {alertConfig.title}
              </Text>
              
              <Text style={{
                fontSize: 16,
                color: currentTheme.colors.secondary,
                textAlign: 'center',
                lineHeight: 24,
              }}>
                {alertConfig.message}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={alertConfig.onConfirm}
              style={{
                backgroundColor: alertConfig.type === 'error' ? '#FF6B6B' :
                               alertConfig.type === 'success' ? '#4ECDC4' :
                               alertConfig.type === 'warning' ? '#FFD93D' :
                               currentTheme.colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: alertConfig.type === 'error' ? '#FF6B6B' :
                            alertConfig.type === 'success' ? '#4ECDC4' :
                            alertConfig.type === 'warning' ? '#FFD93D' :
                            currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '700',
              }}>
                Tamam
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
