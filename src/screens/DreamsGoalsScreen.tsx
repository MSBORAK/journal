import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDreamsGoals } from '../hooks/useDreamsGoals';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CelebrationModal from '../components/CelebrationModal';
import { CustomAlert } from '../components/CustomAlert';
import { Dream, Goal } from '../types';

interface DreamsGoalsScreenProps {
  navigation: any;
}

const DreamsGoalsScreen = React.memo(function DreamsGoalsScreen({ navigation }: DreamsGoalsScreenProps) {
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
    updateDream,
    updateGoal,
    updatePromise,
    toggleFavoriteDream,
    updateGoalProgress,
    toggleMilestone,
    getStats,
    getActivePromises,
    toggleDreamCompletion,
    togglePromiseCompletion,
  } = useDreamsGoals(user?.uid);

  const [activeTab, setActiveTab] = useState<'dreams' | 'goals' | 'promise'>('dreams');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({
    title: '',
    message: '',
    type: 'dream' as 'dream' | 'goal' | 'promise'
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'success' | 'warning' | 'error' | 'info',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promiseText: '',
  });

  const handleTabChange = (tab: 'dreams' | 'goals' | 'promise') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const triggerCelebration = (type: 'dream' | 'goal' | 'promise', title: string) => {
    const messages = {
      dream: 'Hayalini gerçekleştirdin! Bir adım daha ilerledin, harikasın! 🌟',
      goal: 'Hedefini tamamladın! Bu başarıyı kutlamalısın! 🚀',
      promise: 'Sözünü tuttuğun için tebrikler! Güvenilirliğin muhteşem! ✨'
    };
    
    setCelebrationData({
      title,
      message: messages[type],
      type
    });
    setShowCelebration(true);
  };

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

  const formatDate = (dateIso?: string) => {
    if (!dateIso) return '';
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Test verileri ekle (sadece ilk açılışta)
  useEffect(() => {
    const addTestData = async () => {
      if (user?.uid && dreams.length === 0 && goals.length === 0 && promises.length === 0 && !loading) {
        try {
          // Test Dreams
          await addDream({
            title: "CEO Olmak",
            description: "Büyük bir şirketin CEO'su olmak ve dünyayı değiştirmek",
            category: "career",
            emoji: "👔",
            isFavorite: true,
            isCompleted: false,
            isArchived: false,
          });
          
          await addDream({
            title: "Dünya Turu",
            description: "Tüm dünyayı gezmek ve farklı kültürleri tanımak",
            category: "travel",
            emoji: "🌍",
            isFavorite: false,
            isCompleted: false,
            isArchived: false,
          });

          // Test Goals
          await addGoal({
            title: "İngilizce Öğren",
            description: "C1 seviyesinde İngilizce konuşabilmek",
            progress: 60,
            status: 'active',
            dreamId: '',
            type: 'medium',
            category: 'learning',
            emoji: '🎓',
            priority: 'high',
            milestones: [
              { id: '1', title: 'A1 seviyesini tamamla', isCompleted: true },
              { id: '2', title: 'B1 seviyesini tamamla', isCompleted: true },
              { id: '3', title: 'B2 seviyesini tamamla', isCompleted: false },
              { id: '4', title: 'C1 seviyesini tamamla', isCompleted: false },
            ],
          });

          await addGoal({
            title: "Fitness Hedefi",
            description: "6 ayda 10 kg vermek",
            progress: 30,
            status: 'active',
            dreamId: '',
            type: 'short',
            category: 'health',
            emoji: '💪',
            priority: 'medium',
            milestones: [
              { id: '1', title: 'İlk 2 kg ver', isCompleted: true },
              { id: '2', title: '5 kg ver', isCompleted: false },
              { id: '3', title: '10 kg ver', isCompleted: false },
            ],
          });

          // Test Promises
          await addPromise("Her gün 30 dakika kitap okuyacağım", "📚");
          await addPromise("Haftada 3 gün spor yapacağım", "💪");
          await addPromise("Daha az sosyal medya kullanacağım", "📱");

          console.log('Test data added successfully!');
        } catch (error) {
          console.error('Error adding test data:', error);
        }
      }
    };

    addTestData();
  }, [user?.uid, dreams.length, goals.length, promises.length]);

  const handleSave = async () => {
    if (activeTab === 'promise') {
      if (!formData.promiseText.trim()) {
        showAlert('Hata', 'Lütfen bir söz yazın', 'error');
        return;
      }
      await addPromise(formData.promiseText);
    } else {
      if (!formData.title.trim()) {
        showAlert('Hata', 'Lütfen bir başlık yazın', 'error');
        return;
      }
      if (activeTab === 'dreams') {
        await addDream({
          title: formData.title,
          description: formData.description,
          category: "personal",
          emoji: "🌟",
          isFavorite: false,
          isCompleted: false,
          isArchived: false,
        });
      } else {
        await addGoal({
          title: formData.title,
          description: formData.description,
          progress: 0,
          status: 'active',
          dreamId: '',
          type: 'short',
          category: 'personal',
          emoji: '🎯',
          priority: 'medium',
          milestones: [],
        });
      }
    }
    
    setFormData({ title: '', description: '', promiseText: '' });
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderEmptyState = () => (
    <View style={dynamicStyles.emptyState}>
      <Text style={dynamicStyles.emptyIcon}>
        {activeTab === 'dreams' ? '🌟' : activeTab === 'goals' ? '🎯' : '🤝'}
      </Text>
      <Text style={dynamicStyles.emptyTitle}>
        {activeTab === 'dreams' ? 'Hayallerini Keşfet' : 
         activeTab === 'goals' ? 'Hedeflerini Belirle' : 
         'Kendine Söz Ver'}
      </Text>
      <Text style={dynamicStyles.emptyMessage}>
        {activeTab === 'dreams' ? 'Hayallerin gerçeğe dönüşsün' : 
         activeTab === 'goals' ? 'Hedeflerine ulaş' : 
         'Kendine verdiğin sözleri tut'}
      </Text>
    </View>
  );

  // Her tema için uyumlu favori rengi
  const getFavoriteColor = () => {
    switch (currentTheme.name) {
      case 'light': return '#f59e0b'; // Altın sarısı
      case 'dark': return '#8b5cf6'; // Mor
      case 'ocean': return '#0ea5e9'; // Mavi
      case 'forest': return '#16a34a'; // Yeşil
      case 'lavender': return '#c084fc'; // Lavanta
      case 'rose': return '#f43f5e'; // Pembe
      case 'sunset': return '#f97316'; // Turuncu
      case 'midnight': return '#1e40af'; // Koyu mavi
      default: return currentTheme.colors.accent;
    }
  };

  const renderDreamCard = (dream: Dream) => (
    <TouchableOpacity
      key={dream.id}
      style={dynamicStyles.card}
      onPress={() => {
        setSelectedItem(dream);
        setShowDetailModal(true);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          dynamicStyles.cardGradient,
          { borderColor: dream.isFavorite ? getFavoriteColor() : currentTheme.colors.border }
        ]}
      >

        <View style={dynamicStyles.cardHeader}>
          <View style={dynamicStyles.cardIconContainer}>
            <Text style={dynamicStyles.cardIcon}>🌟</Text>
          </View>
          {/* Tamamla */}
          <TouchableOpacity
            onPress={() => {
              toggleDreamCompletion(dream.id);
              if (!dream.isCompleted) {
                triggerCelebration('dream', dream.title);
              }
            }}
            style={[
              dynamicStyles.completeButton,
              dream.isCompleted && {
                backgroundColor: currentTheme.colors.primary,
                borderColor: currentTheme.colors.primary,
              }
            ]}
          >
            <Ionicons 
              name={dream.isCompleted ? "star" : "star-outline"} 
              size={20} 
              color={dream.isCompleted ? currentTheme.colors.card : currentTheme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.cardContent}>
          <Text style={dynamicStyles.cardTitle}>{dream.title}</Text>
          {dream.description && (
            <Text style={dynamicStyles.cardDescription}>{dream.description}</Text>
          )}
          <Text style={dynamicStyles.cardMeta}>
            Yazıldı: {formatDate(dream.createdAt)}
            {dream.completedAt ? `  •  Tamamlandı: ${formatDate(dream.completedAt)}` : ''}
          </Text>
        </View>

        {/* Removed progress dots */}
        {/* Tamamlandı pill kaldırıldı - yıldız rengi yeterli gösterge */}
      </View>
    </TouchableOpacity>
  );

  const renderGoalCard = (goal: Goal) => (
    <TouchableOpacity
      key={goal.id}
      style={dynamicStyles.card}
      onPress={() => {
        setSelectedItem(goal);
        setShowDetailModal(true);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          dynamicStyles.cardGradient,
          { borderColor: goal.progress === 100 ? '#10B981' : currentTheme.colors.border }
        ]}
      >

        <View style={dynamicStyles.cardHeader}>
          <View style={dynamicStyles.cardIconContainer}>
            <Text style={dynamicStyles.cardIcon}>🎯</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const newProgress = goal.progress === 100 ? 0 : 100;
              updateGoalProgress(goal.id, newProgress);
              if (newProgress === 100) {
                triggerCelebration('goal', goal.title);
              }
            }}
            style={[
              dynamicStyles.progressButton,
              goal.progress === 100 && {
                backgroundColor: currentTheme.colors.primary,
                borderColor: currentTheme.colors.primary,
              }
            ]}
          >
            <Ionicons 
              name={goal.progress === 100 ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={goal.progress === 100 ? currentTheme.colors.card : currentTheme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.cardContent}>
          <Text style={dynamicStyles.cardTitle}>{goal.title}</Text>
          {goal.description && (
            <Text style={dynamicStyles.cardDescription}>{goal.description}</Text>
          )}
          <Text style={dynamicStyles.cardMeta}>
            Yazıldı: {formatDate(goal.createdAt)}
            {goal.completedAt ? `  •  Tamamlandı: ${formatDate(goal.completedAt)}` : ''}
          </Text>
        </View>

        {/* Animated Progress Bar */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={[dynamicStyles.progressFill, { width: `${goal.progress}%` }]} />
          </View>
          <Text style={dynamicStyles.progressText}>{goal.progress}% tamamlandı</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPromiseCard = (promise: any) => (
    <TouchableOpacity
      key={promise.id}
      style={dynamicStyles.card}
      onPress={() => {
        setSelectedItem(promise);
        setShowDetailModal(true);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          dynamicStyles.cardGradient,
          { borderColor: promise.isCompleted ? '#10B981' : currentTheme.colors.border }
        ]}
      >

        <View style={dynamicStyles.cardHeader}>
          <View style={dynamicStyles.cardIconContainer}>
            <Text style={dynamicStyles.cardIcon}>🤝</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              togglePromiseCompletion(promise.id);
              if (!promise.isCompleted) {
                triggerCelebration('promise', promise.text);
              }
            }}
            style={[
              dynamicStyles.progressButton,
              promise.isCompleted && {
                backgroundColor: currentTheme.colors.primary,
                borderColor: currentTheme.colors.primary,
              }
            ]}
          >
            <Ionicons 
              name={promise.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={promise.isCompleted ? currentTheme.colors.card : currentTheme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.cardContent}>
          <Text
            style={dynamicStyles.cardTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {promise.text}
          </Text>
          <Text style={dynamicStyles.cardMeta}>
            Yazıldı: {formatDate(promise.createdAt)}
            {promise.completedAt ? `  •  Tamamlandı: ${formatDate(promise.completedAt)}` : ''}
          </Text>
        </View>

        {/* Status Indicator */}
        <View style={[dynamicStyles.statusIndicator, { marginTop: 8 }]}>
          <View style={[
            dynamicStyles.statusDot,
            { backgroundColor: promise.isCompleted ? currentTheme.colors.card : currentTheme.colors.background }
          ]} />
          <Text style={dynamicStyles.statusText}>
            {promise.isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: currentTheme.colors.primary + '12',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '25',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      opacity: 0.85,
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.background,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      padding: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.card,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    activeTabText: {
      color: currentTheme.colors.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    cardsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      width: '48%',
      aspectRatio: 0.9,
      backgroundColor: currentTheme.colors.card,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    cardGradient: {
      padding: 16,
      paddingBottom: 20,
      borderRadius: 16,
      flex: 1,
      position: 'relative',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    cardIcon: {
      fontSize: 20,
    },
    favoriteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    completeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: currentTheme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      marginLeft: 8,
    },
    progressButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: currentTheme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    cardContent: {
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    cardMeta: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 6,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 4,
      marginBottom: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'right',
      fontWeight: '600',
    },
    progressIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    completedPill: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    completedText: {
      color: currentTheme.colors.card,
      fontSize: 12,
      fontWeight: '600',
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: currentTheme.colors.border,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '600',
    },
    addNewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginTop: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '40',
      borderStyle: 'dashed',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    addNewButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.primary,
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Celebration Modal */}
      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={celebrationData.title}
        message={celebrationData.message}
        type={celebrationData.type}
        themeName={currentTheme.name}
      />
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>✨ Hayaller & Hedefler</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          Geleceğine yön ver, hayallerini gerçeğe dönüştür
        </Text>
      </View>

      {/* Tabs */}
      <View style={dynamicStyles.tabContainer}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'dreams' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('dreams')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'dreams' && dynamicStyles.activeTabText]}>
            🌟 Hayaller
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'goals' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('goals')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'goals' && dynamicStyles.activeTabText]}>
            🎯 Hedefler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'promise' && dynamicStyles.activeTab]}
          onPress={() => handleTabChange('promise')}
        >
          <Text style={[dynamicStyles.tabText, activeTab === 'promise' && dynamicStyles.activeTabText]}>
            🤝 Söz
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: currentTheme.colors.secondary }}>
            Yükleniyor...
          </Text>
        </View>
      ) : (
        <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'dreams' && (
          <>
            {dreams.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <View style={dynamicStyles.cardsList}>
                  {dreams.map(renderDreamCard)}
                </View>
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
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
                  {goals.map(renderGoalCard)}
                </View>
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
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
                <TouchableOpacity
                  style={dynamicStyles.addNewButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowAddModal(true);
                  }}
                >
                  <Ionicons name="add-circle-outline" size={28} color={currentTheme.colors.primary} />
                  <Text style={dynamicStyles.addNewButtonText}>Yeni Söz Ver</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
        </ScrollView>
      )}

      {/* Simple Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              borderRadius: 16,
              width: '100%',
              maxHeight: '60%',
              shadowColor: currentTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}>
              {/* Modal Header */}
              <View style={{
                backgroundColor: currentTheme.colors.primary,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: currentTheme.colors.card,
                  flex: 1,
                  textAlign: 'center',
                }}>
                  {activeTab === 'dreams' ? '✨ Yeni Hayal' : 
                   activeTab === 'goals' ? '🎯 Yeni Hedef' : 
                   '🤝 Yeni Söz'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: currentTheme.colors.card + '33',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={16} color={currentTheme.colors.card} />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {activeTab === 'promise' ? (
                  // Promise Form
                  <View style={{ gap: 16 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: currentTheme.colors.text,
                      marginBottom: 8,
                    }}>
                      Kendine bir söz ver
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 16,
                        color: currentTheme.colors.text,
                        minHeight: 100,
                        textAlignVertical: 'top',
                        borderWidth: 1,
                        borderColor: currentTheme.colors.border,
                      }}
                      placeholder="Örnek: Her gün 10 dakika meditasyon yapacağım..."
                      placeholderTextColor={currentTheme.colors.muted}
                      value={formData.promiseText}
                      onChangeText={(text) => setFormData({ ...formData, promiseText: text })}
                      multiline
                    />
                  </View>
                ) : (
                  // Dreams & Goals Form
                  <View style={{ gap: 16 }}>
                    <View>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: currentTheme.colors.text,
                        marginBottom: 8,
                      }}>
                        Başlık *
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          fontSize: 16,
                          color: currentTheme.colors.text,
                          borderWidth: 1,
                          borderColor: currentTheme.colors.border,
                        }}
                        placeholder={activeTab === 'dreams' ? "Hayalim..." : "Hedefim..."}
                        placeholderTextColor={currentTheme.colors.muted}
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                      />
                    </View>
                    
                    <View>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: currentTheme.colors.text,
                        marginBottom: 8,
                      }}>
                        Açıklama
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          fontSize: 16,
                          color: currentTheme.colors.text,
                          minHeight: 100,
                          textAlignVertical: 'top',
                          borderWidth: 1,
                          borderColor: currentTheme.colors.border,
                        }}
                        placeholder="Hayalini detaylandır..."
                        placeholderTextColor={currentTheme.colors.muted}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                      />
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginTop: 20,
                }}>
                  <TouchableOpacity
                    onPress={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: currentTheme.colors.background,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: currentTheme.colors.secondary,
                    }}>
                      İptal
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleSave}
                    style={{
                      flex: 1,
                      backgroundColor: currentTheme.colors.primary,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: currentTheme.colors.background,
                    }}>
                      Kaydet
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxHeight: '70%',
          }}>
            <Text style={{
              fontSize: 20,
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

            {/* Milestones - only for goals */}
            {activeTab === 'goals' && Array.isArray(selectedItem?.milestones) && selectedItem?.milestones.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: currentTheme.colors.text,
                  marginBottom: 12,
                }}>
                  Alt Görevler
                </Text>
                <View style={{ gap: 10 }}>
                  {selectedItem.milestones.map((m: any) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={async () => {
                        const total = selectedItem.milestones.length;
                        const completedBefore = selectedItem.milestones.filter((x: any) => x.isCompleted).length;
                        const willComplete = !m.isCompleted;
                        const completedAfter = willComplete ? completedBefore + 1 : completedBefore - 1;
                        const newProgress = Math.round((completedAfter / total) * 100);

                        // UI'yı anında güncelle
                        setSelectedItem({
                          ...selectedItem,
                          milestones: selectedItem.milestones.map((x: any) => x.id === m.id ? { ...x, isCompleted: !x.isCompleted } : x),
                          progress: newProgress,
                        });

                        await toggleMilestone(selectedItem.id, m.id);

                        if (willComplete && completedAfter === total) {
                          triggerCelebration('goal', selectedItem.title);
                        }
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: currentTheme.colors.background,
                        borderRadius: 12,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.border,
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        marginRight: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: m.isCompleted ? currentTheme.colors.primary : currentTheme.colors.border,
                        backgroundColor: m.isCompleted ? currentTheme.colors.primary : 'transparent',
                      }}>
                        {m.isCompleted && (
                          <Ionicons name="checkmark" size={14} color={currentTheme.colors.card} />
                        )}
                      </View>
                      <Text style={{
                        flex: 1,
                        fontSize: 14,
                        color: currentTheme.colors.text,
                      }}>
                        {m.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: currentTheme.colors.background,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: currentTheme.colors.secondary,
                }}>
                  Kapat
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setShowDetailModal(false);
                  // Edit modal açılmadan önce form data'yı set et
                  if (selectedItem) {
                    setFormData({
                      title: selectedItem.title || selectedItem.text || '',
                      description: selectedItem.description || '',
                      promiseText: selectedItem.text || '',
                    });
                  }
                  setShowEditModal(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor: currentTheme.colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: currentTheme.colors.background,
                }}>
                  Düzenle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              borderRadius: 16,
              width: '100%',
              maxHeight: '60%',
              shadowColor: currentTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}>
              {/* Modal Header */}
              <View style={{
                backgroundColor: currentTheme.colors.primary,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: currentTheme.colors.background,
                  flex: 1,
                  textAlign: 'center',
                }}>
                  ✏️ Düzenle
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={16} color={currentTheme.colors.background} />
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 16 }}>
                  {activeTab === 'promise' ? (
                    // Promise Form
                    <View>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: currentTheme.colors.text,
                        marginBottom: 8,
                      }}>
                        Sözün *
                      </Text>
                      <TextInput
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          fontSize: 16,
                          color: currentTheme.colors.text,
                          minHeight: 100,
                          textAlignVertical: 'top',
                          borderWidth: 1,
                          borderColor: currentTheme.colors.border,
                        }}
                        placeholder="Sözünü yaz..."
                        placeholderTextColor={currentTheme.colors.muted}
                        value={formData.promiseText}
                        onChangeText={(text) => {
                          setFormData({ ...formData, promiseText: text });
                          setSelectedItem({
                            ...selectedItem,
                            text: text
                          });
                        }}
                        multiline
                      />
                    </View>
                  ) : (
                    // Dreams & Goals Form
                    <>
                      <View>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: currentTheme.colors.text,
                          marginBottom: 8,
                        }}>
                          Başlık *
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: currentTheme.colors.background,
                            borderRadius: 12,
                            padding: 16,
                            fontSize: 16,
                            color: currentTheme.colors.text,
                            borderWidth: 1,
                            borderColor: currentTheme.colors.border,
                          }}
                          placeholder="Başlık..."
                          placeholderTextColor={currentTheme.colors.muted}
                          value={formData.title}
                          onChangeText={(text) => {
                            setFormData({ ...formData, title: text });
                            setSelectedItem({
                              ...selectedItem,
                              title: text
                            });
                          }}
                        />
                      </View>
                      
                      {selectedItem?.description !== undefined && (
                        <View>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: currentTheme.colors.text,
                            marginBottom: 8,
                          }}>
                            Açıklama
                          </Text>
                          <TextInput
                            style={{
                              backgroundColor: currentTheme.colors.background,
                              borderRadius: 12,
                              padding: 16,
                              fontSize: 16,
                              color: currentTheme.colors.text,
                              minHeight: 100,
                              textAlignVertical: 'top',
                              borderWidth: 1,
                              borderColor: currentTheme.colors.border,
                            }}
                            placeholder="Açıklama..."
                            placeholderTextColor={currentTheme.colors.muted}
                            value={formData.description}
                            onChangeText={(text) => {
                              setFormData({ ...formData, description: text });
                              setSelectedItem({
                                ...selectedItem,
                                description: text
                              });
                            }}
                            multiline
                          />
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  marginTop: 20,
                }}>
                  <TouchableOpacity
                    onPress={() => setShowEditModal(false)}
                    style={{
                      flex: 1,
                      backgroundColor: currentTheme.colors.background,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: currentTheme.colors.secondary,
                    }}>
                      İptal
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (activeTab === 'dreams' && selectedItem) {
                          await updateDream(selectedItem.id, {
                            title: formData.title,
                            description: formData.description,
                          });
                        } else if (activeTab === 'goals' && selectedItem) {
                          await updateGoal(selectedItem.id, {
                            title: formData.title,
                            description: formData.description,
                          });
                        } else if (activeTab === 'promise' && selectedItem) {
                          await updatePromise(selectedItem.id, {
                            text: formData.promiseText,
                          });
                        }
                        
                        setShowEditModal(false);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      } catch (error) {
                        console.error('Error updating item:', error);
                        showAlert('Hata', 'Güncelleme sırasında bir hata oluştu', 'error');
                      }
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: currentTheme.colors.primary,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: currentTheme.colors.background,
                    }}>
                      Kaydet
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
          text: 'Tamam',
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
});

export default DreamsGoalsScreen;