import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAchievements } from '../hooks/useAchievements';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Achievement } from '../types';

interface AchievementsScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export default function AchievementsScreen({ navigation }: AchievementsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const {
    achievements,
    userStats,
    loading,
    achievementDefinitions,
    getAchievementsByCategory,
    getAchievementProgress,
    getAchievementStats,
  } = useAchievements(user?.uid);

  const [activeTab, setActiveTab] = useState<'all' | 'streak' | 'writing' | 'goals' | 'mood'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [animationValues] = useState({
    fadeAnim: new Animated.Value(0),
    scaleAnim: new Animated.Value(0.9),
  });

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(animationValues.fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animationValues.scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab: 'all' | 'streak' | 'writing' | 'goals' | 'mood') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleAchievementPress = (achievement: Achievement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
  };

  const getFilteredAchievements = () => {
    if (activeTab === 'all') {
      return achievementDefinitions;
    }
    return achievementDefinitions.filter(def => def.category === activeTab);
  };

  const getCategoryStats = () => {
    const stats = getAchievementStats();
    return {
      total: stats.total,
      unlocked: stats.unlocked,
      completionRate: stats.completionRate,
      byCategory: stats.byCategory,
      unlockedByCategory: stats.unlockedByCategory,
    };
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      streak: '🔥 Streak',
      writing: t('welcome') === 'Welcome' ? '📝 Writing' : '📝 Yazma',
      goals: t('welcome') === 'Welcome' ? '🎯 Tasks' : '🎯 Görevler',
      mood: t('welcome') === 'Welcome' ? '💪 Health' : '💪 Sağlık',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      streak: '🔥',
      writing: '📝',
      goals: '🎯',
      mood: '💪',
    };
    return emojis[category as keyof typeof emojis] || '🏆';
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
      fontSize: 36,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textShadowColor: currentTheme.colors.primary + '20',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card + 'F5',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '05',
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.primary,
      marginBottom: 6,
      textShadowColor: currentTheme.colors.primary + '20',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    statLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: currentTheme.colors.card + 'F0',
      borderRadius: 20,
      padding: 8,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '04',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      minHeight: 40,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 14,
    },
    activeTabText: {
      color: currentTheme.colors.background,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 20,
    },
    achievementCard: {
      width: (screenWidth - 60) / 2,
      marginBottom: 16,
      borderRadius: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    achievementGradient: {
      borderRadius: 24,
      padding: 20,
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unlockedGradient: {
      borderRadius: 24,
      padding: 20,
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFD700' + '30',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    lockedGradient: {
      borderRadius: 24,
      padding: 20,
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.85,
    },
    achievementIcon: {
      fontSize: 48,
      marginBottom: 12,
      textShadowColor: 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    lockedIcon: {
      fontSize: 48,
      marginBottom: 12,
      opacity: 0.5,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    lockedTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    achievementDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 16,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    progressContainer: {
      width: '100%',
      height: 6,
      backgroundColor: currentTheme.colors.border + '40',
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    unlockedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: '#FFD700',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lockedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: currentTheme.colors.secondary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 28,
      padding: 24,
      width: '100%',
      maxWidth: 380,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '20',
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modalIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 16,
    },
    modalDate: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalCloseButton: {
      marginTop: 20,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    modalCloseText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
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
      fontSize: 22,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  const renderAchievementCard = (definition: any) => {
    const isUnlocked = achievements.find(a => a.id === definition.id);
    const progress = getAchievementProgress(definition.id);
    
    const colors = isUnlocked 
      ? [
          currentTheme.colors.primary + '20', 
          currentTheme.colors.accent + '15', 
          currentTheme.colors.card + 'F8',
          currentTheme.colors.primary + '10'
        ]
      : [
          currentTheme.colors.border + '30', 
          currentTheme.colors.border + '20', 
          currentTheme.colors.card + 'F5',
          currentTheme.colors.border + '15'
        ];

    return (
      <TouchableOpacity
        key={definition.id}
        style={dynamicStyles.achievementCard}
        onPress={() => isUnlocked && handleAchievementPress(isUnlocked)}
        activeOpacity={isUnlocked ? 0.8 : 1}
      >
        <LinearGradient
          colors={colors as any}
          style={[
            dynamicStyles.achievementGradient,
            isUnlocked && dynamicStyles.unlockedGradient,
            !isUnlocked && dynamicStyles.lockedGradient,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge */}
          <View style={isUnlocked ? dynamicStyles.unlockedBadge : dynamicStyles.lockedBadge}>
            <Ionicons 
              name={isUnlocked ? "checkmark" : "lock-closed"} 
              size={14} 
              color={isUnlocked ? currentTheme.colors.text : currentTheme.colors.text} 
            />
          </View>

          {/* Icon */}
          <Text style={isUnlocked ? dynamicStyles.achievementIcon : dynamicStyles.lockedIcon}>
            {definition.icon}
          </Text>

          {/* Title */}
          <Text style={isUnlocked ? dynamicStyles.achievementTitle : dynamicStyles.lockedTitle}>
            {definition.title}
          </Text>

          {/* Description */}
          <Text style={dynamicStyles.achievementDescription}>
            {definition.description}
          </Text>

          {/* Progress */}
          {!isUnlocked && progress && (
            <>
              <View style={dynamicStyles.progressContainer}>
                <View 
                  style={[
                    dynamicStyles.progressFill,
                    { width: `${progress.progress}%` }
                  ]} 
                />
              </View>
              <Text style={dynamicStyles.progressText}>
                {progress.current}/{progress.required}
              </Text>
            </>
          )}

          {/* Unlocked Date */}
          {isUnlocked && (
            <Text style={dynamicStyles.progressText}>
              {new Date(isUnlocked.unlockedAt).toLocaleDateString(t('welcome') === 'Welcome' ? 'en-US' : 'tr-TR')}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const stats = getCategoryStats();

  if (loading) {
    return (
      <View style={[dynamicStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: currentTheme.colors.text }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Animated.View 
        style={[
          dynamicStyles.container,
          {
            opacity: animationValues.fadeAnim,
            transform: [{ scale: animationValues.scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>{t('welcome') === 'Welcome' ? '🏆 My Achievements' : '🏆 Başarılarım'}</Text>
          <Text style={dynamicStyles.headerSubtitle}>
            {t('welcome') === 'Welcome' ? 'Discover your achievements and earn new badges!' : 'Başarılarını keşfet ve yeni rozetler kazan!'}
          </Text>
        </View>

        {/* Stats */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>{stats.unlocked}</Text>
            <Text style={dynamicStyles.statLabel}>{t('welcome') === 'Welcome' ? 'Earned' : 'Kazanılan'}</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>{stats.total}</Text>
            <Text style={dynamicStyles.statLabel}>{t('welcome') === 'Welcome' ? 'Total' : 'Toplam'}</Text>
          </View>
          <View style={dynamicStyles.statCard}>
            <Text style={dynamicStyles.statNumber}>{Math.round(stats.completionRate)}%</Text>
            <Text style={dynamicStyles.statLabel}>{t('welcome') === 'Welcome' ? 'Completion' : 'Tamamlanma'}</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={dynamicStyles.tabBar}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'all' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('all')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'all' && dynamicStyles.activeTabText]}>
              🏆 {t('welcome') === 'Welcome' ? 'All' : 'Tümü'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'streak' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('streak')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'streak' && dynamicStyles.activeTabText]}>
              🔥 Streak
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'writing' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('writing')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'writing' && dynamicStyles.activeTabText]}>
              📝 {t('welcome') === 'Welcome' ? 'Writing' : 'Yazma'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'goals' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('goals')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'goals' && dynamicStyles.activeTabText]}>
              🎯 {t('welcome') === 'Welcome' ? 'Tasks' : 'Görevler'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'mood' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('mood')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'mood' && dynamicStyles.activeTabText]}>
              💪 {t('welcome') === 'Welcome' ? 'Health' : 'Sağlık'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={dynamicStyles.content}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.achievementsGrid}>
            {getFilteredAchievements().map(renderAchievementCard)}
          </View>
        </ScrollView>

        {/* Achievement Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalIcon}>{selectedAchievement?.icon}</Text>
                <Text style={dynamicStyles.modalTitle}>{selectedAchievement?.title}</Text>
                <Text style={dynamicStyles.modalDescription}>
                  {selectedAchievement?.description}
                </Text>
                <Text style={dynamicStyles.modalDate}>
                  Kazanıldı: {selectedAchievement?.unlockedAt ? 
                    new Date(selectedAchievement.unlockedAt).toLocaleDateString('tr-TR') : 
                    'Bilinmiyor'
                  }
                </Text>
              </View>

              <TouchableOpacity
                style={dynamicStyles.modalCloseButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={dynamicStyles.modalCloseText}>✨ Harika!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}
