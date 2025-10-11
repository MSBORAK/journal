import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useDiary } from '../hooks/useDiary';
import { useHealth } from '../hooks/useHealth';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// import { useDreamsGoals } from '../hooks/useDreamsGoals'; // Kaldırıldı
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface StatisticsScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { entries, getStreak } = useDiary(user?.uid);
  const { getTodayHealthData, saveHealthData, getTodayWellnessScore, getWeeklyAverage } = useHealth(user?.uid);
  const {
    habits,
    getTodayHabits,
    getHabitStreaks,
    getWeeklyStats,
    completeHabit,
    uncompleteHabit,
  } = useHabits(user?.uid);
  // const { dreams, goals, promises, getStats } = useDreamsGoals(user?.uid); // Kaldırıldı

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState<'habits' | 'progress' | 'stats'>('stats');

  const handleTabChange = (tab: 'habits' | 'progress' | 'stats') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Habit Card Renderer
  const renderHabitCard = (habit: any, streak: any) => {
    return (
      <TouchableOpacity 
        key={habit.id} 
        style={[
          dynamicStyles.habitCard,
          habit.todayCompleted && dynamicStyles.completedHabitCard
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (habit.todayCompleted) {
            uncompleteHabit(habit.id);
          } else {
            completeHabit(habit.id, habit.target);
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            habit.todayCompleted 
              ? [habit.color + 'FF', habit.color + 'CC', habit.color + 'AA']
              : [currentTheme.colors.card + 'FF', currentTheme.colors.card + 'F8', currentTheme.colors.card + 'F0']
          }
          style={dynamicStyles.habitGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={dynamicStyles.habitHeader}>
            <View style={dynamicStyles.habitIconContainer}>
              <Text style={dynamicStyles.habitIcon}>{habit.icon}</Text>
            </View>
            <View style={dynamicStyles.habitCheckbox}>
              {habit.todayCompleted ? (
                <Ionicons name="checkmark-circle" size={32} color={habit.color} />
              ) : (
                <Ionicons name="ellipse-outline" size={32} color={currentTheme.colors.secondary} />
              )}
            </View>
          </View>

          <View style={dynamicStyles.habitContent}>
            <Text style={[
              dynamicStyles.habitTitle,
              habit.todayCompleted && { color: 'white' }
            ]}>
              {habit.title}
            </Text>
            <Text style={[
              dynamicStyles.habitDescription,
              habit.todayCompleted && { color: 'white', opacity: 0.9 }
            ]}>
              {habit.description}
            </Text>
            
            <View style={dynamicStyles.habitProgress}>
              <View style={dynamicStyles.habitProgressBar}>
                <View 
                  style={[
                    dynamicStyles.habitProgressFill,
                    { 
                      width: `${(habit.todayValue / habit.target) * 100}%`,
                      backgroundColor: habit.color
                    }
                  ]} 
                />
              </View>
              <Text style={[
                dynamicStyles.habitProgressText,
                habit.todayCompleted && { color: 'white' }
              ]}>
                {habit.todayValue} / {habit.target} {habit.unit === 'glasses' ? 'bardak' : 
                 habit.unit === 'minutes' ? 'dk' : 
                 habit.unit === 'times' ? 'kez' : 
                 habit.unit === 'hours' ? 'saat' : ''}
              </Text>
            </View>

            {streak && (
              <View style={dynamicStyles.habitStreak}>
                <Text style={[
                  dynamicStyles.habitStreakText,
                  habit.todayCompleted && { color: 'white' }
                ]}>
                  🔥 {streak.currentStreak} gün seri
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Progress Cards Renderer
  const renderProgressCards = () => {
    const weeklyStats = getWeeklyStats();
    const streaks = getHabitStreaks();
    
    return (
      <>
        {/* Weekly Overview */}
        <View style={dynamicStyles.progressCard}>
          <LinearGradient
            colors={[currentTheme.colors.primary + '20', currentTheme.colors.accent + '15']}
            style={dynamicStyles.progressGradient}
          >
            <Text style={dynamicStyles.progressCardTitle}>📊 Haftalık Özet</Text>
            <View style={dynamicStyles.progressStats}>
              <View style={dynamicStyles.progressStat}>
                <Text style={dynamicStyles.progressStatNumber}>{weeklyStats.totalHabits}</Text>
                <Text style={dynamicStyles.progressStatLabel}>Aktif Alışkanlık</Text>
              </View>
              <View style={dynamicStyles.progressStat}>
                <Text style={dynamicStyles.progressStatNumber}>{weeklyStats.totalCompletions}</Text>
                <Text style={dynamicStyles.progressStatLabel}>Tamamlanan</Text>
              </View>
              <View style={dynamicStyles.progressStat}>
                <Text style={dynamicStyles.progressStatNumber}>{Math.round(weeklyStats.completionRate)}%</Text>
                <Text style={dynamicStyles.progressStatLabel}>Başarı Oranı</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Top Streaks */}
        <View style={dynamicStyles.progressCard}>
          <LinearGradient
            colors={[currentTheme.colors.accent + '20', currentTheme.colors.primary + '15']}
            style={dynamicStyles.progressGradient}
          >
            <Text style={dynamicStyles.progressCardTitle}>🔥 En Uzun Seriler</Text>
            {streaks
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .slice(0, 3)
              .map(streak => {
                const habit = habits.find(h => h.id === streak.habitId);
                return habit ? (
                  <View key={streak.habitId} style={dynamicStyles.streakItem}>
                    <Text style={dynamicStyles.streakIcon}>{habit.icon}</Text>
                    <View style={dynamicStyles.streakContent}>
                      <Text style={dynamicStyles.streakTitle}>{habit.title}</Text>
                      <Text style={dynamicStyles.streakNumber}>{streak.currentStreak} gün</Text>
                    </View>
                  </View>
                ) : null;
              })
            }
          </LinearGradient>
        </View>
      </>
    );
  };
  
  // Health Modal States
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [water, setWater] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [meditation, setMeditation] = useState(0);

  // Animation values
  const fadeAnims = useRef({
    header: new Animated.Value(0),
    lifeMap: new Animated.Value(0),
    journey: new Animated.Value(0),
    mood: new Animated.Value(0),
  }).current;

  const scaleAnims = useRef({
    header: new Animated.Value(0.95),
    lifeMap: new Animated.Value(0.95),
    journey: new Animated.Value(0.95),
    mood: new Animated.Value(0.95),
  }).current;

  // Start animations
  useEffect(() => {
    const startAnimations = () => {
      const animations = [
        Animated.parallel([
          Animated.timing(fadeAnims.header, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims.header, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnims.lifeMap, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims.lifeMap, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnims.journey, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims.journey, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnims.mood, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims.mood, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ];

      Animated.stagger(200, animations).start();
    };

    startAnimations();
  }, []);

  // Card press animation
  const animateCardPress = (cardType: keyof typeof scaleAnims) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(scaleAnims[cardType], {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[cardType], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Health Modal Functions
  const openHealthModal = () => {
    const todayData = getTodayHealthData();
    console.log('Opening health modal, todayData:', todayData);
    if (todayData) {
      console.log('Setting values from saved data:', todayData);
      setWater(todayData.water);
      setExercise(todayData.exercise);
      setSleep(todayData.sleep);
      setMeditation(todayData.meditation);
    } else {
      console.log('No saved data, setting to 0');
      setWater(0);
      setExercise(0);
      setSleep(0);
      setMeditation(0);
    }
    setHealthModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSaveHealthData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Saving health data for today:', today, {
        water,
        exercise,
        sleep,
        meditation,
      });
      await saveHealthData(today, {
        water,
        exercise,
        sleep,
        meditation,
      });
      console.log('Health data saved successfully');
      setHealthModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving health data:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getWellnessScore = () => {
    return getTodayWellnessScore();
  };

  const getHealthCategories = () => {
    const todayData = getTodayHealthData();
    if (!todayData) {
      return [
        { emoji: '💧', label: 'Su', score: 0, color: '#3B82F6' },
        { emoji: '🏃', label: 'Egzersiz', score: 0, color: '#10B981' },
        { emoji: '😴', label: 'Uyku', score: 0, color: '#8B5CF6' },
        { emoji: '🧘', label: 'Meditasyon', score: 0, color: '#F59E0B' },
      ];
    }
    
    return [
      {
        emoji: '💧',
        label: 'Su',
        score: Math.round(Math.min((todayData.water / 12) * 100, 100)),
        color: '#3B82F6',
      },
      {
        emoji: '🏃',
        label: 'Egzersiz',
        score: Math.round(Math.min((todayData.exercise / 120) * 100, 100)),
        color: '#10B981',
      },
      {
        emoji: '😴',
        label: 'Uyku',
        score: Math.round(Math.min((todayData.sleep / 12) * 100, 100)),
        color: '#8B5CF6',
      },
      {
        emoji: '🧘',
        label: 'Meditasyon',
        score: Math.round(Math.min((todayData.meditation / 60) * 100, 100)),
        color: '#F59E0B',
      },
    ];
  };

  // Mood data calculation
  const moodData = useMemo(() => {
    const moodCounts: { [key: string]: number } = {};
    
    // Eğer entries boşsa, örnek veri göster
    if (entries.length === 0) {
      return [
        { mood: '4', count: 8, percentage: 40, emoji: '😎', color: '#10B981' },  // Mutlu
        { mood: '3', count: 6, percentage: 30, emoji: '🫠', color: '#F59E0B' },  // Yorgun
        { mood: '2', count: 4, percentage: 20, emoji: '😐', color: '#9CA3AF' },  // Normal
        { mood: '1', count: 2, percentage: 10, emoji: '😔', color: '#6B7280' },  // Üzgün
      ];
    }

    // Gerçek veri hesaplama
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    // Eğer hiç mood verisi yoksa, örnek veri göster
    if (totalMoods === 0) {
      return [
        { mood: '4', count: 5, percentage: 35, emoji: '😎', color: '#10B981' },  // Mutlu
        { mood: '3', count: 4, percentage: 28, emoji: '🫠', color: '#F59E0B' },  // Yorgun
        { mood: '2', count: 3, percentage: 21, emoji: '😐', color: '#9CA3AF' },  // Normal
        { mood: '1', count: 2, percentage: 16, emoji: '😔', color: '#6B7280' },  // Üzgün
      ];
    }
    
    const moodConfig = {
      1: { emoji: '😔', color: '#6B7280' },  // Üzgün
      2: { emoji: '😐', color: '#9CA3AF' },  // Normal
      3: { emoji: '🫠', color: '#F59E0B' },  // Yorgun
      4: { emoji: '😎', color: '#10B981' },  // Mutlu
      5: { emoji: '🤩', color: '#EF4444' },  // Harika
      // Eski sistem için backward compatibility
      happy: { emoji: '😊', color: '#F59E0B' },
      excited: { emoji: '🤩', color: '#EF4444' },
      peaceful: { emoji: '😌', color: '#10B981' },
      grateful: { emoji: '🙏', color: '#8B5CF6' },
      sad: { emoji: '😢', color: '#6B7280' },
      anxious: { emoji: '😰', color: '#F59E0B' },
      angry: { emoji: '😠', color: '#EF4444' },
      tired: { emoji: '😴', color: '#6B7280' },
      neutral: { emoji: '😐', color: '#9CA3AF' },
      peace: { emoji: '🕊️', color: '#8B5CF6' },
    };

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
        ...moodConfig[mood as keyof typeof moodConfig]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Show top 4 moods
  }, [entries]);

  // Other data calculations
  // İlk entry'yi bul (en eski tarihli)
  const firstEntry = entries.length > 0 
    ? entries.reduce((oldest, current) => {
        return new Date(current.date) < new Date(oldest.date) ? current : oldest;
      })
    : null;
  const daysSinceStart = firstEntry ? Math.floor((new Date().getTime() - new Date(firstEntry.date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Debug logs
  console.log('=== JOURNEY START DEBUG ===');
  console.log('Total entries:', entries.length);
  console.log('Entries:', entries.map(e => ({ id: e.id, date: e.date, title: e.title })));
  console.log('First entry:', firstEntry);
  console.log('Days since start:', daysSinceStart);
  console.log('========================');

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 30,
      paddingBottom: 30,
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
      borderRadius: 28,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      transform: [{ translateY: -3 }],
    },
    // Life Map Card
    lifeMapCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 28,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: '#F59E0B',
      transform: [{ translateY: -3 }],
    },
    lifeMapGradient: {
      borderRadius: 28,
      padding: 24,
    },
    lifeMapHeader: {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 20,
    },
    lifeMapTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    lifeMapSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    healthInfoContainer: {
      backgroundColor: currentTheme.colors.primary + '20',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '30',
    },
    healthInfoText: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    lifeMapScore: {
      backgroundColor: '#F59E0B',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    lifeMapScoreNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    lifeMapScoreLabel: {
      fontSize: 14,
      color: 'white',
      marginLeft: 4,
    },
    healthCategoriesContainer: {
      marginBottom: 16,
    },
    healthCategoryItem: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    healthCategoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    healthCategoryEmoji: {
      fontSize: 20,
    },
    healthCategoryScore: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    healthCategoryBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    healthCategoryBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    healthCategoryLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    titleSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 24,
      fontWeight: '500',
    },
    journeyHeader: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 28,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: currentTheme.colors.primary,
      transform: [{ translateY: -3 }],
    },
    journeyHeaderGradient: {
      borderRadius: 28,
      padding: 20,
    },
    journeyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    journeyDate: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 8,
    },
    journeyDuration: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      marginBottom: 16,
    },
    journeyActionContainer: {
      marginTop: 8,
      alignItems: 'center',
    },
    journeyActionButton: {
      backgroundColor: currentTheme.colors.primary + '25',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '40',
    },
    journeyActionText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    activePeriodButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    activePeriodButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    summaryContainer: {
      flexDirection: 'column',
      gap: 16,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 12,
      minHeight: 60,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    streakCard: {
      borderTopWidth: 4,
      borderTopColor: '#ff6b35',
      backgroundColor: '#fff7f0',
    },
    entriesCard: {
      borderTopWidth: 4,
      borderTopColor: '#4ade80',
      backgroundColor: '#f0fdf4',
    },
    moodCard: {
      borderTopWidth: 4,
      borderTopColor: '#f59e0b',
      backgroundColor: '#fffbeb',
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 28,
      backgroundColor: currentTheme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContent: {
      flex: 1,
      alignItems: 'flex-start',
      marginLeft: 16,
    },
    summaryTitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    summaryLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '400',
    },
    milestoneContainer: {
      marginHorizontal: 20,
      marginBottom: 24,
      borderRadius: 28,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: '#F59E0B',
      transform: [{ translateY: -3 }],
    },
    milestoneContainerGradient: {
      borderRadius: 28,
      padding: 24,
    },
    milestoneTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    milestoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    milestoneIcon: {
      width: 48,
      height: 48,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    milestoneContent: {
      flex: 1,
    },
    milestoneLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    milestoneStatus: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
    },
    highlightContainer: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 28,
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: '#8B5CF6',
      transform: [{ translateY: -3 }],
    },
    highlightContainerGradient: {
      borderRadius: 28,
      padding: 24,
    },
    highlightTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    highlightItem: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    highlightEmoji: {
      fontSize: 24,
      marginBottom: 8,
    },
    highlightLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
    },
    highlightValue: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    chartsContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    chartContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    chartTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 8,
    },
    chartActionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: currentTheme.colors.background,
    },
    modernChart: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 20,
      minHeight: 180,
    },
    chartVisual: {
      alignItems: 'center',
      marginBottom: 16,
    },
    barChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 12,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: 24,
      borderRadius: 12,
      marginBottom: 8,
    },
    barLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    activityGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    activityDay: {
      alignItems: 'center',
    },
    activityDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: 8,
    },
    activityLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    activityStats: {
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    activityStatText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    activityStatSubtext: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    moodDistribution: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    moodItem: {
      alignItems: 'center',
    },
    moodCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    moodEmoji: {
      fontSize: 24,
    },
    barWrapper: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 160,
    },
    moodSummary: {
      marginTop: 16,
    },
    moodSummaryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    moodLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    moodPercent: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    moodCount: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    emptyMoodContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    emptyMoodText: {
      fontSize: 16,
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
      fontWeight: '600',
    },
    emptyMoodSubtext: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    startWritingButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    startWritingButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    startJourneyButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      marginTop: 16,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    startJourneyButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Chart Styles
    moodChartContainer: {
      paddingVertical: 16,
    },
    moodChartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    // Line Chart Styles
    lineChartContainer: {
      marginBottom: 20,
    },
    lineChartGrid: {
      flexDirection: 'row',
      height: 80,
      marginBottom: 12,
    },
    yAxisContainer: {
      width: 40,
      justifyContent: 'space-between',
      paddingRight: 8,
    },
    yAxisLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      textAlign: 'right',
    },
    chartArea: {
      flex: 1,
      position: 'relative',
      backgroundColor: currentTheme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    lineChartLine: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    lineChartPoint: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    lineChartEmoji: {
      position: 'absolute',
      fontSize: 16,
      fontWeight: 'bold',
    },
    lineChartPercent: {
      position: 'absolute',
      fontSize: 10,
      fontWeight: '600',
      color: currentTheme.colors.text,
      backgroundColor: currentTheme.colors.background,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    gridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: currentTheme.colors.border,
      opacity: 0.3,
    },
    xAxisContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
    },
    xAxisLabel: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Pie Chart Styles
    pieChartContainer: {
      alignItems: 'center',
    },
    pieChart: {
      flexDirection: 'row',
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    pieSlice: {
      minWidth: 2,
    },
    pieLegend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    moodLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
    },
    moodLegendText: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    // Sample Chart Styles
    sampleChart: {
      alignItems: 'center',
      marginTop: 16,
    },
    sampleChartTitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 8,
    },
    sampleBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      height: 60,
    },
    sampleBar: {
      width: 20,
      borderRadius: 2,
    },
    barValue: {
      fontSize: 10,
      color: currentTheme.colors.text,
      fontWeight: 'bold',
      marginTop: 2,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 2,
      marginTop: 8,
    },
    expandedChart: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 16,
    },
    expandedChartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    activityWeekContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    activityDayItem: {
      alignItems: 'center',
      flex: 1,
    },
    activityDayLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 6,
      textAlign: 'center',
      fontWeight: '500',
    },
    activitySummary: {
      marginTop: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
    },
    activitySummaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    activityGoalText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 12,
    },
    activityProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    activityProgressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 4,
    },
    moodTrendChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 200,
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    moodTrendItem: {
      alignItems: 'center',
      flex: 1,
    },
    moodTrendValue: {
      fontSize: 24,
      marginBottom: 8,
    },
    moodTrendBar: {
      width: 20,
      backgroundColor: '#10b981',
      borderRadius: 10,
      marginBottom: 8,
    },
    moodTrendLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    moodTrendSummary: {
      marginTop: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
    },
    moodTrendSummaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    moodTrendInsight: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontStyle: 'italic',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: screenWidth * 0.92,
      maxHeight: '85%',
      borderRadius: 32,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 15,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalGradient: {
      padding: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 20,
    },
    modalScroll: {
      maxHeight: 400,
    },
    sliderContainer: {
      marginBottom: 24,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sliderGradient: {
      padding: 20,
      borderRadius: 20,
    },
    sliderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sliderEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    sliderLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    sliderValueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    sliderValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
    },
    sliderUnit: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
      marginLeft: 4,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressTrack: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressDots: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    progressDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: currentTheme.colors.border,
    },
    progressDotActive: {
      backgroundColor: currentTheme.colors.primary,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    sliderThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    modalSaveButton: {
      marginTop: 24,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    modalSaveButtonGradient: {
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSaveButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    // Tab Bar Styles
    tabBar: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: currentTheme.colors.background,
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
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    activeTabText: {
      color: 'white',
    },
    // Habit Card Styles
    habitCard: {
      marginBottom: 12,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    completedHabitCard: {
      transform: [{ scale: 1.02 }],
    },
    habitGradient: {
      borderRadius: 16,
      padding: 16,
      minHeight: 100,
    },
    habitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    habitIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    habitIcon: {
      fontSize: 20,
    },
    habitCheckbox: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    habitContent: {
      flex: 1,
    },
    habitTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    habitDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginBottom: 8,
      lineHeight: 16,
    },
    habitProgress: {
      marginTop: 8,
    },
    habitProgressBar: {
      height: 6,
      backgroundColor: currentTheme.colors.border + '40',
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 4,
    },
    habitProgressFill: {
      height: '100%',
      borderRadius: 3,
    },
    habitProgressText: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    habitStreak: {
      marginTop: 4,
    },
    habitStreakText: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    // Progress Card Styles
    progressCard: {
      marginBottom: 12,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    progressGradient: {
      borderRadius: 16,
      padding: 16,
      minHeight: 100,
    },
    progressCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    progressStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    progressStat: {
      alignItems: 'center',
    },
    progressStatNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    progressStatLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    streakItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    streakIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    streakContent: {
      flex: 1,
    },
    streakTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    streakNumber: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    // Empty State Styles
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
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

  const filteredEntries = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return entries.filter(entry => new Date(entry.date) >= filterDate);
  }, [entries, selectedPeriod]);

  const stats = useMemo(() => {
    const totalEntries = filteredEntries.length;
    const avgMood = totalEntries > 0 
      ? filteredEntries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries 
      : 0;
    const currentStreak = getStreak();

    // Calculate mood distribution
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredEntries.forEach(entry => {
      moodCounts[entry.mood as keyof typeof moodCounts]++;
    });

    // Calculate weekly activity
    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split('T')[0];
      return filteredEntries.some(entry => entry.date === dateStr);
    });

    // Get last 7 days mood data
    const last7DaysMood = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split('T')[0];
      const entry = filteredEntries.find(e => e.date === dateStr);
      return entry ? entry.mood : 0;
    });

    return {
      totalEntries,
      avgMood: Math.round(avgMood * 10) / 10,
      currentStreak,
      moodCounts,
      weeklyActivity,
      last7DaysMood,
    };
  }, [filteredEntries, getStreak]);


  // Calculate milestones
  const milestones = [
    { 
      icon: '✍️', 
      label: 'İlk Günlük', 
      status: entries.length > 0 ? 'Tamamlandı ✅' : 'Henüz başlamadın',
      completed: entries.length > 0,
      color: '#4ade80'
    },
    { 
      icon: '🔥', 
      label: '7 Gün Seri', 
      status: stats.currentStreak >= 7 ? 'Tamamlandı ✅' : `${stats.currentStreak}/7 gün`,
      completed: stats.currentStreak >= 7,
      color: '#f59e0b'
    },
    { 
      icon: '🎯', 
      label: '30 Gün Hedefi', 
      status: stats.totalEntries >= 30 ? 'Tamamlandı ✅' : `${stats.totalEntries}/30 günlük`,
      completed: stats.totalEntries >= 30,
      color: '#8b5cf6'
    },
    { 
      icon: '💎', 
      label: '100 Gün Efsanesi', 
      status: stats.totalEntries >= 100 ? 'Tamamlandı ✅' : `${stats.totalEntries}/100 günlük`,
      completed: stats.totalEntries >= 100,
      color: '#ef4444'
    },
  ];

  // Calculate highlights
  const happiestDay = entries.length > 0 
    ? entries.reduce((max, entry) => entry.mood > max.mood ? entry : max, entries[0])
    : null;
  
  const longestEntry = entries.length > 0
    ? entries.reduce((max, entry) => entry.content.length > max.content.length ? entry : max, entries[0])
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView 
        style={dynamicStyles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            dynamicStyles.header,
            {
              opacity: fadeAnims.header,
              transform: [
                { translateY: fadeAnims.header.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })},
                { scale: scaleAnims.header }
              ]
            }
          ]}
        >
          <Text style={dynamicStyles.title}>🗺️ YOLCULUĞUM</Text>
          <Text style={dynamicStyles.titleSubtitle}>Yaşam haritan ve kişisel gelişim yolculuğun</Text>
        </Animated.View>

        {/* Yaşam Haritası */}
        <Animated.View
          style={[
            dynamicStyles.lifeMapCard,
            {
              opacity: fadeAnims.lifeMap,
              transform: [
                { translateY: fadeAnims.lifeMap.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })},
                { scale: scaleAnims.lifeMap }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              animateCardPress('lifeMap');
              openHealthModal();
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[
                currentTheme.colors.primary + '20',
                currentTheme.colors.accent + '25',
                currentTheme.colors.card,
                currentTheme.name === 'dark' ? currentTheme.colors.accent + '30' : currentTheme.colors.accent + '20'
              ]}
              style={dynamicStyles.lifeMapGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={dynamicStyles.lifeMapHeader}>
                <Text style={dynamicStyles.lifeMapTitle}>🔥 Yolculuğum</Text>
                <Text style={dynamicStyles.lifeMapSubtitle}>Alışkanlıklar ve kişisel gelişim takibi</Text>
              </View>

              {/* Tab Bar */}
              <View style={dynamicStyles.tabBar}>
                <TouchableOpacity
                  style={[dynamicStyles.tab, activeTab === 'stats' && dynamicStyles.activeTab]}
                  onPress={() => handleTabChange('stats')}
                  activeOpacity={0.7}
                >
                  <Text style={[dynamicStyles.tabText, activeTab === 'stats' && dynamicStyles.activeTabText]}>
                    📊 İstatistikler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.tab, activeTab === 'habits' && dynamicStyles.activeTab]}
                  onPress={() => handleTabChange('habits')}
                  activeOpacity={0.7}
                >
                  <Text style={[dynamicStyles.tabText, activeTab === 'habits' && dynamicStyles.activeTabText]}>
                    🔥 Alışkanlıklar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[dynamicStyles.tab, activeTab === 'progress' && dynamicStyles.activeTab]}
                  onPress={() => handleTabChange('progress')}
                  activeOpacity={0.7}
                >
                  <Text style={[dynamicStyles.tabText, activeTab === 'progress' && dynamicStyles.activeTabText]}>
                    📈 İlerleme
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              {activeTab === 'stats' && (
                <>
                  <View style={dynamicStyles.healthInfoContainer}>
                    <Text style={dynamicStyles.healthInfoText}>
                      📊 Günlük aktivitelerini takip et ve genel sağlık skorunu gör.
                    </Text>
                  </View>

                  <View style={dynamicStyles.healthCategoriesContainer}>
                    {getHealthCategories().map((cat, index) => (
                      <View key={index} style={dynamicStyles.healthCategoryItem}>
                        <View style={dynamicStyles.healthCategoryHeader}>
                          <Text style={dynamicStyles.healthCategoryEmoji}>{cat.emoji}</Text>
                          <Text style={dynamicStyles.healthCategoryScore}>~{cat.score}/100</Text>
                        </View>
                        <View style={dynamicStyles.healthCategoryBar}>
                          <View 
                            style={[
                              dynamicStyles.healthCategoryBarFill, 
                              { width: `${cat.score}%`, backgroundColor: cat.color }
                            ]} 
                          />
                        </View>
                        <Text style={dynamicStyles.healthCategoryLabel}>{cat.label}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {activeTab === 'habits' && (
                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  {getTodayHabits().length === 0 ? (
                    <View style={dynamicStyles.emptyState}>
                      <Text style={dynamicStyles.emptyIcon}>🔥</Text>
                      <Text style={dynamicStyles.emptyTitle}>Alışkanlıklarını Oluştur</Text>
                      <Text style={dynamicStyles.emptyMessage}>
                        Günlük alışkanlıklar, büyük değişimlerin anahtarıdır.
                      </Text>
                    </View>
                  ) : (
                    getTodayHabits().map(habit => {
                      const streak = getHabitStreaks().find(s => s.habitId === habit.id);
                      return renderHabitCard(habit, streak);
                    })
                  )}
                </ScrollView>
              )}

              {activeTab === 'progress' && (
                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                  {habits.length === 0 ? (
                    <View style={dynamicStyles.emptyState}>
                      <Text style={dynamicStyles.emptyIcon}>📊</Text>
                      <Text style={dynamicStyles.emptyTitle}>İlerlemeni Takip Et</Text>
                      <Text style={dynamicStyles.emptyMessage}>
                        Alışkanlıklarını oluşturduktan sonra burada ilerlemeni görebilirsin.
                      </Text>
                    </View>
                  ) : (
                    renderProgressCards()
                  )}
                </ScrollView>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>


        {/* Yolculuk Başlangıcı */}
        <Animated.View
          style={[
            dynamicStyles.journeyHeader,
            {
              opacity: fadeAnims.journey,
              transform: [
                { translateY: fadeAnims.journey.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })},
                { scale: scaleAnims.journey }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => animateCardPress('journey')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[
                currentTheme.colors.primary + '25',
                currentTheme.colors.accent + '30',
                currentTheme.colors.card,
                currentTheme.name === 'dark' ? currentTheme.colors.accent + '35' : currentTheme.colors.accent + '25'
              ]}
              style={dynamicStyles.journeyHeaderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={dynamicStyles.journeyTitle}>🌅 Yolculuk Başlangıcı</Text>
              <Text style={dynamicStyles.journeyDate}>
                {firstEntry ? new Date(firstEntry.date).toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                }) : 'Henüz başlamadın'}
              </Text>
              <Text style={dynamicStyles.journeyDuration}>
                {daysSinceStart > 0 ? `${daysSinceStart} gün önce başladın` : 'Yolculuğun henüz başlamadı'}
              </Text>
              
              <View style={dynamicStyles.journeyActionContainer}>
                <TouchableOpacity
                  style={dynamicStyles.journeyActionButton}
                  onPress={() => {
                    animateCardPress('journey');
                    navigation.navigate('WriteDiaryStep1' as never);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={dynamicStyles.journeyActionText}>
                    <Ionicons name="arrow-forward" size={16} color={currentTheme.colors.primary} />
                    {' '}{!firstEntry ? 'İlk günlüğünü yaz' : 'Günlük yaz'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Mood Dağılımı */}
        <Animated.View
          style={[
            dynamicStyles.highlightContainer,
            {
              opacity: fadeAnims.mood,
              transform: [
                { translateY: fadeAnims.mood.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })},
                { scale: scaleAnims.mood }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => animateCardPress('mood')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[
                currentTheme.colors.primary + '15',
                currentTheme.colors.accent + '20',
                currentTheme.colors.card,
                currentTheme.name === 'dark' ? currentTheme.colors.accent + '25' : currentTheme.colors.accent + '15'
              ]}
              style={dynamicStyles.highlightContainerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={dynamicStyles.highlightTitle}>😊 Mood Dağılımı</Text>
              
              {entries.length === 0 ? (
                <View style={dynamicStyles.emptyMoodContainer}>
                  <Text style={dynamicStyles.emptyMoodText}>
                    📊 Mood grafiği henüz oluşmadı
                  </Text>
                  <Text style={dynamicStyles.emptyMoodSubtext}>
                    Birkaç günlük yazarak renkli grafiğini gör!
                  </Text>
                  <View style={dynamicStyles.sampleChart}>
                    <Text style={dynamicStyles.sampleChartTitle}>Örnek Grafik:</Text>
                    <View style={dynamicStyles.sampleBars}>
                      <View style={[dynamicStyles.sampleBar, { height: 60, backgroundColor: '#F59E0B' }]} />
                      <View style={[dynamicStyles.sampleBar, { height: 40, backgroundColor: '#10B981' }]} />
                      <View style={[dynamicStyles.sampleBar, { height: 30, backgroundColor: '#8B5CF6' }]} />
                      <View style={[dynamicStyles.sampleBar, { height: 20, backgroundColor: '#EF4444' }]} />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={dynamicStyles.moodChartContainer}>
                  {/* Line Chart */}
                  <Text style={dynamicStyles.moodChartTitle}>📈 Mood Trend Grafiği</Text>
                  <View style={dynamicStyles.lineChartContainer}>
                    <View style={dynamicStyles.lineChartGrid}>
                      {/* Y-axis labels */}
                      <View style={dynamicStyles.yAxisContainer}>
                        <Text style={dynamicStyles.yAxisLabel}>100%</Text>
                        <Text style={dynamicStyles.yAxisLabel}>75%</Text>
                        <Text style={dynamicStyles.yAxisLabel}>50%</Text>
                        <Text style={dynamicStyles.yAxisLabel}>25%</Text>
                        <Text style={dynamicStyles.yAxisLabel}>0%</Text>
                      </View>
                      
                      {/* Chart Area */}
                      <View style={dynamicStyles.chartArea}>
                        <View style={dynamicStyles.lineChartLine}>
                          {moodData.map((mood, index) => {
                            const x = (index / (moodData.length - 1)) * 200;
                            const y = 60 - (mood.percentage / 100) * 60;
                            return (
                              <View key={index}>
                                <View 
                                  style={[
                                    dynamicStyles.lineChartPoint,
                                    { 
                                      left: x,
                                      top: y,
                                      backgroundColor: mood.color 
                                    }
                                  ]} 
                                />
                                <Text style={[dynamicStyles.lineChartEmoji, { left: x - 10, top: y + 20 }]}>
                                  {mood.emoji}
                                </Text>
                                <Text style={[dynamicStyles.lineChartPercent, { left: x - 15, top: y - 25 }]}>
                                  {mood.percentage}%
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                        
                        {/* Grid Lines */}
                        <View style={dynamicStyles.gridLine} />
                        <View style={[dynamicStyles.gridLine, { top: 15 }]} />
                        <View style={[dynamicStyles.gridLine, { top: 30 }]} />
                        <View style={[dynamicStyles.gridLine, { top: 45 }]} />
                        <View style={[dynamicStyles.gridLine, { top: 60 }]} />
                      </View>
                    </View>
                    
                    {/* X-axis labels */}
                    <View style={dynamicStyles.xAxisContainer}>
                      {moodData.map((mood, index) => (
                        <Text key={index} style={dynamicStyles.xAxisLabel}>
                          {mood.emoji}
                        </Text>
                      ))}
                    </View>
                  </View>
                  
                  {/* Pie Chart Simulation */}
                  <Text style={dynamicStyles.moodChartTitle}>🥧 Mood Oranları</Text>
                  <View style={dynamicStyles.pieChartContainer}>
                    <View style={dynamicStyles.pieChart}>
                      {moodData.map((mood, index) => (
                        <View 
                          key={index} 
                          style={[
                            dynamicStyles.pieSlice,
                            { 
                              backgroundColor: mood.color,
                              flex: mood.percentage / 100 
                            }
                          ]} 
                        />
                      ))}
                    </View>
                    <View style={dynamicStyles.pieLegend}>
                      {moodData.map((mood, index) => (
                        <View key={index} style={dynamicStyles.moodLegendItem}>
                          <View style={[dynamicStyles.legendColor, { backgroundColor: mood.color }]} />
                          <Text style={dynamicStyles.moodLegendText}>{mood.emoji} {mood.percentage}%</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>


      </ScrollView>

      {/* Health Data Modal */}
      <Modal
        visible={healthModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHealthModalVisible(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <LinearGradient
              colors={[
                currentTheme.colors.primary + '15',
                currentTheme.colors.accent + '20',
                currentTheme.colors.card,
              ]}
              style={dynamicStyles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Modal Header */}
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>💪 Günlük Aktiviteler</Text>
                <TouchableOpacity
                  onPress={() => setHealthModalVisible(false)}
                  style={dynamicStyles.modalCloseButton}
                >
                  <Ionicons name="close" size={28} color={currentTheme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={dynamicStyles.modalSubtitle}>
                Bugünkü aktivitelerini kaydet
              </Text>

              <ScrollView style={dynamicStyles.modalScroll}>
                {/* Water */}
                <View style={dynamicStyles.sliderContainer}>
                  <LinearGradient
                    colors={[
                      '#3B82F6' + '15',
                      '#60A5FA' + '20',
                      currentTheme.colors.background,
                    ]}
                    style={dynamicStyles.sliderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={dynamicStyles.sliderHeader}>
                      <Text style={dynamicStyles.sliderEmoji}>💧</Text>
                      <Text style={dynamicStyles.sliderLabel}>Su</Text>
                      <View style={dynamicStyles.sliderValueContainer}>
                        <Text style={dynamicStyles.sliderValue}>{water}</Text>
                        <Text style={dynamicStyles.sliderUnit}>bardak</Text>
                      </View>
                    </View>
                    
                    <Slider
                      style={dynamicStyles.slider}
                      minimumValue={0}
                      maximumValue={12}
                      step={1}
                      value={water}
                      onValueChange={setWater}
                      minimumTrackTintColor="#3B82F6"
                      maximumTrackTintColor={currentTheme.colors.border}
                      thumbTintColor="#3B82F6"
                    />
                    
                    {/* Progress Bar */}
                    <View style={dynamicStyles.progressContainer}>
                      <View style={dynamicStyles.progressTrack}>
                        <LinearGradient
                          colors={['#3B82F6', '#60A5FA', '#93C5FD']}
                          style={[
                            dynamicStyles.progressFill,
                            { width: `${(water / 12) * 100}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                      <View style={dynamicStyles.progressDots}>
                        {Array.from({ length: 12 }, (_, i) => (
                          <View
                            key={i}
                            style={[
                              dynamicStyles.progressDot,
                              water >= (i + 1) && dynamicStyles.progressDotActive
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Exercise */}
                <View style={dynamicStyles.sliderContainer}>
                  <LinearGradient
                    colors={[
                      '#10B981' + '15',
                      '#34D399' + '20',
                      currentTheme.colors.background,
                    ]}
                    style={dynamicStyles.sliderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={dynamicStyles.sliderHeader}>
                      <Text style={dynamicStyles.sliderEmoji}>🏃</Text>
                      <Text style={dynamicStyles.sliderLabel}>Egzersiz</Text>
                      <View style={dynamicStyles.sliderValueContainer}>
                        <Text style={dynamicStyles.sliderValue}>{exercise}</Text>
                        <Text style={dynamicStyles.sliderUnit}>dakika</Text>
                      </View>
                    </View>
                    
                    <Slider
                      style={dynamicStyles.slider}
                      minimumValue={0}
                      maximumValue={120}
                      step={5}
                      value={exercise}
                      onValueChange={setExercise}
                      minimumTrackTintColor="#10B981"
                      maximumTrackTintColor={currentTheme.colors.border}
                      thumbTintColor="#10B981"
                    />
                    
                    {/* Progress Bar */}
                    <View style={dynamicStyles.progressContainer}>
                      <View style={dynamicStyles.progressTrack}>
                        <LinearGradient
                          colors={['#10B981', '#34D399', '#6EE7B7']}
                          style={[
                            dynamicStyles.progressFill,
                            { width: `${(exercise / 120) * 100}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                      <View style={dynamicStyles.progressDots}>
                        {Array.from({ length: 6 }, (_, i) => (
                          <View
                            key={i}
                            style={[
                              dynamicStyles.progressDot,
                              exercise >= ((i + 1) * 20) && dynamicStyles.progressDotActive
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Sleep */}
                <View style={dynamicStyles.sliderContainer}>
                  <LinearGradient
                    colors={[
                      '#8B5CF6' + '15',
                      '#A78BFA' + '20',
                      currentTheme.colors.background,
                    ]}
                    style={dynamicStyles.sliderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={dynamicStyles.sliderHeader}>
                      <Text style={dynamicStyles.sliderEmoji}>😴</Text>
                      <Text style={dynamicStyles.sliderLabel}>Uyku</Text>
                      <View style={dynamicStyles.sliderValueContainer}>
                        <Text style={dynamicStyles.sliderValue}>{sleep}</Text>
                        <Text style={dynamicStyles.sliderUnit}>saat</Text>
                      </View>
                    </View>
                    
                    <Slider
                      style={dynamicStyles.slider}
                      minimumValue={0}
                      maximumValue={12}
                      step={0.5}
                      value={sleep}
                      onValueChange={setSleep}
                      minimumTrackTintColor="#8B5CF6"
                      maximumTrackTintColor={currentTheme.colors.border}
                      thumbTintColor="#8B5CF6"
                    />
                    
                    {/* Progress Bar */}
                    <View style={dynamicStyles.progressContainer}>
                      <View style={dynamicStyles.progressTrack}>
                        <LinearGradient
                          colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
                          style={[
                            dynamicStyles.progressFill,
                            { width: `${(sleep / 12) * 100}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                      <View style={dynamicStyles.progressDots}>
                        {Array.from({ length: 6 }, (_, i) => (
                          <View
                            key={i}
                            style={[
                              dynamicStyles.progressDot,
                              sleep >= ((i + 1) * 2) && dynamicStyles.progressDotActive
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Meditation */}
                <View style={dynamicStyles.sliderContainer}>
                  <LinearGradient
                    colors={[
                      '#F59E0B' + '15',
                      '#FBBF24' + '20',
                      currentTheme.colors.background,
                    ]}
                    style={dynamicStyles.sliderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={dynamicStyles.sliderHeader}>
                      <Text style={dynamicStyles.sliderEmoji}>🧘</Text>
                      <Text style={dynamicStyles.sliderLabel}>Meditasyon</Text>
                      <View style={dynamicStyles.sliderValueContainer}>
                        <Text style={dynamicStyles.sliderValue}>{meditation}</Text>
                        <Text style={dynamicStyles.sliderUnit}>dakika</Text>
                      </View>
                    </View>
                    
                    <Slider
                      style={dynamicStyles.slider}
                      minimumValue={0}
                      maximumValue={60}
                      step={5}
                      value={meditation}
                      onValueChange={setMeditation}
                      minimumTrackTintColor="#F59E0B"
                      maximumTrackTintColor={currentTheme.colors.border}
                      thumbTintColor="#F59E0B"
                    />
                    
                    {/* Progress Bar */}
                    <View style={dynamicStyles.progressContainer}>
                      <View style={dynamicStyles.progressTrack}>
                        <LinearGradient
                          colors={['#F59E0B', '#FBBF24', '#FCD34D']}
                          style={[
                            dynamicStyles.progressFill,
                            { width: `${(meditation / 60) * 100}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                      <View style={dynamicStyles.progressDots}>
                        {Array.from({ length: 6 }, (_, i) => (
                          <View
                            key={i}
                            style={[
                              dynamicStyles.progressDot,
                              meditation >= ((i + 1) * 10) && dynamicStyles.progressDotActive
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={dynamicStyles.modalSaveButton}
                onPress={handleSaveHealthData}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    currentTheme.colors.primary,
                    currentTheme.colors.accent,
                    currentTheme.colors.primary,
                  ]}
                  style={dynamicStyles.modalSaveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={dynamicStyles.modalSaveButtonText}>
                    ✨ Kaydet
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}