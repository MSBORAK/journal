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
        if (!formData.title || !formData.emoji) {
          Alert.alert('Eksik Bilgi', 'Lütfen en azından bir başlık ve emoji ekleyin.');
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
        Alert.alert('✨ Harika!', 'Hayalin eklendi! Şimdi onu gerçeğe dönüştürme zamanı.');
      } else if (activeTab === 'goals') {
        if (!formData.title || !formData.emoji) {
          Alert.alert('Eksik Bilgi', 'Lütfen en azından bir başlık ve emoji ekleyin.');
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
        Alert.alert('🎯 Tebrikler!', 'Hedefin oluşturuldu! Her adım seni hedefe yaklaştırıyor.');
      } else if (activeTab === 'promise') {
        if (!formData.promiseText) {
          Alert.alert('Eksik Bilgi', 'Lütfen bir söz metni yazın.');
          return;
        }
        await addPromise(formData.promiseText, formData.emoji || '💫');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('💫 Harika!', 'Kendine verdiğin sözü unutma!');
      }
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error saving:', err);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
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
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: currentTheme.colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              maxHeight: '80%',
            }}>
              {/* Modal Header */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.colors.border,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: currentTheme.colors.text,
                }}>
                  {activeTab === 'dreams' ? 'Hayalini hayata geçir' : activeTab === 'goals' ? 'Hedefini gerçekleştir' : 'İç sesinle bağlantı kur'}
                </Text>
              </View>

              {/* Modal Content */}
              <View style={{ padding: 32 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {activeTab === 'promise' ? (
                    // Promise Form
                    <View style={{ gap: 20 }}>
                      <View style={{
                        backgroundColor: currentTheme.colors.primary + '08',
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.primary + '15',
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
                        backgroundColor: currentTheme.colors.primary + '08',
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.primary + '15',
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
                        backgroundColor: currentTheme.colors.primary + '08',
                        borderRadius: 20,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.primary + '15',
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
                gap: 12,
                paddingHorizontal: 32,
                paddingBottom: 32,
              }}>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.background,
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Text style={{
                    color: currentTheme.colors.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    İptal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.primary,
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    Kaydet
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
      </Modal>
    </SafeAreaView>
  );
}
